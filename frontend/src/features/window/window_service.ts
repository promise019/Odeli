// src/features/window/window_service.ts

export type WindowAction = "minimize" | "maximize" | "close";

export function sendWindowCommand(action: WindowAction): void {
    const payload = JSON.stringify({
        cmd: "window",
        action,
    });

    if (window.ipc?.postMessage) {
        window.ipc.postMessage(payload);
    } else {
        console.warn(`[Window Service] Cannot dispatch '${action}' - IPC bridge unavailable.`);
    }
}