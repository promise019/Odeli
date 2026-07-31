// src/features/editor/search_widget.ts

import { div, input, button } from "../../utils/dom.js";
import { SearchEngine, type SearchOptions } from "./search_engine.js";
import { TextBuffer } from "./text_buffer.js";

export class SearchWidget {
    private element: HTMLElement;
    private findInput: HTMLInputElement;
    private replaceInput: HTMLInputElement;
    private matchCountLabel: HTMLElement;

    private matchCaseBtn: HTMLButtonElement;
    private wholeWordBtn: HTMLButtonElement;
    private regexBtn: HTMLButtonElement;

    private options: SearchOptions = {
        matchCase: false,
        wholeWord: false,
        useRegex: false,
    };

    private isOpen: boolean = false;

    constructor(
        private searchEngine: SearchEngine,
        private buffer: TextBuffer,
        private onRenderRequest: () => void
    ) {
        this.findInput = input("bg-zinc-800 text-xs text-zinc-100 px-2 py-1 rounded border border-zinc-700 outline-none w-48 placeholder-zinc-500");
        this.findInput.placeholder = "Find...";

        this.replaceInput = input("bg-zinc-800 text-xs text-zinc-100 px-2 py-1 rounded border border-zinc-700 outline-none w-48 placeholder-zinc-500");
        this.replaceInput.placeholder = "Replace...";

        this.matchCountLabel = div("text-xs text-zinc-400 min-w-[50px] text-center");
        this.matchCountLabel.textContent = "0/0";

        this.matchCaseBtn = button("Aa", "px-1.5 py-0.5 text-xs rounded border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-100");
        this.wholeWordBtn = button("W", "px-1.5 py-0.5 text-xs rounded border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-100");
        this.regexBtn = button(".*", "px-1.5 py-0.5 text-xs rounded border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-100");

        this.element = div(
            "absolute top-2 right-6 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-2 z-50 flex-col gap-2 hidden [-webkit-app-region:no-drag]"
        );

        this.setupLayout();
        this.setupEvents();
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public toggle(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.element.classList.remove("hidden");
            this.element.classList.add("flex");
            this.findInput.focus();
            this.findInput.select();
            this.executeFind();
        } else {
            this.element.classList.add("hidden");
            this.element.classList.remove("flex");
        }
    }

    private executeFind(): void {
        const query = this.findInput.value;
        const matches = this.searchEngine.find(this.buffer, query, this.options);
        this.updateCountDisplay(matches.length, this.searchEngine.getActiveIndex());
        this.onRenderRequest();
    }

    private updateCountDisplay(total: number, activeIdx: number): void {
        if (total === 0) {
            this.matchCountLabel.textContent = "No results";
        } else {
            this.matchCountLabel.textContent = `${activeIdx + 1}/${total}`;
        }
    }

    private setupLayout(): void {
        const findRow = div("flex items-center gap-1.5");
        findRow.append(
            this.findInput,
            this.matchCaseBtn,
            this.wholeWordBtn,
            this.regexBtn,
            this.matchCountLabel
        );

        const replaceRow = div("flex items-center gap-1.5");
        const replaceBtn = button("Replace", "text-xs bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-200");
        const replaceAllBtn = button("Replace All", "text-xs bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-200");

        replaceBtn.onclick = () => {
            this.searchEngine.replaceActive(this.buffer, this.replaceInput.value);
            this.executeFind();
        };

        replaceAllBtn.onclick = () => {
            this.searchEngine.replaceAll(this.buffer, this.replaceInput.value);
            this.executeFind();
        };

        replaceRow.append(this.replaceInput, replaceBtn, replaceAllBtn);

        this.element.append(findRow, replaceRow);
    }

    private setupEvents(): void {
        this.findInput.addEventListener("input", () => this.executeFind());

        this.findInput.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (e.shiftKey) {
                    this.searchEngine.previous();
                } else {
                    this.searchEngine.next();
                }
                this.updateCountDisplay(
                    this.searchEngine.getMatches().length,
                    this.searchEngine.getActiveIndex()
                );
                this.onRenderRequest();
            } else if (e.key === "Escape") {
                this.toggle();
            }
        });

        const toggleOption = (key: keyof SearchOptions, btn: HTMLButtonElement) => {
            this.options[key] = !this.options[key];
            btn.classList.toggle("text-sky-400", this.options[key]);
            btn.classList.toggle("border-sky-500", this.options[key]);
            this.executeFind();
        };

        this.matchCaseBtn.onclick = () => toggleOption("matchCase", this.matchCaseBtn);
        this.wholeWordBtn.onclick = () => toggleOption("wholeWord", this.wholeWordBtn);
        this.regexBtn.onclick = () => toggleOption("useRegex", this.regexBtn);
    }
}