// src/features/editor/input_controller.ts

import { TextBuffer } from "./text_buffer.js";
import { Cursor } from "./cursor.js";
import { SelectionState } from "./selection.js";
import { BufferSelectionHelper } from "./buffer_selection.js";
import { HistoryManager } from "./history.js";

export class EditorInputController {
    constructor(
        private buffer: TextBuffer,
        private cursor: Cursor,
        private selection: SelectionState,
        private history: HistoryManager
    ) {}

    /**
     * Handles typing single printable characters (e.g. 'a', 'B', ' ', '{')
     */
    public typeCharacter(char: string): void {
        const cursorBefore = this.cursor.getPosition();

        // 1. If text is selected, deleting the selection comes first
        if (!this.selection.isCollapsed) {
            const selectedText = BufferSelectionHelper.getSelectedText(this.buffer, this.selection);
            const deletePos = BufferSelectionHelper.deleteSelection(this.buffer, this.selection)!;

            this.buffer.insertAt(deletePos.line, deletePos.column, char);
            
            this.cursor.setPosition(deletePos.line, deletePos.column + char.length);
            const cursorAfter = this.cursor.getPosition();

            // Record replacing selected text with typed character
            this.history.recordEdit({
                line: deletePos.line,
                column: deletePos.column,
                insertedText: char,
                deletedText: selectedText,
                cursorBefore,
                cursorAfter,
            });
            return;
        }

        // 2. Normal typing without selection
        this.buffer.insertAt(cursorBefore.line, cursorBefore.column, char);
        this.cursor.moveRight(this.buffer);
        const cursorAfter = this.cursor.getPosition();

        // Record single char insertion
        this.history.recordEdit({
            line: cursorBefore.line,
            column: cursorBefore.column,
            insertedText: char,
            deletedText: "",
            cursorBefore,
            cursorAfter,
        });
    }

    /**
     * Handles Backspace keypresses
     */
    public handleBackspace(): void {
        const cursorBefore = this.cursor.getPosition();

        // 1. If text is highlighted, delete the entire selection range
        if (!this.selection.isCollapsed) {
            const selectedText = BufferSelectionHelper.getSelectedText(this.buffer, this.selection);
            const norm = this.selection.normalized!;
            const cursorAfter = BufferSelectionHelper.deleteSelection(this.buffer, this.selection)!;

            this.cursor.setPosition(cursorAfter.line, cursorAfter.column);

            // Record range deletion
            this.history.recordEdit({
                line: norm.start.line,
                column: norm.start.column,
                insertedText: "",
                deletedText: selectedText,
                cursorBefore,
                cursorAfter,
            });
            return;
        }

        // 2. Nothing to delete at top-left of document (0,0)
        if (cursorBefore.line === 0 && cursorBefore.column === 0) {
            return;
        }

        // 3. Deleting a character on the current line
        if (cursorBefore.column > 0) {
            const lineText = this.buffer.getLines()[cursorBefore.line] ?? "";
            const deletedChar = lineText[cursorBefore.column - 1] ?? "";

            // Remove character from buffer
            const updatedLine =
                lineText.substring(0, cursorBefore.column - 1) +
                lineText.substring(cursorBefore.column);
            this.buffer.setLine(cursorBefore.line, updatedLine);

            // Move cursor left
            this.cursor.moveLeft(this.buffer);
            const cursorAfter = this.cursor.getPosition();

            // Record single char deletion
            this.history.recordEdit({
                line: cursorAfter.line,
                column: cursorAfter.column,
                insertedText: "",
                deletedText: deletedChar,
                cursorBefore,
                cursorAfter,
            });
        }
    }

    /**
     * Handles Enter keypresses (new line)
     */
    public handleEnter(): void {
        const cursorBefore = this.cursor.getPosition();

        // Delete active selection first if present
        if (!this.selection.isCollapsed) {
            BufferSelectionHelper.deleteSelection(this.buffer, this.selection);
        }

        const lines = this.buffer.getLines();
        const currentLine = lines[cursorBefore.line] ?? "";

        // Split current line at cursor
        const headPart = currentLine.substring(0, cursorBefore.column);
        const tailPart = currentLine.substring(cursorBefore.column);

        this.buffer.setLine(cursorBefore.line, headPart);
        this.buffer.spliceLines(cursorBefore.line + 1, 0, tailPart);

        // Move cursor to start of next line
        this.cursor.setPosition(cursorBefore.line + 1, 0);
        const cursorAfter = this.cursor.getPosition();

        // Record newline insertion
        this.history.recordEdit({
            line: cursorBefore.line,
            column: cursorBefore.column,
            insertedText: "\n",
            deletedText: "",
            cursorBefore,
            cursorAfter,
        });
    }
}