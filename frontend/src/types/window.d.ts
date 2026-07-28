export {};

declare global {
    interface Window {
        ipc: {
            postMessage(message: string): void;
        };
    }
}