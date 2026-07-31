// src/features/editor/search_engine.ts

import { TextBuffer } from "./text_buffer.js";
import { type Position } from "./selection.js";

export interface SearchMatch {
    line: number;
    startColumn: number;
    endColumn: number;
    matchedText: string;
}

export interface SearchOptions {
    matchCase: boolean;
    useRegex: boolean;
    wholeWord: boolean;
}

export class SearchEngine {
    private matches: SearchMatch[] = [];
    private activeIndex: number = -1;

    /**
     * Executes a search query across the entire text buffer
     */
    public find(buffer: TextBuffer, query: string, options: SearchOptions): SearchMatch[] {
        this.matches = [];
        this.activeIndex = -1;

        if (!query) return this.matches;

        const lines = buffer.getLines();
        let regex: RegExp;

        try {
            if (options.useRegex) {
                const flags = options.matchCase ? "g" : "gi";
                regex = new RegExp(query, flags);
            } else {
                const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const pattern = options.wholeWord ? `\\b${escaped}\\b` : escaped;
                const flags = options.matchCase ? "g" : "gi";
                regex = new RegExp(pattern, flags);
            }
        } catch {
            // Invalid regex pattern, return empty match list safely
            return [];
        }

        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
            const lineText = lines[lineIdx] ?? "";
            let match: RegExpExecArray | null;

            // Reset stateful regex index per line
            regex.lastIndex = 0;

            while ((match = regex.exec(lineText)) !== null) {
                // Prevent infinite loop on zero-width matches
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                this.matches.push({
                    line: lineIdx,
                    startColumn: match.index,
                    endColumn: match.index + match[0].length,
                    matchedText: match[0],
                });
            }
        }

        if (this.matches.length > 0) {
            this.activeIndex = 0;
        }

        return this.matches;
    }

    public getMatches(): SearchMatch[] {
        return this.matches;
    }

    public getActiveIndex(): number {
        return this.activeIndex;
    }

    public getActiveMatch(): SearchMatch | null {
        if (this.activeIndex < 0 || this.activeIndex >= this.matches.length) {
            return null;
        }
        return this.matches[this.activeIndex] ?? null;
    }

    public next(): SearchMatch | null {
        if (this.matches.length === 0) return null;
        this.activeIndex = (this.activeIndex + 1) % this.matches.length;
        return this.getActiveMatch();
    }

    public previous(): SearchMatch | null {
        if (this.matches.length === 0) return null;
        this.activeIndex = (this.activeIndex - 1 + this.matches.length) % this.matches.length;
        return this.getActiveMatch();
    }

    /**
     * Replace active match in buffer
     */
    public replaceActive(buffer: TextBuffer, replacement: string): Position | null {
        const match = this.getActiveMatch();
        if (!match) return null;

        const lineText = buffer.getLines()[match.line] ?? "";
        const updatedLine =
            lineText.substring(0, match.startColumn) +
            replacement +
            lineText.substring(match.endColumn);

        buffer.setLine(match.line, updatedLine);

        return { line: match.line, column: match.startColumn + replacement.length };
    }

    /**
     * Replace all matches in buffer from bottom to top
     */
    public replaceAll(buffer: TextBuffer, replacement: string): number {
        if (this.matches.length === 0) return 0;

        const count = this.matches.length;

        // Process bottom-to-top to avoid invalidating column offsets above
        for (let i = this.matches.length - 1; i >= 0; i--) {
            const match = this.matches[i];
            if (!match) continue;

            const lineText = buffer.getLines()[match.line] ?? "";
            const updatedLine =
                lineText.substring(0, match.startColumn) +
                replacement +
                lineText.substring(match.endColumn);

            buffer.setLine(match.line, updatedLine);
        }

        this.matches = [];
        this.activeIndex = -1;
        return count;
    }
}