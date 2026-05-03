//! Module to translate assembly code into machine code.

pub mod encoder;
pub mod lexer;

use encoder::{AssemblyError, encode};
use lexer::{Token, tokenise};
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AssembleError {
    pub line: usize,
    pub source: AssemblyError,
}

impl std::fmt::Display for AssembleError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "line {}: {}", self.line, self.source)
    }
}

impl std::error::Error for AssembleError {}

/// Assemble a complete source string into a word array.
///
/// Returns the assembled words on success, or the first error encountered.
/// Line numbers in errors are 1-indexed.
pub fn assemble(source: &str) -> Result<Vec<u16>, AssembleError> {
    let lines: Vec<&str> = source.lines().collect();

    let mut symbols: HashMap<String, u16> = HashMap::new();
    let mut pc: u16 = 0;

    for (i, line) in lines.iter().enumerate() {
        let tokens = tokenise(line);
        if tokens.is_empty() {
            continue;
        }

        let mut rest = tokens.as_slice();

        while let Some(Token::Label(name)) = rest.first() {
            if symbols.insert(name.clone(), pc).is_some() {
                return Err(AssembleError {
                    line: i + 1,
                    source: AssemblyError::UnknownMnemonic(format!("duplicate label '{name}'")),
                });
            }
            rest = &rest[1..];
        }

        if !rest.is_empty() {
            pc = pc.wrapping_add(1);
        }
    }

    let mut words: Vec<u16> = Vec::new();
    for (i, line) in lines.iter().enumerate() {
        let tokens = tokenise(line);
        if tokens.is_empty() {
            continue;
        }

        let rest: Vec<Token> = tokens
            .into_iter()
            .skip_while(|t| matches!(t, Token::Label(_)))
            .collect();

        if rest.is_empty() {
            continue;
        }

        let resolved: Result<Vec<Token>, AssembleError> = rest
            .into_iter()
            .map(|token| match token {
                Token::Ident(ref name) if symbols.contains_key(name.as_str()) => {
                    Ok(Token::Number(symbols[name.as_str()]))
                }
                other => Ok(other),
            })
            .collect();

        let resolved = resolved?;

        let word = encode(&resolved).map_err(|e| AssembleError {
            line: i + 1,
            source: e,
        })?;

        words.push(word);
    }

    Ok(words)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn asm(src: &str) -> Vec<u16> {
        assemble(src).expect("assembly failed")
    }

    #[test]
    fn empty_source_gives_no_words() {
        assert!(asm("").is_empty());
    }

    #[test]
    fn comment_only_gives_no_words() {
        assert!(asm("; just a comment\n\n  ").is_empty());
    }

    #[test]
    fn single_halt() {
        assert_eq!(asm("HALT"), vec![0xF000]);
    }

    #[test]
    fn two_instructions() {
        let words = asm("LOADI R1 5\nHALT");
        assert_eq!(words.len(), 2);
        assert_eq!(words[1], 0xF000);
    }

    #[test]
    fn label_resolves_to_correct_address() {
        let words = asm("LOADI R1 1\ndone:\nHALT");
        let words2 = asm("LOADI R1 1\ndone:\nHALT\nJMPZ done");
        use crate::isa;
        assert_eq!(words2[2], isa::encode_j(isa::OP_JMPZ, 1));
        let _ = words;
    }

    #[test]
    fn unknown_mnemonic_reports_line_number() {
        let err = assemble("LOADI R1 1\nPUSH R2\nHALT").unwrap_err();
        assert_eq!(err.line, 2);
    }

    #[test]
    fn immediate_out_of_range_reports_line_number() {
        let err = assemble("LOADI R1 999").unwrap_err();
        assert_eq!(err.line, 1);
    }
}
