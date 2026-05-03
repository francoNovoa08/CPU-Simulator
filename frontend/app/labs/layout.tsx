import Link from "next/link";

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-gray-950 text-gray-100">
      <nav className="flex shrink-0 items-center gap-6 border-b border-gray-800 px-6 py-3">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Home
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Labs
        </span>
        <div className="flex gap-2">
          {[1, 2, 3].map(n => (
            <Link
              key={n}
              href={`/labs/${n}`}
              className="rounded px-3 py-1 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
            >
              Lab {n}
            </Link>
          ))}
        </div>
        <div className="ml-auto">
          <Link
            href="/emulator"
            className="rounded border border-gray-700 px-3 py-1 text-xs text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
          >
            Open Emulator ↗
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}