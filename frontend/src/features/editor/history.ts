// src/features/editor/history.ts

import { TextBuffer } from "./text_buffer.js";
import { type Position } from "./selection.js";

export interface EditOperation {
    line: number;
    column: number;
    insertedText: string;
    deletedText: string;
    cursorBefore: Position;
    cursorAfter: Position;
}

export class HistoryManager {
    private undoStack: EditOperation[] = [];
    private redoStack: EditOperation[] = [];

    public recordEdit(op: EditOperation): void {
        this.undoStack.push(op);
        this.redoStack = []; // Clear redo stack on new action
    }

    public undo(buffer: TextBuffer): Position | null {
        const op = this.undoStack.pop();
        if (!op) return null;

        this.redoStack.push(op);

        // Reverse insertion: remove inserted text
        if (op.insertedText.length > 0) {
            if (op.insertedText === "\n") {
                // Handle newline reversal
                const currentLine = buffer.getLine(op.line);
                const nextLine = buffer.getLine(op.line + 1);
                buffer.setLine(op.line, currentLine + nextLine);
                buffer.spliceLines(op.line + 1, 1);
            } else {
                buffer.deleteAt(op.line, op.column, op.insertedText.length);
            }
        }

        // Reverse deletion: re-insert deleted text
        if (op.deletedText.length > 0) {
            buffer.insertAt(op.line, op.column, op.deletedText);
        }

        return op.cursorBefore;
    }

    public redo(buffer: TextBuffer): Position | null {
        const op = this.redoStack.pop();
        if (!op) return null;

        this.undoStack.push(op);

        // Re-apply deletion
        if (op.deletedText.length > 0) {
            buffer.deleteAt(op.line, op.column, op.deletedText.length);
        }

        // Re-apply insertion
        if (op.insertedText.length > 0) {
            if (op.insertedText === "\n") {
                const currentLine = buffer.getLine(op.line);
                const head = currentLine.substring(0, op.column);
                const tail = currentLine.substring(op.column);
                buffer.setLine(op.line, head);
                buffer.spliceLines(op.line + 1, 0, tail);
            } else {
                buffer.insertAt(op.line, op.column, op.insertedText);
            }
        }

        return op.cursorAfter;
    }
}