"use client";

import {
    BookOpen,
    Target,
    Activity,
    AlertTriangle,
    Lightbulb,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import EmulatorShell from "@/components/EmulatorShell";
import { LabData } from "@/lib/labData";

export default function LabClient({ lab }: { lab: LabData }) {
    const labIds = [1, 2, 3];
    const [panelOpen, setPanelOpen] = useState(true);

    return (
        <div className="flex h-full w-full overflow-hidden">
            <button
                onClick={() => setPanelOpen((o) => !o)}
                className="absolute left-0 cursor-pointer top-1/2 z-20 -translate-y-1/2 flex items-center justify-center w-5 h-12 rounded-r bg-zinc-800 border border-l-0 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 active:scale-95 transition-colors"
                style={{
                    left: panelOpen ? "340px" : "0px",
                    transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                title={panelOpen ? "Hide lab panel" : "Show lab panel"}
            >
                {panelOpen ? (
                    <PanelLeftClose size={12} />
                ) : (
                    <PanelLeftOpen size={12} />
                )}
            </button>

            <aside
                className="flex shrink-0 flex-col border-r border-zinc-800/60 bg-[#121214] shadow-[4px_0_24px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                    width: panelOpen ? "340px" : "0px",
                    opacity: panelOpen ? 1 : 0,
                }}
            >
                <div className="flex h-full w-85 flex-col">
                    <div className="flex-1 overflow-y-auto thin-scrollbar p-6">
                        <header className="mb-8">
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-widest text-zinc-500 uppercase"></div><div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-widest text-blue-500 uppercase">
                                <BookOpen size={14} />
                                Lab {lab.id}
                            </div>
                            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight leading-snug">
                                {lab.title}
                            </h1>
                        </header>

                        <section className="mb-8">
                            <h2 className="flex items-center gap-2 mb-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                <Target size={14} />
                                Learning Objectives
                            </h2>
                            <ul className="space-y-2.5">
                                {lab.objectives.map((obj, i) => (
                                    <li
                                        key={i}
                                        className="flex gap-3 text-sm text-zinc-400 leading-relaxed hover:text-zinc-300 transition-colors duration-200"
                                    >
                                        <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                        <span>{obj}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {lab.wiresToWatch && (
                            <section className="mb-8">
                                <h2 className="flex items-center gap-2 mb-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                    <Activity size={14} />
                                    Wires to Watch
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {lab.wiresToWatch.map((w) => (
                                        <span
                                            key={w}
                                            className="rounded bg-zinc-800 px-2 py-1 font-mono text-[11px] text-zinc-300 border border-zinc-700/50"
                                        >
                                            {w}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="mb-8">
                            <h2 className="flex items-center gap-2 mb-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                <BookOpen size={14} />
                                Guided Questions
                            </h2>
                            <ol className="space-y-3">
                                {lab.questions.map((q, i) => (
                                    <li
                                        key={i}
                                        className="flex gap-2 text-sm text-zinc-400 leading-relaxed"
                                    >
                                        <span className="font-mono text-zinc-600 select-none shrink-0">
                                            {i + 1}.
                                        </span>
                                        <span>{q}</span>
                                    </li>
                                ))}
                            </ol>
                        </section>

                        {lab.challenge && (
                            <section className="mb-8 rounded-lg border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/10">
                                    <AlertTriangle
                                        size={14}
                                        className="text-amber-500"
                                    />
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">
                                        Challenge
                                    </h2>
                                </div>
                                <p className="p-4 text-sm text-amber-200/80 leading-relaxed">
                                    {lab.challenge}
                                </p>
                            </section>
                        )}

                        {lab.hint && (
                            <details className="group rounded-lg border border-zinc-800 bg-zinc-900/50">
                                <summary className="flex items-center gap-2 cursor-pointer p-3 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors list-none">
                                    <Lightbulb
                                        size={14}
                                        className="text-emerald-500"
                                    />
                                    Need a hint?
                                    <ChevronRight
                                        size={14}
                                        className="ml-auto transition-transform duration-300 group-open:rotate-90"
                                    />
                                </summary>
                                <div className="px-4 pb-4 pt-1 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50">
                                    {lab.hint}
                                </div>
                            </details>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 border-t border-zinc-800/60 bg-[#121214]">
                        {lab.id > 1 ? (
                            <Link
                                href={`/labs/${lab.id - 1}`}
                                className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 active:scale-95 transition-colors"
                            >
                                <ArrowLeft size={14} /> Prev
                            </Link>
                        ) : (
                            <span className="w-15" />
                        )}
                        <div className="flex gap-1.5">
                            {labIds.map((n) => (
                                <span
                                    key={n}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${n === lab.id ? "bg-zinc-200 scale-125" : "bg-zinc-700"}`}
                                />
                            ))}
                        </div>
                        {lab.id < 3 ? (
                            <Link
                                href={`/labs/${lab.id + 1}`}
                                className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 active:scale-95 transition-colors"
                            >
                                Next <ArrowRight size={14} />
                            </Link>
                        ) : (
                            <span className="w-15" />
                        )}
                    </div>
                </div>
            </aside>

            <div className="flex flex-1 overflow-hidden">
                <EmulatorShell
                    initialProgram={lab.starterProgram}
                    lockedProgram
                />
            </div>
        </div>
    );
}
