import FloatingButton from './components/FloatingButton.js';
import Overlay from './components/Overlay.js';
import ResultsRenderer from './renderers/ResultsRenderer.js';

export default class UIManager {
    constructor() {
        this.floatingButton = new FloatingButton();
        this.overlay = new Overlay();
        this.renderer = new ResultsRenderer();
        this.isVisible = false;
        this.eventHandlers = {};
    }

    async init() {
        await this.floatingButton.create();
        await this.overlay.create();
        this.bindEvents();
    }

    bindEvents() {
        this.floatingButton.on('click', () => this.emit('toggle'));
        this.overlay.on('close', () => this.hide());
        this.overlay.on('analyze', () => this.emit('analyze'));
        this.overlay.on('export', (format) => this.emit('export', format));
        this.overlay.on('navigate', (section) => this.emit('navigate', section));
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }

    show() {
        this.overlay.show();
        this.isVisible = true;
    }

    hide() {
        this.overlay.hide();
        this.isVisible = false;
    }

    showLoading() {
        this.overlay.showLoading();
        this.show();
    }

    showError(message) {
        this.overlay.showError(message);
    }

    async displayResults(analysis) {
        try {
            // Показываем индикатор загрузки для производительности
            this.overlay.showLoading('Анализ производительности...');
            
            // Асинхронно получаем HTML
            const html = await this.renderer.generateResultsHtml(analysis);
            
            // Отображаем результаты
            this.overlay.displayResults(html);
            this.show();
            
        } catch (error) {
            console.error('Error displaying results:', error);
            this.showError(`Ошибка при отображении результатов: ${error.message}`);
        }
    }

    showSection(section) {
        this.overlay.showSection(section);
    }

    async exportResults(analysis, format) {
        try {
            await this.renderer.exportResults(analysis, format);
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Ошибка при экспорте результатов');
        }
    }
}