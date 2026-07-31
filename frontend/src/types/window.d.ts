// src/types/window.d.ts

interface IpcResponsePayload {
    id: string;
    data?: any;
    error?: string;
}

declare global {
    interface Window {
        ipc: {
            postMessage(message: string): void;
        };
        __ODELI_IPC_RESPONSE__?: (response: IpcResponsePayload) => void;
    }
}

export {}; // Keeps this file treated as a module