// src/utils/dom.ts

export function div(classes = ""): HTMLDivElement {
    const el = document.createElement("div");
    el.className = classes;
    return el;
}

export function span(classes = ""): HTMLSpanElement {
    const el = document.createElement("span");
    el.className = classes;
    return el;
}

export function paragraph(classes = ""): HTMLParagraphElement {
    const el = document.createElement("p");
    el.className = classes;
    return el;
}

export function heading(
    level: 1 | 2 | 3 | 4 | 5 | 6,
    text = "",
    classes = ""
): HTMLHeadingElement {
    const el = document.createElement(`h${level}`) as HTMLHeadingElement;

    el.textContent = text;
    el.className = classes;

    return el;
}

export function button(
    text = "",
    classes = ""
): HTMLButtonElement {
    const el = document.createElement("button");
    el.textContent = text;
    el.className = classes;
    return el;
}

export function input(
    type: HTMLInputElement["type"] = "text",
    classes = "",
    // placeholder ="",
    value=""
): HTMLInputElement {
    const el = document.createElement("input");
    el.type = type;
    el.className = classes;
    // el.placeholder=placeholder
    el.value = value
    return el;
}

export function textarea(classes = ""): HTMLTextAreaElement {
    const el = document.createElement("textarea");
    el.className = classes;
    return el;
}

export function select(classes = ""): HTMLSelectElement {
    const el = document.createElement("select");
    el.className = classes;
    return el;
}

export function option(
    text = "",
    value = ""
): HTMLOptionElement {
    const el = document.createElement("option");
    el.text = text;
    el.value = value;
    return el;
}

export function img(
    src = "",
    alt = "",
    classes = ""
): HTMLImageElement {
    const el = document.createElement("img");
    el.src = src;
    el.alt = alt;
    el.className = classes;
    return el;
}

export function icon(classes = ""): HTMLElement {
    const el = document.createElement("i");
    el.className = classes;
    return el;
}

export function label(classes = ""): HTMLLabelElement {
    const el = document.createElement("label");
    el.className = classes;
    return el;
}

export function form(classes = ""): HTMLFormElement {
    const el = document.createElement("form");
    el.className = classes;
    return el;
}

export function nav(classes = ""): HTMLElement {
    const el = document.createElement("nav");
    el.className = classes;
    return el;
}

export function section(classes = ""): HTMLElement {
    const el = document.createElement("section");
    el.className = classes;
    return el;
}

export function article(classes = ""): HTMLElement {
    const el = document.createElement("article");
    el.className = classes;
    return el;
}

export function aside(classes = ""): HTMLElement {
    const el = document.createElement("aside");
    el.className = classes;
    return el;
}

export function header(classes = ""): HTMLElement {
    const el = document.createElement("header");
    el.className = classes;
    return el;
}

export function footer(classes = ""): HTMLElement {
    const el = document.createElement("footer");
    el.className = classes;
    return el;
}

export function ul(classes = ""): HTMLUListElement {
    const el = document.createElement("ul");
    el.className = classes;
    return el;
}

export function li(classes = ""): HTMLLIElement {
    const el = document.createElement("li");
    el.className = classes;
    return el;
}

export function hr(classes = ""): HTMLHRElement {
    const el = document.createElement("hr");
    el.className = classes;
    return el;
}

export function canvas(classes = ""): HTMLCanvasElement {
    const el = document.createElement("canvas");
    el.className = classes;
    return el;
}