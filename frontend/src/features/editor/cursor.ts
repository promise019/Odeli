// src/features/editor/cursor.ts

import { TextBuffer } from "./text_buffer.js";
import { type Position } from "./selection.js";

export class Cursor {
    private line: number = 0;
    private column: number = 0;

    constructor(line: number = 0, column: number = 0) {
        this.line = line;
        this.column = column;
    }

    /**
     * Gets the current cursor position coordinates
     */
    public getPosition(): Position {
        return { line: this.line, column: this.column };
    }

    /**
     * Sets the cursor position directly
     */
    public setPosition(line: number, column: number): void {
        this.line = Math.max(0, line);
        this.column = Math.max(0, column);
    }

    /**
     * Moves cursor left by 1 character or wraps to end of previous line
     */
    public moveLeft(buffer: TextBuffer): void {
        if (this.column > 0) {
            this.column--;
        } else if (this.line > 0) {
            this.line--;
            const prevLineText = buffer.getLines()[this.line] ?? "";
            this.column = prevLineText.length;
        }
    }

    /**
     * Moves cursor right by 1 character or wraps to start of next line
     */
    public moveRight(buffer: TextBuffer): void {
        const lines = buffer.getLines();
        const currentLineText = lines[this.line] ?? "";

        if (this.column < currentLineText.length) {
            this.column++;
        } else if (this.line < lines.length - 1) {
            this.line++;
            this.column = 0;
        }
    }

    /**
     * Moves cursor up by 1 line while clamping column offset
     */
    public moveUp(buffer: TextBuffer): void {
        if (this.line > 0) {
            this.line--;
            const targetLineText = buffer.getLines()[this.line] ?? "";
            this.column = Math.min(this.column, targetLineText.length);
        } else {
            this.column = 0;
        }
    }

    /**
     * Moves cursor down by 1 line while clamping column offset
     */
    public moveDown(buffer: TextBuffer): void {
        const lines = buffer.getLines();
        if (this.line < lines.length - 1) {
            this.line++;
            const targetLineText = lines[this.line] ?? "";
            this.column = Math.min(this.column, targetLineText.length);
        } else {
            const currentLineText = lines[this.line] ?? "";
            this.column = currentLineText.length;
        }
    }

    /**
     * Moves cursor to column 0 of current line
     */
    public moveToLineStart(): void {
        this.column = 0;
    }

    /**
     * Moves cursor to the end of the current line
     */
    public moveToLineEnd(buffer: TextBuffer): void {
        const currentLineText = buffer.getLines()[this.line] ?? "";
        this.column = currentLineText.length;
    }
}