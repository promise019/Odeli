import { div } from "../utils/dom.js";

import { createEditor } from "./editor.js";
import { createPanel } from "./panel.js";

export function createMainArea(): HTMLElement {

    const area = div(
        "flex flex-col flex-1 overflow-hidden"
    );

    area.append(
        createEditor(),
        createPanel()
    );

    return area;
}