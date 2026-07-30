import { div } from "../utils/dom.js";

import { createActivityBar } from "./activity_bar.js";
import { createSidebar } from "./sidebar.js";
import { createMainArea } from "./main_area.js";
import { createSplitView } from "./splt_view.js";

export function createWorkspace(): HTMLElement {
;const workspace = div(
        "flex flex-1 overflow-hidden"
    );

    // Wrap the sidebar and main area in a horizontal split view
    const mainSplit = createSplitView(
        createSidebar(),
        createMainArea(),
        {
            direction: "horizontal",
            initialSize: 260, // Default sidebar width in pixels
            minSize: 180,     // Minimum collapse threshold
            maxSize: 480,     // Maximum width threshold
        }
    );

    workspace.append(
        createActivityBar(), // Fixed layout icon strip
        mainSplit            // Resizable sidebar + main editor area
    );

    return workspace;
}