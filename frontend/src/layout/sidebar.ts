import { div, heading } from "../utils/dom.js";

export function createSidebar(): HTMLElement {

    const sidebar = div(
        "w-full border-r border-zinc-800 bg-zinc-900 flex flex-col"
    );

    sidebar.append(

        heading(
            2,
            "Explorer",
            "text-xs uppercase tracking-widest text-zinc-500 px-4 py-3"
        )

    );

    return sidebar;
}