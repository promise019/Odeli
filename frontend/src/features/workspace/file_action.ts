// src/features/editor/file_actions.ts
import { tabStore } from "../../state/tab_state.js";

let untitledCounter = 1;

export function createNewFile(fileName?: string) {
    const name = fileName || `Untitled-${untitledCounter++}.txt`;
    const path = `untitled/${name}`;

    tabStore.openTab({
        id: path, // Satisfies the required 'id' property on Tab
        path: path,
        title: name,
    });
}