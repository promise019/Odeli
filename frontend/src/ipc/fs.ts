export interface FileItem {
    name: string;
    path: string;
    is_dir: boolean;
    size: number;
    is_symlink: boolean;
}

interface IpcResponse<T> {
    id: string;
    error?: string;
    data?: T;
}

const pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: Error) => void }>();

// Registered callback invoked by Rust evaluate_script
window.__ODELI_IPC_RESPONSE__ = (response: IpcResponse<any>) => {
    const pending = pendingRequests.get(response.id);
    if (!pending) return;

    if (response.error) {
        pending.reject(new Error(response.error));
    } else {
        pending.resolve(response.data);
    }
    pendingRequests.delete(response.id);
};

function sendIpc<T>(payload: Record<string, any>): Promise<T> {
    return new Promise((resolve, reject) => {
        if (!window.ipc?.postMessage) {
            return reject(new Error("Native IPC bridge unavailable (running outside Wry environment)"));
        }
        const id = Math.random().toString(36).substring(2, 9);
        pendingRequests.set(id, { resolve, reject });

        const message = JSON.stringify({ ...payload, id });
        window.ipc.postMessage(message);
    });
}

export const nativeFs = {
    readDir: (path: string) => sendIpc<FileItem[]>({ cmd: "readDir", path }),
    readFile: (path: string) => sendIpc<string>({ cmd: "readFile", path }),
    writeFile: (path: string, content: string) => sendIpc<boolean>({ cmd: "writeFile", path, content }),
    createDir: (path: string) => sendIpc<boolean>({ cmd: "createDir", path }),
    deleteNode: (path: string) => sendIpc<boolean>({ cmd: "deleteNode", path }),
};

