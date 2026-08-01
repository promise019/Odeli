// src/features/editor/editor_controller.ts

import { TextBuffer } from "./text_buffer.js";
import { MultiCursorManager } from "./multi_cursor.js";
import { SelectionState } from "./selection.js";
import { HistoryManager } from "./history.js";
import { MultiInputController } from "./multi_input_controller.js";
import { MultiCursorRenderer } from "./multi_cursor_renderer.js";
import { SearchEngine } from "./search_engine.js";
import { SearchWidget } from "./search_widget.js";

export class EditorController {
    private buffer: TextBuffer;
    private multiCursor: MultiCursorManager;
    private selection: SelectionState;
    private history: HistoryManager;
    
    private multiInput: MultiInputController;
    private cursorRenderer: MultiCursorRenderer;
    
    private searchEngine: SearchEngine;
    private searchWidget: SearchWidget;

    constructor(container: HTMLElement) {
        this.buffer = new TextBuffer(["// Start typing here..."]);
        this.multiCursor = new MultiCursorManager();
        this.selection = new SelectionState();
        this.history = new HistoryManager();

        this.multiInput = new MultiInputController(
            this.buffer,
            this.multiCursor,
            this.selection,
            this.history
        );

        this.cursorRenderer = new MultiCursorRenderer(this.multiCursor);

        // --- Search Engine Setup ---
        this.searchEngine = new SearchEngine();
        this.searchWidget = new SearchWidget(
            this.searchEngine,
            this.buffer,
            () => this.render()
        );

        // Mount search UI into container
        container.appendChild(this.searchWidget.getElement());
        container.appendChild(this.cursorRenderer.getContainer());

        this.bindGlobalShortcuts();
    }

    /**
     * Centralized Keydown Event Loop handling editor shortcuts
     */
    private bindGlobalShortcuts(): void {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().includes("MAC");
            const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

            // 1. Cmd/Ctrl + F: Toggle Search Widget
            if (ctrlOrCmd && e.key.toLowerCase() === "f") {
                e.preventDefault();
                this.searchWidget.toggle();
                return;
            }

            // 2. Ctrl + Alt + Up / Down: Add Multi-Cursor
            if (e.ctrlKey && e.altKey && e.key === "ArrowUp") {
                e.preventDefault();
                this.multiInput.addCursorAboveOrBelow("up");
                this.render();
                return;
            }

            if (e.ctrlKey && e.altKey && e.key === "ArrowDown") {
                e.preventDefault();
                this.multiInput.addCursorAboveOrBelow("down");
                this.render();
                return;
            }

            // 3. Cmd/Ctrl + Z / Shift+Z: Undo / Redo
            if (ctrlOrCmd && e.key.toLowerCase() === "z") {
                e.preventDefault();
                if (e.shiftKey) {
                    this.history.redo(this.buffer);
                } else {
                    this.history.undo(this.buffer);
                }
                this.render();
                return;
            }

            // 4. Standard Typing & Backspace Loop
            if (e.key === "Backspace") {
                e.preventDefault();
                this.multiInput.handleBackspace();
                this.render();
            } else if (e.key === "Enter") {
                e.preventDefault();
                this.multiInput.handleEnter();
                this.render();
            } else if (e.key.length === 1 && !ctrlOrCmd && !e.altKey) {
                e.preventDefault();
                this.multiInput.typeCharacter(e.key);
                this.render();
            }
        });
    }

    private render(): void {
        this.cursorRenderer.render();
        // Trigger code mirror or custom line DOM renderers here
    }
}