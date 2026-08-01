// src/features/editor/file_actions.ts

import { fsService } from "../file_system/file_service.js";
import { TextBuffer } from "../editor/text_buffer.js";
import { tabStore } from "../../state/tab_state.js";

// Single Source of Truth for all active buffers in memory
export const bufferRegistry = new Map<string, TextBuffer>();

let untitledCounter = 1;

/**
 * Gets the current active workspace root path if available, 
 * falling back to a clean relative path or home fallback.
 */
function resolveFilePath(providedPath?: string): string {
    if (providedPath && providedPath.trim().length > 0) {
        return providedPath;
    }

    // Default to untitled file in active workspace if available
    const activeTab = tabStore.getActiveTab();
    if (activeTab && activeTab.path.includes("/")) {
        const parentDir = activeTab.path.substring(0, activeTab.path.lastIndexOf("/"));
        return `${parentDir}/untitled-${untitledCounter++}.txt`;
    }

    return `untitled-${untitledCounter++}.txt`;
}

/**
 * Reads a file from disk via Rust IPC, registers its buffer, and opens a tab
 */
export async function openFile(filePath: string): Promise<TextBuffer> {
    const fileName = filePath.split(/[/\\]/).pop() || filePath;

    // Return existing buffer if file is already loaded in memory
    if (bufferRegistry.has(filePath)) {
        tabStore.openTab({ id: filePath, path: filePath, title: fileName });
        return bufferRegistry.get(filePath)!;
    }

    try {
        const content = await fsService.readFile(filePath);
        const buffer = new TextBuffer(content);
        bufferRegistry.set(filePath, buffer);

        tabStore.openTab({
            id: filePath,
            path: filePath,
            title: fileName,
        });

        return buffer;
    } catch (err) {
        console.error(`[WRY IPC] Failed to open file at ${filePath}:`, err);
        throw err;
    }
}

/**
 * Saves current buffer content to disk using Rust IPC
 */
export async function saveActiveFile(filePath: string): Promise<boolean> {
    const buffer = bufferRegistry.get(filePath);
    if (!buffer) return false;

    try {
        const content = buffer.getText();
        await fsService.writeFile(filePath, content);
        console.log(`[WRY IPC] Successfully saved: ${filePath}`);
        return true;
    } catch (err) {
        console.error(`[WRY IPC] Save failed for ${filePath}:`, err);
        return false;
    }
}

/**
 * Creates a new file on disk via Rust IPC, initializes an empty buffer, and opens a tab
 */
export async function createNewFileOnDisk(customPath?: string): Promise<TextBuffer> {
    const filePath = resolveFilePath(customPath);
    const fileName = filePath.split(/[/\\]/).pop() || filePath;

    try {
        // Write empty file on disk via Rust IPC
        await fsService.writeFile(filePath, "");

        const buffer = new TextBuffer("");
        bufferRegistry.set(filePath, buffer);

        tabStore.openTab({
            id: filePath,
            path: filePath,
            title: fileName,
        });

        console.log(`[WRY IPC] Successfully created file: ${filePath}`);
        return buffer;
    } catch (err) {
        console.error(`[WRY IPC] Failed to create new file on disk (${filePath}):`, err);
        throw err;
    }
}

/**
 * Deletes a file on disk via Rust IPC and cleans up active tab & buffer
 */
export async function deleteFileFromDisk(filePath: string): Promise<void> {
    try {
        await fsService.deleteNode(filePath);
        bufferRegistry.delete(filePath);
        
        // Close tab if tabStore has closeTab implementation
        if (typeof (tabStore as any).closeTab === "function") {
            (tabStore as any).closeTab(filePath);
        }
    } catch (err) {
        console.error(`[WRY IPC] Failed to delete file ${filePath}:`, err);
        throw err;
    }
}