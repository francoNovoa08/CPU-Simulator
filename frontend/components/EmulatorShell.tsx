"use client";

import { useState } from "react";
import { Play, Pause, StepForward, RotateCcw, Terminal } from "lucide-react";
import AsmEditor from "@/components/AsmEditor";
import Datapath from "@/components/Datapath";
import { useCpu } from "@/lib/useCpu";

interface EmulatorShellProps {
    initialProgram: string;
    lockedProgram?: boolean;
}

export default function EmulatorShell({
    initialProgram,
    lockedProgram = false,
}: EmulatorShellProps) {
    const cpu = useCpu();
    const [source, setSource] = useState(initialProgram);

    if (!cpu.wasmReady) {
        return (
            <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
                Loading CPU…
            </div>
        );
    }

    return (
        <div className="flex h-full w-full overflow-hidden bg-[#0d0d0f] text-zinc-300">
            <main className="flex flex-1 min-w-0 flex-row overflow-hidden">
                <div
                    className="flex flex-col border-r border-zinc-800/60 overflow-hidden shrink-0"
                    style={{ width: "35%", minWidth: "320px" }}
                >
                    <div className="flex shrink-0 items-center justify-between px-3 py-2 border-b border-zinc-800/60 bg-[#121214]">
                        <div className="flex items-center gap-2 min-w-0 mr-2">
                            <Terminal
                                size={14}
                                className="text-zinc-500 shrink-0"
                            />
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 truncate">
                                Assembly Editor
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {lockedProgram && (
                                <button
                                    onClick={() => setSource(initialProgram)}
                                    className="flex cursor-pointer items-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all duration-200 whitespace-nowrap"
                                >
                                    <RotateCcw size={11} /> Reset
                                </button>
                            )}
                            <button
                                onClick={() => cpu.assemble(source)}
                                className="flex cursor-pointer items-center gap-1 px-3 py-1.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 hover:border-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-200 text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-[0_0_10px_rgba(37,99,235,0.05)]"
                            >
                                <Play size={11} fill="currentColor" /> Assemble
                            </button>
                        </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-hidden">
                        <AsmEditor value={source} onChange={setSource} />
                    </div>
                    {cpu.assembleError && (
                        <div className="shrink-0 border-t border-red-900 bg-red-950/60 px-4 py-2 font-mono text-xs text-red-400">
                            {cpu.assembleError}
                        </div>
                    )}
                </div>

                <div className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden p-6 datapath-bg">
                    <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] pointer-events-none" />
                    <Datapath
                        activeWires={cpu.state.active_wires}
                        registers={cpu.state.registers}
                        pc={cpu.state.pc}
                        ir={cpu.state.ir}
                        flagZ={cpu.state.flag_z}
                        mmioWrite={cpu.state.mmio_write}
                    />
                </div>
            </main>

            <aside className="flex w-72 shrink-0 flex-col border-l border-zinc-800/60 bg-[#121214] shadow-[-4px_0_24px_rgba(0,0,0,0.2)]">
                <div className="p-5 border-b border-zinc-800/60">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Execution
                        </span>
                        {cpu.state.halted && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-500 border border-amber-500/20 animate-pulse">
                                Halted
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <button
                            onClick={() =>
                                cpu.setRunMode(
                                    cpu.runMode === "slow" ? "paused" : "slow",
                                )
                            }
                            disabled={cpu.state.halted}
                            className={`flex flex-col cursor-pointer items-center justify-center py-2.5 rounded border transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100 disabled:cursor-not-allowed ${
                                cpu.runMode === "slow"
                                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[inset_0_0_15px_rgba(37,99,235,0.1)]"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                            }`}
                        >
                            {cpu.runMode === "slow" ? (
                                <Pause size={16} />
                            ) : (
                                <Play size={16} />
                            )}
                            <span className="text-[10px] font-semibold mt-1">
                                SLOW
                            </span>
                        </button>
                        <button
                            onClick={() =>
                                cpu.setRunMode(
                                    cpu.runMode === "fast" ? "paused" : "fast",
                                )
                            }
                            disabled={cpu.state.halted}
                            className={`flex cursor-pointer flex-col items-center justify-center py-2.5 rounded border transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100 disabled:cursor-not-allowed ${
                                cpu.runMode === "fast"
                                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[inset_0_0_15px_rgba(37,99,235,0.1)]"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                            }`}
                        >
                            {cpu.runMode === "fast" ? (
                                <Pause size={16} fill="currentColor" />
                            ) : (
                                <Play size={16} fill="currentColor" />
                            )}
                            <span className="text-[10px] font-semibold mt-1">
                                FAST
                            </span>
                        </button>
                        <button
                            onClick={cpu.step}
                            disabled={
                                cpu.state.halted || cpu.runMode !== "paused"
                            }
                            className="flex cursor-pointer flex-col items-center justify-center py-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100 disabled:cursor-not-allowed"
                        >
                            <StepForward size={16} />
                            <span className="text-[10px] font-semibold mt-1">
                                STEP
                            </span>
                        </button>
                    </div>

                    <button
                        onClick={cpu.reset}
                        className="w-full cursor-pointer py-2 mt-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-all duration-200 active:scale-95 text-xs font-medium flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={12} /> Reset CPU
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto thin-scrollbar p-5 border-b border-zinc-800/60">
                    <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                        Registers
                    </span>
                    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
                        <table className="w-full font-mono text-xs">
                            <tbody>
                                {cpu.state.registers.map((val, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/50 transition-colors duration-200"
                                    >
                                        <td className="py-2 pl-4 text-zinc-500 font-semibold w-10">
                                            R{i}
                                        </td>
                                        <td className="py-2 pr-4 text-right text-zinc-300">
                                            {val
                                                .toString(16)
                                                .toUpperCase()
                                                .padStart(4, "0")}
                                        </td>
                                        <td className="py-2 pr-4 text-right text-zinc-600">
                                            {val}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-5 flex flex-col gap-5">
                    <div>
                        <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Internal State
                        </span>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded p-2 flex flex-col items-center transition-colors hover:bg-zinc-800/40 duration-200">
                                <span className="text-[10px] text-zinc-500 font-bold mb-1">
                                    PC
                                </span>
                                <span className="font-mono text-sm text-blue-400">
                                    {cpu.state.pc
                                        .toString(16)
                                        .toUpperCase()
                                        .padStart(4, "0")}
                                </span>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded p-2 flex flex-col items-center transition-colors hover:bg-zinc-800/40 duration-200">
                                <span className="text-[10px] text-zinc-500 font-bold mb-1">
                                    IR
                                </span>
                                <span className="font-mono text-sm text-zinc-300">
                                    {cpu.state.ir
                                        .toString(16)
                                        .toUpperCase()
                                        .padStart(4, "0")}
                                </span>
                            </div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded p-2 flex items-center justify-between px-4 transition-colors hover:bg-zinc-800/40 duration-200">
                            <span className="text-[10px] text-zinc-500 font-bold">
                                Z FLAG
                            </span>
                            <div
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    cpu.state.flag_z
                                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110"
                                        : "bg-zinc-800 border border-zinc-700"
                                }`}
                            />
                        </div>
                    </div>

                    <div>
                        <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                            MMIO Output
                        </span>
                        <div
                            className={`rounded-lg border p-4 text-center font-mono text-lg font-bold transition-all duration-300 ${
                                cpu.state.mmio_write !== null
                                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] scale-105"
                                    : "border-zinc-800/80 bg-zinc-900/50 text-zinc-600"
                            }`}
                        >
                            {cpu.state.mmio_write !== null
                                ? `0x${cpu.state.mmio_write.toString(16).toUpperCase().padStart(4, "0")}`
                                : "—"}
                        </div>
                    </div>
                </div>
            </aside>

            <style>{`
        .datapath-bg {
          background-color: #0d0d0f;
          background-image: radial-gradient(#27272a 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
        </div>
    );
}
