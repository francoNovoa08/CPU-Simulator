pub mod alu;
pub mod assembler;
pub mod cpu;
pub mod isa;
pub mod memory;

use assembler::assemble;
use cpu::{Cpu as CoreCpu, StepResult};
use isa::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Cpu {
    inner: CoreCpu,
    program: Vec<u16>,
}

#[wasm_bindgen]
impl Cpu {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Cpu {
        Cpu {
            inner: CoreCpu::new(),
            program: Vec::new(),
        }
    }

    /// Load a flat u16 array into memory starting at address 0.
    pub fn load_program(&mut self, words: &[u16]) {
        self.program = words.to_vec();
        self.inner.load_program(words);
    }

    /// Assemble a source string and load the result.
    ///
    /// Returns an error string on failure, or an empty string on success.
    pub fn assemble_and_load(&mut self, source: &str) -> String {
        match assemble(source) {
            Ok(words) => {
                self.load_program(&words);
                String::new()
            }
            Err(e) => e.to_string(),
        }
    }

    /// Execute one fetch-decode-execute cycle.
    ///
    /// Returns a JSON string conforming to the StepDelta schema.
    pub fn step(&mut self) -> String {
        if self.inner.halted {
            return self.build_delta(&[], None, true);
        }

        let pre_ir_op = (self.inner.ir >> 12) & 0xF;
        let pre_ir = self.inner.ir;

        let result = self.inner.step();

        let active_wires = compute_wires(&result, pre_ir_op, pre_ir);
        let mmio = match &result {
            StepResult::MmioWrite(v) => Some(*v),
            _ => None,
        };
        let halted = self.inner.halted;

        self.build_delta(&active_wires, mmio, halted)
    }

    /// Return full CPU state as a JSON string.
    pub fn snapshot(&self) -> String {
        build_snapshot(&self.inner)
    }

    /// Reset all state and reload the last assembled program.
    pub fn reset(&mut self) {
        let program = self.program.clone();
        self.inner.reset();
        self.inner.load_program(&program);
    }
}

impl Default for Cpu {
    fn default() -> Self {
        Self::new()
    }
}

fn compute_wires(result: &StepResult, op: u16, _ir: u16) -> Vec<&'static str> {
    if matches!(result, StepResult::Halted) {
        return vec![];
    }

    let mut wires = vec!["pc_to_ram", "ram_to_ir"];

    match op {
        OP_ADD | OP_SUB | OP_AND | OP_OR => {
            wires.extend(["rs1_to_alu", "rs2_to_alu", "alu_to_rd", "alu_to_flags"]);
        }

        OP_NOT => {
            wires.extend(["rs1_to_alu", "alu_to_rd", "alu_to_flags"]);
        }

        OP_LOADI => {
            wires.extend(["alu_to_rd", "alu_to_flags"]);
        }

        OP_STORE => {
            wires.push("rs1_to_ram");
            if matches!(result, StepResult::MmioWrite(_)) {
                wires.push("rd_to_mmio");
            }
        }

        OP_JMP => {
            wires.push("alu_to_pc");
        }

        OP_JMPZ => {
            wires.push("alu_to_pc");
        }

        OP_ADDI => {
            wires.extend(["rs1_to_alu", "alu_to_rd", "alu_to_flags"]);
        }

        _ => {}
    }

    wires
}

fn build_delta_inner(
    cpu: &CoreCpu,
    active_wires: &[&str],
    mmio: Option<u16>,
    halted: bool,
) -> String {
    let wires_json = active_wires
        .iter()
        .map(|w| format!("\"{w}\""))
        .collect::<Vec<_>>()
        .join(",");

    let regs_json = cpu
        .registers
        .iter()
        .map(|r| r.to_string())
        .collect::<Vec<_>>()
        .join(",");

    let mmio_json = match mmio {
        Some(v) => v.to_string(),
        None => "null".to_string(),
    };

    format!(
        r#"{{"active_wires":[{wires_json}],"registers":[{regs_json}],"pc":{pc},"ir":{ir},"flag_z":{fz},"halted":{halted},"mmio_write":{mmio_json}}}"#,
        pc = cpu.pc,
        ir = cpu.ir,
        fz = cpu.flag_z,
    )
}

fn build_snapshot(cpu: &CoreCpu) -> String {
    build_delta_inner(cpu, &[], None, cpu.halted)
}

impl Cpu {
    fn build_delta(&self, active_wires: &[&str], mmio: Option<u16>, halted: bool) -> String {
        build_delta_inner(&self.inner, active_wires, mmio, halted)
    }
}
