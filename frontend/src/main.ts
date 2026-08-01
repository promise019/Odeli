// frontend/src/main.ts

import { createShell } from "./layout/shell.js";
import { FileExplorer } from "./views/explorer.js";
import { tabStore } from "./state/tab_state.js";
import { createCommandPalette } from "./components/command_palette.js";
import { createNewFileOnDisk, saveActiveFile } from "./features/workspace/file_action.js";
import { logger } from "./utils/logger.js";

async function bootstrap_app() {
    logger.info("Initializing Odeli IDE bootstrap process...");

    const app = document.getElementById("app");
    if (!app) {
        logger.error("Root Element '#app' not found in DOM!");
        throw new Error("Root Element Not found");
    }

    app.className = "bg-black h-screen w-screen overflow-hidden relative";
    app.append(createShell());

    // Mount Command Palette overlay component to the root container
    app.append(createCommandPalette());

    // --- Global Keyboard Shortcuts (Ctrl+N, Ctrl+S) ---
    window.addEventListener(
        "keydown",
        (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().includes("MAC");
            const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

            const activeEl = document.activeElement;
            const isInputActive = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

            // Ignore Ctrl+N / Ctrl+S if focused in an input field other than the editor
            if (isInputActive && !activeEl.classList.contains("monaco-mouse-cursor-text")) {
                return;
            }

            // Ctrl+N / Cmd+N: New File
            if (ctrlOrCmd && e.key.toLowerCase() === "n") {
                e.preventDefault();
                e.stopPropagation();

                logger.info("Shortcut captured: Ctrl+N / Cmd+N -> Creating new file...");

                createNewFileOnDisk()
                    .then(() => logger.info("File creation lifecycle complete."))
                    .catch((err) => logger.error("File creation lifecycle failed:", err));
                return;
            }

            // Ctrl+S / Cmd+S: Save File
            if (ctrlOrCmd && e.key.toLowerCase() === "s") {
                e.preventDefault();
                e.stopPropagation();

                const activeTab = tabStore.getActiveTab();
                if (activeTab) {
                    logger.info(`Shortcut captured: Ctrl+S -> Saving active tab: ${activeTab.path}`);
                    saveActiveFile(activeTab.path);
                } else {
                    logger.warn("Shortcut Ctrl+S ignored: No active tab found.");
                }
                return;
            }
        },
        true // Capture phase
    );

    // --- Sidebar File Explorer Initialization ---
    const sidebarEl = app.querySelector(".sidebar") || app.querySelector("#sidebar");

    if (sidebarEl) {
        logger.info("Mounting FileExplorer to sidebar...");
        const explorer = new FileExplorer(
            sidebarEl as HTMLElement,
            ".",
            (filePath: string) => {
                const title = filePath.split(/[/\\]/).pop() || filePath;
                logger.info(`File clicked in explorer: ${filePath}`);

                tabStore.openTab({
                    id: filePath,
                    title: title,
                    path: filePath,
                    icon: "file",
                });
            }
        );

        try {
            await explorer.render();
            logger.info("FileExplorer successfully rendered.");
        } catch (err) {
            logger.error("FileExplorer failed to render directory tree:", err);
        }
    } else {
        logger.warn("Sidebar element (.sidebar or #sidebar) was not found in shell layout!");
    }
}

// Global unhandled error boundary
bootstrap_app().catch((err) => {
    console.error("[Odeli Fatal Bootstrap Error]:", err);
});