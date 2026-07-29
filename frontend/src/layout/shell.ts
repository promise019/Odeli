import { div } from "../utils/dom.js";

import { createTitleBar } from "./title_bar.js";
import { createWorkspace } from "./workspace.js";
import { createStatusBar } from "./status_bar.js";

export function createShell(): HTMLElement {

    const shell = div(
        "w-screen h-screen flex flex-col bg-zinc-950 text-white overflow-hidden"
    );

    shell.append(
        createTitleBar(),
        createWorkspace(),
        createStatusBar()
    );

    return shell;
}