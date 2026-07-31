// src/features/editor/selection.ts

export interface Position {
    line: number;   // 0-indexed line number
    column: number; // 0-indexed character offset
}

export interface SelectionRange {
    anchor: Position; // Selection start point (where Shift was first pressed or mouse clicked)
    head: Position;   // Active cursor end point
}

export class SelectionState {
    private rangeState: SelectionRange | null = null;

    /**
     * Start or update a selection range
     */
    public setSelection(anchor: Position, head: Position): void {
        this.rangeState = { anchor: { ...anchor }, head: { ...head } };
    }

    /**
     * Clear selection (collapse back to single cursor)
     */
    public clear(): void {
        this.rangeState = null;
    }

    public get rawRange(): SelectionRange | null {
        return this.rangeState;
    }

    /**
     * Returns true if there is no active selection range
     */
    public get isCollapsed(): boolean {
        if (!this.rangeState) return true;
        return (
            this.rangeState.anchor.line === this.rangeState.head.line &&
            this.rangeState.anchor.column === this.rangeState.head.column
        );
    }

    /**
     * Returns selection bounds where `start` is guaranteed to be chronologically before `end`
     */
    public get normalized(): { start: Position; end: Position } | null {
        if (!this.rangeState || this.isCollapsed) return null;

        const { anchor, head } = this.rangeState;

        if (
            anchor.line < head.line ||
            (anchor.line === head.line && anchor.column < head.column)
        ) {
            return { start: { ...anchor }, end: { ...head } };
        } else {
            return { start: { ...head }, end: { ...anchor } };
        }
    }

    /**
     * Checks if a character coordinate falls inside the selection range (used for rendering CSS highlights)
     */
    public containsPosition(line: number, column: number): boolean {
        const norm = this.normalized;
        if (!norm) return false;

        const { start, end } = norm;

        // Line completely outside selection
        if (line < start.line || line > end.line) return false;

        // On starting line: column must be >= start column
        if (line === start.line && column < start.column) return false;

        // On ending line: column must be < end column
        if (line === end.line && column >= end.column) return false;

        return true;
    }
}