import { div } from "../utils/dom.js";
import { Icon } from "../utils/icons.js";
import type { IconName } from "../utils/icons.js";
import { appStore } from "../state/app.js";
import type { SidebarView } from "../state/app.js";

interface ActivityItem {
    id: SidebarView;
    icon: IconName;
    label: string;
}

const topItems: ActivityItem[] = [
    { id: "explorer", icon: "Files", label: "Explorer" },
    { id: "search", icon: "Search", label: "Search" },
    { id: "git", icon: "GitBranch", label: "Source Control" },
];

const bottomItems: ActivityItem[] = [
    { id: "settings", icon: "Settings", label: "Settings" },
];

export function createActivityBar(): HTMLElement {
    const container = div(
        "w-12 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between items-center py-2 shrink-0 select-none"
    );

    const topSection = div("flex flex-col items-center gap-2 w-full");
    const bottomSection = div("flex flex-col items-center gap-2 w-full");

    function renderItem(item: ActivityItem, state: ReturnType<typeof appStore.getState>) {
        const isActive = state.isSidebarOpen && state.activeSidebarView === item.id;

        const btn = div(
            `relative w-10 h-10 flex items-center justify-center rounded cursor-pointer transition-colors ${
                isActive
                    ? "text-orange-400 bg-zinc-900"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
            }`,
            Icon(item.icon, "w-5 h-5")
        );

        btn.title = item.label;

        // Active indicator strip on left
        if (isActive) {
            const activeStrip = div("absolute left-0 top-2 bottom-2 w-0.5 bg-orange-500 rounded-r");
            btn.appendChild(activeStrip);
        }

        btn.addEventListener("click", () => {
            appStore.setActiveSidebarView(item.id);
        });

        return btn;
    }

    function render(state: ReturnType<typeof appStore.getState>) {
        topSection.innerHTML = "";
        bottomSection.innerHTML = "";

        topItems.forEach((item) => topSection.appendChild(renderItem(item, state)));
        bottomItems.forEach((item) => bottomSection.appendChild(renderItem(item, state)));
    }

    appStore.subscribe(render);

    container.append(topSection, bottomSection);
    return container;
}