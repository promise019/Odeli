import { div } from "../utils/dom.js";
import { tabStore } from "../state/tab_state.js";
import { TextBuffer } from "../features/editor/text_buffer.js";
import { fsService } from "../features/file_system/file_service.js";
import {
    bufferRegistry,
    saveActiveFile,
    createNewFileOnDisk,
} from "../features/workspace/file_action.js";

interface Cursor {
    line: number;
    col: number;
}

export function createEditorViewport(): HTMLElement {
    const container = div(
        "flex-1 relative flex w-full h-full bg-zinc-900 text-zinc-200 font-mono text-xs overflow-auto select-text outline-none"
    );
    container.tabIndex = 0; // Focusable element for keydown events

    // Automatically retain focus when clicking anywhere inside the viewport
    container.addEventListener("click", () => {
        container.focus();
    });

    let currentCursor: Cursor = { line: 0, col: 0 };
    let currentBufferCleanup: (() => void) | null = null;
    let activeBuffer: TextBuffer | null = null;
    let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

    // Debounced real-time sync from TextBuffer -> Rust IPC -> Disk
    function scheduleRealtimeSync(path: string, content: string) {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);

        autoSaveTimer = setTimeout(() => {
            fsService
                .writeFile(path, content)
                .then(() => console.log(`[Realtime Sync] Autosaved ${path}`))
                .catch((err: unknown) =>
                    console.error(`[Realtime Sync] Failed to save ${path}:`, err)
                );
        }, 300); // 300ms debounce buffer
    }

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
            ),
            div("text-xs text-zinc-600", "Press Ctrl+N to create a new file")
        );
    }

    function renderCodeView(buffer: TextBuffer): HTMLElement {
        const lines = buffer.getLines();
        const viewport = div("flex w-full min-h-full py-2 pointer-events-none");

        const lineGutter = div(
            "flex flex-col text-right text-zinc-600 select-none pr-4 pl-2 shrink-0 border-r border-zinc-800/60 min-w-[40px]"
        );
        const codeContent = div("flex flex-col flex-1 pl-4 overflow-x-auto whitespace-pre");

        lines.forEach((lineText, idx) => {
            const isCurrentLine = idx === currentCursor.line;

            // Render line number in gutter
            const numEl = div(
                `h-5 leading-5 ${isCurrentLine ? "text-zinc-200 font-bold" : ""}`,
                String(idx + 1)
            );
            lineGutter.appendChild(numEl);

            // Render text with active blinking cursor block
            let lineDisplayHTML = lineText;
            if (isCurrentLine) {
                const before = lineText.slice(0, currentCursor.col);
                const charAtCursor = lineText[currentCursor.col] || " ";
                const after = lineText.slice(currentCursor.col + 1);

                lineDisplayHTML = `${escapeHTML(before)}<span class="bg-orange-500 text-black animate-pulse">${escapeHTML(charAtCursor)}</span>${escapeHTML(after)}`;
            } else {
                lineDisplayHTML = escapeHTML(lineText) || " ";
            }

            const lineEl = div(
                `h-5 leading-5 w-full flex items-center px-1 rounded ${
                    isCurrentLine ? "bg-zinc-800/50 border-l-2 border-orange-500 -ml-[2px]" : ""
                }`
            );
            lineEl.innerHTML = lineDisplayHTML;
            codeContent.appendChild(lineEl);
        });

        viewport.append(lineGutter, codeContent);
        return viewport;
    }

    // Keyboard Event Controller
    function handleKeyDown(e: KeyboardEvent) {
        // Create New File Realtime (Ctrl+N / Cmd+N)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
            e.preventDefault();
            createNewFileOnDisk().catch((err: unknown) =>
                console.error("[IPC] Failed to create new file:", err)
            );
            return;
        }

        if (!activeBuffer) return;

        // Manual Force Save (Ctrl+S / Cmd+S)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            const activeTab = tabStore.getActiveTab();
            if (activeTab) {
                if (autoSaveTimer) clearTimeout(autoSaveTimer);
                saveActiveFile(activeTab.path).catch((err: unknown) =>
                    console.error(`[IPC] Failed to save file:`, err)
                );
            }
            return;
        }

        // Undo / Redo (Ctrl+Z / Ctrl+Shift+Z)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
            e.preventDefault();
            if (e.shiftKey) activeBuffer.redo();
            else activeBuffer.undo();
            return;
        }

        // Typing Characters (Letters, Numbers, Symbols)
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            activeBuffer.insertAt(currentCursor.line, currentCursor.col, e.key);
            currentCursor.col++;
            return;
        }

        // Enter Key (New Line)
        if (e.key === "Enter") {
            e.preventDefault();
            activeBuffer.insertAt(currentCursor.line, currentCursor.col, "\n");
            currentCursor.line++;
            currentCursor.col = 0;
            return;
        }

        // Backspace Key
        if (e.key === "Backspace") {
            e.preventDefault();
            if (currentCursor.col > 0) {
                activeBuffer.deleteAt(currentCursor.line, currentCursor.col - 1, 1);
                currentCursor.col--;
            } else if (currentCursor.line > 0) {
                const prevLineLen = activeBuffer.getLine(currentCursor.line - 1).length;
                const currentLineText = activeBuffer.getLine(currentCursor.line);

                // Merge current line into the end of previous line
                activeBuffer.deleteAt(currentCursor.line, 0, 0);
                activeBuffer.insertAt(currentCursor.line - 1, prevLineLen, currentLineText);
                currentCursor.line--;
                currentCursor.col = prevLineLen;
            }
            return;
        }

        // Arrow Key Navigation
        if (e.key === "ArrowLeft" && currentCursor.col > 0) {
            currentCursor.col--;
            render();
        } else if (e.key === "ArrowRight") {
            const lineLen = activeBuffer.getLine(currentCursor.line).length;
            if (currentCursor.col < lineLen) {
                currentCursor.col++;
                render();
            }
        } else if (e.key === "ArrowUp" && currentCursor.line > 0) {
            currentCursor.line--;
            currentCursor.col = Math.min(
                currentCursor.col,
                activeBuffer.getLine(currentCursor.line).length
            );
            render();
        } else if (e.key === "ArrowDown" && currentCursor.line < activeBuffer.getLineCount() - 1) {
            currentCursor.line++;
            currentCursor.col = Math.min(
                currentCursor.col,
                activeBuffer.getLine(currentCursor.line).length
            );
            render();
        }
    }

    container.addEventListener("keydown", handleKeyDown);

    function render() {
        container.innerHTML = "";
        if (!activeBuffer) {
            container.appendChild(renderEmptyState());
        } else {
            container.appendChild(renderCodeView(activeBuffer));
        }
    }

    // Asynchronously update editor viewport when tabs change or files load
    async function update() {
        if (currentBufferCleanup) {
            currentBufferCleanup();
            currentBufferCleanup = null;
        }

        const activeTab = tabStore.getActiveTab();

        if (!activeTab) {
            activeBuffer = null;
            render();
            return;
        }

        const tabPath = activeTab.path;

        // Fetch from disk via Rust IPC if not loaded into bufferRegistry yet
        if (!bufferRegistry.has(tabPath)) {
            try {
                const content = await fsService.readFile(tabPath);
                bufferRegistry.set(tabPath, new TextBuffer(content));
            } catch (err: unknown) {
                console.warn(
                    `[Viewport] Could not read disk file for ${tabPath}, starting empty buffer:`,
                    err
                );
                if (!bufferRegistry.has(tabPath)) {
                    bufferRegistry.set(tabPath, new TextBuffer(""));
                }
            }
        }

        // Verify active tab didn't change during async operation
        const currentTab = tabStore.getActiveTab();
        if (currentTab?.path !== tabPath) return;

        activeBuffer = bufferRegistry.get(tabPath)!;

        // Clamp cursor to valid bounds of the active buffer
        const maxLine = Math.max(0, activeBuffer.getLineCount() - 1);
        if (currentCursor.line > maxLine) currentCursor.line = maxLine;
        const currentLineLen = activeBuffer.getLine(currentCursor.line)?.length || 0;
        if (currentCursor.col > currentLineLen) currentCursor.col = currentLineLen;

        render();

        // Subscribe to buffer edits -> re-render UI AND sync real-time changes to Rust
        currentBufferCleanup = activeBuffer.subscribe(() => {
            render();
            if (activeBuffer && activeTab) {
                scheduleRealtimeSync(activeTab.path, activeBuffer.getText());
            }
        });
    }

    update();
    tabStore.subscribe(update);

    return container;
}

function escapeHTML(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/ /g, "&nbsp;");
}