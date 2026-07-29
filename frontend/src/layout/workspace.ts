import { div } from "../utils/dom.js";

import { createActivityBar } from "./activity_bar.js";
import { createSidebar } from "./sidebar.js";
import { createMainArea } from "./main_area.js";

export function createWorkspace(): HTMLElement {

    const workspace = div(
        "flex flex-1 overflow-hidden"
    );

    workspace.append(
        createActivityBar(),
        createSidebar(),
        createMainArea()
    );

    return workspace;
}