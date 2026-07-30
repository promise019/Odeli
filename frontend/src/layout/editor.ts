import { div } from "../utils/dom.js";
import { createTabBar } from "../components/tab_bar.js";
import { tabStore } from "../state/tab_state.js";

export function createEditor(): HTMLElement {
    const container = div("flex flex-col w-full h-full bg-zinc-900 overflow-hidden");

    // Add mock initial tabs for instant UI testing
    tabStore.openTab({ id: "1", title: "main.ts", path: "src/main.ts", isDirty: true });
    tabStore.openTab({ id: "2", title: "split_view.ts", path: "src/layout/split_view.ts" });
    tabStore.openTab({ id: "3", title: "styles.css", path: "src/styles.css" });

    const tabBar = createTabBar();
    const editorContent = div(
        "flex-1 p-4 text-zinc-400 font-mono text-sm overflow-auto",
        "// Editor content area"
    );

    container.append(tabBar, editorContent);
    return container;
}