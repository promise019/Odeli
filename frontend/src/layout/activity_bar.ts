import { div } from "../utils/dom.js";
import { Icon } from "../utils/icons.js";

export function createActivityBar(): HTMLElement {

    const bar = div(
        "w-14 border-r border-zinc-800 bg-zinc-900 flex flex-col items-center py-2 gap-2"
    );

    const icons = [
        "Folder",
        "Search",
        "GitBranch",
        "Play",
        "Blocks",
        "Sparkles"
    ] as const;

    icons.forEach(name => {

        const button = div(
            "w-10 h-10 rounded-md flex items-center justify-center hover:bg-zinc-800 cursor-pointer transition-colors"
        );

        button.append(
            Icon(name, "w-5 h-5 text-zinc-400")
        );

        bar.append(button);

    });

    return bar;
}