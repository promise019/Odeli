// src/features/editor/multi_cursor.ts

import { type Position } from "./selection.js";

export interface CursorSelectionInstance {
    id: string;
    anchor: Position;
    head: Position;
}

export class MultiCursorManager {
    private instances: CursorSelectionInstance[] = [];

    constructor() {
        // Start with 1 default primary cursor at (0,0)
        this.addCursor({ line: 0, column: 0 });
    }

    /**
     * Returns all current active cursor instances
     */
    public getCursors(): CursorSelectionInstance[] {
        return this.instances;
    }

    /**
     * Gets the primary (last added) cursor
     */
    public getPrimary(): CursorSelectionInstance {
        const last = this.instances[this.instances.length - 1];
        if (last) return last;

        return {
            id: "primary",
            anchor: { line: 0, column: 0 },
            head: { line: 0, column: 0 },
        };
    }

    /**
     * Replaces the entire instances array directly
     */
    public setCursors(cursors: CursorSelectionInstance[]): void {
        this.instances = cursors;
        this.sortAndMerge();
    }

    /**
     * Adds a new cursor instance at a given position
     */
    public addCursor(head: Position, anchor: Position = head): void {
        const id = typeof crypto !== "undefined" && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `cursor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        this.instances.push({
            id,
            anchor: { ...anchor },
            head: { ...head },
        });
        this.sortAndMerge();
    }

    /**
     * Resets back to a single primary cursor at position
     */
    public resetToSingle(head: Position, anchor: Position = head): void {
        this.instances = [
            {
                id: "primary",
                anchor: { ...anchor },
                head: { ...head },
            },
        ];
    }

    /**
     * Applies a mapping function over all cursors
     */
    public updateAll(
        fn: (instance: CursorSelectionInstance) => CursorSelectionInstance
    ): void {
        this.instances = this.instances.map(fn);
        this.sortAndMerge();
    }

    /**
     * Sorts cursors top-to-bottom, left-to-right, and merges overlapping ones
     */
    public sortAndMerge(): void {
        if (this.instances.length <= 1) return;

        // 1. Sort by line then by column
        this.instances.sort((a, b) => {
            if (a.head.line !== b.head.line) return a.head.line - b.head.line;
            return a.head.column - b.head.column;
        });

        // 2. Merge identical/overlapping cursor positions
        const merged: CursorSelectionInstance[] = [];

        for (const current of this.instances) {
            const prev = merged[merged.length - 1];

            if (!prev) {
                merged.push(current);
                continue;
            }

            // Deduplicate cursors sharing the exact same anchor & head
            if (
                prev.head.line === current.head.line &&
                prev.head.column === current.head.column &&
                prev.anchor.line === current.anchor.line &&
                prev.anchor.column === current.anchor.column
            ) {
                continue;
            }

            merged.push(current);
        }

        this.instances = merged;
    }
}