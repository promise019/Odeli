// frontend/src/utils/logger.ts

const PREFIX = "[Odeli IDE]";

export const logger = {
    /**
     * Standard informational logging
     */
    info(message: string, ...args: unknown[]) {
        console.log(`%c${PREFIX} ℹ️ ${message}`, "color: #3b82f6; font-weight: bold;", ...args);
    },

    /**
     * Warning logging for non-fatal issues (e.g., missing tabs, ignored shortcuts)
     */
    warn(message: string, ...args: unknown[]) {
        console.warn(`%c${PREFIX} ⚠️ ${message}`, "color: #f59e0b; font-weight: bold;", ...args);
    },

    /**
     * Error logging for operation failures (e.g., failed IPC calls, missing DOM elements)
     */
    error(message: string, ...args: unknown[]) {
        console.error(`%c${PREFIX} ❌ ${message}`, "color: #ef4444; font-weight: bold;", ...args);
    },

    /**
     * Dedicated IPC request logger to track outgoing payload messages to Rust WRY
     */
    ipc(cmd: string, payload?: unknown) {
        console.groupCollapsed(`%c${PREFIX} 📡 IPC Outgoing: ${cmd}`, "color: #10b981; font-weight: bold;");
        if (payload !== undefined) {
            console.log("Payload:", payload);
        }
        console.trace("Callstack");
        console.groupEnd();
    },
};