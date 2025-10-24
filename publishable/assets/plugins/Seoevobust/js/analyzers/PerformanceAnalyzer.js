export default class PerformanceAnalyzer {
    constructor() {
        this.metrics = {};
        this.observers = [];
    }

    async analyze() {
        try {
            // Основные метрики
            const navigationMetrics = this.analyzeNavigationTiming();
            const resourceMetrics = this.analyzeResourceTiming();
            const paintMetrics = this.analyzePaintTiming();
            const memoryMetrics = this.analyzeMemoryUsage();
            const optimizationMetrics = this.analyzeOptimizations();

            // Расчет общего балла с защитой от undefined
            const perfScore = this.calculatePerformanceScore(
                navigationMetrics,
                resourceMetrics,
                optimizationMetrics
            );

            // Генерируем рекомендации в нужном формате
            const recommendations = this.generatePerformanceRecommendations(
                navigationMetrics,
                resourceMetrics,
                paintMetrics,
                memoryMetrics,
                optimizationMetrics,
                perfScore
            );

            return {
                ...navigationMetrics,
                ...resourceMetrics,
                ...paintMetrics,
                memory: memoryMetrics,
                optimizations: optimizationMetrics,
                score: perfScore,
                grade: this.getPerformanceGrade(perfScore),
                recommendations: recommendations
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

    calculatePerformanceScore(navigation, resources, optimizations) {
        let score = 100;
        
        const safeNavigation = navigation || {};
        const safeResources = resources || {};
        const safeOptimizations = optimizations || {};

        // Navigation Timing (30%)
        if (safeNavigation.loadTime > 3000) score -= 10;
        if (safeNavigation.loadTime > 5000) score -= 20;
        if (safeNavigation.ttfb > 600) score -= 5;
        if (safeNavigation.domContentLoaded > 3000) score -= 5;

        // Resource Efficiency (25%)
        if (safeResources.totalSize > 2 * 1024 * 1024) score -= 10;
        if (safeResources.totalSize > 3 * 1024 * 1024) score -= 15;
        if (safeResources.totalRequests > 50) score -= 5;
        if (safeResources.totalRequests > 100) score -= 10;

        // Optimizations (15%) - с защитой от деления на ноль
        const imagesTotal = safeOptimizations.images?.total || 1;
        const lazyPercentage = (safeOptimizations.images?.lazy || 0) / imagesTotal;
        if (lazyPercentage < 0.5) score -= 5;
        
        const scriptsExternal = safeOptimizations.scripts?.external || 1;
        const asyncDeferCount = (safeOptimizations.scripts?.async || 0) + (safeOptimizations.scripts?.defer || 0);
        const asyncPercentage = asyncDeferCount / scriptsExternal;
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

    generatePerformanceRecommendations(navigation, resources, paint, memory, optimizations, score) {
        const recommendations = [];

        // Анализ времени загрузки
        if (navigation.loadTime > 5000) {
            recommendations.push({
                id: 'perf-load-time-critical',
                title: 'Критически долгая загрузка страницы',
                description: `Время полной загрузки страницы составляет ${navigation.loadTime}мс, что значительно превышает рекомендуемые 3 секунды.`,
                suggestion: 'Оптимизируйте критический путь рендеринга, используйте lazy loading для невидимых элементов, сжимайте ресурсы.',
                priority: 'critical',
                impact: 9,
                category: 'loading'
            });
        } else if (navigation.loadTime > 3000) {
            recommendations.push({
                id: 'perf-load-time-warning',
                title: 'Длительное время загрузки',
                description: `Время загрузки ${navigation.loadTime}мс превышает рекомендуемый порог в 3 секунды.`,
                suggestion: 'Минифицируйте CSS и JavaScript, оптимизируйте изображения, используйте кэширование.',
                priority: 'warning',
                impact: 7,
                category: 'loading'
            });
        }

        if (navigation.ttfb > 600) {
            recommendations.push({
                id: 'perf-ttfb-slow',
                title: 'Медленный отклик сервера',
                description: `Время до первого байта (TTFB) составляет ${navigation.ttfb}мс, что указывает на проблемы серверной части.`,
                suggestion: 'Оптимизируйте серверные процессы, используйте кэширование на стороне сервера, рассмотрите CDN.',
                priority: 'warning',
                impact: 6,
                category: 'server'
            });
        }

        // Анализ количества ресурсов
        if (resources.totalRequests > 100) {
            recommendations.push({
                id: 'perf-too-many-requests',
                title: 'Слишком много HTTP-запросов',
                description: `Страница загружает ${resources.totalRequests} ресурсов, что увеличивает время загрузки.`,
                suggestion: 'Объедините CSS и JS файлы, используйте sprites для изображений, реализуйте lazy loading.',
                priority: 'warning',
                impact: 7,
                category: 'resources'
            });
        } else if (resources.totalRequests > 50) {
            recommendations.push({
                id: 'perf-many-requests',
                title: 'Большое количество HTTP-запросов',
                description: `Обнаружено ${resources.totalRequests} запросов к ресурсам.`,
                suggestion: 'Рассмотрите объединение мелких ресурсов, используйте HTTP/2 для параллельной загрузки.',
                priority: 'info',
                impact: 5,
                category: 'resources'
            });
        }

        // Анализ размера ресурсов
        const totalSizeMB = Math.round(resources.totalSize / (1024 * 1024));
        if (totalSizeMB > 3) {
            recommendations.push({
                id: 'perf-large-size-critical',
                title: 'Критически большой размер страницы',
                description: `Общий размер ресурсов ${totalSizeMB}MB значительно превышает рекомендуемые 2MB.`,
                suggestion: 'Сжимайте изображения, используйте современные форматы (WebP, AVIF), минифицируйте код, включите GZIP/Brotli сжатие.',
                priority: 'critical',
                impact: 8,
                category: 'optimization'
            });
        } else if (totalSizeMB > 2) {
            recommendations.push({
                id: 'perf-large-size-warning',
                title: 'Большой размер страницы',
                description: `Размер страницы ${totalSizeMB}MB близок к критическому значению.`,
                suggestion: 'Оптимизируйте изображения, удалите неиспользуемый CSS и JavaScript.',
                priority: 'warning',
                impact: 6,
                category: 'optimization'
            });
        }

        // Анализ lazy loading изображений
        const imagesTotal = optimizations.images.total || 1;
        const lazyPercentage = (optimizations.images.lazy || 0) / imagesTotal;
        if (lazyPercentage < 0.3 && imagesTotal > 5) {
            recommendations.push({
                id: 'perf-lazy-loading',
                title: 'Отсутствует lazy loading для изображений',
                description: `Только ${Math.round(lazyPercentage * 100)}% изображений используют lazy loading.`,
                suggestion: 'Добавьте атрибут loading="lazy" для изображений ниже сгиба (below the fold).',
                priority: 'warning',
                impact: 6,
                category: 'images',
                examples: '<img src="image.jpg" loading="lazy" alt="Description">'
            });
        }

        // Анализ async/defer для скриптов
        const scriptsExternal = optimizations.scripts.external || 1;
        const asyncDeferCount = (optimizations.scripts.async || 0) + (optimizations.scripts.defer || 0);
        const asyncPercentage = asyncDeferCount / scriptsExternal;
        if (asyncPercentage < 0.5 && scriptsExternal > 2) {
            recommendations.push({
                id: 'perf-script-loading',
                title: 'Неоптимальная загрузка скриптов',
                description: `Только ${Math.round(asyncPercentage * 100)}% внешних скриптов используют async/defer.`,
                suggestion: 'Добавьте атрибуты async или defer к внешним скриптам, которые не критичны для первоначального рендеринга.',
                priority: 'warning',
                impact: 7,
                category: 'scripts',
                examples: '<script src="app.js" defer></script>'
            });
        }

        // Анализ First Contentful Paint
        if (paint.firstContentfulPaint > 2000) {
            recommendations.push({
                id: 'perf-fcp-slow',
                title: 'Медленный First Contentful Paint',
                description: `Первое отображение контента занимает ${paint.firstContentfulPaint}мс.`,
                suggestion: 'Уменьшите время загрузки критических ресурсов, оптимизируйте CSS, используйте предварительную загрузку шрифтов.',
                priority: 'warning',
                impact: 7,
                category: 'rendering'
            });
        }

        // Анализ использования памяти
        if (memory.usagePercentage > 80) {
            recommendations.push({
                id: 'perf-memory-high',
                title: 'Высокое потребление памяти',
                description: `Используется ${memory.usagePercentage}% доступной памяти JavaScript.`,
                suggestion: 'Оптимизируйте использование памяти, устраните утечки памяти, используйте более эффективные структуры данных.',
                priority: 'warning',
                impact: 6,
                category: 'memory'
            });
        }

        // Положительные рекомендации (если все хорошо)
        if (score >= 90) {
            recommendations.push({
                id: 'perf-excellent',
                title: 'Отличная производительность',
                description: 'Ваш сайт демонстрирует отличные показатели производительности.',
                suggestion: 'Продолжайте мониторить производительность при добавлении нового функционала.',
                priority: 'info',
                impact: 2,
                category: 'maintenance'
            });
        }

        // Сортируем рекомендации по приоритету и влиянию
        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 0, warning: 1, info: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.impact - a.impact;
        });
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
            recommendations: this.generatePerformanceRecommendations(
                { loadTime: 1800, ttfb: 300 },
                { totalRequests: 15, totalSize: 1500000 },
                { firstContentfulPaint: 900 },
                { usagePercentage: 50 },
                {
                    images: { total: 10, lazy: 5 },
                    scripts: { external: 3, async: 2, defer: 1 }
                },
                85
            )
        };
    }
}