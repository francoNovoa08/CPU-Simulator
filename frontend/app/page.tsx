"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Cpu, BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { useState, useEffect } from "react";

type Category = "alu" | "memory" | "control";

const CATEGORY_STYLES: Record<
    Category,
    {
        label: string;
        text: string;
        textMuted: string;
        rowHover: string;
        dot: string;
    }
> = {
    alu: {
        label: "ALU",
        text: "text-blue-400",
        textMuted: "text-blue-400/80",
        rowHover: "hover:bg-blue-500/5",
        dot: "bg-blue-400",
    },
    memory: {
        label: "Memory",
        text: "text-amber-400",
        textMuted: "text-amber-400/80",
        rowHover: "hover:bg-amber-500/5",
        dot: "bg-amber-400",
    },
    control: {
        label: "Control",
        text: "text-violet-400",
        textMuted: "text-violet-400/80",
        rowHover: "hover:bg-violet-500/5",
        dot: "bg-violet-400",
    },
};

interface Instruction {
    opcode: string;
    mnemonic: string;
    syntax: string;
    semantics: string;
    category: Category;
}

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

function RegisterReadout() {
    const [registers, setRegisters] = useState<number[]>([
        0x0000, 0x0000, 0x0000, 0x0000,
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRegisters((prev) => {
                const next = [...prev];
                const i = Math.floor(Math.random() * next.length);
                next[i] = Math.floor(Math.random() * 0x10000);
                return next;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="hidden lg:block absolute top-28 right-6 rounded-lg border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs"
        >
            <p className="mb-2 text-[9px] uppercase tracking-widest text-zinc-600">
                Register file
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {registers.map((value, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 text-zinc-400"
                    >
                        <span className="text-zinc-600">R{i}</span>
                        <span className="text-zinc-200">
                            0x
                            {value.toString(16).toUpperCase().padStart(4, "0")}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function WireDiagram({ wires }: { wires: string[] }) {
    const edges = wires.map((w) => {
        const [from, to] = w.split("_to_");
        return { from, to };
    });

    const sources = new Set(edges.map((e) => e.from));
    const dests = new Set(edges.map((e) => e.to));
    const nodes = Array.from(new Set(edges.flatMap((e) => [e.from, e.to])));

    const columns: string[][] = [[], [], []];
    nodes.forEach((node) => {
        if (sources.has(node) && dests.has(node)) columns[1].push(node);
        else if (dests.has(node)) columns[2].push(node);
        else columns[0].push(node);
    });

    const colX = [16, 90, 164];
    const positions: Record<string, { x: number; y: number }> = {};
    columns.forEach((col, c) => {
        col.forEach((node, i) => {
            const y = 24 + (i - (col.length - 1) / 2) * 18;
            positions[node] = { x: colX[c], y };
        });
    });

    return (
        <svg viewBox="0 0 180 48" className="w-28 h-8 shrink-0">
            {edges.map((e, i) => {
                const from = positions[e.from];
                const to = positions[e.to];
                if (!from || !to) return null;
                return (
                    <line
                        key={i}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="#3f3f46"
                        strokeWidth={1}
                    />
                );
            })}
            {nodes.map((node) => {
                const pos = positions[node];
                if (!pos) return null;
                return (
                    <circle
                        key={node}
                        cx={pos.x}
                        cy={pos.y}
                        r={2.5}
                        fill="#71717a"
                    />
                );
            })}
        </svg>
    );
}

// --- Animation Variants ---
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
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
        <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-zinc-700/40 selection:text-zinc-100 font-sans overflow-x-hidden">
            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/70 backdrop-blur-md"
            >
                <div className="flex items-center gap-2 cursor-pointer">
                    <Cpu size={18} className="text-zinc-400" />
                    <span className="font-mono text-base font-bold text-zinc-100 tracking-tight">
                        cpu16
                    </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-4">
                    <Link
                        href="/emulator"
                        className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Emulator
                    </Link>
                    <Link
                        href="/labs/1"
                        className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Labs
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
                {/* Hardware grid background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                </div>

                <RegisterReadout />

                <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center text-center max-w-4xl w-full"
                    >
                        <motion.h1
                            variants={fadeUp}
                            className="mb-6 text-5xl sm:text-7xl font-extrabold leading-[1.1] tracking-tight text-white"
                        >
                            A CPU, built from <br className="hidden sm:block" />
                            first principles
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="mb-8 max-w-2xl text-lg text-zinc-400 leading-relaxed font-light"
                        >
                            A custom 16-bit RISC ISA, an assembler and
                            cycle-accurate emulator written in Rust, compiled to
                            WebAssembly, and wired to an animated datapath
                            diagram.
                        </motion.p>

                        <motion.p
                            variants={fadeUp}
                            className="mb-12 font-mono text-sm text-zinc-500"
                        >
                            Running purely in the browser — zero dependencies.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                        >
                            <Link
                                href="/emulator"
                                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-zinc-100 px-8 py-3.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-white active:scale-95"
                            >
                                Open Emulator
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/labs/1"
                                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-zinc-700 px-8 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-white active:scale-95"
                            >
                                <BookOpen size={16} className="text-zinc-500" />
                                Start Lab 1
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="z-10 mt-auto pt-16 flex flex-col items-center gap-3"
                >
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                        Scroll
                    </span>
                    <div className="h-12 w-px bg-linear-to-b from-zinc-600 to-transparent" />
                </motion.div>
            </section>

            {/* Architecture Stack */}
            <section className="relative px-6 py-16 sm:py-24 border-t border-white/5">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-12">
                        <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                            Under the hood
                        </h2>
                        <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Every layer built from scratch
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 items-stretch">
                        {STACK_ITEMS.map((item, i) => (
                            <Fragment key={item.title}>
                                <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/2 p-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-100">
                                            {item.title}
                                        </h3>
                                        <span className="mt-1 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                            {item.layer} Layer
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-400 leading-relaxed grow">
                                        {item.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                                        {item.tags.map((t) => (
                                            <span
                                                key={t}
                                                className="rounded-md bg-black/50 border border-white/10 px-2.5 py-1 font-mono text-[11px] text-zinc-300"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {i < STACK_ITEMS.length - 1 && (
                                    <div className="hidden md:flex items-center justify-center w-12">
                                        <div className="relative h-4 w-full">
                                            <ChevronRight
                                                size={16}
                                                className="absolute inset-0 m-auto text-zinc-700"
                                            />
                                            <motion.span
                                                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-400"
                                                animate={{
                                                    x: [2, 40],
                                                    opacity: [0, 1, 1, 0],
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    repeatDelay: 3,
                                                    delay: i,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* Labs Section */}
            <section className="relative px-6 py-16 sm:py-24 border-t border-white/5 bg-zinc-900/20">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12">
                        <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                            Educational Labs
                        </h2>
                        <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Experiments, live in the browser
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        {LABS.map((lab, i) => (
                            <Link
                                key={lab.id}
                                href={`/labs/${lab.id}`}
                                className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-white/5 bg-black/40 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
                            >
                                <div className="flex items-center justify-center w-16 h-16 shrink-0 rounded-xl bg-white/5 border border-white/10">
                                    <span className="font-mono text-2xl font-bold text-zinc-500">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="mb-2 text-lg font-bold text-zinc-200 transition-colors group-hover:text-white">
                                        {lab.title}
                                    </h3>
                                    <p className="mb-4 text-sm text-zinc-400 leading-relaxed">
                                        {lab.description}
                                    </p>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <WireDiagram wires={lab.wires} />
                                        <div className="flex flex-wrap gap-2">
                                            {lab.wires.map((w) => (
                                                <span
                                                    key={w}
                                                    className="rounded bg-zinc-800 px-2 py-1 font-mono text-[10px] text-zinc-300 border border-zinc-700/50"
                                                >
                                                    {w}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight
                                    size={18}
                                    className="absolute right-6 top-6 sm:relative sm:top-auto sm:right-auto shrink-0 text-zinc-600"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ISA Section */}
            <section className="relative px-6 py-16 sm:py-24 border-t border-white/5">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                                Instruction Set
                            </h2>
                            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                12 instructions. Turing complete.
                            </p>
                        </div>
                        <div className="text-sm font-mono text-zinc-500 border border-zinc-800 rounded-lg px-4 py-2 bg-zinc-900/50">
                            Architecture: 16-bit word size
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4 font-mono text-xs text-zinc-500">
                        {(Object.keys(CATEGORY_STYLES) as Category[]).map(
                            (key) => (
                                <span
                                    key={key}
                                    className="flex items-center gap-1.5"
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${CATEGORY_STYLES[key].dot}`}
                                    />
                                    {CATEGORY_STYLES[key].label}
                                </span>
                            ),
                        )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-zinc-950 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-zinc-900 font-mono text-xs">
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
                                    {ISA.map((row) => {
                                        const style =
                                            CATEGORY_STYLES[row.category];
                                        return (
                                            <tr
                                                key={row.mnemonic}
                                                className={`border-b border-white/5 last:border-0 transition-colors ${style.rowHover}`}
                                            >
                                                <td className="px-6 py-3.5 text-zinc-500">
                                                    {row.opcode}
                                                </td>
                                                <td
                                                    className={`px-6 py-3.5 font-bold ${style.text}`}
                                                >
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
                                                                        ? `${style.textMuted} mr-2`
                                                                        : "text-zinc-400 mr-2"
                                                                }
                                                            >
                                                                {part}
                                                            </span>
                                                        ))}
                                                </td>
                                                <td className="px-6 py-3.5 text-zinc-500">
                                                    {row.semantics}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative border-t border-white/5 px-6 py-16">
                <div className="mx-auto max-w-2xl flex flex-col items-center text-center gap-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Ready to step through code?
                    </h2>
                    <p className="max-w-md text-zinc-400 leading-relaxed">
                        Try one of the labs above, or open a blank program and
                        write your own.
                    </p>
                    <Link
                        href="/emulator"
                        className="flex items-center gap-2 rounded-lg bg-zinc-100 px-8 py-3.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-white active:scale-95"
                    >
                        Launch Emulator
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 px-6 py-8 bg-zinc-950">
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
        title: "Rust emulator core",
        description:
            "Custom ISA, two-pass assembler, ALU, memory subsystem, and cycle-accurate fetch-decode-execute, all unit-tested natively then compiled to WASM.",
        tags: ["Rust", "wasm-pack", "wasm-bindgen"],
    },
    {
        layer: "Bridge",
        title: "WASM bindings",
        description:
            "A thin JS boundary exposes Rust-defined functions. Each step returns a structured delta.",
        tags: ["wasm-bindgen", "TypeScript", "JSON delta"],
    },
    {
        layer: "Frontend",
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

const ISA: Instruction[] = [
    {
        opcode: "0000",
        mnemonic: "ADD",
        syntax: "ADD RD RS1 RS2",
        semantics: "RD ← RS1 + RS2; set Z",
        category: "alu",
    },
    {
        opcode: "0001",
        mnemonic: "SUB",
        syntax: "SUB RD RS1 RS2",
        semantics: "RD ← RS1 − RS2; set Z",
        category: "alu",
    },
    {
        opcode: "0010",
        mnemonic: "AND",
        syntax: "AND RD RS1 RS2",
        semantics: "RD ← RS1 & RS2; set Z",
        category: "alu",
    },
    {
        opcode: "0011",
        mnemonic: "OR",
        syntax: "OR RD RS1 RS2",
        semantics: "RD ← RS1 | RS2; set Z",
        category: "alu",
    },
    {
        opcode: "0100",
        mnemonic: "NOT",
        syntax: "NOT RD RS1",
        semantics: "RD ← ~RS1; set Z",
        category: "alu",
    },
    {
        opcode: "0101",
        mnemonic: "LOADI",
        syntax: "LOADI RD IMM6",
        semantics: "RD ← sign-extend(IMM6); set Z",
        category: "memory",
    },
    {
        opcode: "0110",
        mnemonic: "LOAD",
        syntax: "LOAD RD RS1",
        semantics: "RD ← MEM[RS1]",
        category: "memory",
    },
    {
        opcode: "0111",
        mnemonic: "STORE",
        syntax: "STORE RS1 RS2",
        semantics: "MEM[RS2] ← RS1",
        category: "memory",
    },
    {
        opcode: "1000",
        mnemonic: "JMP",
        syntax: "JMP ADDR9",
        semantics: "PC ← ADDR9",
        category: "control",
    },
    {
        opcode: "1001",
        mnemonic: "JMPZ",
        syntax: "JMPZ ADDR9",
        semantics: "PC ← ADDR9 if Z",
        category: "control",
    },
    {
        opcode: "1010",
        mnemonic: "ADDI",
        syntax: "ADDI RD RS1 IMM6",
        semantics: "RD ← RS1 + sign-extend(IMM6)",
        category: "alu",
    },
    {
        opcode: "1111",
        mnemonic: "HALT",
        syntax: "HALT",
        semantics: "Stop execution",
        category: "control",
    },
];
