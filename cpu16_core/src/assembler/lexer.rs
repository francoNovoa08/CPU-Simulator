//! Breaks up a line of assembly code into a vector of tokens.

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Token {
    Label(String),
    /// A mnemonic or register name, e.g. `ADD`, `R1`.
    Ident(String),
    /// Decimal or hex
    Number(u16),
}

/// Tokenises a line of assembly source code
/// 
/// Returns an empty vector for blank and comment lines
pub fn tokenise(line: &str) -> Vec<Token> {
    let stripped = match line.find(";") {
        Some(pos) => &line[..pos],
        None => line,
    };

    stripped
        .split_whitespace()
        .filter_map(classify)
        .collect()
}

/// Takes a raw token and classifies it as a label, identifier, or number (Token enum).
fn classify(raw: &str) -> Option<Token> {
    if raw.ends_with(":") {
        let name = raw.trim_end_matches(":").to_ascii_uppercase();
        return Some(Token::Label(name));
    }

    if let Some(hex) = raw.strip_prefix("0x").or_else(|| raw.strip_prefix("0X"))
        && let Ok(n) = u16::from_str_radix(hex, 16) {
            return Some(Token::Number(n));
        }

    if let Ok(n) = raw.parse::<u16>() {
        return Some(Token::Number(n));
    }

    Some(Token::Ident(raw.to_ascii_uppercase()))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ident(s: &str) -> Token { Token::Ident(s.to_string()) }
    fn label(s: &str) -> Token { Token::Label(s.to_string()) }
    fn num(n: u16) -> Token { Token::Number(n) }

    #[test]
    fn empty_line_gives_no_tokens() {
        assert!(tokenise("").is_empty());
    }

    #[test]
    fn comment_only_gives_no_tokens() {
        assert!(tokenise("; this is a comment").is_empty());
    }

    #[test]
    fn inline_comment_is_stripped() {
        let tokens = tokenise("ADD R1 R2 R3 ; add them");
        assert_eq!(tokens, vec![ident("ADD"), ident("R1"), ident("R2"), ident("R3")]);
    }

    #[test]
    fn mnemonic_is_uppercased() {
        let tokens = tokenise("add");
        assert_eq!(tokens, vec![ident("ADD")]);
    }

    #[test]
    fn decimal_literal() {
        let tokens = tokenise("LOADI R1 42");
        assert_eq!(tokens, vec![ident("LOADI"), ident("R1"), num(42)]);
    }

    #[test]
    fn hex_literal_lowercase_prefix() {
        let tokens = tokenise("LOADI R2 0xff");
        assert_eq!(tokens, vec![ident("LOADI"), ident("R2"), num(255)]);
    }

    #[test]
    fn hex_literal_uppercase_prefix() {
        let tokens = tokenise("LOADI R2 0XFF");
        assert_eq!(tokens, vec![ident("LOADI"), ident("R2"), num(255)]);
    }

    #[test]
    fn zero_literal() {
        let tokens = tokenise("LOADI R1 0");
        assert_eq!(tokens[2], num(0));
    }

    #[test]
    fn max_u16_hex() {
        let tokens = tokenise("LOADI R1 0xFFFF");
        assert_eq!(tokens[2], num(0xFFFF));
    }

    #[test]
    fn label_definition_strips_colon() {
        let tokens = tokenise("loop:");
        assert_eq!(tokens, vec![label("LOOP")]);
    }

    #[test]
    fn label_is_uppercased() {
        let tokens = tokenise("myLabel:");
        assert_eq!(tokens, vec![label("MYLABEL")]);
    }
}