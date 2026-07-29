import { div, heading } from "../utils/dom.js";
import { Icon } from "../utils/icons.js";

export function createTitleBar(): HTMLElement {

    const bar = div(
        "h-11 shrink-0 flex items-center justify-between px-5 bg-zinc-900 border-b border-zinc-800"
    );

    /* ---------------- Left ---------------- */

    const left = div(
        "flex items-center gap-3"
    );

    left.append(

        Icon("CodeXml", "w-5 h-5 text-orange-500"),

        heading(
            1,
            "Odeli",
            "text-sm font-semibold tracking-wide text-zinc-100"
        )

    );

    /* ---------------- Center ---------------- */

    const center = div(
        "flex-1 flex justify-center px-10"
    );

    const commandBar = div(
        "w-[500px] h-8 rounded-lg bg-zinc-800 border border-zinc-700 \
         flex items-center gap-2 px-5 hover:border-zinc-600 \
         transition-colors cursor-text"
    );

    commandBar.append(

        Icon(
            "Search",
            "w-4 h-4 text-zinc-500"
        )

    );

    const placeholder = document.createElement("span");

    placeholder.className =
        "text-xs text-zinc-500";

    placeholder.textContent =
        "Search files, commands or symbols";

    commandBar.append(placeholder);

    center.append(commandBar);

    /* ---------------- Right ---------------- */

    const right = div(
        "flex items-center gap-4"
    );

    const git = div(
        "flex items-center gap-2 text-xs text-zinc-400"
    );

    git.append(

        Icon(
            "GitBranch",
            "w-4 h-4"
        )

    );

    const branch = document.createElement("span");
    branch.textContent = "main";

    git.append(branch);

    const notifications = div(
        "p-2 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors"
    );

    notifications.append(

        Icon(
            "Bell",
            "w-4 h-4 text-zinc-400"
        )

    );

    const settings = div(
        "p-2 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors"
    );

    settings.append(

        Icon(
            "Settings",
            "w-4 h-4 text-zinc-400"
        )

    );

    right.append(
        git,
        notifications,
        settings
    );

    bar.append(
        left,
        center,
        right
    );

    return bar;
}