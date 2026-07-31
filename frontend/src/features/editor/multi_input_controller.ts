// src/features/editor/multi_input_controller.ts

import { TextBuffer } from "./text_buffer.js";
import { MultiCursorManager, type CursorSelectionInstance } from "./multi_cursor.js";
import { SelectionState } from "./selection.js";
import { BufferSelectionHelper } from "./buffer_selection.js";
import { HistoryManager } from "./history.js";

export class MultiInputController {
    constructor(
        private buffer: TextBuffer,
        private multiCursor: MultiCursorManager,
        private selection: SelectionState,
        private history: HistoryManager
    ) {}

    /**
     * Type character across all active cursors (or replace selection if text is highlighted)
     */
    public typeCharacter(char: string): void {
        if (!this.selection.isCollapsed) {
            const selectedText = BufferSelectionHelper.getSelectedText(this.buffer, this.selection);
            const norm = this.selection.normalized;
            const deletePos = BufferSelectionHelper.deleteSelection(this.buffer, this.selection);

            if (deletePos) {
                this.buffer.insertAt(deletePos.line, deletePos.column, char);
                const cursorAfter = { line: deletePos.line, column: deletePos.column + char.length };
                this.multiCursor.resetToSingle(cursorAfter);

                if (norm) {
                    this.history.recordEdit({
                        line: norm.start.line,
                        column: norm.start.column,
                        insertedText: char,
                        deletedText: selectedText,
                        cursorBefore: norm.start,
                        cursorAfter,
                    });
                }
            }
            return;
        }

        const cursors = [...this.multiCursor.getCursors()];
        const updatedCursors: CursorSelectionInstance[] = [];

        for (let i = cursors.length - 1; i >= 0; i--) {
            const cursor = cursors[i];
            if (!cursor) continue;

            const line = cursor.head.line;
            const col = cursor.head.column;

            this.buffer.insertAt(line, col, char);

            this.history.recordEdit({
                line,
                column: col,
                insertedText: char,
                deletedText: "",
                cursorBefore: { line, column: col },
                cursorAfter: { line, column: col + char.length },
            });

            const charLen = char.length;
            for (let j = 0; j < updatedCursors.length; j++) {
                const target = updatedCursors[j];
                if (target && target.head.line === line && target.head.column >= col) {
                    target.head.column += charLen;
                    target.anchor.column += charLen;
                }
            }

            updatedCursors.unshift({
                ...cursor,
                head: { line, column: col + charLen },
                anchor: { line, column: col + charLen },
            });
        }

        this.multiCursor.setCursors(updatedCursors);
    }

    /**
     * Backspace across all active cursors (or delete highlighted selection)
     */
    public handleBackspace(): void {
        if (!this.selection.isCollapsed) {
            const selectedText = BufferSelectionHelper.getSelectedText(this.buffer, this.selection);
            const norm = this.selection.normalized;
            const deletePos = BufferSelectionHelper.deleteSelection(this.buffer, this.selection);

            if (deletePos) {
                this.multiCursor.resetToSingle(deletePos);
                if (norm) {
                    this.history.recordEdit({
                        line: norm.start.line,
                        column: norm.start.column,
                        insertedText: "",
                        deletedText: selectedText,
                        cursorBefore: norm.end,
                        cursorAfter: deletePos,
                    });
                }
            }
            return;
        }

        const cursors = [...this.multiCursor.getCursors()];
        const updatedCursors: CursorSelectionInstance[] = [];

        for (let i = cursors.length - 1; i >= 0; i--) {
            const cursor = cursors[i];
            if (!cursor) continue;

            const line = cursor.head.line;
            const col = cursor.head.column;

            if (col > 0) {
                const lineText = this.buffer.getLines()[line] ?? "";
                const deletedChar = lineText[col - 1] ?? "";

                const updated =
                    lineText.substring(0, col - 1) + lineText.substring(col);
                this.buffer.setLine(line, updated);

                this.history.recordEdit({
                    line,
                    column: col - 1,
                    insertedText: "",
                    deletedText: deletedChar,
                    cursorBefore: { line, column: col },
                    cursorAfter: { line, column: col - 1 },
                });

                for (let j = 0; j < updatedCursors.length; j++) {
                    const target = updatedCursors[j];
                    if (target && target.head.line === line && target.head.column >= col) {
                        target.head.column = Math.max(0, target.head.column - 1);
                        target.anchor.column = Math.max(0, target.anchor.column - 1);
                    }
                }

                updatedCursors.unshift({
                    ...cursor,
                    head: { line, column: col - 1 },
                    anchor: { line, column: col - 1 },
                });
            } else {
                updatedCursors.unshift(cursor);
            }
        }

        this.multiCursor.setCursors(updatedCursors);
    }

    /**
     * Handles Enter keypress across all active cursors
     */
    public handleEnter(): void {
        if (!this.selection.isCollapsed) {
            BufferSelectionHelper.deleteSelection(this.buffer, this.selection);
        }

        const cursors = [...this.multiCursor.getCursors()];
        const updatedCursors: CursorSelectionInstance[] = [];

        for (let i = cursors.length - 1; i >= 0; i--) {
            const cursor = cursors[i];
            if (!cursor) continue;

            const line = cursor.head.line;
            const col = cursor.head.column;
            const lines = this.buffer.getLines();
            const currentLine = lines[line] ?? "";

            const headPart = currentLine.substring(0, col);
            const tailPart = currentLine.substring(col);

            this.buffer.setLine(line, headPart);
            this.buffer.spliceLines(line + 1, 0, tailPart);

            this.history.recordEdit({
                line,
                column: col,
                insertedText: "\n",
                deletedText: "",
                cursorBefore: { line, column: col },
                cursorAfter: { line: line + 1, column: 0 },
            });

            for (let j = 0; j < updatedCursors.length; j++) {
                const target = updatedCursors[j];
                if (target && target.head.line > line) {
                    target.head.line += 1;
                    target.anchor.line += 1;
                }
            }

            updatedCursors.unshift({
                ...cursor,
                head: { line: line + 1, column: 0 },
                anchor: { line: line + 1, column: 0 },
            });
        }

        this.multiCursor.setCursors(updatedCursors);
    }

    /**
     * Adds a cursor directly above or below primary cursor (Ctrl+Alt+Up / Down)
     */
    public addCursorAboveOrBelow(direction: "up" | "down"): void {
        const primary = this.multiCursor.getPrimary();
        const targetLine =
            direction === "up" ? primary.head.line - 1 : primary.head.line + 1;

        const lines = this.buffer.getLines();
        if (targetLine >= 0 && targetLine < lines.length) {
            const targetLineText = lines[targetLine] ?? "";
            const clampedCol = Math.min(primary.head.column, targetLineText.length);

            this.multiCursor.addCursor({ line: targetLine, column: clampedCol });
        }
    }
}