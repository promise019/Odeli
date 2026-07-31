// src/views/editor_viewport.ts
import { div } from "../utils/dom.js";
import { tabStore } from "../state/tab_state.js";
import type { Tab } from "../state/tab_state.js";
import { TextBuffer } from "../features/editor/text_buffer.js";

// Store buffer instances per active tab path
const bufferMap = new Map<string, TextBuffer>();

function getOrCreateBuffer(tab: Tab): TextBuffer {
    if (!bufferMap.has(tab.path)) {
        // Initial text loaded into the new buffer instance
        const initialText = `// Editing: ${tab.path}\n\nexport function main() {\n    console.log("Hello from Odeli!");\n}`;
        bufferMap.set(tab.path, new TextBuffer(initialText));
    }
    return bufferMap.get(tab.path)!;
}

export function createEditorViewport(): HTMLElement {
    const container = div(
        "flex-1 relative flex w-full h-full bg-zinc-900 text-zinc-200 font-mono text-xs overflow-auto select-text"
    );

    let currentBufferCleanup: (() => void) | null = null;

    function renderEmptyState(): HTMLElement {
        const odeliIcon = document.createElement("img");
        odeliIcon.src = new URL("../assets/Odeli_Icon1.png", import.meta.url).href;
        odeliIcon.alt = "Odeli Logo";
        odeliIcon.className = "w-14 h-14 object-contain";

        return div(
            "absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 select-none pointer-events-none",
            div(
                "flex items-center gap-2 mb-4 text-zinc-400 font-sans text-xl font-bold tracking-tight",
                odeliIcon,
                "Odeli IDE"
            )
        );
    }

    function renderCodeView(buffer: TextBuffer): HTMLElement {
        const lines = buffer.getLines();
        const viewport = div("flex w-full min-h-full py-2");

        const lineGutter = div(
            "flex flex-col text-right text-zinc-600 select-none pr-4 pl-2 shrink-0 border-r border-zinc-800/60 min-w-[40px]"
        );
        const codeContent = div("flex flex-col flex-1 pl-4 overflow-x-auto whitespace-pre");

        lines.forEach((lineText, idx) => {
            const numEl = div("h-5 leading-5 hover:text-zinc-400", String(idx + 1));
            lineGutter.appendChild(numEl);

            const lineEl = div("h-5 leading-5 w-full flex items-center px-1 rounded", lineText || " ");
            codeContent.appendChild(lineEl);
        });

        viewport.append(lineGutter, codeContent);
        return viewport;
    }

    function update() {
        // Unsubscribe from previous buffer updates if tab changed
        if (currentBufferCleanup) {
            currentBufferCleanup();
            currentBufferCleanup = null;
        }

        container.innerHTML = "";
        const activeTab = tabStore.getActiveTab();

        if (!activeTab) {
            container.appendChild(renderEmptyState());
        } else {
            const buffer = getOrCreateBuffer(activeTab);
            
            // Initial render
            container.appendChild(renderCodeView(buffer));

            // Re-render viewport whenever buffer emits a change event
            currentBufferCleanup = buffer.subscribe(() => {
                container.innerHTML = "";
                container.appendChild(renderCodeView(buffer));
            });
        }
    }

    update();
    tabStore.subscribe(update);

    return container;
}