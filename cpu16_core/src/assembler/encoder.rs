//! Maps a token slice for one instruction to a u16 word

use crate::assembler::lexer::Token;
use crate::isa;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AssemblyError {
    UnknownMnemonic(String),
    UnknownRegister(String),
    WrongOperandCount { mnemonic: String, expected: usize, got: usize },
    ExpectedRegister { mnemonic: String, position: usize },
    ExpectedImmediate { mnemonic: String, position: usize },
    ImmediateOutOfRange { mnemonic: String, value: u16, bits: u8 },
    UnresolvedLabel(String),
}

impl std::fmt::Display for AssemblyError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::UnknownMnemonic(m) =>
                write!(f, "unknown mnemonic '{m}'"),
            Self::UnknownRegister(r) =>
                write!(f, "unknown register '{r}'"),
            Self::WrongOperandCount { mnemonic, expected, got } =>
                write!(f, "'{mnemonic}' expects {expected} operand(s), got {got}"),
            Self::ExpectedRegister { mnemonic, position } =>
                write!(f, "'{mnemonic}': operand {position} must be a register"),
            Self::ExpectedImmediate { mnemonic, position } =>
                write!(f, "'{mnemonic}': operand {position} must be a number"),
            Self::ImmediateOutOfRange { mnemonic, value, bits } =>
                write!(f, "'{mnemonic}': immediate {value} does not fit in {bits} bits"),
            Self::UnresolvedLabel(l) =>
                write!(f, "unresolved label '{l}'"),
        }
    }
}

impl std::error::Error for AssemblyError {}

fn parse_register(token: &Token, mnemonic: &str, position: usize) -> Result<u16, AssemblyError> {
    match token {
        Token::Ident(name) => {
            match name.as_str() {
                "R0" => Ok(0), "R1" => Ok(1), "R2" => Ok(2), "R3" => Ok(3),
                "R4" => Ok(4), "R5" => Ok(5), "R6" => Ok(6), "R7" => Ok(7),
                other => Err(AssemblyError::UnknownRegister(other.to_string())),
            }
        }
        _ => Err(AssemblyError::ExpectedRegister {
            mnemonic: mnemonic.to_string(),
            position,
        }),
    }
}

fn parse_immediate(token: &Token, mnemonic: &str, position: usize) -> Result<u16, AssemblyError> {
    match token {
        Token::Number(n) => Ok(*n),
        Token::Ident(name) => Err(AssemblyError::UnresolvedLabel(name.clone())),
        _ => Err(AssemblyError::ExpectedImmediate {
            mnemonic: mnemonic.to_string(),
            position,
        }),
    }
}

fn check_imm6(mnemonic: &str, value: u16) -> Result<u16, AssemblyError> {
    let fits_unsigned = value <= 0x3F;
    let fits_signed   = value >= 0xFFE0;
    if fits_unsigned || fits_signed {
        Ok(value & 0x3F)
    } else {
        Err(AssemblyError::ImmediateOutOfRange { mnemonic: mnemonic.to_string(), value, bits: 6 })
    }
}

fn check_addr9(mnemonic: &str, value: u16) -> Result<u16, AssemblyError> {
    if value <= 0x1FF {
        Ok(value)
    } else {
        Err(AssemblyError::ImmediateOutOfRange { mnemonic: mnemonic.to_string(), value, bits: 9 })
    }
}

fn check_operand_count(mnemonic: &str, tokens: &[Token], expected: usize) -> Result<(), AssemblyError> {
    let got = tokens.len() - 1;
    if got != expected {
        Err(AssemblyError::WrongOperandCount {
            mnemonic: mnemonic.to_string(),
            expected,
            got,
        })
    } else {
        Ok(())
    }
}

