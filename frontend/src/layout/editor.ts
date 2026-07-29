import { div } from "../utils/dom.js";

export function createEditor(): HTMLElement {

    const editor = div(
        "flex-1 bg-zinc-950 flex items-center justify-center"
    );

    editor.textContent = "Editor";

    return editor;
}