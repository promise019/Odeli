import { div, heading, input } from "../utils/dom.js";
import { Icon } from "../utils/icons.js";
import { sendWindowCommand } from "../features/window/window_service.js";

export function createTitleBar(): HTMLElement {
    const bar = div(
        "h-11 shrink-0 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 select-none overflow-hidden [-webkit-app-region:drag]"
    );

    // Native window drag region for Wry frameless window
    bar.setAttribute("data-wry-window-drag", "true");

    // Double-click empty title bar space to toggle maximize
    bar.addEventListener("dblclick", (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest("[-webkit-app-region:no-drag]") || target === bar) {
            sendWindowCommand("maximize");
        }
    });

    /* ---------------- Left (Branding) ---------------- */

    const left = div("flex items-center gap-2 pl-3 shrink-0 [-webkit-app-region:no-drag]");
    const OdeliIcon = document.createElement("img");
    OdeliIcon.src = new URL("../../assets/Odeli_Icon1.png", import.meta.url).href;
    OdeliIcon.alt = "Odeli Logo";
    OdeliIcon.className = "w-6 h-6 object-contain shrink-0"; // Sized to fit 44px bar height nicely

    left.append(
        OdeliIcon,
        heading(
            1,
            "Odeli",
            "text-sm font-semibold tracking-wide text-zinc-100 whitespace-nowrap"
        )
    );

    /* ---------------- Center (Search / Command Bar) ---------------- */

    // `min-w-0` allows the center section to contract smoothly when resizing
    const center = div("flex-1 flex justify-center px-4 min-w-0");

    // Responsive width: expands up to 480px, but shrinks down when window is small
    const commandBar = div(
        "w-full max-w-[480px] min-w-[120px] h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/60 \
         flex items-center gap-2 px-3 hover:border-zinc-600 relative \
         transition-colors cursor-pointer [-webkit-app-region:no-drag]"
    );

    const searchInput = input(
        "text",
        "flex-1 min-w-0 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none h-full border-none truncate"
    );
    searchInput.placeholder = "Search files, commands or symbols";

    commandBar.append(
        Icon("Search", "w-4 h-4 text-zinc-500 shrink-0"),
        searchInput
    );

    center.append(commandBar);

    /* ---------------- Right (Actions & Window Controls) ---------------- */

    // `shrink-0` prevents window controls from being squeezed off screen
    const right = div("flex items-center gap-1.5 shrink-0 [-webkit-app-region:no-drag]");

    const git = div(
        "hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 px-2 py-1 rounded hover:bg-zinc-800 cursor-pointer transition-colors shrink-0"
    );
    git.append(Icon("GitBranch", "w-3.5 h-3.5"));

    const branch = document.createElement("span");
    branch.textContent = "main";
    git.append(branch);

    const notifications = div(
        "hidden md:flex p-1.5 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors text-zinc-400 hover:text-zinc-200 shrink-0"
    );
    notifications.append(Icon("Bell", "w-4 h-4"));

    const settings = div(
        "hidden md:flex p-1.5 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors text-zinc-400 hover:text-zinc-200 shrink-0"
    );
    settings.append(Icon("Settings", "w-4 h-4"));

    /* ---------------- Window Controls ---------------- */

    // `shrink-0` ensures buttons remain pinned to top-right corner at any window size
    const windowControls = div("flex items-center ml-1 border-l border-zinc-800 h-11 shrink-0");

    const minimizeBtn = div(
        "h-11 w-11 flex items-center justify-center hover:bg-zinc-800 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors shrink-0"
    );
    minimizeBtn.append(Icon("Minus", "w-3.5 h-3.5"));
    minimizeBtn.title = "Minimize";
    minimizeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sendWindowCommand("minimize");
    });

    const maximizeBtn = div(
        "h-11 w-11 flex items-center justify-center hover:bg-zinc-800 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors shrink-0"
    );
    maximizeBtn.append(Icon("Square", "w-3 h-3"));
    maximizeBtn.title = "Maximize / Restore";
    maximizeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sendWindowCommand("maximize");
    });

    const closeBtn = div(
        "h-11 w-11 flex items-center justify-center hover:bg-red-600 cursor-pointer text-zinc-400 hover:text-white transition-colors shrink-0"
    );
    closeBtn.append(Icon("X", "w-4 h-4"));
    closeBtn.title = "Close";
    closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sendWindowCommand("close");
    });

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