"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
    Cpu,
    BookOpen,
    ArrowRight,
    Terminal,
    Zap,
    Code2,
    ChevronRight,
} from "lucide-react";

const Github = ({ size = 24, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.8 0-1.5-.5-2.8-1.5-3.8.1-.4.6-1.8-.1-3.8 0 0-1-1-3 0-1-.3-2-.5-3-.5s-2 .2-3 .5c-2-1-2-1-3 0-.7 2-.2 3.4-.1 3.8-1 1-1.5 2.3-1.5 3.8 0 5.2 3 6.5 6 6.8-.3.3-.5.8-.6 1.4-.6.3-1.2.4-1.9.4-.8 0-1.5-.3-2-1-.5-.7-1-1-1.8-1-.8 0-1.2.5-1.2.5s.4.8.8 1c.5.3 1 .9 1.2 1.6.2.7.9 1.1 1.7 1.1.6 0 1.3-.1 1.9-.4V22" />
    </svg>
);

// --- Animation Variants ---
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-300 selection:bg-cyan-500/30 selection:text-cyan-100 font-sans overflow-x-hidden">
            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#09090b]/70 backdrop-blur-md"
            >
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                        <Cpu size={18} />
                    </div>
                    <span className="font-mono text-base font-bold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                        cpu16
                    </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-4">
                    <Link
                        href="/emulator"
                        className="relative px-3 py-2 text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors group"
                    >
                        Emulator
                        <span className="absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link
                        href="/labs/1"
                        className="relative px-3 py-2 text-sm font-medium text-zinc-400 hover:text-blue-400 transition-colors group"
                    >
                        Labs
                        <span className="absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-blue-500/0 via-blue-400 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    <div className="w-px h-4 bg-zinc-800 mx-2 hidden sm:block" />

                    <a
                        href="https://github.com/francoNovoa08/CPU-Simulator"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95"
                    >
                        <Github
                            size={14}
                            className="group-hover:rotate-12 transition-transform duration-300"
                        />
                        <span>Source</span>
                    </a>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative flex min-h-dvh flex-col items-center px-6 pt-32 pb-8 overflow-hidden">
                {/* Hardware Grid Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                </div>

                {/* Glowing Orbs */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute top-1/3 left-1/3 w-75 h-75 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"
                />

                <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center text-center max-w-4xl w-full"
                    >

                        <motion.h1 variants={fadeUp} className="mb-6 text-5xl sm:text-7xl font-extrabold leading-[1.1] tracking-tight text-white">
                            A CPU, built from <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 animate-gradient-x">
                                first principles
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="mb-8 max-w-2xl text-lg text-zinc-400 leading-relaxed font-light">
                            A custom 16-bit RISC ISA, an assembler and
                            cycle-accurate emulator written in Rust, compiled to
                            WebAssembly, and wired to an animated datapath diagram.
                        </motion.p>
                        
                        <motion.p variants={fadeUp} className="mb-12 font-mono text-sm text-zinc-500">
                            <span className="text-green-400">✓</span> Running purely
                            in the browser. Zero dependencies.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <Link
                                href="/emulator"
                                className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95"
                            >
                                Open Emulator
                                <ArrowRight
                                    size={16}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </Link>
                            <Link
                                href="/labs/1"
                                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-8 py-3.5 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white active:scale-95"
                            >
                                <BookOpen
                                    size={16}
                                    className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
                                />
                                Start Lab 1
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="z-10 mt-auto pt-16 flex flex-col items-center gap-3 animate-bounce"
                >
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                        Scroll
                    </span>
                    <div className="h-12 w-px bg-linear-to-b from-zinc-600 to-transparent" />
                </motion.div>
            </section>

            {/* Architecture Stack */}
            <section className="relative px-6 py-16 sm:py-24 border-t border-white/5">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="mx-auto max-w-5xl"
                >
                    <motion.div variants={fadeUp} className="mb-12">
                        <h2 className="mb-3 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-widest text-blue-500">
                            <Code2 size={16} /> Under the hood
                        </h2>
                        <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Every layer built from scratch
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STACK_ITEMS.map((item) => (
                            <motion.div
                                variants={fadeUp}
                                key={item.title}
                                className="group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/2 p-8 hover:bg-white/4 transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.15)]"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    {item.icon}
                                </div>
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-blue-100 transition-colors">
                                        {item.title}
                                    </h3>
                                    <span className="mt-1 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                        {item.layer} Layer
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-400 leading-relaxed grow">
                                    {item.description}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-white/5">
                                    {item.tags.map((t) => (
                                        <span
                                            key={t}
                                            className="rounded-md bg-black/50 border border-white/10 px-2.5 py-1 font-mono text-[11px] text-zinc-300"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Labs Section */}
            <section className="relative px-6 py-16 sm:py-24 border-t border-white/5 bg-zinc-900/20">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="mx-auto max-w-4xl"
                >
                    <motion.div variants={fadeUp} className="mb-12">
                        <h2 className="mb-3 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-widest text-cyan-500">
                            <Zap size={16} /> Educational Labs
                        </h2>
                        <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Experiments, live in the browser
                        </p>
                    </motion.div>

                    <div className="flex flex-col gap-6">
                        {LABS.map((lab, i) => (
                            <motion.div variants={fadeUp} key={lab.id}>
                                <Link
                                    href={`/labs/${lab.id}`}
                                    className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-white/5 bg-black/40 p-6 hover:border-cyan-500/30 hover:bg-cyan-950/20 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-center w-16 h-16 shrink-0 rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all">
                                        <span className="font-mono text-2xl font-bold text-zinc-500 group-hover:text-cyan-400 transition-colors">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="mb-2 text-lg font-bold text-zinc-200 group-hover:text-white transition-colors">
                                            {lab.title}
                                        </h3>
                                        <p className="mb-4 text-sm text-zinc-400 leading-relaxed">
                                            {lab.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {lab.wires.map((w) => (
                                                <span
                                                    key={w}
                                                    className="rounded bg-zinc-800 px-2 py-1 font-mono text-[10px] text-zinc-300 border border-zinc-700/50 group-hover:bg-cyan-900/40 group-hover:border-cyan-700/50 group-hover:text-cyan-200 transition-colors"
                                                >
                                                    {w}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute right-6 top-6 sm:relative sm:top-auto sm:right-auto h-10 w-10 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-cyan-500 text-zinc-500 group-hover:text-white transition-all">
                                        <ChevronRight
                                            size={18}
                                            className="group-hover:translate-x-0.5 transition-transform"
                                        />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ISA Section */}
            <section className="relative px-6 py-16 sm:py-24 border-t border-white/5">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="mx-auto max-w-5xl"
                >
                    <motion.div variants={fadeUp} className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <h2 className="mb-3 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-widest text-blue-500">
                                <Terminal size={16} /> Instruction Set
                            </h2>
                            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                12 instructions. Turing complete.
                            </p>
                        </div>
                        <div className="text-sm font-mono text-zinc-500 border border-zinc-800 rounded-lg px-4 py-2 bg-zinc-900/50">
                            Architecture: 16-bit word size
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="rounded-xl border border-white/10 bg-black overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-zinc-900/80 backdrop-blur-sm font-mono text-xs">
                                        <th className="px-6 py-4 text-zinc-400 font-semibold tracking-widest uppercase">
                                            Opcode
                                        </th>
                                        <th className="px-6 py-4 text-zinc-400 font-semibold tracking-widest uppercase">
                                            Mnemonic
                                        </th>
                                        <th className="px-6 py-4 text-zinc-400 font-semibold tracking-widest uppercase">
                                            Syntax
                                        </th>
                                        <th className="px-6 py-4 text-zinc-400 font-semibold tracking-widest uppercase">
                                            Semantics
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="font-mono text-sm">
                                    {ISA.map((row) => (
                                        <tr
                                            key={row.mnemonic}
                                            className="group border-b border-white/5 last:border-0 hover:bg-blue-500/5 transition-colors"
                                        >
                                            <td className="px-6 py-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                                {row.opcode}
                                            </td>
                                            <td className="px-6 py-3.5 text-blue-400 font-bold group-hover:text-blue-300 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all">
                                                {row.mnemonic}
                                            </td>
                                            <td className="px-6 py-3.5 text-zinc-300">
                                                {row.syntax
                                                    .split(" ")
                                                    .map((part, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={
                                                                idx === 0
                                                                    ? "text-blue-400/80 mr-2"
                                                                    : "text-zinc-400 mr-2"
                                                            }
                                                        >
                                                            {part}
                                                        </span>
                                                    ))}
                                            </td>
                                            <td className="px-6 py-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                                {row.semantics}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* CTA Section */}
            <section className="relative border-t border-white/5 px-6 py-24 overflow-hidden bg-blue-950/10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 mx-auto max-w-3xl flex flex-col items-center text-center gap-8"
                >
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <Cpu size={40} />
                    </div>
                    <div>
                        <h2 className="mb-4 text-4xl font-bold text-white tracking-tight">
                            Ready to step through code?
                        </h2>
                        <p className="max-w-xl mx-auto text-lg text-zinc-400 leading-relaxed">
                            Write assembly, compile it on the fly, and watch the
                            electrical signals flow through the datapath on
                            every clock cycle.
                        </p>
                    </div>
                    <Link
                        href="/emulator"
                        className="group flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] hover:-translate-y-1"
                    >
                        Launch Emulator{" "}
                        <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 px-6 py-8 bg-black">
                <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-zinc-600" />
                        <span className="font-mono text-sm text-zinc-400 font-semibold">
                            cpu16
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/francoNovoa08/CPU-Simulator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            <Github
                                size={16}
                                className="group-hover:text-white transition-colors"
                            />{" "}
                            GitHub
                        </a>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-sm text-zinc-500 font-mono">
                            Rust · WASM · Next.js
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const STACK_ITEMS = [
    {
        layer: "Backend",
        icon: <Code2 size={14} />,
        title: "Rust emulator core",
        description:
            "Custom ISA, two-pass assembler, ALU, memory subsystem, and cycle-accurate fetch-decode-execute, all unit-tested natively then compiled to WASM.",
        tags: ["Rust", "wasm-pack", "wasm-bindgen"],
    },
    {
        layer: "Bridge",
        icon: <Zap size={14} />,
        title: "WASM bindings",
        description:
            "A thin JS boundary exposes Rust-defined functions. Each step returns a structured delta.",
        tags: ["wasm-bindgen", "TypeScript", "JSON delta"],
    },
    {
        layer: "Frontend",
        icon: <Terminal size={14} />,
        title: "Animated datapath",
        description:
            "SVG datapath with wire animations driven by the step delta. CodeMirror editor with a custom assembly syntax highlighter.",
        tags: ["Next.js", "SVG", "CodeMirror 6", "Tailwind"],
    },
];

const LABS = [
    {
        id: 1,
        title: "Basic ALU Operations — Adding Two Numbers",
        description:
            "Load two immediates into registers, pass them through the ALU, and observe the result wire up to a destination register. The foundation computation.",
        wires: ["rs1_to_alu", "rs2_to_alu", "alu_to_rd"],
    },
    {
        id: 2,
        title: "Control Flow — Building a Loop",
        description:
            "The program counter is just a number. JMPZ changes it conditionally. Watch a countdown loop execute and observe exactly when the zero flag gates the branch.",
        wires: ["alu_to_flags", "alu_to_pc"],
    },
    {
        id: 3,
        title: "Memory-Mapped I/O — Controlling External Hardware",
        description:
            "Address 0xFFFF is the output register. A STORE instruction triggers it. The puzzle: LOADI only holds 6 bits — how do you load 65535 into a register?",
        wires: ["rs1_to_ram", "rd_to_mmio"],
    },
];

const ISA = [
    {
        opcode: "0000",
        mnemonic: "ADD",
        syntax: "ADD RD RS1 RS2",
        semantics: "RD ← RS1 + RS2; set Z",
    },
    {
        opcode: "0001",
        mnemonic: "SUB",
        syntax: "SUB RD RS1 RS2",
        semantics: "RD ← RS1 − RS2; set Z",
    },
    {
        opcode: "0010",
        mnemonic: "AND",
        syntax: "AND RD RS1 RS2",
        semantics: "RD ← RS1 & RS2; set Z",
    },
    {
        opcode: "0011",
        mnemonic: "OR",
        syntax: "OR RD RS1 RS2",
        semantics: "RD ← RS1 | RS2; set Z",
    },
    {
        opcode: "0100",
        mnemonic: "NOT",
        syntax: "NOT RD RS1",
        semantics: "RD ← ~RS1; set Z",
    },
    {
        opcode: "0101",
        mnemonic: "LOADI",
        syntax: "LOADI RD IMM6",
        semantics: "RD ← sign-extend(IMM6); set Z",
    },
    {
        opcode: "0110",
        mnemonic: "LOAD",
        syntax: "LOAD RD RS1",
        semantics: "RD ← MEM[RS1]",
    },
    {
        opcode: "0111",
        mnemonic: "STORE",
        syntax: "STORE RS1 RS2",
        semantics: "MEM[RS2] ← RS1",
    },
    {
        opcode: "1000",
        mnemonic: "JMP",
        syntax: "JMP ADDR9",
        semantics: "PC ← ADDR9",
    },
    {
        opcode: "1001",
        mnemonic: "JMPZ",
        syntax: "JMPZ ADDR9",
        semantics: "PC ← ADDR9 if Z",
    },
    {
        opcode: "1010",
        mnemonic: "ADDI",
        syntax: "ADDI RD RS1 IMM6",
        semantics: "RD ← RS1 + sign-extend(IMM6)",
    },
    {
        opcode: "1111",
        mnemonic: "HALT",
        syntax: "HALT",
        semantics: "Stop execution",
    },
];