import { div } from "../utils/dom.js";
import { Icon } from "../utils/icons.js";
import type { IconName } from "../utils/icons.js";
import { appStore } from "../state/app.js";
import { tabStore } from "../state/tab_state.js";
import { themeStore } from "../state/theme.js";

export interface CommandItem {
    id: string;
    label: string;
    shortcut?: string;
    icon?: IconName;
    action: () => void;
}

const defaultCommands: CommandItem[] = [
    {
        id: "toggle-sidebar",
        label: "View: Toggle Primary Side Bar",
        shortcut: "Ctrl+B",
        icon: "PanelLeft",
        action: () => appStore.toggleSidebar(),
    },
    {
        id: "close-active-tab",
        label: "View: Close Active Tab",
        shortcut: "Ctrl+W",
        icon: "X",
        action: () => {
            const activeId = tabStore.getActiveId();
            if (activeId) tabStore.closeTab(activeId);
        },
    },
    {
        id: "close-all-tabs",
        label: "View: Close All Tabs",
        icon: "XCircle",
        action: () => {
            const tabs = [...tabStore.getTabs()];
            tabs.forEach((t) => tabStore.closeTab(t.id));
        },
    },
    {
        id: "view-explorer",
        label: "View: Show Explorer",
        icon: "Files",
        action: () => appStore.setActiveSidebarView("explorer"),
    },
    {
        id: "view-search",
        label: "View: Show Search",
        icon: "Search",
        action: () => appStore.setActiveSidebarView("search"),
    },
    {
        id: "view-git",
        label: "View: Show Source Control",
        icon: "GitBranch",
        action: () => appStore.setActiveSidebarView("git"),
    },
    {
        id: "view-settings",
        label: "View: Show Settings",
        icon: "Settings",
        action: () => appStore.setActiveSidebarView("settings"),
    },
];

// Combine built-in commands with dynamically generated theme selection options
function getAllCommands(): CommandItem[] {
    const themeCommands: CommandItem[] = themeStore.getThemes().map((t) => ({
        id: `theme-select-${t.id}`,
        label: `Preferences: Color Theme - ${t.name}`,
        icon: "Palette",
        action: () => themeStore.setTheme(t.id),
    }));

    return [...defaultCommands, ...themeCommands];
}

export function createCommandPalette(): HTMLElement {
    const backdrop = div(
        "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[12vh] opacity-0 pointer-events-none transition-opacity duration-150"
    );

    const modal = div(
        "w-[560px] max-w-[90vw] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-150 scale-95"
    );

    // Search Input
    const inputContainer = div(
        "flex items-center px-4 py-3 border-b border-zinc-800 gap-3"
    );
    const searchIcon = Icon("Search", "w-4 h-4 text-zinc-400 shrink-0");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type a command or search...";
    input.className =
        "w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans";

    inputContainer.append(searchIcon, input);

    // Results List
    const resultsContainer = div("max-h-[320px] overflow-y-auto py-1.5");

    modal.append(inputContainer, resultsContainer);
    backdrop.appendChild(modal);

    let selectedIndex = 0;
    let filteredCommands: CommandItem[] = getAllCommands();

    function filterCommands(query: string) {
        const all = getAllCommands();
        const q = query.toLowerCase().trim();
        if (!q) {
            filteredCommands = [...all];
        } else {
            filteredCommands = all.filter((cmd) =>
                cmd.label.toLowerCase().includes(q)
            );
        }
        selectedIndex = 0;
        renderList();
    }

    function executeSelected() {
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
            appStore.closeCommandPalette();
            cmd.action();
        }
    }

    function renderList() {
        resultsContainer.innerHTML = "";

        if (filteredCommands.length === 0) {
            const empty = div(
                "px-4 py-6 text-center text-xs text-zinc-500",
                "No matching commands found"
            );
            resultsContainer.appendChild(empty);
            return;
        }

        filteredCommands.forEach((cmd, idx) => {
            const isSelected = idx === selectedIndex;
            const itemRow = div(
                `flex items-center justify-between px-4 py-2 text-xs cursor-pointer select-none transition-colors ${
                    isSelected
                        ? "bg-orange-500/10 text-orange-400 border-l-2 border-orange-500 font-medium"
                        : "text-zinc-300 hover:bg-zinc-800/50"
                }`,
                div(
                    "flex items-center gap-2.5 truncate",
                    Icon(
                        cmd.icon || "Terminal",
                        `w-4 h-4 shrink-0 ${
                            isSelected ? "text-orange-400" : "text-zinc-500"
                        }`
                    ),
                    div("truncate", cmd.label)
                ),
                cmd.shortcut
                    ? div(
                          "px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] shrink-0",
                          cmd.shortcut
                      )
                    : null
            );

            itemRow.addEventListener("click", () => {
                selectedIndex = idx;
                executeSelected();
            });

            itemRow.addEventListener("mouseenter", () => {
                selectedIndex = idx;
                renderList();
            });

            resultsContainer.appendChild(itemRow);
        });
    }

    // Input & Navigation Event Listeners
    input.addEventListener("input", (e) => {
        filterCommands((e.target as HTMLInputElement).value);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredCommands.length;
            renderList();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedIndex =
                (selectedIndex - 1 + filteredCommands.length) %
                filteredCommands.length;
            renderList();
        } else if (e.key === "Enter") {
            e.preventDefault();
            executeSelected();
        } else if (e.key === "Escape") {
            e.preventDefault();
            appStore.closeCommandPalette();
        }
    });

    // Close on backdrop click
    backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
            appStore.closeCommandPalette();
        }
    });

    // Global Keybinding Trigger (Ctrl+Shift+P / Cmd+Shift+P / F1)
    window.addEventListener("keydown", (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        const metaKey = isMac ? e.metaKey : e.ctrlKey;

        if ((metaKey && e.shiftKey && e.key.toLowerCase() === "p") || e.key === "F1") {
            e.preventDefault();
            appStore.toggleCommandPalette();
        }
    });

    // React to state changes
    appStore.subscribe((state) => {
        if (state.isCommandPaletteOpen) {
            backdrop.classList.remove("opacity-0", "pointer-events-none");
            backdrop.classList.add("opacity-100", "pointer-events-auto");
            modal.classList.remove("scale-95");
            modal.classList.add("scale-100");
            input.value = "";
            filterCommands("");
            setTimeout(() => input.focus(), 50);
        } else {
            backdrop.classList.remove("opacity-100", "pointer-events-auto");
            backdrop.classList.add("opacity-0", "pointer-events-none");
            modal.classList.remove("scale-100");
            modal.classList.add("scale-95");
            input.blur();
        }
    });

    return backdrop;
}