export default class Overlay {
    constructor() {
        this.overlay = null;
        this.isVisible = false;
        this.eventHandlers = {};
    }

    async create() {
        // Убедимся, что оверлей не создается повторно
        if (document.getElementById('seo-analyzer-overlay')) {
            this.overlay = document.getElementById('seo-analyzer-overlay');
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'seo-analyzer-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = this.getOverlayHTML();
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
        
        this.bindEvents();
    }

    getOverlayHTML() {
        return `
            <div class="seo-analyzer-panel">
                <div class="seo-analyzer-header">
                    <h3>🔍 SEO Анализ страницы</h3>
                    <button class="seo-analyzer-close">&times;</button>
                </div>
                <div class="seo-analyzer-content">
                    <div class="seo-loading" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p>Анализируем страницу...</p>
                    </div>
                    <div class="seo-results" style="display: none;"></div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        if (!this.overlay) return;

        const closeBtn = this.overlay.querySelector('.seo-analyzer-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.emit('close');
            });
        }

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.emit('close');
            }
        });

        // Навигация по секциям
        this.overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-btn')) {
                this.emit('navigate', e.target.dataset.section);
            }
            if (e.target.classList.contains('export-btn')) {
                this.emit('export', e.target.dataset.format);
            }
            if (e.target.classList.contains('analyze-btn')) {
                this.emit('analyze');
            }
        });
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
        if (this.overlay) {
            this.overlay.style.display = 'flex';
            this.isVisible = true;
        }
    }

    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
            this.isVisible = false;
        }
    }

    showLoading() {
        if (!this.overlay) return;
        
        const resultsEl = this.overlay.querySelector('.seo-results');
        const loadingEl = this.overlay.querySelector('.seo-loading');
        
        if (resultsEl) resultsEl.style.display = 'none';
        if (loadingEl) loadingEl.style.display = 'block';
    }

    showError(message) {
        if (!this.overlay) return;
        
        const resultsEl = this.overlay.querySelector('.seo-results');
        const loadingEl = this.overlay.querySelector('.seo-loading');
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (resultsEl) {
            resultsEl.innerHTML = `<div class="seo-error">${message}</div>`;
            resultsEl.style.display = 'block';
        }
    }

    displayResults(html) {
        if (!this.overlay) return;
        
        const resultsEl = this.overlay.querySelector('.seo-results');
        const loadingEl = this.overlay.querySelector('.seo-loading');
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (resultsEl) {
            resultsEl.innerHTML = html;
            resultsEl.style.display = 'block';
        }
    }

    showSection(section) {
        if (!this.overlay) return;
        
        // Скрыть все секции
        this.overlay.querySelectorAll('.seo-section').forEach(sectionEl => {
            sectionEl.style.display = 'none';
        });
        
        // Убрать активный класс со всех кнопок
        this.overlay.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Показать выбранную секцию и активировать кнопку
        const sectionId = section + '-section';
        const sectionEl = this.overlay.querySelector(`#${sectionId}`);
        const button = this.overlay.querySelector(`[data-section="${section}"]`);
        
        if (sectionEl) {
            sectionEl.style.display = 'block';
        }
        if (button) {
            button.classList.add('active');
        }
    }

    showLoading(message = 'Анализ...') {
        if (this.resultsElement) {
            this.resultsElement.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>${message}</p>
                </div>
            `;
        }
    }

}