export default class BasicElementsAnalyzer {
    analyze(doc) {
        const title = this.analyzeTitle(doc);
        const description = this.analyzeDescription(doc);
        const h1 = this.analyzeH1(doc);
        const viewport = this.analyzeViewport(doc);
        const charset = this.analyzeCharset(doc);
        const lang = this.analyzeLang(doc);
        const canonical = this.analyzeCanonical(doc);
        const robots = this.analyzeRobots(doc);
        const headings = this.analyzeHeadings(doc);
        const favicon = this.analyzeFavicon(doc);

        const score = this.calculateBasicScore(title, description, h1, viewport, lang, canonical, robots);

        // Генерируем рекомендации по базовым элементам
        const recommendations = this.generateBasicRecommendations(
            title,
            description,
            h1,
            viewport,
            charset,
            lang,
            canonical,
            robots,
            headings,
            favicon,
            score
        );

        return {
            title,
            description,
            h1,
            viewport,
            charset,
            lang,
            canonical,
            robots,
            headings,
            favicon,
            score,
            recommendations
        };
    }

    analyzeTitle(doc) {
        const title = doc.querySelector('title');
        const text = title ? title.textContent.trim() : '';
        
        return {
            exists: !!title,
            length: text.length,
            optimal: text.length >= 30 && text.length <= 60,
            value: text || 'Не задан'
        };
    }

    analyzeDescription(doc) {
        const meta = doc.querySelector('meta[name="description"]');
        const content = meta ? meta.getAttribute('content') : '';
        
        return {
            exists: !!meta,
            length: content.length,
            optimal: content.length >= 70 && content.length <= 160,
            value: content || 'Не задан'
        };
    }

    analyzeH1(doc) {
        const h1Elements = doc.querySelectorAll('h1');
        const titles = Array.from(h1Elements).map(h1 => h1.textContent.trim());
        
        return {
            count: h1Elements.length,
            optimal: h1Elements.length === 1,
            titles: titles
        };
    }

    analyzeViewport(doc) {
        const viewport = doc.querySelector('meta[name="viewport"]');
        return {
            exists: !!viewport,
            value: viewport ? viewport.getAttribute('content') : '',
            optimal: viewport && viewport.getAttribute('content').includes('width=device-width')
        };
    }

    analyzeCharset(doc) {
        const charset = doc.querySelector('meta[charset]') || doc.querySelector('meta[http-equiv="Content-Type"]');
        return {
            exists: !!charset,
            value: charset ? (charset.getAttribute('charset') || charset.getAttribute('content')) : ''
        };
    }

    analyzeLang(doc) {
        const html = doc.documentElement;
        const lang = html.getAttribute('lang');
        return {
            exists: !!lang,
            value: lang || 'Не задан',
            optimal: !!lang
        };
    }

    analyzeCanonical(doc) {
        const canonical = doc.querySelector('link[rel="canonical"]');
        return {
            exists: !!canonical,
            value: canonical ? canonical.getAttribute('href') : 'Не задана',
            optimal: !!canonical
        };
    }

    analyzeRobots(doc) {
        const robots = doc.querySelector('meta[name="robots"]');
        const content = robots ? robots.getAttribute('content') : '';
        return {
            exists: !!robots,
            value: content || 'Не задан',
            allowsIndexing: !content.includes('noindex'),
            allowsFollowing: !content.includes('nofollow')
        };
    }

    analyzeHeadings(doc) {
        const headings = {};
        for (let i = 1; i <= 6; i++) {
            const hElements = doc.querySelectorAll(`h${i}`);
            headings[`h${i}`] = {
                count: hElements.length,
                titles: Array.from(hElements).map(h => h.textContent.trim())
            };
        }
        return headings;
    }

    analyzeFavicon(doc) {
        const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        return {
            exists: !!favicon,
            value: favicon ? favicon.getAttribute('href') : 'Не задана'
        };
    }

