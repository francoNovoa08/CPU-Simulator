//! Instruction Set Architecture (ISA) definitions.

pub const OP_ADD: u16 = 0x0;
pub const OP_SUB: u16 = 0x1;
pub const OP_AND: u16 = 0x2;
pub const OP_OR: u16 = 0x3;
pub const OP_NOT: u16 = 0x4;
pub const OP_LOADI: u16 = 0x5;
pub const OP_LOAD: u16 = 0x6;
pub const OP_STORE: u16 = 0x7;
pub const OP_JMP: u16 = 0x8;
pub const OP_JMPZ: u16 = 0x9;
pub const OP_ADDI: u16 = 0xA;
pub const OP_HALT: u16 = 0xF;

/// Encodes register instructions from assembly to machine code.
///
/// R-format: `OPCODE[15:12] | RD[11:9] | RS1[8:6] | RS2[5:3] | 000[2:0]`
///
/// - `RD`: Destination register
/// - `RSx`: Source register x
pub fn encode_r(op: u16, rd: u16, rs1: u16, rs2: u16) -> u16 {
    (op & 0xF) << 12 | (rd & 0x7) << 9 | (rs1 & 0x7) << 6 | (rs2 & 0x7) << 3
}

/// Encodes immediate instructions from assembly to machine code.
///
/// I-format: `OPCODE[15:12] | RD[11:9] | RS1[8:6] | IMM6[5:0]`
/// 
/// - `RD`: Destination register
/// - `RSx`: Source register x
/// - `IMM6`: 6-bit immediate value
pub fn encode_i(op: u16, rd: u16, rs1: u16, imm6: u16) -> u16 {
    (op & 0xF) << 12 | (rd & 0x7) << 9 | (rs1 & 0x7) << 6 | (imm6 & 0x3F)
}

/// Encodes jump instructions from assembly to machine code.
/// 
/// J-format: `OPCODE[15:12] | 000[11:9] | ADDR9[8:0]`
/// 
/// - `ADDR9`: 9-bit address
pub fn encode_j(op: u16, addr9: u16) -> u16 {
    (op & 0xF) << 12 | (addr9 & 0x1FF)
}

/// Takes a 6-bit immediate value and sign-extends it to 16 bits.
pub fn sign_extend_6(imm6: u16) -> u16 {
    if imm6 & 0x20 != 0 {
        imm6 | 0xFFC0
    } else {
        imm6
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // encode_r tests
    #[test]
    fn encode_r_add_r3_r1_r2() {
        // ADD R3 R1 R2 -> 0000 011 001 010 000 = 0x0650
        let word = encode_r(OP_ADD, 3, 1, 2);
        assert_eq!(word, 0x0650, "ADD R3 R1 R2 should encode to 0x0650");
    }

    #[test]
    fn encode_r_opcode_sits_in_top_nibble() {
        let word = encode_r(OP_SUB, 0, 0, 0);
        assert_eq!(word >> 12, OP_SUB);
    }

    #[test]
    fn encode_r_rd_field_bits_11_9() {
        let word = encode_r(0, 7, 0, 0);
        assert_eq!((word >> 9) & 0x7, 7);
    }

    #[test]
    fn encode_r_rs1_field_bits_8_6() {
        let word = encode_r(0, 0, 5, 0);
        assert_eq!((word >> 6) & 0x7, 5);
    }

    #[test]
    fn encode_r_rs2_field_bits_5_3() {
        let word = encode_r(0, 0, 0, 6);
        assert_eq!((word >> 3) & 0x7, 6);
    }

    #[test]
    fn encode_r_tail_bits_2_0_are_zero() {
        let word = encode_r(OP_AND, 7, 7, 7);
        assert_eq!(word & 0x7, 0, "bits [2:0] must always be zero in R-format");
    }

    // encode_i tests
    #[test]
    fn encode_i_loadi_r1_10() {
        // LOADI R1 10  ->  0101 001 000 001010  =  0x520A
        let word = encode_i(OP_LOADI, 1, 0, 10);
        assert_eq!(word, 0x520A, "LOADI R1 10 should encode to 0x520A");
    }

    #[test]
    fn encode_i_imm6_masked_to_6_bits() {
        let word = encode_i(OP_LOADI, 0, 0, 0xFF);
        assert_eq!(word & 0x3F, 0x3F);
    }

    #[test]
    fn encode_i_addi_r2_r1_neg1() {
        // ADDI with IMM6 = -1
        let word = encode_i(OP_ADDI, 2, 1, 0x3F);
        assert_eq!((word >> 12) & 0xF, OP_ADDI);
        assert_eq!((word >> 9) & 0x7, 2);
        assert_eq!((word >> 6) & 0x7, 1);
        assert_eq!(word & 0x3F, 0x3F);
    }

    // encode_j tests
    #[test]
    fn encode_j_jmp_addr_0() {
        let word = encode_j(OP_JMP, 0);
        assert_eq!(word, 0x8000);
    }

    #[test]
    fn encode_j_jmpz_addr_511() {
        let word = encode_j(OP_JMPZ, 0x1FF);
        assert_eq!(word, 0x91FF);
    }

    #[test]
    fn encode_j_addr9_masked_to_9_bits() {
        let word = encode_j(OP_JMP, 0x3FF);
        assert_eq!(word & 0x1FF, 0x1FF);
    }

    #[test]
    fn encode_j_middle_bits_11_9_are_zero() {
        let word = encode_j(OP_JMP, 0x1FF);
        assert_eq!((word >> 9) & 0x7, 0, "bits [11:9] must be zero in J-format");
    }

    // sign_extend_6 tests
    #[test]
    fn sign_extend_6_zero() {
        assert_eq!(sign_extend_6(0), 0);
    }

    #[test]
    fn sign_extend_6_max_positive() {
        assert_eq!(sign_extend_6(31), 31);
    }

    #[test]
    fn sign_extend_6_minus_one() {
        // -1  = 0b111111 = 63
        assert_eq!(sign_extend_6(63), 0xFFFF);
    }
}