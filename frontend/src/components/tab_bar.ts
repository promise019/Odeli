import { div } from "../utils/dom.js";
import { Icon } from "../utils/icons.js";
import { tabStore } from "../state/tab_state.js";

export function createTabBar(): HTMLElement {
    const container = div(
        "h-9 w-full bg-zinc-950 border-b border-zinc-800 flex items-center overflow-x-auto overflow-y-hidden select-none scrollbar-none shrink-0"
    );

    function render() {
        container.innerHTML = "";
        const tabs = tabStore.getTabs();
        const activeId = tabStore.getActiveId();

        if (tabs.length === 0) {
            const empty = div("px-4 text-xs text-zinc-600 italic flex items-center h-full", "No open editors");
            container.appendChild(empty);
            return;
        }

        tabs.forEach((tab) => {
            const isActive = tab.id === activeId;

            const tabEl = div(
                `group relative h-full flex items-center gap-2 px-3 border-r border-zinc-800 text-xs cursor-pointer transition-colors shrink-0 max-w-[200px] min-w-[120px] ${
                    isActive
                        ? "bg-zinc-900 text-zinc-100 font-medium"
                        : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                }`
            );

            // Orange top indicator for active tab
            if (isActive) {
                const activeBar = div("absolute top-0 left-0 right-0 h-[2px] bg-orange-500");
                tabEl.appendChild(activeBar);
            }

            // File Icon & Title
            const fileIcon = Icon(tab.icon || "FileText", "w-3.5 h-3.5 text-zinc-400 shrink-0");
            const title = div("truncate flex-1 min-w-0", tab.title);

            // Close / Unsaved Indicator Button
            const closeBtn = div(
                "w-4 h-4 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors shrink-0 ml-1"
            );

            if (tab.isDirty) {
                const dirtyDot = div("w-2 h-2 rounded-full bg-orange-400 group-hover:hidden");
                const closeIcon = Icon("X", "w-3 h-3 hidden group-hover:block");
                closeBtn.append(dirtyDot, closeIcon);
            } else {
                closeBtn.append(Icon("X", "w-3 h-3"));
            }

            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                tabStore.closeTab(tab.id);
            });

            tabEl.addEventListener("click", () => {
                tabStore.setActiveTab(tab.id);
            });

            tabEl.append(fileIcon, title, closeBtn);
            container.appendChild(tabEl);
        });
    }

    render();
    tabStore.subscribe(render);

    return container;
}