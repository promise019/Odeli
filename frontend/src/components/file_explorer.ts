import { div } from "../utils/dom.js";
import { Icon } from "../utils/icons.js";
import type { IconName } from "../utils/icons.js";
import { tabStore } from "../state/tab_state.js";

export interface FileNode {
    id: string;
    name: string;
    path: string;
    type: "file" | "folder";
    children?: FileNode[];
    isOpen?: boolean;
}

// Map common file extensions to Lucide icon names
function getFileIcon(filename: string): IconName {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "ts":
        case "tsx":
        case "js":
        case "jsx":
            return "FileCode";
        case "rs":
            return "Cog";
        case "json":
            return "Braces";
        case "css":
        case "scss":
            return "Palette";
        case "html":
            return "Globe";
        case "png":
        case "jpg":
        case "svg":
            return "Image";
        default:
            return "FileText";
    }
}

// Default mock workspace tree (will be replaced by Tauri/Rust IPC filesystem calls)
export const initialFileTree: FileNode[] = [
    {
        id: "src",
        name: "src",
        path: "src",
        type: "folder",
        isOpen: true,
        children: [
            {
                id: "src/components",
                name: "components",
                path: "src/components",
                type: "folder",
                isOpen: true,
                children: [
                    { id: "src/components/tab_bar.ts", name: "tab_bar.ts", path: "src/components/tab_bar.ts", type: "file" },
                    { id: "src/components/file_explorer.ts", name: "file_explorer.ts", path: "src/components/file_explorer.ts", type: "file" },
                ],
            },
            {
                id: "src/layout",
                name: "layout",
                path: "src/layout",
                type: "folder",
                isOpen: true,
                children: [
                    { id: "src/layout/workspace.ts", name: "workspace.ts", path: "src/layout/workspace.ts", type: "file" },
                    { id: "src/layout/split_view.ts", name: "split_view.ts", path: "src/layout/split_view.ts", type: "file" },
                    { id: "src/layout/sidebar.ts", name: "sidebar.ts", path: "src/layout/sidebar.ts", type: "file" },
                ],
            },
            {
                id: "src/state",
                name: "state",
                path: "src/state",
                type: "folder",
                isOpen: true,
                children: [
                    { id: "src/state/tabs.ts", name: "tabs.ts", path: "src/state/tabs.ts", type: "file" },
                ],
            },
            { id: "src/main.ts", name: "main.ts", path: "src/main.ts", type: "file" },
        ],
    },
    { id: "package.json", name: "package.json", path: "package.json", type: "file" },
    { id: "Cargo.toml", name: "Cargo.toml", path: "Cargo.toml", type: "file" },
];

export function createFileExplorer(data: FileNode[] = initialFileTree): HTMLElement {
    const container = div(
        "flex flex-col w-full h-full bg-zinc-950 text-zinc-300 text-xs select-none overflow-y-auto"
    );

    // Explorer Header Bar
    const header = div(
        "flex items-center justify-between px-4 py-2 border-b border-zinc-800 text-[11px] font-semibold tracking-wider uppercase text-zinc-400 shrink-0",
        div("", "Explorer"),
        div(
            "flex items-center gap-1",
            div("p-0.5 rounded hover:bg-zinc-800 cursor-pointer text-zinc-400 hover:text-zinc-200 transition-colors", Icon("FilePlus", "w-3.5 h-3.5")),
            div("p-0.5 rounded hover:bg-zinc-800 cursor-pointer text-zinc-400 hover:text-zinc-200 transition-colors", Icon("FolderPlus", "w-3.5 h-3.5")),
            div("p-0.5 rounded hover:bg-zinc-800 cursor-pointer text-zinc-400 hover:text-zinc-200 transition-colors", Icon("RefreshCw", "w-3.5 h-3.5"))
        )
    );

    const treeContainer = div("flex-1 py-1 overflow-x-hidden");

    function renderTree(nodes: FileNode[], depth = 0): HTMLElement {
        const list = div("flex flex-col");

        nodes.forEach((node) => {
            const activeId = tabStore.getActiveId();
            const isActive = activeId === node.id || activeId === node.path;
            const indentPadding = `${depth * 12 + 12}px`;

            if (node.type === "folder") {
                const folderRow = div(
                    "flex items-center gap-1.5 py-1 px-2 hover:bg-zinc-800/60 cursor-pointer text-zinc-300 transition-colors group",
                    Icon(node.isOpen ? "ChevronDown" : "ChevronRight", "w-3.5 h-3.5 text-zinc-400 shrink-0"),
                    Icon(node.isOpen ? "FolderOpen" : "Folder", "w-3.5 h-3.5 text-orange-400 shrink-0"),
                    div("truncate flex-1 font-medium", node.name)
                );
                folderRow.style.paddingLeft = indentPadding;

                folderRow.addEventListener("click", () => {
                    node.isOpen = !node.isOpen;
                    updateUI();
                });

                list.appendChild(folderRow);

                if (node.isOpen && node.children) {
                    list.appendChild(renderTree(node.children, depth + 1));
                }
            } else {
                const fileIconName = getFileIcon(node.name);
                const fileRow = div(
                    `flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors group ${
                        isActive
                            ? "bg-zinc-800/90 text-orange-400 font-medium border-l-2 border-orange-500"
                            : "hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
                    }`,
                    Icon(
                        fileIconName,
                        `w-3.5 h-3.5 shrink-0 ${
                            isActive ? "text-orange-400" : "text-zinc-500 group-hover:text-zinc-300"
                        }`
                    ),
                    div("truncate flex-1", node.name)
                );
                fileRow.style.paddingLeft = indentPadding;

                fileRow.addEventListener("click", () => {
                    tabStore.openTab({
                        id: node.id,
                        title: node.name,
                        path: node.path,
                        icon: fileIconName,
                    });
                });

                list.appendChild(fileRow);
            }
        });

        return list;
    }

    function updateUI() {
        treeContainer.innerHTML = "";
        treeContainer.appendChild(renderTree(data));
    }

    updateUI();

    // Re-render highlight whenever the active tab changes
    tabStore.subscribe(updateUI);

    container.append(header, treeContainer);
    return container;
}