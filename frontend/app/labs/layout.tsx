"use client";

import Link from "next/link";

export default function LabsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen flex-col bg-[#0d0d0f] text-zinc-300">
            {/* Global scrollbar styling injected here so it applies to child components */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .thin-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .thin-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .thin-scrollbar::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 10px;
                }
                .thin-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #3f3f46;
                }
            `,
                }}
            />

            <nav className="flex shrink-0 items-center gap-6 border-b border-zinc-800/60 bg-[#121214] px-6 py-3">
                <Link
                    href="/"
                    className="text-sm font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    Home
                </Link>
                <div className="h-4 w-px bg-zinc-800/80" />{" "}
                {/* Subtle separator */}
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                    Labs
                </span>
                <div className="flex gap-1">
                    {[1, 2, 3].map((n) => (
                        <Link
                            key={n}
                            href={`/labs/${n}`}
                            className="rounded px-3 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
                        >
                            Lab {n}
                        </Link>
                    ))}
                </div>
                <div className="ml-auto">
                    <Link
                        href="/emulator"
                        className="rounded bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/40 hover:text-blue-300 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(37,99,235,0.05)] hover:shadow-[0_0_20px_rgba(37,99,235,0.1)] block"
                    >
                        Open Emulator
                    </Link>
                </div>
            </nav>
            <div className="relative flex flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
