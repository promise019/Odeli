import type { IconName } from "../utils/icons.js";

export interface Tab {
    id: string;
    title: string;
    path: string;
    isDirty?: boolean;
    icon?: IconName | string;
}

type TabListener = () => void;

class TabManager {
    private tabs: Tab[] = [];
    private activeId: string | null = null;
    private listeners: Set<TabListener> = new Set();

    getTabs(): Tab[] {
        return this.tabs;
    }

    getActiveId(): string | null {
        return this.activeId;
    }

    getActiveTab(): Tab | undefined {
        return this.tabs.find((t) => t.id === this.activeId);
    }

    openTab(tab: Tab) {
        const existing = this.tabs.find((t) => t.id === tab.id);
        if (!existing) {
            this.tabs.push(tab);
        }
        this.activeId = tab.id;
        this.notify();
    }

   closeTab(id: string) {
    const index = this.tabs.findIndex((t) => t.id === id);
    if (index === -1) return;

    this.tabs.splice(index, 1);

    if (this.activeId === id) {
        if (this.tabs.length > 0) {
            // Switch to adjacent tab if closed tab was active
            const newIndex = Math.max(0, index - 1);
            this.activeId = this.tabs[newIndex]?.id ?? null;
        } else {
            this.activeId = null;
        }
    }
    this.notify();
}

    setActiveTab(id: string) {
        if (this.activeId !== id && this.tabs.some((t) => t.id === id)) {
            this.activeId = id;
            this.notify();
        }
    }

    setDirty(id: string, isDirty: boolean) {
        const tab = this.tabs.find((t) => t.id === id);
        if (tab) {
            tab.isDirty = isDirty;
            this.notify();
        }
    }

    subscribe(listener: TabListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach((fn) => fn());
    }
}

export const tabStore = new TabManager();