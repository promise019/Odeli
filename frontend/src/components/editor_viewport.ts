import { div } from "../utils/dom.js";
import { Icon } from "../utils/icons.js";
import { tabStore } from "../state/tab_state.js";
import type { Tab } from "../state/tab_state.js";

// Mock file contents for preview testing
const mockFileContents: Record<string, string[]> = {
    "src/main.ts": [
        'import { createWorkspace } from "./layout/workspace.js";',
        'import { appStore } from "./state/app.js";',
        '',
        'function bootstrap() {',
        '    const root = document.getElementById("app");',
        '    if (!root) return;',
        '',
        '    const workspace = createWorkspace();',
        '    root.appendChild(workspace);',
        '    appStore.setStatusMessage("Odeli IDE Ready");',
        '}',
        '',
        'document.addEventListener("DOMContentLoaded", bootstrap);',
    ],
    "package.json": [
        '{',
        '  "name": "odeli",',
        '  "private": true,',
        '  "version": "0.1.0",',
        '  "type": "module",',
        '  "scripts": {',
        '    "dev": "vite",',
        '    "build": "tsc && vite build"',
        '  },',
        '  "dependencies": {',
        '    "lucide": "^0.300.0"',
        '  }',
        '}',
    ],
};

const defaultContent = [
    '// Welcome to Odeli IDE',
    '// Select or open a file from the explorer to start editing.',
    '',
    'export function init() {',
    '    console.log("Editor viewport initialized.");',
    '}',
];

export function createEditorViewport(): HTMLElement {
    const container = div(
        "flex-1 relative flex w-full h-full bg-zinc-900 text-zinc-200 font-mono text-xs overflow-auto select-text"
    );

    function renderEmptyState(): HTMLElement {
        const OdeliIcon = document.createElement('img');
    OdeliIcon.src=new URL("../../assets/Odeli_Icon1.png", import.meta.url).href;
    OdeliIcon.alt = "Odeli Logo";
    OdeliIcon.className = "w-14 h-14 object-contain";
        return div(
            "absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 select-none pointer-events-none",
            div("flex items-center gap-2 mb-4 text-zinc-400 font-sans text-xl font-bold tracking-tight",
                // Icon("Code2", "w-8 h-8 text-orange-500"),
                
                OdeliIcon,
                "Odeli IDE"
            ),
            div("flex flex-col gap-2 text-xs text-zinc-500 font-sans",
                div("flex items-center justify-between gap-6",
                    "Show Command Palette",
                    div("px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[11px]", "Ctrl+Shift+P")
                ),
                div("flex items-center justify-between gap-6",
                    "Go to File",
                    div("px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[11px]", "Ctrl+P")
                ),
                div("flex items-center justify-between gap-6",
                    "Toggle Sidebar",
                    div("px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[11px]", "Ctrl+B")
                )
            )
        );
    }

    function renderCodeView(tab: Tab): HTMLElement {
        const lines = mockFileContents[tab.path] || defaultContent;
        const activeLineIndex = 3; // Mock current cursor line position

        const viewport = div("flex w-full min-h-full py-2");

        // Line Numbers Column
        const lineGutter = div(
            "flex flex-col text-right text-zinc-600 select-none pr-4 pl-2 shrink-0 border-r border-zinc-800/60 min-w-[40px]"
        );

        // Code Content Area
        const codeContent = div("flex flex-col flex-1 pl-4 overflow-x-auto whitespace-pre");

        lines.forEach((lineText, idx) => {
            const lineNum = idx + 1;
            const isCurrentLine = idx === activeLineIndex;

            // Line Number Item
            const numEl = div(
                `h-5 leading-5 ${isCurrentLine ? "text-zinc-200 font-bold" : "hover:text-zinc-400"}`,
                String(lineNum)
            );
            lineGutter.appendChild(numEl);

            // Code Line Container
            const lineEl = div(
                `h-5 leading-5 w-full flex items-center px-1 rounded ${
                    isCurrentLine ? "bg-zinc-800/50 border-l-2 border-orange-500 -ml-[2px]" : ""
                }`,
                lineText || " "
            );
            codeContent.appendChild(lineEl);
        });

        viewport.append(lineGutter, codeContent);
        return viewport;
    }

    function update() {
        container.innerHTML = "";
        const activeTab = tabStore.getActiveTab();

        if (!activeTab) {
            container.appendChild(renderEmptyState());
        } else {
            container.appendChild(renderCodeView(activeTab));
        }
    }

    update();
    tabStore.subscribe(update);

    return container;
}