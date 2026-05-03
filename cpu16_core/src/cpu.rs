//! CPU fetch, decode, execute
use crate::alu;
use crate::isa::{self, sign_extend_6};
use crate::memory::Memory;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum StepResult {
    /// Cycle completed successfully
    Ok,
    /// HALT instruction reached
    Halted,
    /// A STORE to the MMIO address (carries written value)
    MmioWrite(u16),
    /// Unknown opcode encountered
    UnknownOpcode(u16),
}

pub struct Cpu {
    pub registers: [u16; 8],
    pub pc: u16,
    pub ir: u16,
    pub flag_z: bool,
    pub memory: Memory,
    pub halted: bool,
}

impl Cpu {
    pub fn new() -> Self {
        Self {
            registers: [0u16; 8],
            pc: 0,
            ir: 0,
            flag_z: false,
            memory: Memory::new(),
            halted: false,
        }
    }

    pub fn load_program(&mut self, words: &[u16]) {
        self.reset();
        self.memory.load(words);
    }

    pub fn reset(&mut self) {
        self.registers = [0u16; 8];
        self.pc = 0;
        self.ir = 0;
        self.flag_z = false;
        self.halted = false;
        self.memory.reset();
    }

    /// Execute one fetch-decode-execute cycle
    pub fn step(&mut self) -> StepResult {
        if self.halted {
            return StepResult::Halted;
        }

        self.ir = self.memory.read(self.pc);
        self.pc = self.pc.wrapping_add(1);

        let op = (self.ir >> 12) & 0xF;
        let rd = ((self.ir >> 9) & 0x7) as usize;
        let rs1 = ((self.ir >> 6) & 0x7) as usize;
        let rs2 = ((self.ir >> 3) & 0x7) as usize;
        let imm6 = sign_extend_6(self.ir & 0x3F);
        let addr9 = self.ir & 0x1FF;

        match op {
            isa::OP_ADD => {
                let r = alu::add(self.reg(rs1), self.reg(rs2));
                self.write_reg(rd, r.value);
                self.flag_z = r.flag_z;
            }
            isa::OP_SUB => {
                let r = alu::sub(self.reg(rs1), self.reg(rs2));
                self.write_reg(rd, r.value);
                self.flag_z = r.flag_z;
            }
            isa::OP_AND => {
                let r = alu::and(self.reg(rs1), self.reg(rs2));
                self.write_reg(rd, r.value);
                self.flag_z = r.flag_z;
            }
            isa::OP_OR => {
                let r = alu::or(self.reg(rs1), self.reg(rs2));
                self.write_reg(rd, r.value);
                self.flag_z = r.flag_z;
            }
            isa::OP_NOT => {
                let r = alu::not(self.reg(rs1));
                self.write_reg(rd, r.value);
                self.flag_z = r.flag_z;
            }
            isa::OP_LOADI => {
                self.write_reg(rd, imm6);
                self.flag_z = imm6 == 0;
            }
            isa::OP_LOAD => {
                let addr = self.reg(rs1);
                let value = self.memory.read(addr);
                self.write_reg(rd, value);
            }
            isa::OP_STORE => {
                let value = self.reg(rs1);
                let addr  = self.reg(rs2);
                if let Some(mmio_value) = self.memory.write(addr, value) {
                    return StepResult::MmioWrite(mmio_value);
                }
            }
            isa::OP_JMP => {
                self.pc = addr9;
            }
            isa::OP_JMPZ => {
                if self.flag_z {
                    self.pc = addr9;
                }
            }
            isa::OP_ADDI => {
                let r = alu::add(self.reg(rs1), imm6);
                self.write_reg(rd, r.value);
                self.flag_z = r.flag_z;
            }
            isa::OP_HALT => {
                self.halted = true;
                return StepResult::Halted;
            }
            _ => {
                return StepResult::UnknownOpcode(op);
            }
        }

        StepResult::Ok
    }

    /// Read a register value, R0 always returns 0
    fn reg(&self, index: usize) -> u16 {
        self.registers[index]
    }

    /// Write a value to a register, writes to R0 are ignored
    fn write_reg(&mut self, index: usize, value: u16) {
        if index != 0 {
            self.registers[index] = value;
        }
    }
}

