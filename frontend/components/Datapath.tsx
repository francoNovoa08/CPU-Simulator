"use client";

import { useEffect, useRef } from "react";

interface DatapathProps {
    activeWires: string[];
    registers: number[];
    pc: number;
    ir: number;
    flagZ: boolean;
    mmioWrite: number | null;
}

const HIGHLIGHT_DURATION = 800;

export default function Datapath({
    activeWires,
    registers,
    pc,
    ir,
    flagZ,
    mmioWrite,
}: DatapathProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        svg.querySelectorAll("[data-wire]").forEach((el) => {
            el.classList.remove("wire-active");
        });
        if (timerRef.current) clearTimeout(timerRef.current);

        if (activeWires.length === 0) return;

        activeWires.forEach((id) => {
            svg.querySelectorAll(`[data-wire="${id}"]`).forEach((el) => {
                el.classList.add("wire-active");
            });
        });

        timerRef.current = setTimeout(() => {
            svg.querySelectorAll("[data-wire]").forEach((el) => {
                el.classList.remove("wire-active");
            });
        }, HIGHLIGHT_DURATION);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [activeWires]);

    const hex4 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
    const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");

    return (
        <>
            <style>{`
        .wire {
          fill: none;
          stroke: #374151;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: stroke 0.1s, filter 0.1s;
        }
        .wire-active {
            stroke: #3b82f6;
            stroke-dasharray: 6 6;
            animation: wire-flow 0.8s linear infinite;
        }
        @keyframes wire-flow {
            to { stroke-dashoffset: -12; }
        }
        @keyframes wire-pulse {
          0%   { stroke: #c4b5fd; filter: drop-shadow(0 0 8px #c4b5fd); }
          40%  { stroke: #a5b4fc; filter: drop-shadow(0 0 6px #a5b4fc); }
          100% { stroke: #6366f1; filter: drop-shadow(0 0 2px #6366f1); }
        }
        .component-box {
          fill: #111827;
          stroke: #374151;
          stroke-width: 1.5;
          rx: 6;
        }
        .cpu-boundary {
          fill: #0d1117;
          stroke: #4b5563;
          stroke-width: 1.5;
          stroke-dasharray: 6 3;
        }
        .component-label {
          fill: #6b7280;
          font-size: 9px;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .value-text {
          fill: #e5e7eb;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
        }
        .reg-label {
          fill: #6b7280;
          font-size: 9px;
          font-family: 'JetBrains Mono', monospace;
        }
        .reg-value {
          fill: #d1d5db;
          font-size: 9px;
          font-family: 'JetBrains Mono', monospace;
        }
        .flag-active { fill: #34d399; }
        .flag-inactive { fill: #374151; }
        .mmio-active {
          fill: #052e16;
          stroke: #16a34a;
        }
        .mmio-inactive {
          fill: #111827;
          stroke: #374151;
        }
        .mmio-value-active { fill: #4ade80; }
        .mmio-value-inactive { fill: #4b5563; }
        .arrowhead { fill: #374151; }
        .arrowhead-active { fill: #a5b4fc; }
        .section-title {
          fill: #4b5563;
          font-size: 8px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      `}</style>

            <svg
                ref={svgRef}
                viewBox="0 0 520 520"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
                style={{ maxHeight: "100%", maxWidth: "100%" }}
            >
                <defs>
                    <marker
                        id="arrow"
                        markerWidth="6"
                        markerHeight="6"
                        refX="5"
                        refY="3"
                        orient="auto"
                    >
                        <path d="M0,0 L0,6 L6,3 z" className="arrowhead" />
                    </marker>
                </defs>

                <g id="components">
                    <rect
                        x="15"
                        y="120"
                        width="480"
                        height="375"
                        rx="12"
                        className="cpu-boundary"
                    />
                    <text x="30" y="136" className="section-title">
                        CPU
                    </text>

                    <rect
                        x="40"
                        y="40"
                        width="80"
                        height="44"
                        className="component-box"
                    />
                    <text
                        x="80"
                        y="56"
                        textAnchor="middle"
                        className="component-label"
                    >
                        PC
                    </text>
                    <text
                        x="80"
                        y="72"
                        textAnchor="middle"
                        className="value-text"
                    >
                        {hex4(pc)}
                    </text>

                    <rect
                        x="320"
                        y="40"
                        width="100"
                        height="60"
                        className="component-box"
                    />
                    <text
                        x="370"
                        y="55"
                        textAnchor="middle"
                        className="component-label"
                    >
                        RAM
                    </text>
                    <text
                        x="370"
                        y="72"
                        textAnchor="middle"
                        className="value-text"
                    >
                        MEM[{hex4(pc > 0 ? pc - 1 : 0)}]
                    </text>
                    <text
                        x="370"
                        y="86"
                        textAnchor="middle"
                        className="section-title"
                    >
                        0xFFFF words
                    </text>

                    {/* Instruction Register */}
                    <rect
                        x="40"
                        y="135"
                        width="110"
                        height="44"
                        className="component-box"
                    />
                    <text
                        x="95"
                        y="152"
                        textAnchor="middle"
                        className="component-label"
                    >
                        IR
                    </text>
                    <text
                        x="95"
                        y="168"
                        textAnchor="middle"
                        className="value-text"
                    >
                        {hex4(ir)}
                    </text>

                    {/* Control Unit */}
                    <rect
                        x="180"
                        y="135"
                        width="90"
                        height="44"
                        className="component-box"
                    />
                    <text
                        x="225"
                        y="150"
                        textAnchor="middle"
                        className="component-label"
                    >
                        Control
                    </text>
                    <text
                        x="225"
                        y="163"
                        textAnchor="middle"
                        className="section-title"
                    >
                        op={hex2((ir >> 12) & 0xf)}
                    </text>
                    <text
                        x="225"
                        y="174"
                        textAnchor="middle"
                        className="section-title"
                    >
                        rd={(ir >> 9) & 0x7} rs1={(ir >> 6) & 0x7} rs2=
                        {(ir >> 3) & 0x7}
                    </text>

                    {/* Register File */}
                    <rect
                        x="40"
                        y="210"
                        width="140"
                        height="188"
                        className="component-box"
                    />
                    <text
                        x="110"
                        y="226"
                        textAnchor="middle"
                        className="component-label"
                    >
                        Register File
                    </text>
                    {registers.map((val, i) => (
                        <g key={i}>
                            <text x="55" y={242 + i * 21} className="reg-label">
                                R{i}
                            </text>
                            <text
                                x="165"
                                y={242 + i * 21}
                                textAnchor="end"
                                className="reg-value"
                            >
                                {hex4(val)}
                            </text>
                            {i < 7 && (
                                <line
                                    x1="50"
                                    y1={248 + i * 21}
                                    x2="170"
                                    y2={248 + i * 21}
                                    stroke="#1f2937"
                                    strokeWidth="0.5"
                                />
                            )}
                        </g>
                    ))}

                    {/* ALU */}
                    <polygon
                        points="310,220 420,220 400,330 330,330"
                        fill="#111827"
                        stroke="#374151"
                        strokeWidth="1.5"
                    />
                    <text
                        x="365"
                        y="265"
                        textAnchor="middle"
                        className="component-label"
                    >
                        ALU
                    </text>
                    <text
                        x="365"
                        y="285"
                        textAnchor="middle"
                        className="value-text"
                    >
                        {aluLabel(ir)}
                    </text>

                    {/* FLAGS */}
                    <rect
                        x="325"
                        y="350"
                        width="80"
                        height="34"
                        className="component-box"
                    />
                    <text
                        x="365"
                        y="362"
                        textAnchor="middle"
                        className="component-label"
                    >
                        FLAGS
                    </text>
                    <circle
                        cx="355"
                        cy="373"
                        r="5"
                        className={flagZ ? "flag-active" : "flag-inactive"}
                    />
                    <text x="365" y="376" className="reg-label">
                        Z={flagZ ? "1" : "0"}
                    </text>

                    {/* MMIO */}
                    <rect
                        x="320"
                        y="410"
                        width="100"
                        height="44"
                        rx="6"
                        className={
                            mmioWrite !== null ? "mmio-active" : "mmio-inactive"
                        }
                        style={{ transition: "fill 0.3s, stroke 0.3s" }}
                    />
                    <text
                        x="370"
                        y="426"
                        textAnchor="middle"
                        className="component-label"
                    >
                        MMIO 0xFFFF
                    </text>
                    <text
                        x="370"
                        y="442"
                        textAnchor="middle"
                        className={
                            mmioWrite !== null
                                ? "mmio-value-active"
                                : "mmio-value-inactive"
                        }
                        style={{ fontFamily: "monospace", fontSize: 11 }}
                    >
                        {mmioWrite !== null ? hex4(mmioWrite) : "——"}
                    </text>
                </g>

                <g id="wires">
                    <path
                        d="M 150,157 L 179,157"
                        className="wire"
                        opacity="0.3"
                        markerEnd="url(#arrow)"
                    />
                    <path
                        d="M 225,179 L 225,209"
                        className="wire"
                        opacity="0.3"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="pc_to_ram"
                        d="M 120,62 L 319,62"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="ram_to_ir"
                        d="M 370,100 L 370,115 L 295,115 A 5 5 0 0 0 285,115 L 95,115 L 95,134"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="ir_to_alu"
                        d="M 95,179 L 95,195 L 220,195 A 5 5 0 0 1 230,195 L 285,195 A 5 5 0 0 1 295,195 L 365,195 L 365,219"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="rs1_to_alu"
                        d="M 180,240 L 312.5,240"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="rs2_to_alu"
                        d="M 180,280 L 320,280"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="alu_to_rd"
                        d="M 410,275 L 450,275 L 450,480 L 110,480 L 110,399"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="alu_to_flags"
                        d="M 365,330 L 365,349"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="rs1_to_ram"
                        d="M 180,225 L 290,225 L 290,80 L 319,80"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="ram_to_rd"
                        d="M 370,40 L 370,20 L 25,20 L 25,300 L 39,300"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="alu_to_pc"
                        d="M 416,240 L 470,240 L 470,10 L 80,10 L 80,39"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />

                    <path
                        data-wire="rd_to_mmio"
                        d="M 180,360 L 290,360 L 290,432 L 319,432"
                        className="wire"
                        markerEnd="url(#arrow)"
                    />
                </g>
            </svg>
        </>
    );
}

function aluLabel(ir: number): string {
    const op = (ir >> 12) & 0xf;
    switch (op) {
        case 0x0:
            return "ADD";
        case 0x1:
            return "SUB";
        case 0x2:
            return "AND";
        case 0x3:
            return "OR";
        case 0x4:
            return "NOT";
        case 0x5:
            return "LOAD-I";
        case 0xa:
            return "ADD-I";
        default:
            return "—";
    }
}
