import { div } from "../utils/dom.js";
import { createFileExplorer } from "../components/file_explorer.js";

export function createSidebar(): HTMLElement {
    const sidebar = div(
        "flex flex-col w-full h-full bg-zinc-950 border-r border-zinc-800 overflow-hidden"
    );

    sidebar.appendChild(createFileExplorer());

    return sidebar;
}