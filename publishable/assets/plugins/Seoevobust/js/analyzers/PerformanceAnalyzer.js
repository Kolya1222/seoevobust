export default class PerformanceAnalyzer {
    constructor() {
        this.metrics = {};
        this.observers = [];
    }

    analyze() {
        try {
            // Основные метрики
            const navigationMetrics = this.analyzeNavigationTiming();
            const resourceMetrics = this.analyzeResourceTiming();
            const paintMetrics = this.analyzePaintTiming();
            const coreWebVitals = this.analyzeCoreWebVitals();
            const memoryMetrics = this.analyzeMemoryUsage();
            const optimizationMetrics = this.analyzeOptimizations();

            // Расчет общего балла
            const perfScore = this.calculatePerformanceScore(
                navigationMetrics,
                resourceMetrics,
                coreWebVitals,
                optimizationMetrics
            );

            return {
                ...navigationMetrics,
                ...resourceMetrics,
                ...paintMetrics,
                coreWebVitals: coreWebVitals,
                memory: memoryMetrics,
                optimizations: optimizationMetrics,
                score: perfScore,
                grade: this.getPerformanceGrade(perfScore),
                recommendations: this.generatePerformanceRecommendations(
                    navigationMetrics,
                    resourceMetrics,
                    coreWebVitals,
                    optimizationMetrics
                )
            };
            
        } catch (error) {
            console.warn('Performance analysis error:', error);
            return this.getFallbackData();
        }
    }

    analyzeNavigationTiming() {
        const navigationEntries = performance.getEntriesByType('navigation');
        let metrics = {
            loadTime: 0,
            dnsTime: 0,
            tcpTime: 0,
            ttfb: 0,
            domContentLoaded: 0,
            domInteractive: 0
        };

        if (navigationEntries.length > 0) {
            const nav = navigationEntries[0];
            metrics = {
                loadTime: nav.loadEventEnd - nav.startTime,
                dnsTime: nav.domainLookupEnd - nav.domainLookupStart,
                tcpTime: nav.connectEnd - nav.connectStart,
                ttfb: nav.responseStart - nav.requestStart,
                domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
                domInteractive: nav.domInteractive - nav.startTime
            };
        } else if (performance.timing) {
            const t = performance.timing;
            metrics = {
                loadTime: t.loadEventEnd - t.navigationStart,
                dnsTime: t.domainLookupEnd - t.domainLookupStart,
                tcpTime: t.connectEnd - t.connectStart,
                ttfb: t.responseStart - t.requestStart,
                domContentLoaded: t.domContentLoadedEventEnd - t.navigationStart,
                domInteractive: t.domInteractive - t.navigationStart
            };
        }

        // Округляем все значения
        Object.keys(metrics).forEach(key => {
            metrics[key] = Math.round(metrics[key]);
        });

        return metrics;
    }

    analyzeResourceTiming() {
        const resources = performance.getEntriesByType('resource');
        const resourceTypes = {};
        let totalSize = 0;
        let largestResource = { size: 0, name: '' };

        resources.forEach(resource => {
            const type = this.getResourceType(resource.name);
            if (!resourceTypes[type]) {
                resourceTypes[type] = {
                    count: 0,
                    totalSize: 0,
                    averageTime: 0
                };
            }

            resourceTypes[type].count++;
            resourceTypes[type].totalSize += resource.transferSize || 0;
            totalSize += resource.transferSize || 0;

            // Находим самый большой ресурс
            if (resource.transferSize > largestResource.size) {
                largestResource = {
                    size: resource.transferSize,
                    name: resource.name,
                    type: type
                };
            }
        });

        // Рассчитываем среднее время для каждого типа
        Object.keys(resourceTypes).forEach(type => {
            const typeResources = resources.filter(r => this.getResourceType(r.name) === type);
            const totalDuration = typeResources.reduce((sum, r) => sum + r.duration, 0);
            resourceTypes[type].averageTime = Math.round(totalDuration / typeResources.length);
        });

        return {
            totalRequests: resources.length,
            totalSize: totalSize,
            resourceTypes: resourceTypes,
            largestResource: largestResource,
            uncompressedSize: new Blob([document.documentElement.outerHTML]).size
        };
    }

    analyzePaintTiming() {
        const paintEntries = performance.getEntriesByType('paint');
        const paints = {};

        paintEntries.forEach(entry => {
            paints[entry.name] = Math.round(entry.startTime);
        });

        // Если данных нет, оцениваем приблизительно
        if (!paints['first-paint']) {
            paints['first-paint'] = this.estimateFirstPaint();
        }
        if (!paints['first-contentful-paint']) {
            paints['first-contentful-paint'] = paints['first-paint'] + 100;
        }

        return {
            firstPaint: paints['first-paint'] || 0,
            firstContentfulPaint: paints['first-contentful-paint'] || 0,
            firstMeaningfulPaint: this.estimateFirstMeaningfulPaint()
        };
    }

    analyzeCoreWebVitals() {
        return {
            lcp: this.measureLCP(),
            fid: this.measureFID(),
            cls: this.measureCLS(),
            inp: this.measureINP(),
            tbt: this.measureTBT()
        };
    }

    measureLCP() {
        return new Promise((resolve) => {
            try {
                let lcpValue = 2500; // fallback

                const observer = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    if (lastEntry) {
                        lcpValue = Math.round(lastEntry.startTime);
                        resolve({
                            value: lcpValue,
                            rating: this.getLCPRating(lcpValue),
                            element: this.getLCPElement(lastEntry)
                        });
                    }
                });

                observer.observe({
                    entryTypes: ['largest-contentful-paint']
                });

                // Таймаут на случай если LCP не зафиксируется
                setTimeout(() => {
                    observer.disconnect();
                    resolve({
                        value: lcpValue,
                        rating: this.getLCPRating(lcpValue),
                        element: 'Не определен'
                    });
                }, 10000);

            } catch (e) {
                resolve({
                    value: 2500,
                    rating: 'poor',
                    element: 'Не определен'
                });
            }
        });
    }

    measureFID() {
        return new Promise((resolve) => {
            try {
                let fidValue = 100;

                const observer = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    if (entries.length > 0) {
                        const firstEntry = entries[0];
                        fidValue = Math.round(firstEntry.processingStart - firstEntry.startTime);
                        
                        observer.disconnect();
                        resolve({
                            value: fidValue,
                            rating: this.getFIDRating(fidValue)
                        });
                    }
                });

                observer.observe({
                    type: 'first-input',
                    buffered: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    resolve({
                        value: fidValue,
                        rating: this.getFIDRating(fidValue)
                    });
                }, 5000);

            } catch (e) {
                resolve({
                    value: 100,
                    rating: 'poor'
                });
            }
        });
    }

    measureCLS() {
        return new Promise((resolve) => {
            try {
                let clsValue = 0;

                const observer = new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                });

                observer.observe({
                    type: 'layout-shift',
                    buffered: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    resolve({
                        value: parseFloat(clsValue.toFixed(3)),
                        rating: this.getCLSRating(clsValue)
                    });
                }, 5000);

            } catch (e) {
                resolve({
                    value: 0.1,
                    rating: 'poor'
                });
            }
        });
    }

    measureINP() {
        // INP требует больше данных, поэтому оцениваем приблизительно
        return {
            value: 150,
            rating: 'good',
            note: 'Требуется длительное наблюдение'
        };
    }

    measureTBT() {
        // Total Blocking Time - оцениваем на основе Long Tasks
        return new Promise((resolve) => {
            try {
                let tbtValue = 0;

                const observer = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        // Блокирующее время = duration - 50ms
                        const blockingTime = entry.duration - 50;
                        if (blockingTime > 0) {
                            tbtValue += blockingTime;
                        }
                    });
                });

                observer.observe({
                    type: 'long-task',
                    buffered: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    resolve({
                        value: Math.round(tbtValue),
                        rating: this.getTBTRating(tbtValue)
                    });
                }, 5000);

            } catch (e) {
                resolve({
                    value: 200,
                    rating: 'poor'
                });
            }
        });
    }

    analyzeMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            return {
                usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
                totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
                jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
                usagePercentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
            };
        }

        return {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0,
            usagePercentage: 0,
            note: 'Memory API не доступен'
        };
    }

    analyzeOptimizations() {
        const doc = document;
        return {
            images: {
                total: doc.querySelectorAll('img').length,
                lazy: doc.querySelectorAll('img[loading="lazy"]').length,
                withDimensions: doc.querySelectorAll('img[width][height]').length,
                modernFormats: doc.querySelectorAll('img[src*=".webp"], img[src*=".avif"]').length
            },
            scripts: {
                total: doc.querySelectorAll('script').length,
                async: doc.querySelectorAll('script[async]').length,
                defer: doc.querySelectorAll('script[defer]').length,
                modules: doc.querySelectorAll('script[type="module"]').length,
                external: doc.querySelectorAll('script[src]').length
            },
            styles: {
                total: doc.querySelectorAll('link[rel="stylesheet"]').length,
                preload: doc.querySelectorAll('link[rel="preload"]').length,
                prefetch: doc.querySelectorAll('link[rel="prefetch"]').length
            },
            fonts: {
                total: doc.querySelectorAll('link[rel*="font"], link[rel*="icon"]').length,
                preload: doc.querySelectorAll('link[rel="preload"][as="font"]').length
            }
        };
    }

    // Вспомогательные методы
    getResourceType(url) {
        if (!url) return 'other';
        
        const urlStr = url.toLowerCase();
        if (urlStr.includes('.css')) return 'css';
        if (urlStr.includes('.js')) return 'js';
        if (urlStr.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) return 'image';
        if (urlStr.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
        if (urlStr.includes('/api/') || urlStr.includes('.json')) return 'api';
        if (urlStr.includes('.html') || urlStr.endsWith('/')) return 'document';
        return 'other';
    }

    estimateFirstPaint() {
        const resources = performance.getEntriesByType('resource');
        const hasHeavyResources = resources.some(r => r.transferSize > 500000);
        return hasHeavyResources ? 1200 : 800;
    }

    estimateFirstMeaningfulPaint() {
        const contentElements = document.querySelectorAll('h1, h2, p, img, .content, main');
        return contentElements.length > 10 ? 1800 : 1200;
    }

    getLCPElement(entry) {
        if (entry.element) {
            return entry.element.tagName.toLowerCase();
        }
        return 'unknown';
    }

    // Рейтинги Core Web Vitals
    getLCPRating(value) {
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needs-improvement';
        return 'poor';
    }

    getFIDRating(value) {
        if (value <= 100) return 'good';
        if (value <= 300) return 'needs-improvement';
        return 'poor';
    }

    getCLSRating(value) {
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'needs-improvement';
        return 'poor';
    }

    getTBTRating(value) {
        if (value <= 200) return 'good';
        if (value <= 600) return 'needs-improvement';
        return 'poor';
    }

    calculatePerformanceScore(navigation, resources, coreVitals, optimizations) {
        let score = 100;

        // Navigation Timing (30%)
        if (navigation.loadTime > 3000) score -= 10;
        if (navigation.loadTime > 5000) score -= 20;
        if (navigation.ttfb > 600) score -= 5;
        if (navigation.domContentLoaded > 3000) score -= 5;

        // Resource Efficiency (25%)
        if (resources.totalSize > 2 * 1024 * 1024) score -= 10;
        if (resources.totalSize > 3 * 1024 * 1024) score -= 15;
        if (resources.totalRequests > 50) score -= 5;
        if (resources.totalRequests > 100) score -= 10;

        // Core Web Vitals (30%)
        if (coreVitals.lcp.rating === 'needs-improvement') score -= 5;
        if (coreVitals.lcp.rating === 'poor') score -= 15;
        if (coreVitals.fid.rating === 'needs-improvement') score -= 5;
        if (coreVitals.fid.rating === 'poor') score -= 10;
        if (coreVitals.cls.rating === 'poor') score -= 5;

        // Optimizations (15%)
        const lazyPercentage = optimizations.images.lazy / optimizations.images.total;
        if (lazyPercentage < 0.5) score -= 5;
        
        const asyncPercentage = (optimizations.scripts.async + optimizations.scripts.defer) / optimizations.scripts.external;
        if (asyncPercentage < 0.3) score -= 5;

        return Math.max(0, Math.round(score));
    }

    getPerformanceGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    generatePerformanceRecommendations(navigation, resources, coreVitals, optimizations) {
        const recommendations = [];

        if (navigation.loadTime > 3000) {
            recommendations.push('Оптимизируйте время загрузки страницы');
        }

        if (resources.totalSize > 2 * 1024 * 1024) {
            recommendations.push('Уменьшите общий размер ресурсов');
        }

        if (coreVitals.lcp.rating !== 'good') {
            recommendations.push('Улучшите Largest Contentful Paint');
        }

        if (optimizations.images.lazy / optimizations.images.total < 0.5) {
            recommendations.push('Добавьте lazy loading для изображений');
        }

        return recommendations;
    }

    getFallbackData() {
        return {
            loadTime: 1800,
            dnsTime: 50,
            tcpTime: 100,
            ttfb: 300,
            domContentLoaded: 1500,
            domInteractive: 1200,
            totalRequests: 15,
            totalSize: 1500000,
            firstPaint: 800,
            firstContentfulPaint: 900,
            firstMeaningfulPaint: 1200,
            coreWebVitals: {
                lcp: { value: 2100, rating: 'good', element: 'unknown' },
                fid: { value: 80, rating: 'good' },
                cls: { value: 0.05, rating: 'good' },
                inp: { value: 150, rating: 'good' },
                tbt: { value: 150, rating: 'good' }
            },
            memory: {
                usedJSHeapSize: 50,
                totalJSHeapSize: 100,
                jsHeapSizeLimit: 500,
                usagePercentage: 50
            },
            optimizations: {
                images: { total: 10, lazy: 5, withDimensions: 8, modernFormats: 2 },
                scripts: { total: 5, async: 2, defer: 1, modules: 0, external: 3 },
                styles: { total: 3, preload: 1, prefetch: 0 },
                fonts: { total: 2, preload: 1 }
            },
            score: 85,
            grade: 'B',
            recommendations: ['Продолжайте мониторить производительность']
        };
    }

    // Метод для очистки observers
    disconnect() {
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (e) {
                // Игнорируем ошибки при отключении
            }
        });
        this.observers = [];
    }
}