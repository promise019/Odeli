// src/features/editor/buffer_selection.ts

import { TextBuffer } from "./text_buffer.js";
import { SelectionState, type Position } from "./selection.js";

export class BufferSelectionHelper {
    /**
     * Extract text inside active selection range (for Copy / Cut)
     */
    static getSelectedText(buffer: TextBuffer, selection: SelectionState): string {
        const norm = selection.normalized;
        if (!norm) return "";

        const { start, end } = norm;
        const lines = buffer.getLines();

        if (start.line === end.line) {
            return lines[start.line].substring(start.column, end.column);
        }

        const result: string[] = [];
        // First line segment
        result.push(lines[start.line].substring(start.column));

        // Middle lines
        for (let i = start.line + 1; i < end.line; i++) {
            result.push(lines[i]);
        }

        // Last line segment
        result.push(lines[end.line].substring(0, end.column));

        return result.join("\n");
    }

    /**
     * Delete text inside active selection range (for Backspace / Delete / Cut)
     * Returns the cursor position where cursor should rest after deletion
     */
    static deleteSelection(buffer: TextBuffer, selection: SelectionState): Position | null {
        const norm = selection.normalized;
        if (!norm) return null;

        const { start, end } = norm;
        const lines = buffer.getLines();

        if (start.line === end.line) {
            const lineText = lines[start.line];
            const updatedLine =
                lineText.substring(0, start.column) + lineText.substring(end.column);
            buffer.setLine(start.line, updatedLine);
        } else {
            const startLineText = lines[start.line].substring(0, start.column);
            const endLineText = lines[end.line].substring(end.column);

            // Merge remaining start and end text into start line
            buffer.setLine(start.line, startLineText + endLineText);

            // Remove all lines in between
            const deleteCount = end.line - start.line;
            buffer.spliceLines(start.line + 1, deleteCount);
        }

        selection.clear();
        return { line: start.line, column: start.column };
    }

    /**
     * Replaces selection with typed character or pasted string
     */
    static replaceSelection(
        buffer: TextBuffer,
        selection: SelectionState,
        text: string
    ): Position {
        const startPos = this.deleteSelection(buffer, selection) || { line: 0, column: 0 };
        buffer.insertAt(startPos.line, startPos.column, text);
        return startPos;
    }
}