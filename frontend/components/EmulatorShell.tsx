"use client";

import { useState } from "react";
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
      <div className="flex h-full items-center justify-center text-gray-500 text-sm">
        Loading CPU…
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-950 text-gray-100">
      {/* Editor */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-800">
        <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Assembly
          </span>
          <div className="flex gap-1">
            {lockedProgram && (
              <button
                onClick={() => setSource(initialProgram)}
                className="rounded bg-gray-700 px-2 py-1 text-xs hover:bg-gray-600"
                title="Reset to starter program"
              >
                ↺
              </button>
            )}
            <button
              onClick={() => cpu.assemble(source)}
              className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium hover:bg-indigo-500 active:bg-indigo-700"
            >
              Assemble ▶
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <AsmEditor value={source} onChange={setSource} />
        </div>
        {cpu.assembleError && (
          <div className="border-t border-red-900 bg-red-950 px-3 py-2 font-mono text-xs text-red-400">
            {cpu.assembleError}
          </div>
        )}
      </aside>

      {/* Datapath */}
      <main className="flex flex-1 flex-col items-center justify-center overflow-hidden p-2">
        <Datapath
          activeWires={cpu.state.active_wires}
          registers={cpu.state.registers}
          pc={cpu.state.pc}
          ir={cpu.state.ir}
          flagZ={cpu.state.flag_z}
          mmioWrite={cpu.state.mmio_write}
        />
      </main>

      <aside className="flex w-56 shrink-0 flex-col border-l border-gray-800">
        <div className="border-b border-gray-800 px-3 py-2">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Controls
          </span>
          <div className="flex flex-col gap-1">
            <button
              onClick={cpu.step}
              disabled={cpu.state.halted}
              className="rounded bg-gray-800 px-3 py-1 text-xs hover:bg-gray-700 disabled:opacity-40"
            >
              Step
            </button>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  cpu.setRunMode(cpu.runMode === "slow" ? "paused" : "slow")
                }
                disabled={cpu.state.halted}
                className={`flex-1 rounded px-2 py-1 text-xs disabled:opacity-40 ${
                  cpu.runMode === "slow"
                    ? "bg-indigo-600 hover:bg-indigo-500"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {cpu.runMode === "slow" ? "⏸ Slow" : "▶ Slow"}
              </button>
              <button
                onClick={() =>
                  cpu.setRunMode(cpu.runMode === "fast" ? "paused" : "fast")
                }
                disabled={cpu.state.halted}
                className={`flex-1 rounded px-2 py-1 text-xs disabled:opacity-40 ${
                  cpu.runMode === "fast"
                    ? "bg-indigo-600 hover:bg-indigo-500"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {cpu.runMode === "fast" ? "⏸ Fast" : "▶▶ Fast"}
              </button>
            </div>
            <button
              onClick={cpu.reset}
              className="rounded bg-gray-800 px-3 py-1 text-xs hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Registers */}
        <div className="border-b border-gray-800 px-3 py-2">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Registers
          </span>
          <table className="w-full font-mono text-xs">
            <tbody>
              {cpu.state.registers.map((val, i) => (
                <tr key={i} className="border-b border-gray-800/50 last:border-0">
                  <td className="py-0.5 text-gray-500">R{i}</td>
                  <td className="py-0.5 text-right text-gray-200">
                    {val.toString(16).toUpperCase().padStart(4, "0")}
                  </td>
                  <td className="py-0.5 pl-2 text-right text-gray-500">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CPU state */}
        <div className="border-b border-gray-800 px-3 py-2">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            CPU
          </span>
          <table className="w-full font-mono text-xs">
            <tbody>
              <tr>
                <td className="py-0.5 text-gray-500">PC</td>
                <td className="py-0.5 text-right text-gray-200">
                  {cpu.state.pc.toString(16).toUpperCase().padStart(4, "0")}
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-gray-500">IR</td>
                <td className="py-0.5 text-right text-gray-200">
                  {cpu.state.ir.toString(16).toUpperCase().padStart(4, "0")}
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-gray-500">Z</td>
                <td className={`py-0.5 text-right font-bold ${cpu.state.flag_z ? "text-green-400" : "text-gray-600"}`}>
                  {cpu.state.flag_z ? "1" : "0"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MMIO */}
        <div className="px-3 py-2">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Output
          </span>
          <div className={`rounded border px-3 py-2 text-center font-mono text-base font-bold transition-colors ${
            cpu.state.mmio_write !== null
              ? "border-green-700 bg-green-950 text-green-400"
              : "border-gray-800 bg-gray-900 text-gray-600"
          }`}>
            {cpu.state.mmio_write !== null ? cpu.state.mmio_write : "—"}
          </div>
        </div>

        {cpu.state.halted && (
          <div className="mx-3 rounded border border-yellow-800 bg-yellow-950 px-3 py-1 text-center text-xs text-yellow-400">
            HALTED
          </div>
        )}
      </aside>
    </div>
  );
}