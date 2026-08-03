export type SidebarView = "explorer" | "search" | "git" | "settings";
export type PanelTab = "terminal" | "output" | "problems";

export interface AppState {
    workspacePath: string | null;
    workspaceName: string;
    activeSidebarView: SidebarView;
    isSidebarOpen: boolean;
    activePanelTab: PanelTab;
    isCommandPaletteOpen: boolean;
    isPanelOpen: boolean;
    statusMessage: string;
}

type AppStateListener = (state: AppState) => void;

class AppStore {
    private state: AppState = {
        workspacePath: "/projects/odeli",
        workspaceName: "odeli",
        activeSidebarView: "explorer",
        isSidebarOpen: true,
        activePanelTab: "terminal",
        isCommandPaletteOpen: false,
        isPanelOpen: false,
        statusMessage: "Ready",
    };

    private listeners: Set<AppStateListener> = new Set();

    getState(): Readonly<AppState> {
        return this.state;
    }

    toggleCommandPalette() {
        this.state.isCommandPaletteOpen = !this.state.isCommandPaletteOpen;
        this.notify();
    }

    openCommandPalette() {
        this.state.isCommandPaletteOpen = true;
        this.notify();
    }

    closeCommandPalette() {
        this.state.isCommandPaletteOpen = false;
        this.notify();
    }

    // Generic updater
    setState(partial: Partial<AppState>) {
        this.state = { ...this.state, ...partial };
        this.notify();
    }

    // Helper Actions
    setActiveSidebarView(view: SidebarView) {
        if (this.state.activeSidebarView === view && this.state.isSidebarOpen) {
            // Clicking active view toggles sidebar closed
            this.state.isSidebarOpen = false;
        } else {
            this.state.activeSidebarView = view;
            this.state.isSidebarOpen = true;
        }
        this.notify();
    }

    toggleSidebar() {
        this.state.isSidebarOpen = !this.state.isSidebarOpen;
        this.notify();
    }

    setActivePanelTab(tab: PanelTab) {
        this.state.activePanelTab = tab;
        this.state.isPanelOpen = true;
        this.notify();
    }

    togglePanel() {
        this.state.isPanelOpen = !this.state.isPanelOpen;
        this.notify();
    }

    setStatusMessage(msg: string) {
        this.state.statusMessage = msg;
        this.notify();
    }

    setWorkspace(path: string, name: string) {
        this.state.workspacePath = path;
        this.state.workspaceName = name;
        this.notify();
    }

    subscribe(listener: AppStateListener): () => void {
        this.listeners.add(listener);
        // Call immediately with current state on subscribe
        listener(this.state);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach((fn) => fn(this.state));
    }
}

export const appStore = new AppStore();