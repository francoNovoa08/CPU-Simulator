# A 16-Bit RISC CPU Emulator
A custom instruction set architecture, assembler, and cycle-accurate emulator written in Rust, compiled to WebAssembly, and deployed as an interactive educational platform for students.

**Live:** https://francoNovoa08.github.io/CPU-Simulator  

## Architecture

The project is a Cargo workspace with two crates and a Next.js frontend.

### The ISA

All instructions are 16 bits wide. Three encoding formats:
| Format | Layout | Instructions |
|--------|--------|-------------|
| R | `OPCODE[15:12] \| RD[11:9] \| RS1[8:6] \| RS2[5:3] \| 000` | ADD SUB AND OR NOT LOAD STORE |
| I | `OPCODE[15:12] \| RD[11:9] \| RS1[8:6] \| IMM6[5:0]` | LOADI ADDI |
| J | `OPCODE[15:12] \| 000 \| ADDR9[8:0]` | JMP JMPZ |
| N | `OPCODE[15:12] \| 000000000000` | HALT |

HALT takes no operands and stops the fetch-decode-execute loop; every subsequent `step()` call is a no-op until the CPU is reset.

R0 is hardwired zero. Writes to R0 are silently discarded, reads always return 0. This eliminates a dedicated CLEAR instruction and encodes NOP as `ADD R0 R0 R0`.

Address `0xFFFF` is the memory-mapped I/O register. Any STORE to it triggers the frontend's output display. 

### The backend

The Rust core is unit-tested natively before any WASM is involved.
```
cargo test
```

`wasm-pack` compiles `cpu16_core` to a WASM module with TypeScript-typed bindings. The WASM API is deliberately thin.

### The frontend
The datapath is an SVG. Each path has a `data-wire` attribute matching the wire identifiers from the Rust backend. A React effect applies a CSS class to the matching paths on each step, triggering a flowing dash animation:

```css
.wire-active {
  stroke: #3b82f6;
  stroke-dasharray: 6 6;
  animation: wire-flow 0.8s linear infinite;
}
```

This requires no dependencies. The SVG paths are positioned to reflect actual data flow.

The code editor uses CodeMirror 6 with a custom `StreamLanguage` definition for the assembly dialect. Mnemonics, registers, labels, and immediates each have their own token type and highlight colour.

## The assembler

The CLI assembler (`cpu16_asm`) produces flat binaries, human-readable listings, or JSON word arrays.

The same assembler logic runs in the browser via WASM. There is no separate JS implementation.

## Educational labs

Three structured labs are built into the platform, each pre-loaded with a starter program and guided questions:

**Lab 1: Basic ALU operations.** Load two immediates, add them, observe `rs1_to_alu`, `rs2_to_alu`, and `alu_to_rd` light up in sequence. Students decode the ADD instruction word by hand using the ISA table.

**Lab 2: Control flow.** A countdown loop using SUB and JMPZ. Students watch the PC jump backwards and observe the zero flag gate the branch. The guided question asks them to count how many times SUB executes before the halt, which requires them to trace execution mentally rather than just watch.

**Lab 3: Memory-mapped I/O.** The MMIO puzzle: `LOADI` holds 6 bits; 0xFFFF needs 16. Students must discover that `NOT R1 R0` (NOT of the hardwired zero register) gives them `0xFFFF` in a single instruction. When the STORE hits `0xFFFF`, the output box on the datapath turns green and the `rd_to_mmio` wire fires.
