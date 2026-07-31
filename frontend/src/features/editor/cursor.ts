export interface Position {
    line: number;
    col: number;
}

export interface SelectionRange {
    start: Position;
    end: Position;
}

export type CursorChangeListener = (cursor: Cursor) => void;

export class Cursor {
    public line: number = 0;
    public col: number = 0;
    
    // Anchor position for text selection (Shift + Arrows or Drag)
    public anchorLine: number = 0;
    public anchorCol: number = 0;

    // Preserved column when navigating up/down through shorter lines
    private goalCol: number = 0;
    private listeners: Set<CursorChangeListener> = new Set();

    /**
     * Set cursor position explicitly
     */
    public setPosition(line: number, col: number, keepSelection: boolean = false): void {
        this.line = Math.max(0, line);
        this.col = Math.max(0, col);
        this.goalCol = this.col;

        if (!keepSelection) {
            this.anchorLine = this.line;
            this.anchorCol = this.col;
        }

        this.notify();
    }

    /**
     * Moves cursor up or down while preserving the goal column
     */
    public moveVertical(deltaLines: number, maxLine: number, getLineLength: (line: number) => number): void {
        const targetLine = Math.max(0, Math.min(this.line + deltaLines, maxLine));
        const lineLen = getLineLength(targetLine);

        this.line = targetLine;
        // Clamp column to current line length, but remember goalCol
        this.col = Math.min(this.goalCol, lineLen);
        
        this.anchorLine = this.line;
        this.anchorCol = this.col;
        this.notify();
    }

    /**
     * Checks if text is currently highlighted/selected
     */
    public hasSelection(): boolean {
        return this.line !== this.anchorLine || this.col !== this.anchorCol;
    }

    /**
     * Returns selection bounds normalized from top-left to bottom-right
     */
    public getSelection(): SelectionRange | null {
        if (!this.hasSelection()) return null;

        const isAnchorFirst =
            this.anchorLine < this.line ||
            (this.anchorLine === this.line && this.anchorCol < this.col);

        return isAnchorFirst
            ? { start: { line: this.anchorLine, col: this.anchorCol }, end: { line: this.line, col: this.col } }
            : { start: { line: this.line, col: this.col }, end: { line: this.anchorLine, col: this.anchorCol } };
    }

    public subscribe(listener: CursorChangeListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify(): void {
        this.listeners.forEach((fn) => fn(this));
    }
}