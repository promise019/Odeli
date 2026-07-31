// src/features/editor/multi_cursor.ts

export interface CursorPosition {
    line: number;
    column: number;
}

export interface CursorSelectionInstance {
    head: CursorPosition;
    anchor: CursorPosition;
}

export class MultiCursorManager {
    private cursors: CursorSelectionInstance[] = [
        { head: { line: 0, column: 0 }, anchor: { line: 0, column: 0 } }
    ];

    public getCursors(): CursorSelectionInstance[] {
        return this.cursors;
    }

    public setCursors(cursors: CursorSelectionInstance[]): void {
        this.cursors = cursors;
    }

    public getPrimary(): CursorSelectionInstance {
        return this.cursors[0] ?? { head: { line: 0, column: 0 }, anchor: { line: 0, column: 0 } };
    }

    public addCursor(pos: CursorPosition): void {
        this.cursors.push({ head: pos, anchor: pos });
    }

    public resetToSingle(pos: CursorPosition): void {
        this.cursors = [{ head: pos, anchor: pos }];
    }

    public updateAll(fn: (c: CursorSelectionInstance) => CursorSelectionInstance): void {
        this.cursors = this.cursors.map(fn);
    }
}