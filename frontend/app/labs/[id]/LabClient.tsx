"use client";

import EmulatorShell from "@/components/EmulatorShell";
import { LabData } from "@/lib/labData";
import Link from "next/link";

export default function LabClient({ lab }: { lab: LabData }) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-gray-800 bg-gray-950">
        <div className="p-5">

          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Lab {lab.id}
          </div>
          <h1 className="mb-4 text-lg font-bold text-gray-100">{lab.title}</h1>

          <section className="mb-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Learning Objectives
            </h2>
            <ul className="space-y-2">
              {lab.objectives.map((obj, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-300">
                  <span className="mt-0.5 shrink-0 text-indigo-400">▸</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          {lab.wiresToWatch && (
            <section className="mb-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Wires to Watch
              </h2>
              <div className="flex flex-wrap gap-1">
                {lab.wiresToWatch.map(w => (
                  <span
                    key={w}
                    className="rounded bg-indigo-950 px-2 py-0.5 font-mono text-xs text-indigo-300 border border-indigo-900"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mb-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Guided Questions
            </h2>
            <ol className="space-y-3">
              {lab.questions.map((q, i) => (
                <li key={i} className="text-xs text-gray-300">
                  <span className="font-semibold text-gray-400">{i + 1}. </span>
                  {q}
                </li>
              ))}
            </ol>
          </section>

          {lab.challenge && (
            <section className="mb-5 rounded border border-amber-900 bg-amber-950/40 p-3">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-500">
                Challenge
              </h2>
              <p className="text-xs text-amber-200">{lab.challenge}</p>
            </section>
          )}

          {lab.hint && (
            <details className="mb-5">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-gray-600 hover:text-gray-400">
                Hint ▸
              </summary>
              <p className="mt-2 text-xs text-gray-400">{lab.hint}</p>
            </details>
          )}

          <div className="flex justify-between pt-2 border-t border-gray-800">
            {lab.id > 1 ? (
              <Link
                href={`/labs/${lab.id - 1}`}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                ← Lab {lab.id - 1}
              </Link>
            ) : <span />}
            {lab.id < 3 ? (
              <Link
                href={`/labs/${lab.id + 1}`}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Lab {lab.id + 1} →
              </Link>
            ) : <span />}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 overflow-hidden">
        <EmulatorShell initialProgram={lab.starterProgram} lockedProgram />
      </div>
    </div>
  );
}