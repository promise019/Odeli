// src/features/editor/text_buffer.ts

export class TextBuffer {
    private lines: string[] = [];

    constructor(initialContent: string | string[] = "") {
        if (Array.isArray(initialContent)) {
            this.lines = initialContent.length > 0 ? [...initialContent] : [""];
        } else {
            this.lines = initialContent.split("\n");
        }
    }

    public getLines(): string[] {
        return this.lines;
    }

    public getLine(lineIndex: number): string {
        return this.lines[lineIndex] ?? "";
    }

    public setLine(lineIndex: number, text: string): void {
        if (lineIndex >= 0 && lineIndex < this.lines.length) {
            this.lines[lineIndex] = text;
        }
    }

    public insertAt(line: number, column: number, text: string): void {
        const currentLine = this.getLine(line);
        const updated = currentLine.slice(0, column) + text + currentLine.slice(column);
        this.setLine(line, updated);
    }

    public deleteAt(line: number, column: number, length: number): void {
        const currentLine = this.getLine(line);
        const updated = currentLine.slice(0, column) + currentLine.slice(column + length);
        this.setLine(line, updated);
    }

    public spliceLines(start: number, deleteCount: number, ...items: string[]): void {
        this.lines.splice(start, deleteCount, ...items);
    }

    public setText(text: string | string[]): void {
        if (Array.isArray(text)) {
            this.lines = [...text];
        } else {
            this.lines = text.split("\n");
        }
    }
}