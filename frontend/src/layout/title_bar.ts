import { div, heading, input } from "../utils/dom.js";
import { Icon } from "../utils/icons.js";
// import odeli_icon from "../../assets/Odeli_Icon1.png";

export function createTitleBar(): HTMLElement {
    const bar = div(
        "h-11 shrink-0 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 select-none [-webkit-app-region:drag]"
    );

    /* ---------------- Left ---------------- */

    // Increased to pl-20 to clear top-left OS/frameless window controls cleanly
    const left = div("flex items-center gap-2 pl-20 [-webkit-app-region:no-drag]");
    const OdeliIcon = document.createElement('img');
    OdeliIcon.src=new URL("../../assets/Odeli_Icon1.png", import.meta.url).href;
    OdeliIcon.alt = "Odeli Logo";
    OdeliIcon.className = "w-14 h-14 object-contain";

    left.append(
        // Icon("CodeXml", "w-5 h-5 text-orange-500"),
        OdeliIcon,
        // odeli_icon,
        heading(
            1,
            "Odeli",
            "text-sm font-semibold tracking-wide text-zinc-100"
        )
    );

    /* ---------------- Center ---------------- */

    const center = div("flex-1 flex justify-center px-6");

// Command bar container
    const commandBar = div(
        "w-[480px] h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/60 \
         flex items-center gap-2 px-3 hover:border-zinc-600 relative \
         transition-colors cursor-pointer [-webkit-app-region:no-drag]"
    );

    // Added `flex-1 min-w-0` so the input expands to fill all remaining space after the search icon
    const searchInput = input(
    "text", // 1st arg: type
    "flex-1 min-w-0 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none h-full border-none" // 2nd arg: classes
)     ;
    searchInput.placeholder = "Search files, commands or symbols";

    commandBar.append(
        Icon("Search", "w-4 h-4 text-zinc-500 shrink-0"),
        searchInput
    );

    center.append(commandBar);

    /* ---------------- Right ---------------- */

    const right = div("flex items-center gap-2 [-webkit-app-region:no-drag]");

    const git = div("flex items-center gap-1.5 text-xs text-zinc-400 px-2 py-1 rounded hover:bg-zinc-800 cursor-pointer transition-colors");
    git.append(Icon("GitBranch", "w-3.5 h-3.5"));

    const branch = document.createElement("span");
    branch.textContent = "main";
    git.append(branch);

    const notifications = div("p-1.5 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors text-zinc-400 hover:text-zinc-200");
    notifications.append(Icon("Bell", "w-4 h-4"));

    const settings = div("p-1.5 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors text-zinc-400 hover:text-zinc-200");
    settings.append(Icon("Settings", "w-4 h-4"));

    /* ---------------- Window Controls ---------------- */

    const windowControls = div("flex items-center ml-2 border-l border-zinc-800 h-full");

    const minimizeBtn = div("h-11 w-11 flex items-center justify-center hover:bg-zinc-800 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors");
    minimizeBtn.append(Icon("Minus", "w-3.5 h-3.5"));

    const maximizeBtn = div("h-11 w-11 flex items-center justify-center hover:bg-zinc-800 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors");
    maximizeBtn.append(Icon("Square", "w-3 h-3"));

    const closeBtn = div("h-11 w-11 flex items-center justify-center hover:bg-red-600 cursor-pointer text-zinc-400 hover:text-white transition-colors");
    closeBtn.append(Icon("X", "w-4 h-4"));

    windowControls.append(minimizeBtn, maximizeBtn, closeBtn);

    right.append(
        git,
        notifications,
        settings,
        windowControls
    );

    bar.append(left, center, right);

    return bar;
}