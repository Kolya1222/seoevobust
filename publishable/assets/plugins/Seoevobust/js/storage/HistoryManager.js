export default class HistoryManager {
    constructor() {
        this.history = this.loadHistory();
    }

    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('seoAnalyzerHistory')) || [];
        } catch {
            return [];
        }
    }

    save(analysis) {
        this.history.unshift(analysis);
        if (this.history.length > 50) {
            this.history.pop();
        }
        localStorage.setItem('seoAnalyzerHistory', JSON.stringify(this.history));
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('seoAnalyzerHistory');
    }
}