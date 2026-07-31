// src/features/editor/file_actions.ts

import { fsService } from "../file_system/file_service.js";
import { TextBuffer } from "../editor/text_buffer.js";
import { tabStore } from "../../state/tab_state.js";

// Single Source of Truth for all active buffers in memory
export const bufferRegistry = new Map<string, TextBuffer>();

let untitledCounter = 1;

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

    const content = await fsService.readFile(filePath);
    const buffer = new TextBuffer(content);
    bufferRegistry.set(filePath, buffer);

    tabStore.openTab({
        id: filePath,
        path: filePath,
        title: fileName,
    });

    return buffer;
}

/**
 * Saves current buffer content to disk using Rust IPC
 */
export async function saveActiveFile(filePath: string): Promise<boolean> {
    const buffer = bufferRegistry.get(filePath);
    if (!buffer) return false;

    const content = buffer.getText();
    await fsService.writeFile(filePath, content);
    console.log(`[IPC] Successfully saved: ${filePath}`);
    return true;
}

/**
 * Creates a new file on disk via Rust IPC, initializes an empty buffer, and opens a tab
 */
export async function createNewFileOnDisk(customPath?: string): Promise<TextBuffer> {
    const filePath = customPath || `untitled-${untitledCounter++}.txt`;
    const fileName = filePath.split(/[/\\]/).pop() || filePath;

    // Write empty file on disk via Rust IPC
    await fsService.writeFile(filePath, "");

    const buffer = new TextBuffer("");
    bufferRegistry.set(filePath, buffer);

    tabStore.openTab({
        id: filePath,
        path: filePath,
        title: fileName,
    });

    return buffer;
}

/**
 * Deletes a file on disk via Rust IPC and cleans up active tab & buffer
 */
export async function deleteFileFromDisk(filePath: string): Promise<void> {
    await fsService.deleteNode(filePath);
    bufferRegistry.delete(filePath);
    
    // Close tab if tabStore has closeTab implementation
    if (typeof (tabStore as any).closeTab === "function") {
        (tabStore as any).closeTab(filePath);
    }
}