pub fn encode(tokens: &[Token]) -> Result<u16, AssemblyError> {
    let mnemonic = match &tokens[0] {
        Token::Ident(s) => s.as_str(),
        other => return Err(AssemblyError::UnknownMnemonic(format!("{other:?}"))),
    };

    match mnemonic {
        "ADD" | "SUB" | "AND" | "OR" => {
            check_operand_count(mnemonic, tokens, 3)?;
            let op  = mnemonic_to_opcode(mnemonic);
            let rd  = parse_register(&tokens[1], mnemonic, 1)?;
            let rs1 = parse_register(&tokens[2], mnemonic, 2)?;
            let rs2 = parse_register(&tokens[3], mnemonic, 3)?;
            Ok(isa::encode_r(op, rd, rs1, rs2))
        }

        "NOT" => {
            check_operand_count(mnemonic, tokens, 2)?;
            let rd  = parse_register(&tokens[1], mnemonic, 1)?;
            let rs1 = parse_register(&tokens[2], mnemonic, 2)?;
            Ok(isa::encode_r(isa::OP_NOT, rd, rs1, 0))
        }

        "LOAD" => {
            check_operand_count(mnemonic, tokens, 2)?;
            let rd  = parse_register(&tokens[1], mnemonic, 1)?;
            let rs1 = parse_register(&tokens[2], mnemonic, 2)?;
            Ok(isa::encode_r(isa::OP_LOAD, rd, rs1, 0))
        }

        "STORE" => {
            check_operand_count(mnemonic, tokens, 2)?;
            let rs1 = parse_register(&tokens[1], mnemonic, 1)?;
            let rs2 = parse_register(&tokens[2], mnemonic, 2)?;
            Ok(isa::encode_r(isa::OP_STORE, 0, rs1, rs2))
        }

        "LOADI" => {
            check_operand_count(mnemonic, tokens, 2)?;
            let rd   = parse_register(&tokens[1], mnemonic, 1)?;
            let imm  = parse_immediate(&tokens[2], mnemonic, 2)?;
            let imm6 = check_imm6(mnemonic, imm)?;
            Ok(isa::encode_i(isa::OP_LOADI, rd, 0, imm6))
        }

        "ADDI" => {
            check_operand_count(mnemonic, tokens, 3)?;
            let rd   = parse_register(&tokens[1], mnemonic, 1)?;
            let rs1  = parse_register(&tokens[2], mnemonic, 2)?;
            let imm  = parse_immediate(&tokens[3], mnemonic, 3)?;
            let imm6 = check_imm6(mnemonic, imm)?;
            Ok(isa::encode_i(isa::OP_ADDI, rd, rs1, imm6))
        }

        "JMP" => {
            check_operand_count(mnemonic, tokens, 1)?;
            let addr = parse_immediate(&tokens[1], mnemonic, 1)?;
            let a9   = check_addr9(mnemonic, addr)?;
            Ok(isa::encode_j(isa::OP_JMP, a9))
        }

        "JMPZ" => {
            check_operand_count(mnemonic, tokens, 1)?;
            let addr = parse_immediate(&tokens[1], mnemonic, 1)?;
            let a9   = check_addr9(mnemonic, addr)?;
            Ok(isa::encode_j(isa::OP_JMPZ, a9))
        }

        "HALT" => {
            check_operand_count(mnemonic, tokens, 0)?;
            Ok(0xF000)
        }

        "NOP" => {
            check_operand_count(mnemonic, tokens, 0)?;
            Ok(isa::encode_r(isa::OP_ADD, 0, 0, 0))
        }

        other => Err(AssemblyError::UnknownMnemonic(other.to_string())),
    }
}

