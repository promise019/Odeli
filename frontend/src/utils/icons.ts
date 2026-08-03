import { createElement, icons } from "lucide";

export type IconName = keyof typeof icons;

export function Icon(
    name: IconName | string,
    classes = "w-4 h-4 text-zinc-400"
): HTMLElement {
    const wrapper = document.createElement("span");
    wrapper.className = "inline-flex items-center justify-center shrink-0";

    // Validate if the requested icon exists in Lucide; default to "FileText"
    const validKey = (name in icons) ? (name as IconName) : "FileText";

    wrapper.append(
        createElement(icons[validKey], {
            class: classes,
        })
    );

    return wrapper;
}