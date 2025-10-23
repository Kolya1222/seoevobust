export default class FloatingButton {
    constructor() {
        this.button = null;
        this.eventHandlers = {};
    }

    async create() {
        // Убедимся, что кнопка не создается повторно
        if (document.getElementById('seo-floating-btn')) {
            this.button = document.getElementById('seo-floating-btn');
            return;
        }

        const floatingBtn = document.createElement('div');
        floatingBtn.id = 'seo-floating-btn';
        floatingBtn.innerHTML = 'SEO';
        floatingBtn.title = 'Нажмите для SEO анализа страницы';

        document.body.appendChild(floatingBtn);
        this.button = floatingBtn;
        
        this.bindEvents();
    }

    bindEvents() {
        if (!this.button) return;

        this.button.addEventListener('click', () => {
            this.emit('click');
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
        if (this.button) {
            this.button.style.display = 'block';
        }
    }

    hide() {
        if (this.button) {
            this.button.style.display = 'none';
        }
    }
}