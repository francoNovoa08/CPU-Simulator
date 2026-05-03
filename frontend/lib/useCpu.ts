import { useEffect, useRef, useState, useCallback } from "react";

export interface StepDelta {
    active_wires: string[];
    registers: number[];
    pc: number;
    ir: number;
    flag_z: boolean;
    halted: boolean;
    mmio_write: number | null;
}

export interface CpuState {
    registers: number[];
    pc: number;
    ir: number;
    flag_z: boolean;
    halted: boolean;
    mmio_write: number | null;
    active_wires: string[];
}

const INITIAL_STATE: CpuState = {
    registers: Array(8).fill(0),
    pc: 0,
    ir: 0,
    flag_z: false,
    halted: false,
    mmio_write: null,
    active_wires: [],
};

export type RunMode = "paused" | "slow" | "fast";

export interface UseCpuReturn {
    state: CpuState;
    wasmReady: boolean;
    assembleError: string | null;
    runMode: RunMode;
    assemble: (source: string) => void;
    step: () => void;
    setRunMode: (mode: RunMode) => void;
    reset: () => void;
}

export function useCpu(): UseCpuReturn {
    const cpuRef = useRef<import("@/public/wasm/cpu16_core").Cpu | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [wasmReady, setWasmReady] = useState(false);
    const [state, setState] = useState<CpuState>(INITIAL_STATE);
    const [assembleError, setAssembleError] = useState<string | null>(null);
    const [runMode, setRunModeState] = useState<RunMode>("paused");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const wasm = await import("@/public/wasm/cpu16_core.js");
            await wasm.default();
            if (cancelled) return;
            cpuRef.current = new wasm.Cpu();
            setWasmReady(true);
        }

        load().catch(console.error);
        return () => {
            cancelled = true;
        };
    }, []);

    const clearInterval_ = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const executeSingleStep = useCallback(() => {
        const cpu = cpuRef.current;
        if (!cpu) return;
        const delta: StepDelta = JSON.parse(cpu.step());
        setState({
            registers: delta.registers,
            pc: delta.pc,
            ir: delta.ir,
            flag_z: delta.flag_z,
            halted: delta.halted,
            mmio_write: delta.mmio_write,
            active_wires: delta.active_wires,
        });
        if (delta.halted) clearInterval_();
    }, [clearInterval_]);

    const assemble = useCallback(
        (source: string) => {
            const cpu = cpuRef.current;
            if (!cpu) return;
            clearInterval_();
            const error = cpu.assemble_and_load(source);
            if (error) {
                setAssembleError(error);
            } else {
                setAssembleError(null);
                const snapshot: StepDelta = JSON.parse(cpu.snapshot());
                setState({ ...snapshot, active_wires: [] });
                setRunModeState("paused");
            }
        },
        [clearInterval_],
    );

    const step = useCallback(() => {
        clearInterval_();
        setRunModeState("paused");
        executeSingleStep();
    }, [clearInterval_, executeSingleStep]);

    const setRunMode = useCallback(
        (mode: RunMode) => {
            clearInterval_();
            setRunModeState(mode);

            if (mode === "paused") return;

            const ms = mode === "slow" ? 500 : 16;
            intervalRef.current = setInterval(() => {
                executeSingleStep();
            }, ms);
        },
        [clearInterval_, executeSingleStep],
    );

    const reset = useCallback(() => {
        const cpu = cpuRef.current;
        if (!cpu) return;
        clearInterval_();
        setRunModeState("paused");
        cpu.reset();
        const snapshot: StepDelta = JSON.parse(cpu.snapshot());
        setState({ ...snapshot, active_wires: [] });
    }, [clearInterval_]);

    useEffect(() => () => clearInterval_(), [clearInterval_]);

    return {
        state,
        wasmReady,
        assembleError,
        runMode,
        assemble,
        step,
        setRunMode,
        reset,
    };
}
