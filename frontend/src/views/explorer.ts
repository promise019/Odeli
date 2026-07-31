import { nativeFs, type FileItem } from "../ipc/fs";

export class FileExplorer {
    private container: HTMLElement;
    private rootPath: string;
    private onFileSelect?: ((path: string) => void) | undefined;

    constructor(
        container: HTMLElement,
        rootPath: string = ".",
        onFileSelect?: (path: string) => void
    ) {
        this.container = container;
        this.rootPath = rootPath;
        this.onFileSelect = onFileSelect;
    }

    public async render(): Promise<void> {
        this.container.innerHTML = `<div class="explorer-header">WORKSPACE</div><div class="explorer-tree"></div>`;
        const treeContainer = this.container.querySelector(".explorer-tree") as HTMLElement;

        if (treeContainer) {
            await this.loadDirectory(this.rootPath, treeContainer);
        }
    }

    private async loadDirectory(path: string, parentElement: HTMLElement): Promise<void> {
        try {
            const items: FileItem[] = await nativeFs.readDir(path);
            const ul = document.createElement("ul");
            ul.className = "tree-node";

            for (const item of items) {
                const li = document.createElement("li");
                li.className = item.is_dir ? "item-directory" : "item-file";

                const label = document.createElement("div");
                label.className = "item-label";
                label.innerHTML = `
                    <span class="icon">${item.is_dir ? "📁" : "📄"}</span>
                    <span class="name">${item.name}</span>
                `;

                li.appendChild(label);

                if (item.is_dir) {
                    let expanded = false;
                    let childContainer: HTMLDivElement | null = null;

                    label.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        expanded = !expanded;
                        li.classList.toggle("expanded", expanded);

                        if (expanded) {
                            if (!childContainer) {
                                childContainer = document.createElement("div");
                                childContainer.className = "nested-tree";
                                li.appendChild(childContainer);
                                await this.loadDirectory(item.path, childContainer);
                            }
                            childContainer.style.display = "block";
                        } else if (childContainer) {
                            childContainer.style.display = "none";
                        }
                    });
                } else {
                    label.addEventListener("click", () => {
                        if (this.onFileSelect) {
                            this.onFileSelect(item.path);
                        }
                    });
                }

                ul.appendChild(li);
            }

            parentElement.appendChild(ul);
        } catch (err) {
            console.error(`Failed to load directory ${path}:`, err);
            parentElement.innerHTML = `<div class="tree-error">Error loading folder</div>`;
        }
    }
}