// src/features/editor/history.ts

import { TextBuffer } from "./text_buffer.js";
import { Cursor } from "./cursor.js";
import { SelectionState, type Position } from "./selection.js";

export interface EditDelta {
    line: number;
    column: number;
    insertedText: string;
    deletedText: string;
    cursorBefore: Position;
    cursorAfter: Position;
    timestamp: number;
}

export class HistoryManager {
    private undoStack: EditDelta[] = [];
    private redoStack: EditDelta[] = [];
    private lastEditTime: number = 0;
    private readonly BATCH_TIMEOUT_MS: number = 800; // Group edits made within 800ms

    /**
     * Record an edit operation to the undo history
     */
    public recordEdit(delta: Omit<EditDelta, "timestamp">): void {
        const now = Date.now();
        const fullDelta: EditDelta = { ...delta, timestamp: now };

        const lastDelta = this.undoStack[this.undoStack.length - 1];

        // Batch single character insertions into the same group if typed consecutively
        if (
            lastDelta &&
            now - this.lastEditTime < this.BATCH_TIMEOUT_MS &&
            lastDelta.insertedText.length === 1 &&
            fullDelta.insertedText.length === 1 &&
            fullDelta.deletedText === "" &&
            lastDelta.deletedText === "" &&
            fullDelta.line === lastDelta.line &&
            fullDelta.column === lastDelta.column + lastDelta.insertedText.length
        ) {
            // Append typed char to existing undo entry
            lastDelta.insertedText += fullDelta.insertedText;
            lastDelta.cursorAfter = fullDelta.cursorAfter;
        } else {
            // Push new entry and reset redo stack on fresh input
            this.undoStack.push(fullDelta);
            this.redoStack = [];
        }

        this.lastEditTime = now;
    }

    /**
     * Reverts the last edit operation
     */
    public undo(buffer: TextBuffer, cursor: Cursor, selection: SelectionState): boolean {
        const delta = this.undoStack.pop();
        if (!delta) return false;

        // Push to redo stack before applying
        this.redoStack.push(delta);

        // Clear active selection
        selection.clear();

        // Inverse Operation: Remove inserted text and restore deleted text
        this.applyInverseDelta(buffer, delta);

        // Restore cursor position to where it was before the edit
        cursor.setPosition(delta.cursorBefore.line, delta.cursorBefore.column);

        return true;
    }

    /**
     * Re-applies the last undone operation
     */
    public redo(buffer: TextBuffer, cursor: Cursor, selection: SelectionState): boolean {
        const delta = this.redoStack.pop();
        if (!delta) return false;

        // Push back to undo stack
        this.undoStack.push(delta);

        // Clear active selection
        selection.clear();

        // Forward Operation: Re-apply inserted and deleted text
        this.applyForwardDelta(buffer, delta);

        // Restore cursor position to where it rested after the edit
        cursor.setPosition(delta.cursorAfter.line, delta.cursorAfter.column);

        return true;
    }

    public canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    public canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    public clear(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

    /* ---------------- Helper Delta Mechanics ---------------- */

    private applyInverseDelta(buffer: TextBuffer, delta: EditDelta): void {
        const lines = buffer.getLines();
        const currentLineText = lines[delta.line] ?? "";

        // Remove inserted text
        if (delta.insertedText.length > 0) {
            const head = currentLineText.substring(0, delta.column);
            const tail = currentLineText.substring(delta.column + delta.insertedText.length);
            buffer.setLine(delta.line, head + tail);
        }

        // Restore deleted text
        if (delta.deletedText.length > 0) {
            const lineToUpdate = buffer.getLines()[delta.line] ?? "";
            const head = lineToUpdate.substring(0, delta.column);
            const tail = lineToUpdate.substring(delta.column);
            buffer.setLine(delta.line, head + delta.deletedText + tail);
        }
    }

    private applyForwardDelta(buffer: TextBuffer, delta: EditDelta): void {
        const lines = buffer.getLines();
        const currentLineText = lines[delta.line] ?? "";

        // Remove deleted text
        if (delta.deletedText.length > 0) {
            const head = currentLineText.substring(0, delta.column);
            const tail = currentLineText.substring(delta.column + delta.deletedText.length);
            buffer.setLine(delta.line, head + tail);
        }

        // Re-insert added text
        if (delta.insertedText.length > 0) {
            const lineToUpdate = buffer.getLines()[delta.line] ?? "";
            const head = lineToUpdate.substring(0, delta.column);
            const tail = lineToUpdate.substring(delta.column);
            buffer.setLine(delta.line, head + delta.insertedText + tail);
        }
    }
}