impl Default for Cpu {
    fn default() -> Self {
        Self::new()
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::isa::*;

    fn cpu_with_program(words: &[u16]) -> Cpu {
        let mut cpu = Cpu::new();
        cpu.load_program(words);
        cpu
    }

    #[test]
    fn r0_write_is_discarded() {
        let mut cpu = cpu_with_program(&[encode_r(OP_ADD, 0, 0, 0)]);
        cpu.step();
        assert_eq!(cpu.registers[0], 0);
    }

    #[test]
    fn r0_read_always_zero() {
        let mut cpu = Cpu::new();
        cpu.registers[0] = 0xDEAD;
        let prog = &[encode_r(OP_ADD, 1, 0, 0)];
        cpu.load_program(prog);
        cpu.step();
        assert_eq!(cpu.registers[1], 0);
    }

    #[test]
    fn pc_advances_after_fetch() {
        let halt = encode_j(OP_HALT, 0) & 0xF000;
        let mut cpu = cpu_with_program(&[halt]);
        assert_eq!(cpu.pc, 0);
        cpu.step();
        assert_eq!(cpu.pc, 1);
    }

    #[test]
    fn ir_holds_fetched_instruction() {
        let word = encode_i(OP_LOADI, 1, 0, 7);
        let mut cpu = cpu_with_program(&[word]);
        cpu.step();
        assert_eq!(cpu.ir, word);
    }

    #[test]
    fn add_r3_r1_r2() {
        // LOADI R1 10; LOADI R2 25; ADD R3 R1 R2
        let prog = &[
            encode_i(OP_LOADI, 1, 0, 10),
            encode_i(OP_LOADI, 2, 0, 25),
            encode_r(OP_ADD, 3, 1, 2),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step(); cpu.step();
        assert_eq!(cpu.registers[3], 35);
        assert!(!cpu.flag_z);
    }

    #[test]
    fn add_sets_zero_flag_on_overflow_to_zero() {
        let prog = &[
            encode_i(OP_LOADI, 1, 0, 1),
            encode_r(OP_NOT, 2, 1, 0),
            encode_r(OP_NOT, 2, 0, 0), 
            encode_r(OP_ADD, 3, 2, 1),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step(); cpu.step(); cpu.step();
        assert_eq!(cpu.registers[3], 0);
        assert!(cpu.flag_z);
    }

    #[test]
    fn sub_basic() {
        let prog = &[
            encode_i(OP_LOADI, 1, 0, 10),
            encode_i(OP_LOADI, 2, 0, 3),
            encode_r(OP_SUB, 3, 1, 2),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step(); cpu.step();
        assert_eq!(cpu.registers[3], 7);
    }

    #[test]
    fn sub_sets_z_flag_when_result_is_zero() {
        let prog = &[
            encode_i(OP_LOADI, 1, 0, 5),
            encode_i(OP_LOADI, 2, 0, 5),
            encode_r(OP_SUB, 3, 1, 2),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step(); cpu.step();
        assert!(cpu.flag_z);
    }

    #[test]
    fn and_masks_bits() {
        let prog = &[
            encode_i(OP_LOADI, 1, 0, 0b111100 & 0x3F),
            encode_i(OP_LOADI, 2, 0, 0b001111 & 0x3F),
            encode_r(OP_AND, 3, 1, 2),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step(); cpu.step();
        assert_eq!(cpu.registers[3], 0b001100);
    }

    #[test]
    fn or_combines_bits() {
        let prog = &[
            encode_i(OP_LOADI, 1, 0, 0b010000 & 0x3F),
            encode_i(OP_LOADI, 2, 0, 0b000011 & 0x3F), 
            encode_r(OP_OR, 3, 1, 2),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step(); cpu.step();
        
        assert_eq!(cpu.registers[3], 0b010011); 
    }

    #[test]
    fn not_r0_gives_0xffff() {
        let prog = &[encode_r(OP_NOT, 1, 0, 0)];
        let mut cpu = cpu_with_program(prog);
        cpu.step();
        assert_eq!(cpu.registers[1], 0xFFFF);
    }

    #[test]
    fn loadi_positive_immediate() {
        let mut cpu = cpu_with_program(&[encode_i(OP_LOADI, 1, 0, 31)]);
        cpu.step();
        assert_eq!(cpu.registers[1], 31);
        assert!(!cpu.flag_z);
    }

    #[test]
    fn loadi_zero_sets_flag() {
        let mut cpu = cpu_with_program(&[encode_i(OP_LOADI, 1, 0, 0)]);
        cpu.step();
        assert!(cpu.flag_z);
    }

    #[test]
    fn store_then_load() {
        let prog = &[
            encode_i(OP_LOADI, 1, 0, 24), 
            encode_i(OP_LOADI, 2, 0, 10),
            encode_r(OP_STORE, 0, 1, 2),
            encode_r(OP_LOAD, 3, 2, 0),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step(); cpu.step(); cpu.step();
        
        assert_eq!(cpu.registers[3], 24); 
    }

    #[test]
    fn jmpz_jumps_when_flag_set() {
        let prog = &[
            encode_r(OP_SUB, 1, 0, 0),
            encode_j(OP_JMPZ, 10),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step();
        assert_eq!(cpu.pc, 10);
    }

    #[test]
    fn addi_increments_register() {
        let prog = &[
            encode_i(OP_LOADI, 1, 0, 10),
            encode_i(OP_ADDI, 1, 1, 5),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step();
        assert_eq!(cpu.registers[1], 15);
    }

    #[test]
    fn addi_with_negative_immediate_decrements() {
        let prog = &[
            encode_i(OP_LOADI, 1, 0, 10),
            encode_i(OP_ADDI, 1, 1, 0x3F),
        ];
        let mut cpu = cpu_with_program(prog);
        cpu.step(); cpu.step();
        assert_eq!(cpu.registers[1], 9);
    }

    #[test]
    fn step_after_halt_returns_halted() {
        let mut cpu = cpu_with_program(&[0xF000]);
        cpu.step();
        assert_eq!(cpu.step(), StepResult::Halted);
    }
}