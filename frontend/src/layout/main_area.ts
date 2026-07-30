import { div } from "../utils/dom.js";

import { createEditor } from "./editor.js";
import { createPanel } from "./panel.js";
import { createSplitView } from "./splt_view.js"; // Fixed spelling: split_view.js

export function createMainArea(): HTMLElement {
    const mainView = createSplitView(
        createEditor(),
        createPanel(),
        {
            direction: "vertical",
            initialSize: 450, // Initial height of the editor pane in pixels
            minSize: 150,     // Minimum height before clamping
            maxSize: 800,     // Maximum height before clamping
        }
    );

    return mainView;
}