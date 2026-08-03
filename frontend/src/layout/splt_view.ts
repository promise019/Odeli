import { div } from "../utils/dom.js";

export interface SplitViewOptions {
    direction?: "horizontal" | "vertical";
    initialSize?: number;
    minSize?: number;
    maxSize?: number;
}

export function createSplitView(
    firstPaneContent: HTMLElement,
    secondPaneContent: HTMLElement,
    options: SplitViewOptions = {}
): HTMLElement {
    const {
        direction = "horizontal",
        initialSize = 260,
        minSize = 100,
        maxSize = 800,
    } = options;

    const isHorizontal = direction === "horizontal";

    // Main layout container MUST be flex with overflow-hidden and full height/width
    const container = div(
        `relative flex w-full h-full overflow-hidden select-none ${
            isHorizontal ? "flex-row" : "flex-col"
        }`
    );

    // Ensure children expand to fill pane bounds
    firstPaneContent.classList.add("w-full", "h-full");
    secondPaneContent.classList.add("w-full", "h-full");

    // Primary Pane: Strict flex-grow/shrink lock so flexBasis dictates exact size
    const firstPane = div("overflow-hidden shrink-0 grow-0 relative flex flex-col");
    firstPane.appendChild(firstPaneContent);
    firstPane.style.flexBasis = `${initialSize}px`;

    // Interactive Resizer / Gutter
    const resizer = div(
        `group z-10 flex items-center justify-center shrink-0 grow-0 bg-zinc-800/60 hover:bg-orange-500/80 active:bg-orange-500 transition-colors touch-none ${
            isHorizontal
                ? "w-1 cursor-col-resize h-full"
                : "h-1 cursor-row-resize w-full"
        }`
    );

    const handleIndicator = div(
        `bg-zinc-600 group-hover:bg-zinc-200 transition-colors rounded-full ${
            isHorizontal ? "w-0.5 h-6" : "h-0.5 w-6"
        }`
    );
    resizer.appendChild(handleIndicator);

    // Secondary Pane: Takes up remaining space
    const secondPane = div("flex-1 overflow-hidden min-w-0 min-h-0 relative flex flex-col");
    secondPane.appendChild(secondPaneContent);

    /* ---------------- Drag & Resize Logic ---------------- */

    let isDragging = false;

    const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        e.preventDefault();
        resizer.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();

        const containerRect = container.getBoundingClientRect();
        let newSize: number;

        if (isHorizontal) {
            newSize = e.clientX - containerRect.left;
        } else {
            newSize = e.clientY - containerRect.top;
        }

        // Clamp size within min/max bounds
        const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));

        // Update flexBasis directly
        firstPane.style.flexBasis = `${clampedSize}px`;
    };

    const onPointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        resizer.releasePointerCapture(e.pointerId);
    };

    resizer.addEventListener("pointerdown", onPointerDown);
    resizer.addEventListener("pointermove", onPointerMove);
    resizer.addEventListener("pointerup", onPointerUp);

    container.append(firstPane, resizer, secondPane);

    return container;
}