import { createShell } from "./layout/shell.js";
import { FileExplorer } from "./views/explorer.js";
import { nativeFs } from "./ipc/fs.js";

async function bootstrap_app() {
    const app = document.getElementById("app");
    
    if (!app) {
        throw new Error("Root Element Not found");
    }
    app.className = "bg-black";
    
    const shell = createShell();
    app.append(shell);

    // Grab the sidebar element created by createShell()
    const sidebarEl = app.querySelector(".sidebar") || app.querySelector("#sidebar");

    if (sidebarEl) {
        const explorer = new FileExplorer(
            sidebarEl as HTMLElement,
            ".",
            async (filePath: string) => {
                console.log("File selected from explorer:", filePath);
                // 1. Read file content via native IPC bridge
                const content = await nativeFs.readFile(filePath);
                
                // 2. Dispatch a custom event or call your tab/editor state manager
                window.dispatchEvent(
                    new CustomEvent("tab:open", {
                        detail: { path: filePath, content }
                    })
                );
            }
        );

        await explorer.render();
    }
}

bootstrap_app();