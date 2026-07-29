import { div } from "../utils/dom.js";

export function createPanel(): HTMLElement {

    const panel = div(
        "h-56 border-t border-zinc-800 bg-zinc-900"
    );

    panel.textContent = "Terminal / Output / Problems";

    return panel;
}