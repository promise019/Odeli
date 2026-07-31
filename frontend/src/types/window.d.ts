export {};

export interface IpcResponse<T = any> {
    id: string;
    error?: string;
    data?: T;
}

declare global {
    interface Window {
        /** Provided by Wry for sending string messages to the Rust host */
        ipc: {
            postMessage(message: string): void;
        };
        /** Evaluated by Rust to deliver async IPC command results */
        __ODELI_IPC_RESPONSE__?: (response: IpcResponse) => void;
    }
}