    calculateBasicScore(title, description, h1, viewport, lang, canonical, robots) {
        let score = 0;

        if (title.exists) score += 20;
        if (title.optimal) score += 10;
        if (description.exists) score += 20;
        if (description.optimal) score += 10;
        if (h1.optimal) score += 10;
        if (viewport.exists) score += 5;

        if (lang.exists) score += 5;
        if (canonical.exists) score += 10;
        if (robots.exists && robots.allowsIndexing) score += 10;

        return Math.min(score, 100);
    }

    generateBasicRecommendations(title, description, h1, viewport, charset, lang, canonical, robots, headings, favicon, score) {
        const recommendations = [];

        // Рекомендации по title
        if (!title.exists) {
            recommendations.push({
                id: 'basic-no-title',
                title: 'Отсутствует тег title',
                description: 'Страница не имеет тега title, что негативно влияет на SEO и пользовательский опыт.',
                suggestion: 'Добавьте тег <title> с кратким описанием содержимого страницы.',
                priority: 'critical',
                impact: 9,
                category: 'seo',
                examples: '<title>Название страницы - Название сайта</title>'
            });
        } else if (!title.optimal) {
            if (title.length < 30) {
                recommendations.push({
                    id: 'basic-title-too-short',
                    title: 'Слишком короткий title',
                    description: `Длина title составляет ${title.length} символов, рекомендуется 30-60 символов.`,
                    suggestion: 'Увеличьте длину title, добавив ключевые слова и описание страницы.',
                    priority: 'warning',
                    impact: 7,
                    category: 'seo'
                });
            } else if (title.length > 60) {
                recommendations.push({
                    id: 'basic-title-too-long',
                    title: 'Слишком длинный title',
                    description: `Длина title составляет ${title.length} символов, рекомендуется не более 60 символов.`,
                    suggestion: 'Сократите title до 60 символов, оставив самые важные ключевые слова.',
                    priority: 'warning',
                    impact: 6,
                    category: 'seo'
                });
            }
        }

        // Рекомендации по description
        if (!description.exists) {
            recommendations.push({
                id: 'basic-no-description',
                title: 'Отсутствует meta description',
                description: 'Страница не имеет meta description, что снижает кликабельность в поисковых результатах.',
                suggestion: 'Добавьте тег meta description с кратким и привлекательным описанием страницы.',
                priority: 'warning',
                impact: 8,
                category: 'seo',
                examples: '<meta name="description" content="Описание содержимого страницы">'
            });
        } else if (!description.optimal) {
            if (description.length < 70) {
                recommendations.push({
                    id: 'basic-description-too-short',
                    title: 'Слишком короткий description',
                    description: `Длина description составляет ${description.length} символов, рекомендуется 70-160 символов.`,
                    suggestion: 'Расширьте описание, добавив больше деталей о содержимом страницы.',
                    priority: 'info',
                    impact: 5,
                    category: 'seo'
                });
            } else if (description.length > 160) {
                recommendations.push({
                    id: 'basic-description-too-long',
                    title: 'Слишком длинный description',
                    description: `Длина description составляет ${description.length} символов, рекомендуется не более 160 символов.`,
                    suggestion: 'Сократите description, оставив самую важную информацию.',
                    priority: 'info',
                    impact: 4,
                    category: 'seo'
                });
            }
        }

        // Рекомендации по H1
        if (h1.count === 0) {
            recommendations.push({
                id: 'basic-no-h1',
                title: 'Отсутствует заголовок H1',
                description: 'На странице нет ни одного заголовка H1, что важно для структуры и SEO.',
                suggestion: 'Добавьте один заголовок H1, который отражает основную тему страницы.',
                priority: 'critical',
                impact: 8,
                category: 'seo',
                examples: '<h1>Основной заголовок страницы</h1>'
            });
        } else if (h1.count > 1) {
            recommendations.push({
                id: 'basic-multiple-h1',
                title: 'Несколько заголовков H1',
                description: `На странице обнаружено ${h1.count} заголовков H1. Рекомендуется использовать только один.`,
                suggestion: 'Оставьте один основной заголовок H1, остальные преобразуйте в H2-H6.',
                priority: 'warning',
                impact: 6,
                category: 'seo'
            });
        }

        // Рекомендации по viewport
        if (!viewport.exists) {
            recommendations.push({
                id: 'basic-no-viewport',
                title: 'Отсутствует viewport meta тег',
                description: 'Без viewport тега страница может некорректно отображаться на мобильных устройствах.',
                suggestion: 'Добавьте viewport meta тег для корректного отображения на мобильных устройствах.',
                priority: 'warning',
                impact: 7,
                category: 'mobile',
                examples: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            });
        } else if (!viewport.optimal) {
            recommendations.push({
                id: 'basic-bad-viewport',
                title: 'Неоптимальный viewport',
                description: 'Viewport тег не содержит width=device-width, что может вызвать проблемы на мобильных устройствах.',
                suggestion: 'Измените viewport на "width=device-width, initial-scale=1.0".',
                priority: 'warning',
                impact: 6,
                category: 'mobile'
            });
        }

        // Рекомендации по языку
        if (!lang.exists) {
            recommendations.push({
                id: 'basic-no-lang',
                title: 'Не указан язык страницы',
                description: 'Отсутствует атрибут lang у тега html, что важно для доступности и SEO.',
                suggestion: 'Добавьте атрибут lang с кодом языка к тегу html.',
                priority: 'warning',
                impact: 6,
                category: 'accessibility',
                examples: '<html lang="ru">'
            });
        }

        // Рекомендации по канонической ссылке
        if (!canonical.exists) {
            recommendations.push({
                id: 'basic-no-canonical',
                title: 'Отсутствует canonical ссылка',
                description: 'Нет канонической ссылки, что может вызвать проблемы с дублированием контента.',
                suggestion: 'Добавьте canonical ссылку для указания предпочтительной версии страницы.',
                priority: 'info',
                impact: 5,
                category: 'seo',
                examples: '<link rel="canonical" href="https://example.com/page">'
            });
        }

        // Рекомендации по robots
        if (!robots.exists) {
            recommendations.push({
                id: 'basic-no-robots',
                title: 'Отсутствует robots meta тег',
                description: 'Не указаны инструкции для поисковых роботов.',
                suggestion: 'Добавьте robots meta тег для контроля индексации и следования по ссылкам.',
                priority: 'info',
                impact: 4,
                category: 'seo',
                examples: '<meta name="robots" content="index, follow">'
            });
        } else if (!robots.allowsIndexing) {
            recommendations.push({
                id: 'basic-noindex',
                title: 'Страница запрещена к индексации',
                description: 'Robots meta тег содержит noindex, страница не будет индексироваться поисковыми системами.',
                suggestion: 'Если страница должна быть в поиске, уберите noindex из robots meta тега.',
                priority: 'warning',
                impact: 7,
                category: 'seo'
            });
        }

        // Рекомендации по фавиконке
        if (!favicon.exists) {
            recommendations.push({
                id: 'basic-no-favicon',
                title: 'Отсутствует фавиконка',
                description: 'Сайт не имеет фавиконки, что ухудшает визуальное восприятие в браузере.',
                suggestion: 'Добавьте фавиконку в формате ICO, PNG или SVG.',
                priority: 'info',
                impact: 3,
                category: 'usability',
                examples: '<link rel="icon" type="image/x-icon" href="/favicon.ico">'
            });
        }

        // Рекомендации по структуре заголовков
        if (headings.h1.count === 0 && (headings.h2.count > 0 || headings.h3.count > 0)) {
            recommendations.push({
                id: 'basic-heading-structure',
                title: 'Неправильная структура заголовков',
                description: 'Обнаружены заголовки H2/H3 при отсутствии H1, что нарушает иерархию заголовков.',
                suggestion: 'Добавьте заголовок H1 в начало страницы перед другими заголовками.',
                priority: 'warning',
                impact: 6,
                category: 'accessibility'
            });
        }

        // Положительные рекомендации
        if (score >= 90) {
            recommendations.push({
                id: 'basic-excellent',
                title: 'Отличная базовая оптимизация',
                description: 'Все основные SEO и технические элементы настроены правильно.',
                suggestion: 'Продолжайте поддерживать высокое качество базовых элементов на всех страницах.',
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
}