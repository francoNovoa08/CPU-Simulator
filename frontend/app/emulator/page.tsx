"use client";

import EmulatorShell from "@/components/EmulatorShell";

const STARTER_PROGRAM = `LOADI R1 10
LOADI R2 25
ADD   R3 R1 R2
HALT`;

export default function EmulatorPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <EmulatorShell initialProgram={STARTER_PROGRAM} />
    </div>
  );
}