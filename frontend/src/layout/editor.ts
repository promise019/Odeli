import { div } from "../utils/dom.js";
import { createTabBar } from "../components/tab_bar.js";
import { createEditorViewport } from "../components/editor_viewport.js";

export function createEditor(): HTMLElement {
    const container = div("flex flex-col w-full h-full bg-zinc-900 overflow-hidden");

    const tabBar = createTabBar();
    const viewport = createEditorViewport();

    container.append(tabBar, viewport);
    return container;
}