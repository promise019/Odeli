import { createElement, icons } from "lucide";

export function Icon(
    name: keyof typeof icons,
    classes = "w-4 h-4 text-zinc-400"
): HTMLElement {
    const wrapper = document.createElement("span");

    wrapper.append(
        createElement(icons[name], {
            class: classes,
        })
    );

    return wrapper;
}