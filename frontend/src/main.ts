import { createShell } from "./layout/shell.js";
import { FileExplorer } from "./views/explorer.js";
import { tabStore } from "./state/tab_state.js";

async function bootstrap_app() {
    const app = document.getElementById("app");
    if (!app) throw new Error("Root Element Not found");

    app.className = "bg-black";
    app.append(createShell());

    const sidebarEl = app.querySelector(".sidebar") || app.querySelector("#sidebar");

    if (sidebarEl) {
        const explorer = new FileExplorer(
            sidebarEl as HTMLElement,
            ".",
            (filePath: string) => {
                const title = filePath.split("/").pop() || filePath;
                
                // Open file in your existing tabStore
                tabStore.openTab({
                    id: filePath,
                    title: title,
                    path: filePath,
                    icon: "file",
                });
            }
        );

        await explorer.render();
    }
}

bootstrap_app();