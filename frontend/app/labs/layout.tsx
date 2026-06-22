"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LabsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const activeLab = pathname?.match(/\/labs\/(\d+)/)?.[1];

    return (
        <div className="flex h-screen flex-col bg-[#0d0d0f] text-zinc-300">
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
                    className="text-sm font-bold uppercase tracking-widest text-zinc-200 hover:text-white transition-colors"
                >
                    Home
                </Link>
                <div className="h-4 w-px bg-zinc-800/80" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                    Labs
                </span>
                <div className="flex gap-1">
                    {[1, 2, 3].map((n) => (
                        <Link
                            key={n}
                            href={`/labs/${n}`}
                            className={`rounded px-3 py-1 text-xs font-medium transition-colors active:scale-95 ${
                                String(n) === activeLab
                                    ? "bg-zinc-800 text-zinc-100"
                                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                            }`}
                        >
                            Lab {n}
                        </Link>
                    ))}
                </div>
                <div className="ml-auto">
                    <Link
                        href="/emulator"
                        className="block rounded bg-zinc-100 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-zinc-900 transition-colors hover:bg-white active:scale-95"
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