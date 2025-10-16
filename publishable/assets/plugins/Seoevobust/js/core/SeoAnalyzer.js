import AnalyzerEngine from './AnalyzerEngine.js';
import UIManager from '../ui/UIManager.js';
import HistoryManager from '../storage/HistoryManager.js';
import SettingsManager from '../storage/SettingsManager.js';

export default class ProfessionalSeoAnalyzer {
    constructor() {
        this.engine = new AnalyzerEngine();
        this.ui = new UIManager();
        this.history = new HistoryManager();
        this.settings = new SettingsManager();
        this.isAnalyzing = false;
        this.currentUrl = window.location.href;
        this.analysis = null;
    }

    async init() {
        await this.ui.init();
        this.bindEvents();
    }

    async analyzePage(url = this.currentUrl) {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.ui.showLoading();

        try {
            const analysis = await this.engine.analyze(url);
            this.analysis = analysis;
            this.history.save(analysis);
            await this.ui.displayResults(analysis);
        } catch (error) {
            console.error('❌ Analysis error:', error);
            this.ui.showError(`Ошибка анализа: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
        }
    }

    bindEvents() {
        this.ui.on('analyze', () => this.analyzePage());
        this.ui.on('toggle', () => this.toggle());
        this.ui.on('export', (format) => this.exportResults(format));
        this.ui.on('navigate', (section) => this.handleNavigation(section));
    }

    toggle() {
        if (this.ui.isVisible) {
            this.ui.hide();
        } else {
            if (!this.analysis && !this.isAnalyzing) {
                this.analyzePage(this.currentUrl);
            } else {
                this.ui.show();
            }
        }
    }

    handleNavigation(section) {
        this.ui.showSection(section);
    }

    exportResults(format) {
        if (!this.analysis) return;
        this.ui.exportResults(this.analysis, format);
    }
}