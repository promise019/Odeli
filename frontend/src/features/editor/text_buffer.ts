export interface BufferChangeEvent {
    text: string;
    lines: string[];
    lineCount: number;
}

type BufferListener = (event: BufferChangeEvent) => void;

export class TextBuffer {
    private lines: string[] = [];
    private undoStack: string[] = [];
    private redoStack: string[] = [];
    private listeners: Set<BufferListener> = new Set();

    constructor(initialText: string = "") {
        this.setText(initialText, false);
    }

    public setText(text: string, saveHistory: boolean = true): void {
        if (saveHistory && this.getText() !== text) {
            this.pushUndo();
        }
        this.lines = text.split(/\r?\n/);
        this.redoStack = [];
        this.notify();
    }

    public getText(): string {
        return this.lines.join("\n");
    }

    public getLine(lineIndex: number): string {
        return this.lines[lineIndex] ?? "";
    }

    public getLineCount(): number {
        return this.lines.length;
    }

    public getLines(): string[] {
        return [...this.lines];
    }

    public updateLine(lineIndex: number, newText: string): void {
        if (lineIndex < 0 || lineIndex >= this.lines.length) return;
        this.pushUndo();
        this.lines[lineIndex] = newText;
        this.notify();
    }

    public insertAt(lineIndex: number, colIndex: number, textToInsert: string): void {
        const currentLine = this.getLine(lineIndex);
        const before = currentLine.slice(0, colIndex);
        const after = currentLine.slice(colIndex);

        this.pushUndo();
        const insertedLines = textToInsert.split(/\r?\n/);

        if (insertedLines.length === 1) {
            this.lines[lineIndex] = before + textToInsert + after;
        } else {
            insertedLines[0] = before + insertedLines[0];
            insertedLines[insertedLines.length - 1] += after;
            this.lines.splice(lineIndex, 1, ...insertedLines);
        }
        this.notify();
    }

    /**
     * Deletes characters from a line starting at colIndex.
     */
    /**
 * Deletes characters from a line starting at colIndex.
 */
public deleteAt(lineIndex: number, colIndex: number, length: number = 1): void {
    const line = this.getLine(lineIndex); // Safely returns `string` instead of `string | undefined`
    if (!line || colIndex < 0 || colIndex >= line.length) return;

    this.pushUndo();
    this.lines[lineIndex] = line.slice(0, colIndex) + line.slice(colIndex + length);
    this.notify();
}

    /**
     * Removes an entire line by index.
     */
    public deleteLine(lineIndex: number): void {
        if (lineIndex < 0 || lineIndex >= this.lines.length) return;
        this.pushUndo();

        if (this.lines.length === 1) {
            this.lines = [""];
        } else {
            this.lines.splice(lineIndex, 1);
        }
        this.notify();
    }

    public undo(): boolean {
        if (this.undoStack.length === 0) return false;
        const previous = this.undoStack.pop()!;
        this.redoStack.push(this.getText());
        this.lines = previous.split("\n");
        this.notify();
        return true;
    }

    public redo(): boolean {
        if (this.redoStack.length === 0) return false;
        const next = this.redoStack.pop()!;
        this.undoStack.push(this.getText());
        this.lines = next.split("\n");
        this.notify();
        return true;
    }

    public subscribe(listener: BufferListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private pushUndo(): void {
        this.undoStack.push(this.getText());
        if (this.undoStack.length > 100) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo history on new edit
    }

    private notify(): void {
        const event: BufferChangeEvent = {
            text: this.getText(),
            lines: this.lines,
            lineCount: this.lines.length,
        };
        this.listeners.forEach((fn) => fn(event));
    }
}