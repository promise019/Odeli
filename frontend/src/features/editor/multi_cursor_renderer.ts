// src/features/editor/multi_cursor_renderer.ts

import { MultiCursorManager, type CursorSelectionInstance } from "./multi_cursor.js";
import { div } from "../../utils/dom.js";

export class MultiCursorRenderer {
    private overlayContainer: HTMLElement;

    constructor(
        private multiCursor: MultiCursorManager,
        private lineHeight: number = 20,
        private charWidth: number = 8.5
    ) {
        this.overlayContainer = div("absolute inset-0 pointer-events-none z-10");
    }

    public getContainer(): HTMLElement {
        return this.overlayContainer;
    }

    public render(): void {
        this.overlayContainer.replaceChildren();

        const cursors = this.multiCursor.getCursors();

        cursors.forEach((c: CursorSelectionInstance) => {
            const cursorBar = div(
                "absolute bg-zinc-100 animate-pulse w-[2px] transition-all duration-75"
            );

            cursorBar.style.top = `${c.head.line * this.lineHeight}px`;
            cursorBar.style.left = `${c.head.column * this.charWidth}px`;
            cursorBar.style.height = `${this.lineHeight}px`;

            this.overlayContainer.appendChild(cursorBar);
        });
    }
}