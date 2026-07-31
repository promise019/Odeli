// src/features/editor/history_controller.ts

import { HistoryManager } from "./history.js";
import { TextBuffer } from "./text_buffer.js";
import { Cursor } from "./cursor.js";
import { SelectionState } from "./selection.js";

export class HistoryController {
    constructor(
        private history: HistoryManager,
        private buffer: TextBuffer,
        private cursor: Cursor,
        private selection: SelectionState
    ) {}

    public handleKeyDown(e: KeyboardEvent): boolean {
        const isMac = navigator.platform.toUpperCase().includes("MAC");
        const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

        if (!ctrlOrCmd) return false;

        const key = e.key.toLowerCase();

        // --- Redo Shortcuts: Ctrl+Y OR Cmd+Shift+Z / Ctrl+Shift+Z ---
        if (key === "y" || (e.shiftKey && key === "z")) {
            e.preventDefault();
            this.history.redo(this.buffer, this.cursor, this.selection);
            return true;
        }

        // --- Undo Shortcut: Ctrl+Z / Cmd+Z ---
        if (key === "z" && !e.shiftKey) {
            e.preventDefault();
            this.history.undo(this.buffer, this.cursor, this.selection);
            return true;
        }

        return false;
    }
}