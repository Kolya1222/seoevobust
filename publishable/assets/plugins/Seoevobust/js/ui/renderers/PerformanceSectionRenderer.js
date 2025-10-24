export default class PerformanceSectionRenderer {
    async render(performance) {
        const safePerformance = performance || {};
        const navigation = safePerformance;
        const resources = safePerformance;  
        const memory = safePerformance.memory || {};
        const optimizations = safePerformance.optimizations || {};

        return `
            <h4>Расширенный анализ производительности</h4>
            
            <!-- Основные метрики -->
            <div class="metrics-grid">
                ${this.renderMetricCard('Общий балл', (safePerformance.score || 0) + '%', safePerformance.grade || 'N/A', (safePerformance.score || 0) >= 80)}
                ${this.renderMetricCard('Загрузка', Math.round(safePerformance.loadTime || 0) + 'ms', 'Page Load', (safePerformance.loadTime || 0) < 3000)}
                ${this.renderMetricCard('Размер', Math.round((safePerformance.totalSize || 0) / 1024 / 1024 * 10) / 10 + 'MB', 'Ресурсы', (safePerformance.totalSize || 0) < 2 * 1024 * 1024)}
                ${this.renderMetricCard('Запросы', safePerformance.totalRequests || 0, 'HTTP запросы', (safePerformance.totalRequests || 0) < 50)}
                ${this.renderMetricCard('TTFB', (safePerformance.ttfb || 0) + 'ms', 'Время до первого байта', (safePerformance.ttfb || 0) < 600)}
                ${this.renderMetricCard('Память', (memory.usedJSHeapSize || 0) + 'MB', 'Использование', (memory.usagePercentage || 0) < 80)}
            </div>
            
            <!-- Детальные секции -->
            <div class="performance-sections">
                ${this.renderNavigationTimingSection(navigation)}
                ${this.renderResourceAnalysisSection(resources)}
                ${this.renderOptimizationsSection(optimizations)}
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
        const safeNav = navigation || {};
        return `
            <div class="section-card">
                <h5>Временные метрики навигации</h5>
                <div class="timing-metrics">
                    <div class="timing-item">
                        <span class="timing-label">Полная загрузка:</span>
                        <span class="timing-value ${(safeNav.loadTime || 0) < 3000 ? 'good' : 'warning'}">
                            ${safeNav.loadTime || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">DNS lookup:</span>
                        <span class="timing-value ${(safeNav.dnsTime || 0) < 100 ? 'good' : 'warning'}">
                            ${safeNav.dnsTime || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">TCP соединение:</span>
                        <span class="timing-value ${(safeNav.tcpTime || 0) < 200 ? 'good' : 'warning'}">
                            ${safeNav.tcpTime || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">TTFB:</span>
                        <span class="timing-value ${(safeNav.ttfb || 0) < 600 ? 'good' : 'warning'}">
                            ${safeNav.ttfb || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">DOM Interactive:</span>
                        <span class="timing-value ${(safeNav.domInteractive || 0) < 3000 ? 'good' : 'warning'}">
                            ${safeNav.domInteractive || 0}ms
                        </span>
                    </div>
                    <div class="timing-item">
                        <span class="timing-label">DOM Content Loaded:</span>
                        <span class="timing-value ${(safeNav.domContentLoaded || 0) < 3000 ? 'good' : 'warning'}">
                            ${safeNav.domContentLoaded || 0}ms
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderResourceAnalysisSection(resources) {
        const safeResources = resources || {};
        const resourceTypes = safeResources.resourceTypes || {};
        const largestResource = safeResources.largestResource || {};
        
        return `
            <div class="section-card">
                <h5>Анализ ресурсов</h5>
                <div class="resource-stats">
                    <div class="resource-total">
                        <span>Всего ресурсов:</span>
                        <strong>${safeResources.totalRequests || 0}</strong>
                    </div>
                    <div class="resource-total">
                        <span>Общий размер:</span>
                        <strong>${Math.round((safeResources.totalSize || 0) / 1024 / 1024 * 100) / 100} MB</strong>
                    </div>
                </div>
                
                ${largestResource.name ? `
                    <div class="largest-resource">
                        <strong>Самый большой ресурс:</strong>
                        <span class="resource-name">${this.truncateText(largestResource.name, 40)}</span>
                        <span class="resource-size">${Math.round((largestResource.size || 0) / 1024)} KB</span>
                    </div>
                ` : ''}
                
                <div class="resource-types">
                    <h6>Распределение по типам:</h6>
                    ${Object.entries(resourceTypes).map(([type, data]) => {
                        const safeData = data || {};
                        return `
                            <div class="resource-type-item">
                                <span class="type-name">${type.toUpperCase()}</span>
                                <span class="type-count">${safeData.count || 0}</span>
                                <span class="type-size">${Math.round((safeData.totalSize || 0) / 1024)} KB</span>
                                <span class="type-time">${safeData.averageTime || 0}ms</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderOptimizationsSection(optimizations) {
        const safeOptimizations = optimizations || {};
        const images = safeOptimizations.images || {};
        const scripts = safeOptimizations.scripts || {};
        
        // Безопасные расчеты процентов
        const imagesTotal = images.total || 1;
        const lazyPercentage = Math.round(((images.lazy || 0) / imagesTotal) * 100);
        
        const scriptsExternal = scripts.external || 1;
        const asyncDeferCount = (scripts.async || 0) + (scripts.defer || 0);
        const asyncPercentage = Math.round((asyncDeferCount / scriptsExternal) * 100);
        
        const dimensionsPercentage = Math.round(((images.withDimensions || 0) / imagesTotal) * 100);
        
        return `
            <div class="section-card">
                <h5>Оптимизации</h5>
                <div class="optimization-metrics">
                    <div class="optimization-item ${lazyPercentage >= 50 ? 'good' : 'warning'}">
                        <span class="opt-label">Lazy Loading изображений:</span>
                        <span class="opt-value">${lazyPercentage}%</span>
                        <span class="opt-details">${images.lazy || 0}/${imagesTotal}</span>
                    </div>
                    
                    <div class="optimization-item ${asyncPercentage >= 50 ? 'good' : 'warning'}">
                        <span class="opt-label">Async/Defer скрипты:</span>
                        <span class="opt-value">${asyncPercentage}%</span>
                        <span class="opt-details">${asyncDeferCount}/${scriptsExternal}</span>
                    </div>
                    
                    <div class="optimization-item ${dimensionsPercentage >= 80 ? 'good' : 'warning'}">
                        <span class="opt-label">Изображения с размерами:</span>
                        <span class="opt-value">${dimensionsPercentage}%</span>
                        <span class="opt-details">${images.withDimensions || 0}/${imagesTotal}</span>
                    </div>
                    
                    <div class="optimization-item ${(images.modernFormats || 0) > 0 ? 'good' : 'info'}">
                        <span class="opt-label">Современные форматы:</span>
                        <span class="opt-value">${images.modernFormats || 0}</span>
                        <span class="opt-details">WebP/AVIF</span>
                    </div>
                </div>
            </div>
        `;
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}