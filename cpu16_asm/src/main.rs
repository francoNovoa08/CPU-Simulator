//! Command line assembler
//!
//! Usage:
//!   cpu16_asm <input.asm>              # write <input.bin>
//!   cpu16_asm <input.asm> -o out.bin   # explicit output path
//!   cpu16_asm <input.asm> --listing    # print address + hex + source to stdout
//!   cpu16_asm <input.asm> --format json # print word array as JSON to stdout

use std::path::PathBuf;
use std::process;

use cpu16_core::assembler::assemble;

fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 2 {
        eprintln!("usage: cpu16_asm <input.asm> [-o output.bin] [--listing] [--format json]");
        process::exit(1);
    }

    let input_path = PathBuf::from(&args[1]);
    let source = std::fs::read_to_string(&input_path).unwrap_or_else(|e| {
        eprintln!("error: could not read '{}': {e}", input_path.display());
        process::exit(1);
    });

    let words = assemble(&source).unwrap_or_else(|e| {
        eprintln!("error: {e}");
        process::exit(1);
    });

    let has_listing = args.iter().any(|a| a == "--listing");
    let format_json = args
        .windows(2)
        .any(|w| w[0] == "--format" && w[1] == "json");
    let output_path: Option<PathBuf> = args
        .windows(2)
        .find(|w| w[0] == "-o")
        .map(|w| PathBuf::from(&w[1]));

    if has_listing {
        let source_lines: Vec<&str> = source.lines().collect();
        let mut word_idx = 0usize;
        for line in &source_lines {
            let stripped = match line.find(';') {
                Some(p) => line[..p].trim(),
                None => line.trim(),
            };
            if stripped.is_empty() {
                println!("          {line}");
                continue;
            }
            let is_label_only = stripped.split_whitespace().all(|t| t.ends_with(':'));
            if is_label_only {
                println!("          {line}");
                continue;
            }
            if word_idx < words.len() {
                println!("{:04X}  {:04X}  {line}", word_idx, words[word_idx]);
                word_idx += 1;
            }
        }
        return;
    }

    if format_json {
        let json = words
            .iter()
            .map(|w| w.to_string())
            .collect::<Vec<_>>()
            .join(",");
        println!("[{json}]");
        return;
    }

    let out = output_path.unwrap_or_else(|| input_path.with_extension("bin"));

    let bytes: Vec<u8> = words.iter().flat_map(|w| w.to_be_bytes()).collect();

    std::fs::write(&out, &bytes).unwrap_or_else(|e| {
        eprintln!("error: could not write '{}': {e}", out.display());
        process::exit(1);
    });

    eprintln!("assembled {} word(s) → {}", words.len(), out.display());
}
