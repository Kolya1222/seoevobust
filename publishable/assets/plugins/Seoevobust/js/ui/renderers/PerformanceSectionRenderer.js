export default class PerformanceSectionRenderer {
    async render(performance) {
        // Ждем Core Web Vitals если они еще в процессе измерения
        const coreVitals = performance?.coreWebVitals || {};
        const navigation = performance || {};
        const resources = performance || {};
        const memory = performance?.memory || {};
        const optimizations = performance?.optimizations || {};

        return `
            <h4>🚀 Расширенный анализ производительности</h4>
            
            <!-- Основные метрики -->
            <div class="metrics-grid">
                ${this.renderMetricCard('Общий балл', performance.score + '%', performance.grade, performance.score >= 80)}
                ${this.renderMetricCard('Загрузка', Math.round(performance.loadTime || 0) + 'ms', 'Page Load', performance.loadTime < 3000)}
                ${this.renderMetricCard('Размер', Math.round((resources.totalSize || 0) / 1024 / 1024 * 10) / 10 + 'MB', 'Ресурсы', resources.totalSize < 2 * 1024 * 1024)}
                ${this.renderMetricCard('Запросы', resources.totalRequests || 0, 'HTTP запросы', resources.totalRequests < 50)}
                ${this.renderMetricCard('TTFB', navigation.ttfb + 'ms', 'Время до первого байта', navigation.ttfb < 600)}
                ${this.renderMetricCard('Память', memory.usedJSHeapSize + 'MB', 'Использование', memory.usagePercentage < 80)}
            </div>
            
            <!-- Детальные секции -->
            <div class="performance-sections">
                ${this.renderNavigationTimingSection(navigation)}
                ${this.renderCoreWebVitalsSection(coreVitals)}
                ${this.renderResourceAnalysisSection(resources)}
                ${this.renderOptimizationsSection(optimizations)}
                ${this.renderPerformanceRecommendations(performance)}
            </div>
        `;
    }

    renderMetricCard(label, value, details, isGood) {
        const className = isGood ? 'good' : 'warning';
        return `
            <div class="metric-card ${className}">
                <div class="metric-value">${value}</div>
                <div class="metric-label">${label}</div>
                <div class="metric-details">${details}</div>
            </div>
        `;
    }

    renderNavigationTimingSection(navigation) {
        return `
            <div class="section-card">
                <h5>⏱️ Временные метрики навигации</h5>
                <div class="timing-metrics">
                    <div class="timing-item">
                        <span class="timing-label">Полная загрузка:</span>
                        <span class="timing-value ${navigation.loadTime < 3000 ? 'good' : 'warning'}">
                            ${navigation.loadTime || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">DNS lookup:</span>
                        <span class="timing-value ${navigation.dnsTime < 100 ? 'good' : 'warning'}">
                            ${navigation.dnsTime || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">TCP соединение:</span>
                        <span class="timing-value ${navigation.tcpTime < 200 ? 'good' : 'warning'}">
                            ${navigation.tcpTime || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">TTFB:</span>
                        <span class="timing-value ${navigation.ttfb < 600 ? 'good' : 'warning'}">
                            ${navigation.ttfb || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">DOM Interactive:</span>
                        <span class="timing-value ${navigation.domInteractive < 3000 ? 'good' : 'warning'}">
                            ${navigation.domInteractive || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">DOM Content Loaded:</span>
                        <span class="timing-value ${navigation.domContentLoaded < 3000 ? 'good' : 'warning'}">
                            ${navigation.domContentLoaded || 0}ms
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCoreWebVitalsSection(coreVitals) {
        return `
            <div class="section-card">
                <h5>📊 Core Web Vitals</h5>
                <div class="vitals-grid">
                    ${this.renderVitalCard('LCP', coreVitals.lcp, 'largest-contentful-paint')}
                    ${this.renderVitalCard('FID', coreVitals.fid, 'first-input-delay')}
                    ${this.renderVitalCard('CLS', coreVitals.cls, 'cumulative-layout-shift')}
                    ${this.renderVitalCard('INP', coreVitals.inp, 'interaction-to-next-paint')}
                    ${this.renderVitalCard('TBT', coreVitals.tbt, 'total-blocking-time')}
                </div>
                ${coreVitals.lcp?.element ? `
                    <div class="vital-details">
                        <strong>LCP элемент:</strong> ${coreVitals.lcp.element}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderVitalCard(name, vital, type) {
        if (!vital) return '';

        const value = this.formatVitalValue(type, vital.value);
        const rating = vital.rating || 'unknown';
        const ratingText = this.getRatingText(rating);

        return `
            <div class="vital-card ${rating}">
                <div class="vital-name">${name}</div>
                <div class="vital-value">${value}</div>
                <div class="vital-rating">${ratingText}</div>
                <div class="vital-bar">
                    <div class="vital-progress ${rating}" style="width: ${this.getVitalProgress(rating)}%"></div>
                </div>
            </div>
        `;
    }

    renderResourceAnalysisSection(resources) {
        const resourceTypes = resources.resourceTypes || {};
        
        return `
            <div class="section-card">
                <h5>📦 Анализ ресурсов</h5>
                <div class="resource-stats">
                    <div class="resource-total">
                        <span>Всего ресурсов:</span>
                        <strong>${resources.totalRequests || 0}</strong>
                    </div>
                    <div class="resource-total">
                        <span>Общий размер:</span>
                        <strong>${Math.round((resources.totalSize || 0) / 1024 / 1024 * 100) / 100} MB</strong>
                    </div>
                </div>
                
                ${resources.largestResource ? `
                    <div class="largest-resource">
                        <strong>Самый большой ресурс:</strong>
                        <span class="resource-name">${this.truncateText(resources.largestResource.name, 40)}</span>
                        <span class="resource-size">${Math.round(resources.largestResource.size / 1024)} KB</span>
                    </div>
                ` : ''}
                
                <div class="resource-types">
                    <h6>Распределение по типам:</h6>
                    ${Object.entries(resourceTypes).map(([type, data]) => `
                        <div class="resource-type-item">
                            <span class="type-name">${type.toUpperCase()}</span>
                            <span class="type-count">${data.count}</span>
                            <span class="type-size">${Math.round(data.totalSize / 1024)} KB</span>
                            <span class="type-time">${data.averageTime}ms</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderOptimizationsSection(optimizations) {
        const images = optimizations.images || {};
        const scripts = optimizations.scripts || {};
        
        const lazyPercentage = images.total > 0 ? Math.round((images.lazy / images.total) * 100) : 0;
        const asyncPercentage = scripts.external > 0 ? Math.round(((scripts.async + scripts.defer) / scripts.external) * 100) : 0;
        
        return `
            <div class="section-card">
                <h5>⚡ Оптимизации</h5>
                <div class="optimization-metrics">
                    <div class="optimization-item ${lazyPercentage >= 50 ? 'good' : 'warning'}">
                        <span class="opt-label">Lazy Loading изображений:</span>
                        <span class="opt-value">${lazyPercentage}%</span>
                        <span class="opt-details">${images.lazy}/${images.total}</span>
                    </div>
                    
                    <div class="optimization-item ${asyncPercentage >= 50 ? 'good' : 'warning'}">
                        <span class="opt-label">Async/Defer скрипты:</span>
                        <span class="opt-value">${asyncPercentage}%</span>
                        <span class="opt-details">${scripts.async + scripts.defer}/${scripts.external}</span>
                    </div>
                    
                    <div class="optimization-item ${images.withDimensions >= images.total * 0.8 ? 'good' : 'warning'}">
                        <span class="opt-label">Изображения с размерами:</span>
                        <span class="opt-value">${Math.round((images.withDimensions / images.total) * 100)}%</span>
                        <span class="opt-details">${images.withDimensions}/${images.total}</span>
                    </div>
                    
                    <div class="optimization-item ${images.modernFormats > 0 ? 'good' : 'info'}">
                        <span class="opt-label">Современные форматы:</span>
                        <span class="opt-value">${images.modernFormats}</span>
                        <span class="opt-details">WebP/AVIF</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderPerformanceRecommendations(performance) {
        const recommendations = performance.recommendations || [];
        
        if (recommendations.length === 0) {
            recommendations.push('Производительность в норме, продолжайте мониторинг');
        }

        return `
            <div class="section-card">
                <h5>💡 Рекомендации по производительности</h5>
                <div class="performance-recommendations">
                    ${recommendations.map(rec => `
                        <div class="performance-recommendation">• ${rec}</div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Вспомогательные методы
    formatVitalValue(type, value) {
        if (!value) return 'N/A';
        
        switch (type) {
            case 'largest-contentful-paint':
                return `${value}ms`;
            case 'first-input-delay':
                return `${value}ms`;
            case 'cumulative-layout-shift':
                return value.toFixed(3);
            case 'interaction-to-next-paint':
                return `${value}ms`;
            case 'total-blocking-time':
                return `${value}ms`;
            default:
                return value;
        }
    }

    getRatingText(rating) {
        const texts = {
            'good': 'Хорошо',
            'needs-improvement': 'Нужно улучшить',
            'poor': 'Плохо',
            'unknown': 'Неизвестно'
        };
        return texts[rating] || rating;
    }

    getVitalProgress(rating) {
        const progress = {
            'good': 100,
            'needs-improvement': 60,
            'poor': 30,
            'unknown': 50
        };
        return progress[rating] || 50;
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}