fn mnemonic_to_opcode(mnemonic: &str) -> u16 {
    match mnemonic {
        "ADD" => isa::OP_ADD,
        "SUB" => isa::OP_SUB,
        "AND" => isa::OP_AND,
        "OR"  => isa::OP_OR,
        _     => unreachable!(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::assembler::lexer::tokenise;

    fn enc(line: &str) -> Result<u16, AssemblyError> {
        encode(&tokenise(line))
    }

    fn ok(line: &str) -> u16 {
        enc(line).expect("expected successful encoding")
    }

    #[test]
    fn add_r3_r1_r2() {
        assert_eq!(ok("ADD R3 R1 R2"), isa::encode_r(isa::OP_ADD, 3, 1, 2));
    }

    #[test]
    fn add_wrong_operand_count() {
        assert!(matches!(
            enc("ADD R1 R2"),
            Err(AssemblyError::WrongOperandCount { .. })
        ));
    }

    #[test]
    fn sub_r1_r1_r2() {
        assert_eq!(ok("SUB R1 R1 R2"), isa::encode_r(isa::OP_SUB, 1, 1, 2));
    }

    #[test]
    fn and_encodes_correctly() {
        assert_eq!(ok("AND R4 R2 R3"), isa::encode_r(isa::OP_AND, 4, 2, 3));
    }

    #[test]
    fn or_encodes_correctly() {
        assert_eq!(ok("OR R5 R1 R2"), isa::encode_r(isa::OP_OR, 5, 1, 2));
    }

    #[test]
    fn not_r1_r0() {
        assert_eq!(ok("NOT R1 R0"), isa::encode_r(isa::OP_NOT, 1, 0, 0));
    }

    #[test]
    fn not_wrong_operand_count() {
        assert!(matches!(
            enc("NOT R1 R2 R3"),
            Err(AssemblyError::WrongOperandCount { .. })
        ));
    }

    #[test]
    fn loadi_positive() {
        assert_eq!(ok("LOADI R1 10"), isa::encode_i(isa::OP_LOADI, 1, 0, 10));
    }

    #[test]
    fn loadi_zero() {
        assert_eq!(ok("LOADI R2 0"), isa::encode_i(isa::OP_LOADI, 2, 0, 0));
    }

    #[test]
    fn loadi_max_positive_imm6() {
        assert_eq!(ok("LOADI R1 31"), isa::encode_i(isa::OP_LOADI, 1, 0, 31));
    }

    #[test]
    fn loadi_negative_one_as_u16() {
        assert_eq!(ok("LOADI R1 0xFFFF"), isa::encode_i(isa::OP_LOADI, 1, 0, 0x3F));
    }

    #[test]
    fn addi_r2_r1_5() {
        assert_eq!(ok("ADDI R2 R1 5"), isa::encode_i(isa::OP_ADDI, 2, 1, 5));
    }

    #[test]
    fn load_r3_r2() {
        assert_eq!(ok("LOAD R3 R2"), isa::encode_r(isa::OP_LOAD, 3, 2, 0));
    }

    #[test]
    fn store_r1_r2() {
        assert_eq!(ok("STORE R1 R2"), isa::encode_r(isa::OP_STORE, 0, 1, 2));
    }

    #[test]
    fn jmp_addr_5() {
        assert_eq!(ok("JMP 5"), isa::encode_j(isa::OP_JMP, 5));
    }

    #[test]
    fn jmp_addr_out_of_range() {
        assert!(matches!(
            enc("JMP 512"),
            Err(AssemblyError::ImmediateOutOfRange { .. })
        ));
    }

    #[test]
    fn halt_encodes_to_0xf000() {
        assert_eq!(ok("HALT"), 0xF000);
    }

    #[test]
    fn nop_encodes_to_add_r0_r0_r0() {
        assert_eq!(ok("NOP"), isa::encode_r(isa::OP_ADD, 0, 0, 0));
    }

    #[test]
    fn unknown_mnemonic() {
        assert!(matches!(
            enc("PUSH R1"),
            Err(AssemblyError::UnknownMnemonic(_))
        ));
    }

    #[test]
    fn unknown_register() {
        assert!(matches!(
            enc("ADD R8 R1 R2"),
            Err(AssemblyError::UnknownRegister(_))
        ));
    }
}