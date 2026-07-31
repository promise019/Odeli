// src/features/editor/text_buffer.ts

export type BufferChangeListener = () => void;

export class TextBuffer {
    private lines: string[] = [];
    private listeners: Set<BufferChangeListener> = new Set();

    constructor(initialContent: string | string[] = "") {
        if (Array.isArray(initialContent)) {
            this.lines = initialContent.length > 0 ? [...initialContent] : [""];
        } else {
            this.lines = initialContent.split("\n");
        }
    }

    /**
     * Subscribes a listener function to buffer updates.
     * Returns an unsubscribe cleanup callback.
     */
    public subscribe(listener: BufferChangeListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify(): void {
        this.listeners.forEach((listener) => listener());
    }

    public getText(): string {
        return this.lines.join("\n");
    }

    public getLines(): string[] {
        return this.lines;
    }

    public getLine(lineIndex: number): string {
        return this.lines[lineIndex] ?? "";
    }

    public getLineCount(): number {
        return this.lines.length;
    }

    public setLine(lineIndex: number, text: string): void {
        if (lineIndex >= 0 && lineIndex < this.lines.length) {
            this.lines[lineIndex] = text;
            this.notify();
        }
    }

    public insertAt(line: number, column: number, text: string): void {
        const currentLine = this.getLine(line);

        if (text === "\n") {
            const head = currentLine.substring(0, column);
            const tail = currentLine.substring(column);
            this.lines.splice(line, 1, head, tail);
        } else {
            const updated = currentLine.slice(0, column) + text + currentLine.slice(column);
            this.lines[line] = updated;
        }

        this.notify();
    }

    public deleteAt(line: number, column: number, length: number): void {
        const currentLine = this.getLine(line);
        const updated = currentLine.slice(0, column) + currentLine.slice(column + length);
        this.lines[line] = updated;
        this.notify();
    }

    public spliceLines(start: number, deleteCount: number, ...items: string[]): void {
        this.lines.splice(start, deleteCount, ...items);
        this.notify();
    }

    public setText(text: string | string[]): void {
        if (Array.isArray(text)) {
            this.lines = [...text];
        } else {
            this.lines = text.split("\n");
        }
        this.notify();
    }

    public undo(): void {
        // Wire up to HistoryManager if integrated at buffer level
        this.notify();
    }

    public redo(): void {
        // Wire up to HistoryManager if integrated at buffer level
        this.notify();
    }
}