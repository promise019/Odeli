// src/features/file_system/file_service.ts

interface IpcResponsePayload {
    id: string;
    data?: any;
    error?: string;
}

const pendingRequests = new Map<
    string,
    { resolve: (data: any) => void; reject: (err: Error) => void }
>();

// Register global response handler from Rust IPC
if (typeof window !== "undefined") {
    window.__ODELI_IPC_RESPONSE__ = (response: IpcResponsePayload) => {
        const handler = pendingRequests.get(response.id);
        if (!handler) return;

        if (response.error !== undefined) {
            handler.reject(new Error(response.error));
        } else {
            handler.resolve(response.data);
        }
        pendingRequests.delete(response.id);
    };
}

function sendFsCmd<T>(cmd: string, payload: Record<string, any>): Promise<T> {
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        pendingRequests.set(id, { resolve, reject });

        const requestBody = JSON.stringify({
            cmd,
            id,
            ...payload,
        });

        if (window.ipc?.postMessage) {
            window.ipc.postMessage(requestBody);
        } else {
            pendingRequests.delete(id);
            reject(
                new Error("Wry IPC bridge unavailable. Ensure running inside Odeli window.")
            );
        }
    });
}

// Exposed runtime service
export const fsService = {
    readFile(path: string): Promise<string> {
        return sendFsCmd<string>("readFile", { path });
    },

    writeFile(path: string, content: string): Promise<boolean> {
        return sendFsCmd<boolean>("writeFile", { path, content });
    },

    createDir(path: string): Promise<boolean> {
        return sendFsCmd<boolean>("createDir", { path });
    },

    deleteNode(path: string): Promise<boolean> {
        return sendFsCmd<boolean>("deleteNode", { path });
    },

    readDir(path: string): Promise<any[]> {
        return sendFsCmd<any[]>("readDir", { path });
    },
};