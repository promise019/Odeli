import { div } from "../utils/dom.js";

export function createStatusBar(): HTMLElement {

    const status = div(
        "h-6 shrink-0 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400"
    );

    status.textContent =
        "Rust • UTF-8 • LF • Spaces:4 • main";

    return status;
}