import { StreamLanguage } from "@codemirror/language";
import type { StringStream } from "@codemirror/language";

const MNEMONICS = new Set([
    "ADD",
    "SUB",
    "AND",
    "OR",
    "NOT",
    "LOADI",
    "LOAD",
    "STORE",
    "JMP",
    "JMPZ",
    "ADDI",
    "HALT",
    "NOP",
]);

export const asmLanguage = StreamLanguage.define({
    name: "cpu16asm",

    token(stream: StringStream): string | null {
        if (stream.eatSpace()) return null;

        if (stream.peek() === ";") {
            stream.skipToEnd();
            return "comment";
        }

        if (/[A-Za-z_]/.test(stream.peek() ?? "")) {
            stream.eatWhile(/[\w]/);
            if (stream.peek() === ":") {
                stream.next();
                return "labelName";
            }
            const word = stream.current().toUpperCase();
            if (MNEMONICS.has(word)) return "keyword";
            if (/^R[0-7]$/.test(word)) return "variableName";
            return "labelName";
        }

        if (stream.match(/0[xX][0-9a-fA-F]+/)) return "number";

        if (stream.match(/[0-9]+/)) return "number";

        stream.next();
        return null;
    },

    languageData: {
        commentTokens: { line: ";" },
    },
});
