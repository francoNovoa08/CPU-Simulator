export interface LabData {
  id: number;
  title: string;
  objectives: string[];
  wiresToWatch?: string[];
  questions: string[];
  challenge?: string;
  hint?: string;
  starterProgram: string;
}

export const LAB_DATA: Record<string, LabData> = {
  "1": {
    id: 1,
    title: "Basic ALU Operations: Adding Two Numbers",
    objectives: [
      "Understand that a CPU performs arithmetic by reading register values, passing them through the ALU, and writing the result to a destination register.",
      "Observe the rs1_to_alu, rs2_to_alu, and alu_to_rd wires illuminating in sequence on each ADD step.",
    ],
    wiresToWatch: ["rs1_to_alu", "rs2_to_alu", "alu_to_rd", "alu_to_flags"],
    questions: [
      "Step through the program one clock at a time. After the ADD instruction completes, what is the value in R3?",
      "Modify the program to compute 100 − 37. Which instruction do you use? What register holds the result?",
      "What is the binary representation of the ADD instruction at address 0x0002? Use the ISA table to decode each field manually.",
    ],
    challenge:
      "Extend the program to compute (10 + 25) − 8. You will need a third register and a SUB instruction. Which wires light up differently for SUB vs ADD?",
    starterProgram: `; Lab 1: Add two numbers
LOADI R1 10     ; R1 <- 10
LOADI R2 25     ; R2 <- 25
ADD   R3 R1 R2  ; R3 <- R1 + R2 = 35
HALT`,
  },

  "2": {
    id: 2,
    title: "Control Flow: Building a Loop",
    objectives: [
      "Understand that the Program Counter is just a number, and that JMPZ changes it conditionally.",
      "Observe how a counter variable in a register can be used to bound a loop without dedicated loop hardware.",
    ],
    wiresToWatch: ["alu_to_flags", "alu_to_pc"],
    questions: [
      "How many times does the CPU execute the SUB instruction before halting?",
      "What value does R1 hold immediately after the final SUB that sets the Z flag?",
      "Modify the program to count from 10 to 0. What is the only line you need to change?",
      "Watch the PC value in the register panel. At which addresses does execution spend the most time? Why?",
    ],
    challenge:
      "Rewrite the program to count up from 0 to 5 using ADDI instead of SUB. How do you detect when the counter has reached 5? Hint: SUB the counter from 5 and check the Z flag.",
    starterProgram: `; Lab 2: Count down from 5 to 0
LOADI R1 5      ; R1 <- 5  (loop counter)
LOADI R2 1      ; R2 <- 1  (decrement)
loop: SUB  R1 R1 R2  ; R1 <- R1 - 1; Z flag set when R1 = 0
JMPZ done       ; if Z: jump to done
JMP  loop       ; else: go back to top
done: HALT`,
  },

  "3": {
    id: 3,
    title: "Memory-Mapped I/O: Controlling External Hardware",
    objectives: [
      "Understand that peripherals can be mapped into the address space so that ordinary memory write instructions control external hardware.",
      "Observe the MMIO output box turning green when the program writes to address 0xFFFF.",
    ],
    wiresToWatch: ["rs1_to_ram", "rd_to_mmio"],
    questions: [
      "Address 0xFFFF is 65535 in decimal. LOADI only supports a 6-bit immediate (max 31 unsigned). How can you load 65535 into a register using the available instructions? Think about bitwise NOT.",
      "After assembling and running the program, what colour does the MMIO box turn? What wire on the datapath lights up?",
      "Modify the program so it writes 0 to 0xFFFF after writing 1. What colour should the MMIO box be at the end?",
      "Why does this architecture only need a STORE instruction to control hardware, rather than a special-purpose output instruction?",
    ],
    challenge:
      "Combine Lab 2 and Lab 3: write a program that toggles the MMIO output five times using a loop. You will need to track the current output value and flip it between 0 and 1 on each iteration.",
    hint:
      "To load 0xFFFF into a register: R0 is always 0. NOT R0 = 0xFFFF. Use NOT R1 R0 to get 0xFFFF into R1 in a single instruction.",
    starterProgram: `; Lab 3: Turn on the MMIO output display
; Goal: write any non-zero value to address 0xFFFF
; Puzzle: how do you load 0xFFFF given LOADI only holds 6 bits?

LOADI R2 1      ; R2 <- 1  (value to output)
NOT   R1 R0     ; R1 <- NOT(R0) = NOT(0) = 0xFFFF  (the address)
STORE R2 R1     ; MEM[0xFFFF] <- 1  -> triggers MMIO display
HALT`,
  },
};