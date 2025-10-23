export default class RecommendationsRenderer {
    render(analysis) {
        const recommendations = this.generateRecommendations(analysis);
        
        // Группируем рекомендации по приоритету
        const criticalRecs = recommendations.filter(rec => rec.priority === 'critical');
        const warningRecs = recommendations.filter(rec => rec.priority === 'warning');
        const infoRecs = recommendations.filter(rec => rec.priority === 'info');
        
        let html = '<h4>Рекомендации по улучшению сайта</h4>';
        
        // Счетчик рекомендаций
        html += `
            <div class="recommendations-stats">
                <span class="stat-critical">Критические: ${criticalRecs.length}</span>
                <span class="stat-warning">Важные: ${warningRecs.length}</span>
                <span class="stat-info">Дополнительные: ${infoRecs.length}</span>
            </div>
        `;
        
        // Критические рекомендации
        if (criticalRecs.length > 0) {
            html += '<h5 class="priority-critical">🚨 Критические проблемы</h5>';
            html += '<div class="recommendations-list critical-list">';
            criticalRecs.forEach(rec => {
                html += this.renderRecommendationItem(rec);
            });
            html += '</div>';
        }
        
        // Важные рекомендации
        if (warningRecs.length > 0) {
            html += '<h5 class="priority-warning">⚠️ Важные улучшения</h5>';
            html += '<div class="recommendations-list warning-list">';
            warningRecs.forEach(rec => {
                html += this.renderRecommendationItem(rec);
            });
            html += '</div>';
        }
        
        // Информационные рекомендации
        if (infoRecs.length > 0) {
            html += '<h5 class="priority-info">💡 Дополнительные возможности</h5>';
            html += '<div class="recommendations-list info-list">';
            infoRecs.forEach(rec => {
                html += this.renderRecommendationItem(rec);
            });
            html += '</div>';
        }
        
        // Сводка по баллам
        html += this.renderScoreSummary(analysis);
        
        return html;
    }

    renderRecommendationItem(rec) {
        return `
            <div class="recommendation-item ${rec.priority}">
                <div class="rec-header">
                    <strong>${rec.title}</strong>
                    <span class="rec-impact">Влияние: ${rec.impact}/10</span>
                </div>
                <p class="rec-description">${rec.description}</p>
                <div class="rec-solution">
                    <strong>Решение:</strong> ${rec.suggestion}
                </div>
                ${rec.examples ? this.renderCodeExample(rec.examples) : ''}
                ${rec.category ? `<div class="rec-category">Категория: ${rec.category}</div>` : ''}
            </div>
        `;
    }

    renderCodeExample(code) {
        // Экранируем и форматируем код
        const escapedCode = this.escapeHtml(code);
        
        return `
            <div class="rec-examples">
                <strong>Примеры:</strong>
                <pre class="code-example"><code>${escapedCode}</code></pre>
            </div>
        `;
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    renderScoreSummary(analysis) {
        // Получаем баллы из всех источников с fallback значениями
        const scores = {
            seo: analysis.basic?.score || 0,
            performance: analysis.performance?.score || 0,
            security: analysis.security?.score || 0,
            overall: analysis.score || 0,
            content: analysis.basic?.content?.score || 0
        };
        
        return `
            <div class="score-summary">
                <h5>Сводка по баллам</h5>
                <div class="score-breakdown">
                    <div class="score-item">
                        <span class="score-label">SEO:</span>
                        <span class="score-value ${scores.seo >= 70 ? 'good' : scores.seo >= 50 ? 'warning' : 'bad'}">
                            ${scores.seo}%
                        </span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Производительность:</span>
                        <span class="score-value ${scores.performance >= 70 ? 'good' : scores.performance >= 50 ? 'warning' : 'bad'}">
                            ${scores.performance}%
                        </span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Безопасность:</span>
                        <span class="score-value ${scores.security >= 70 ? 'good' : scores.security >= 50 ? 'warning' : 'bad'}">
                            ${scores.security}%
                        </span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Контент:</span>
                        <span class="score-value ${scores.content >= 70 ? 'good' : scores.overall >= 50 ? 'warning' : 'bad'}">
                        ${scores.content}%
                        </span>
                    </div>
                    <div class="score-item total">
                        <span class="score-label">Общий балл:</span>
                        <span class="score-value ${scores.overall >= 70 ? 'good' : scores.overall >= 50 ? 'warning' : 'bad'}">
                            ${scores.overall}%
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    generateRecommendations(analysis) {
        const recs = [];
        
        const basic = analysis.basic?.basic || {};
        const content = analysis.basic?.content || {};
        const technical = analysis.technical || {};
        const performance = analysis.performance || {};
        const security = analysis.security || {};

        this.addBasicSEORecommendations(recs, basic);  
        this.addContentRecommendations(recs, content);
        this.addTechnicalRecommendations(recs, technical);
        this.addPerformanceRecommendations(recs, performance);
        this.addSecurityRecommendations(recs, security);
        this.addStructureRecommendations(recs, technical);
        this.addAdvancedSEORecommendations(recs, analysis);
        this.addUXRecommendations(recs, analysis);
        this.addMobileRecommendations(recs, analysis);
        this.addAccessibilityRecommendations(recs, analysis);
        this.addEcommerceRecommendations(recs, analysis);
        this.addInternationalSEORecommendations(recs, analysis);
        this.addTechnicalDebtRecommendations(recs, analysis);

        return recs.sort((a, b) => {
            const priorityOrder = { critical: 0, warning: 1, info: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.impact - a.impact;
        });
    }

    addBasicSEORecommendations(recs, basic) {
        // Title
        if (!basic.title?.exists) {
            recs.push({
                priority: 'critical',
                impact: 10,
                category: 'Базовое SEO',
                title: 'Отсутствует тег title',
                description: 'Тег title - один из самых важных SEO-элементов. Без него поисковые системы не смогут правильно определить тему страницы.',
                suggestion: 'Добавьте уникальный тег title длиной 30-60 символов, который точно описывает содержание страницы.',
                examples: '<title>Купить iPhone в Москве - Apple Store | Официальный дилер</title>'
            });
        } else if (!basic.title?.optimal) {
            recs.push({
                priority: 'warning',
                impact: 8,
                category: 'Базовое SEO',
                title: 'Неоптимальная длина title',
                description: `Длина title составляет ${basic.title.length} символов. Рекомендуется 30-60 символов для полного отображения в поисковой выдаче.`,
                suggestion: 'Откорректируйте длину title, оставив только самые важные ключевые слова.',
                examples: 'Идеальная длина: 50-55 символов'
            });
        }

        // Meta Description
        if (!basic.description?.exists) {
            recs.push({
                priority: 'critical',
                impact: 9,
                category: 'Базовое SEO',
                title: 'Отсутствует meta description',
                description: 'Meta description влияет на кликабельность в поисковой выдаче. Без него поисковая система сгенерирует описание автоматически.',
                suggestion: 'Добавьте описательный meta description длиной 70-160 символов с призывом к действию.',
                examples: '<meta name="description" content="Купить iPhone по выгодной цене в официальном магазине Apple. Гарантия 2 года. Доставка по Москве за 2 часа.">'
            });
        } else if (!basic.description?.optimal) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Базовое SEO',
                title: 'Неоптимальная длина meta description',
                description: `Длина description составляет ${basic.description.length} символов. Рекомендуется 70-160 символов.`,
                suggestion: 'Оптимизируйте описание, сделайте его привлекательным для пользователей.',
                examples: 'Включите ключевые слова и призыв к действию'
            });
        }

        // H1 заголовки
        if (!basic.h1?.optimal) {
            if (basic.h1?.count === 0) {
                recs.push({
                    priority: 'critical',
                    impact: 9,
                    category: 'Базовое SEO',
                    title: 'Отсутствует H1 заголовок',
                    description: 'H1 заголовок обязателен для структурирования контента и помогает поисковым системам понять основную тему страницы.',
                    suggestion: 'Добавьте один H1 заголовок в начале основного контента страницы.',
                    examples: '<h1>Купить iPhone 15 Pro Max в Москве</h1>'
                });
            } else if (basic.h1?.count > 1) {
                recs.push({
                    priority: 'warning',
                    impact: 7,
                    category: 'Базовое SEO',
                    title: 'Слишком много H1 заголовков',
                    description: `Найдено ${basic.h1.count} H1 заголовков. Это может запутать поисковые системы при определении основной темы страницы.`,
                    suggestion: 'Оставьте только один основной H1 заголовок, остальные преобразуйте в H2-H6.',
                    examples: 'Один H1 для названия страницы, остальные - подзаголовки H2-H6'
                });
            }
        }

        // Viewport
        if (!basic.viewport?.exists) {
            recs.push({
                priority: 'critical',
                impact: 8,
                category: 'Мобильная оптимизация',
                title: 'Отсутствует viewport meta tag',
                description: 'Без viewport тега сайт не будет корректно отображаться на мобильных устройствах, что негативно влияет на мобильный поиск.',
                suggestion: 'Добавьте viewport meta tag в секцию head.',
                examples: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            });
        }

        // Charset
        if (!basic.charset?.exists) {
            recs.push({
                priority: 'critical',
                impact: 6,
                category: 'Базовое SEO',
                title: 'Не указана кодировка страницы',
                description: 'Отсутствие кодировки может привести к некорректному отображению символов на странице.',
                suggestion: 'Добавьте указание кодировки UTF-8.',
                examples: '<meta charset="UTF-8">'
            });
        }

        // Language
        if (!basic.lang?.exists) {
            recs.push({
                priority: 'warning',
                impact: 5,
                category: 'Базовое SEO',
                title: 'Не указан язык страницы',
                description: 'Атрибут lang помогает поисковым системам определить язык контента.',
                suggestion: 'Добавьте атрибут lang к тегу html.',
                examples: '<html lang="ru">'
            });
        }
    }

    addContentRecommendations(recs, content) {
        // ALT тексты изображений
        if (content.images?.altPercentage < 80) {
            recs.push({
                priority: content.images?.altPercentage < 50 ? 'critical' : 'warning',
                impact: 6,
                category: 'Контент',
                title: 'Недостаточно ALT текстов у изображений',
                description: `Только ${content.images.altPercentage}% изображений имеют ALT текст. ALT тексты важны для доступности и SEO изображений.`,
                suggestion: 'Добавьте описательные ALT тексты ко всем значимым изображениям, описывая что на них изображено.',
                examples: '<img src="iphone.jpg" alt="Apple iPhone 15 Pro Max серебристый">'
            });
        }

        // Объем текста
        if (content.textAnalysis?.contentWords < 300) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Контент',
                title: 'Недостаточно текстового контента',
                description: `На странице всего ${content.textAnalysis.contentWords} слов контента. Рекомендуется минимум 300 слов для хорошего SEO.`,
                suggestion: 'Добавьте больше качественного текстового контента, раскрывающего тему страницы.',
                examples: 'Статьи, описания, инструкции, отзывы'
            });
        }

        // Структура заголовков
        if (!content.headings?.hasH2) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Контент',
                title: 'Отсутствуют подзаголовки H2',
                description: 'H2 заголовки помогают структурировать контент и улучшают читаемость для пользователей и поисковых систем.',
                suggestion: 'Добавьте H2 заголовки для разделения контента на логические разделы.',
                examples: '<h2>Характеристики iPhone</h2><h2>Отзывы покупателей</h2>'
            });
        }

        // Внутренние ссылки
        if (content.links?.internal === 0) {
            recs.push({
                priority: 'warning',
                impact: 5,
                category: 'Контент',
                title: 'Отсутствуют внутренние ссылки',
                description: 'Внутренние ссылки помогают распределять вес страниц и улучшают навигацию по сайту.',
                suggestion: 'Добавьте внутренние ссылки на релевантные страницы сайта.',
                examples: 'Ссылки на категории, похожие товары, полезные статьи'
            });
        }

        // Читаемость
        if (content.readability?.score < 40) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Контент',
                title: 'Низкая читаемость текста',
                description: `Уровень читаемости: ${content.readability.level}. Текст может быть сложен для восприятия пользователями.`,
                suggestion: 'Упростите предложения, разбейте длинные абзацы, используйте списки.',
                examples: 'Длина предложения: 15-20 слов, короткие абзацы по 3-4 предложения'
            });
        }
    }

    addTechnicalRecommendations(recs, technical) {
        // Schema.org разметка
        if (technical.schema?.count === 0) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Техническое SEO',
                title: 'Отсутствует Schema.org разметка',
                description: 'Schema разметка помогает поисковым системам лучше понимать контент и может улучшить отображение в поисковой выдаче.',
                suggestion: 'Добавьте структурированную разметку JSON-LD для основного контента страницы.',
                examples: 'Organization, BreadcrumbList, Product, Article в зависимости от типа страницы'
            });
        } else if (technical.schema?.coverage < 80) {
            recs.push({
                priority: 'info',
                impact: 4,
                category: 'Техническое SEO',
                title: 'Низкое качество Schema разметки',
                description: `Только ${technical.schema.coverage}% Schema разметки является валидной.`,
                suggestion: 'Проверьте и исправьте ошибки в существующей Schema разметке.',
                examples: 'Убедитесь в правильности @context и обязательных полей для каждого типа'
            });
        }

        // Open Graph
        if (!technical.metaTags?.hasOG) {
            recs.push({
                priority: 'warning',
                impact: 5,
                category: 'Социальные сети',
                title: 'Отсутствуют Open Graph теги',
                description: 'Open Graph теги улучшают отображение страницы при расшаривании в социальных сетях.',
                suggestion: 'Добавьте основные Open Graph теги: og:title, og:description, og:image.',
                examples: '<meta property="og:title" content="Заголовок для соцсетей">'
            });
        }

        // Canonical URL
        if (!technical.seo?.canonical?.exists) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Техническое SEO',
                title: 'Отсутствует canonical URL',
                description: 'Canonical URL помогает избежать проблем с дублированием контента.',
                suggestion: 'Добавьте canonical тег, указывающий на основную версию страницы.',
                examples: '<link rel="canonical" href="https://site.com/page/">'
            });
        }

        // Robots meta tag
        if (!technical.seo?.robots?.exists) {
            recs.push({
                priority: 'info',
                impact: 3,
                category: 'Техническое SEO',
                title: 'Отсутствует robots meta tag',
                description: 'Robots meta tag дает дополнительные инструкции поисковым системам по индексации страницы.',
                suggestion: 'Добавьте robots meta tag при необходимости особых инструкций.',
                examples: '<meta name="robots" content="index, follow">'
            });
        }
    }

    addPerformanceRecommendations(recs, performance) {
        // Время загрузки
        if (performance.loadTime > 3000) {
            recs.push({
                priority: 'warning',
                impact: 8,
                category: 'Производительность',
                title: 'Долгая загрузка страницы',
                description: `Время полной загрузки: ${performance.loadTime}ms. Рекомендуется менее 3 секунд.`,
                suggestion: 'Оптимизируйте изображения, минифицируйте CSS/JS, используйте кэширование.',
                examples: 'Сжатие изображений, объединение файлов, CDN для статики'
            });
        }

        // Размер ресурсов
        if (performance.totalSize > 2 * 1024 * 1024) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Производительность',
                title: 'Большой общий размер ресурсов',
                description: `Общий размер ресурсов: ${Math.round(performance.totalSize / 1024 / 1024)}MB. Рекомендуется менее 2MB.`,
                suggestion: 'Оптимизируйте изображения, удалите неиспользуемый код, используйте сжатие.',
                examples: 'Конвертация в WebP, tree-shaking для JS, Gzip сжатие'
            });
        }

        // Lazy loading изображений
        const totalImages = performance.optimizations?.images?.total || 0;
        const lazyImages = performance.optimizations?.images?.lazy || 0;
        if (totalImages > 0 && lazyImages / totalImages < 0.5) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Производительность',
                title: 'Мало изображений с lazy loading',
                description: `Только ${Math.round((performance.optimizations.images.lazy / performance.optimizations.images.total) * 100)}% изображений используют lazy loading.`,
                suggestion: 'Добавьте lazy loading для изображений ниже первого экрана.',
                examples: '<img src="image.jpg" loading="lazy" alt="...">'
            });
        }
    }

    addSecurityRecommendations(recs, security) {
        // HTTPS
        if (!security.https) {
            recs.push({
                priority: 'critical',
                impact: 10,
                category: 'Безопасность',
                title: 'Сайт не использует HTTPS',
                description: 'HTTP соединение не защищено и уязвимо для атак. Также негативно влияет на SEO.',
                suggestion: 'Получите и установите SSL сертификат, настройте перенаправление с HTTP на HTTPS.',
                examples: 'https://your-site.com вместо http://your-site.com'
            });
        }

        // Mixed Content
        if (security.mixedContent?.total > 0) {
            recs.push({
                priority: 'critical',
                impact: 9,
                category: 'Безопасность',
                title: 'Обнаружен Mixed Content',
                description: `Найдено ${security.mixedContent.total} ресурсов, загружаемых по HTTP на HTTPS странице.`,
                suggestion: 'Замените все HTTP ссылки на HTTPS для изображений, скриптов и стилей.',
                examples: 'https://site.com/image.jpg вместо http://site.com/image.jpg'
            });
        }

        // Security Headers
        if (!security.securityHeaders?.['content-security-policy']?.exists) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Безопасность',
                title: 'Отсутствует Content Security Policy',
                description: 'CSP защищает от XSS атак, ограничивая источники загружаемых ресурсов.',
                suggestion: 'Настройте Content Security Policy заголовок на сервере.',
                examples: "Content-Security-Policy: default-src 'self'"
            });
        }

        if (!security.securityHeaders?.['x-frame-options']?.exists) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Безопасность',
                title: 'Отсутствует X-Frame-Options',
                description: 'Заголовок защищает от clickjacking атак.',
                suggestion: 'Добавьте X-Frame-Options заголовок на сервере.',
                examples: 'X-Frame-Options: SAMEORIGIN'
            });
        }

        // Уязвимости
        if (security.vulnerabilities?.length > 0) {
            security.vulnerabilities.forEach(vuln => {
                recs.push({
                    priority: vuln.severity === 'high' ? 'critical' : 'warning',
                    impact: vuln.severity === 'high' ? 8 : 5,
                    category: 'Безопасность',
                    title: vuln.description,
                    description: vuln.recommendation,
                    suggestion: vuln.recommendation,
                    examples: vuln.type
                });
            });
        }

        // Cookies безопасность
        if (security.cookies?.total > 0 && security.cookies.secure / security.cookies.total < 0.5) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Безопасность',
                title: 'Небезопасные cookies',
                description: `Только ${Math.round((security.cookies.secure / security.cookies.total) * 100)}% cookies помечены как secure.`,
                suggestion: 'Добавьте атрибут Secure ко всем cookies, передаваемым по HTTPS.',
                examples: 'Set-Cookie: session=abc123; Secure; HttpOnly'
            });
        }
    }

    addStructureRecommendations(recs, technical) {
        // Семантическая структура
        if (!technical.structure?.header?.exists) {
            recs.push({
                priority: 'warning',
                impact: 4,
                category: 'Структура',
                title: 'Отсутствует семантический header',
                description: 'Header помогает поисковым системам понять структуру страницы.',
                suggestion: 'Используйте тег header для шапки сайта.',
                examples: '<header>Логотип и основная навигация</header>'
            });
        }

        if (!technical.structure?.main?.exists) {
            recs.push({
                priority: 'warning',
                impact: 5,
                category: 'Структура',
                title: 'Отсутствует семантический main',
                description: 'Тег main указывает на основной контент страницы.',
                suggestion: 'Оберните основной контент в тег main.',
                examples: '<main>Основной контент страницы</main>'
            });
        }

        if (!technical.structure?.footer?.exists) {
            recs.push({
                priority: 'info',
                impact: 3,
                category: 'Структура',
                title: 'Отсутствует семантический footer',
                description: 'Footer помогает завершить структуру страницы.',
                suggestion: 'Используйте тег footer для подвала сайта.',
                examples: '<footer>Контакты и дополнительная информация</footer>'
            });
        }

        // Хлебные крошки
        if (!technical.structure?.breadcrumbs?.exists) {
            recs.push({
                priority: 'info',
                impact: 4,
                category: 'Навигация',
                title: 'Отсутствуют хлебные крошки',
                description: 'Хлебные крошки улучшают навигацию и могут отображаться в поисковой выдаче.',
                suggestion: 'Добавьте навигационную цепочку хлебных крошек.',
                examples: 'Главная > Категория > Подкатегория > Товар'
            });
        }

        // Навигация
        if (!technical.structure?.nav?.exists) {
            recs.push({
                priority: 'warning',
                impact: 5,
                category: 'Навигация',
                title: 'Отсутствует семантическая навигация',
                description: 'Тег nav помогает определить основную навигацию страницы.',
                suggestion: 'Оберните основное меню навигации в тег nav.',
                examples: '<nav><ul><li><a href="/">Главная</a></li></ul></nav>'
            });
        }
    }

    addAdvancedSEORecommendations(recs, analysis) {
        const technical = analysis.technical || {};
        const content = analysis.basic?.content || {};

        // Internal Linking Structure
        if (content.links?.internal < 10) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Продвинутое SEO',
                title: 'Слабая внутренняя перелинковка',
                description: 'Мало внутренних ссылок для эффективного распределения ссылочного веса.',
                suggestion: 'Создайте стратегию внутренней перелинковки, связывая релевантные страницы.',
                examples: 'Ссылки между товарами, категориями, статьями и главными страницами'
            });
        }

        // URL Structure
        if (this.hasPoorURLStructure()) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Продвинутое SEO',
                title: 'Неоптимальная структура URL',
                description: 'URL содержат динамические параметры, нечитаемые символы или слишком длинные.',
                suggestion: 'Используйте ЧПУ (человеко-понятные URL) с ключевыми словами.',
                examples: '/category/product-name/ вместо /?id=123&cat=456'
            });
        }

        // Pagination Issues
        if (this.hasPaginationIssues()) {
            recs.push({
                priority: 'info',
                impact: 5,
                category: 'Продвинутое SEO',
                title: 'Проблемы с пагинацией',
                description: 'Отсутствуют rel=next/prev или канонические URL для страниц пагинации.',
                suggestion: 'Добавьте разметку rel=next/prev и canonical для страниц пагинации.',
                examples: '<link rel="prev" href="/page/1/">, <link rel="next" href="/page/3/">'
            });
        }

        // Rich Snippets Optimization
        if (!technical.schema?.hasProduct && this.isEcommercePage()) {
            recs.push({
                priority: 'warning',
                impact: 8,
                category: 'Продвинутое SEO',
                title: 'Отсутствует Product schema для товаров',
                description: 'Product schema может значительно улучшить отображение в поисковой выдаче.',
                suggestion: 'Добавьте Product schema с ценой, наличием, отзывами и рейтингом.',
                examples: 'JSON-LD разметка с offer, aggregateRating, review'
            });
        }

        // FAQ Schema
        if (this.hasFAQContent() && !technical.schema?.hasFAQPage) {
            recs.push({
                priority: 'info',
                impact: 6,
                category: 'Продвинутое SEO',
                title: 'Отсутствует FAQ schema',
                description: 'FAQ schema может вывести страницу в дополнительном блоке поисковой выдачи.',
                suggestion: 'Добавьте FAQPage schema для вопросов и ответов на странице.',
                examples: 'FAQPage с основнымEntity и acceptedAnswer'
            });
        }
    }

    // 🆕 USER EXPERIENCE (UX)
    addUXRecommendations(recs, analysis) {
        const performance = analysis.performance || {};
        const content = analysis.basic?.content || {};

        // Page Load Speed UX
        if (performance.loadTime > 2000) {
            recs.push({
                priority: 'warning',
                impact: 8,
                category: 'User Experience',
                title: 'Медленная загрузка влияет на пользовательский опыт',
                description: '53% пользователей покидают сайт, если загрузка занимает больше 3 секунд.',
                suggestion: 'Внедрите прогрессивную загрузку, оптимизируйте критический путь рендеринга.',
                examples: 'Lazy loading, code splitting, critical CSS inlining'
            });
        }

        // Content Layout
        if (content.textAnalysis?.avgParagraphLength > 200) {
            recs.push({
                priority: 'info',
                impact: 5,
                category: 'User Experience',
                title: 'Слишком длинные абзацы текста',
                description: 'Длинные абзацы ухудшают читаемость и удерживание внимания пользователей.',
                suggestion: 'Разбейте текст на абзацы по 3-4 предложения, используйте подзаголовки.',
                examples: 'Идеальная длина абзаца: 50-100 слов'
            });
        }

        // Visual Hierarchy
        if (!content.headings?.hasH3 && content.textAnalysis?.contentWords > 500) {
            recs.push({
                priority: 'info',
                impact: 4,
                category: 'User Experience',
                title: 'Слабая визуальная иерархия',
                description: 'Отсутствует глубокая структура заголовков для легкого сканирования контента.',
                suggestion: 'Используйте многоуровневые заголовки H2-H4 для структурирования длинного контента.',
                examples: 'H2 для разделов, H3 для подразделов, H4 для пунктов'
            });
        }

        // Call-to-Action Optimization
        if (content.links?.brokenLinks > 5) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'User Experience',
                title: 'Битые ссылки ухудшают пользовательский опыт',
                description: 'Битые ссылки создают негативное впечатление и мешают навигации.',
                suggestion: 'Регулярно проверяйте и исправляйте битые ссылки, настройте кастомную 404 страницу.',
                examples: 'Используйте инструменты для мониторинга битых ссылок'
            });
        }
    }

    addMobileRecommendations(recs, analysis) {
        const technical = analysis.technical || {};
        if (!technical.viewport?.optimal) {
            recs.push({
                priority: 'critical',
                impact: 9,
                category: 'Мобильная оптимизация',
                title: 'Неоптимальные настройки viewport',
                description: 'Viewport не настроен для мобильных устройств, что ухудшает отображение.',
                suggestion: 'Используйте правильный viewport meta tag с запретом масштабирования.',
                examples: '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">'
            });
        }

        if (this.hasSmallTouchTargets()) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Мобильная оптимизация',
                title: 'Слишком маленькие области для касания',
                description: 'Элементы меньше 44px сложно нажимать на мобильных устройствах.',
                suggestion: 'Увеличьте размер кликабельных элементов до минимум 44x44px.',
                examples: 'Кнопки, ссылки, иконки должны быть достаточно большими для пальца'
            });
        }

        if (!this.hasMobileNavigation()) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Мобильная оптимизация',
                title: 'Отсутствует адаптивное меню для мобильных',
                description: 'Навигация не адаптирована для мобильных устройств.',
                suggestion: 'Реализуйте гамбургер-меню или другое адаптивное решение навигации.',
                examples: 'Скрытое меню, выдвижные панели, bottom navigation'
            });
        }
    }

    addAccessibilityRecommendations(recs, analysis) {
        const technical = analysis.technical || {};
        const content = analysis.basic?.content || {};

        // Color Contrast
        if (this.hasPoorColorContrast()) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Доступность',
                title: 'Недостаточный контраст цветов',
                description: 'Текст плохо читается для людей с нарушениями зрения.',
                suggestion: 'Обеспечьте минимальный коэффициент контрастности 4.5:1 для обычного текста.',
                examples: 'Используйте инструменты проверки контраста (WCAG AA стандарт)'
            });
        }

        // Keyboard Navigation
        if (!this.hasProperKeyboardNavigation()) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Доступность',
                title: 'Проблемы с навигацией с клавиатуры',
                description: 'Не все элементы доступны с клавиатуры, отсутствует визуальный focus.',
                suggestion: 'Обеспечьте полную навигацию с Tab/Shift+Tab, добавьте стили для :focus.',
                examples: 'tabindex, focus styles, skip links'
            });
        }

        // Semantic HTML
        if (technical.semantic?.score < 70) {
            recs.push({
                priority: 'info',
                impact: 5,
                category: 'Доступность',
                title: 'Недостаточное использование семантических тегов',
                description: 'Семантические теги помогают скринридерам понять структуру страницы.',
                suggestion: 'Замените div на семантические теги: header, nav, main, article, section, footer.',
                examples: '<main> вместо <div class="main">, <nav> вместо <div class="menu">'
            });
        }

        // ARIA Labels
        if (!this.hasARIALabels()) {
            recs.push({
                priority: 'info',
                impact: 4,
                category: 'Доступность',
                title: 'Отсутствуют ARIA атрибуты',
                description: 'ARIA атрибуты помогают скринридерам понять назначение элементов.',
                suggestion: 'Добавьте aria-label, aria-describedby для сложных интерактивных элементов.',
                examples: 'aria-label для кнопок, aria-expanded для выпадающих меню'
            });
        }

        // Image Accessibility
        if (content.images?.altPercentage < 90) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Доступность',
                title: 'Не все изображения доступны для скринридеров',
                description: 'Изображения без alt текста не могут быть восприняты пользователями скринридеров.',
                suggestion: 'Добавьте alt тексты ко всем значимым изображениям, для декоративных используйте alt="".',
                examples: '<img src="chart.jpg" alt="График роста продаж за 2024 год">'
            });
        }
    }

        addEcommerceRecommendations(recs, analysis) {
        if (!this.isEcommercePage()) return;

        const technical = analysis.technical || {};
        const content = analysis.basic?.content || {};

        // Product Schema
        if (!technical.schema?.hasProduct) {
            recs.push({
                priority: 'critical',
                impact: 9,
                category: 'E-commerce SEO',
                title: 'Отсутствует Product schema для товаров',
                description: 'Product schema обязателен для участия в Google Shopping и улучшенных сниппетах.',
                suggestion: 'Добавьте полную Product schema с ценой, наличием, брендом, отзывами.',
                examples: '@type: Product, name, description, brand, offers, review, aggregateRating'
            });
        }

        // Price and Availability
        if (!this.hasRealTimePriceInfo()) {
            recs.push({
                priority: 'warning',
                impact: 8,
                category: 'E-commerce SEO',
                title: 'Отсутствует актуальная информация о цене и наличии',
                description: 'Поисковые системы ценят актуальные данные о товарах.',
                suggestion: 'Реализуйте динамическое обновление price и availability в schema.',
                examples: 'offers.price, offers.priceCurrency, offers.availability'
            });
        }

        // Trust Signals
        if (!this.hasTrustSignals()) {
            recs.push({
                priority: 'info',
                impact: 6,
                category: 'E-commerce SEO',
                title: 'Недостаточно сигналов доверия',
                description: 'Отсутствуют отзывы, рейтинги, гарантии, что снижает конверсию.',
                suggestion: 'Добавьте систему отзывов, рейтинги, информацию о гарантиях и возвратах.',
                examples: 'Review schema, AggregateRating, доверенные платежные системы'
            });
        }

        // Checkout Optimization
        if (this.hasComplexCheckout()) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'E-commerce UX',
                title: 'Слишком сложный процесс оформления заказа',
                description: 'Многошаговый процесс увеличивает процент отказов.',
                suggestion: 'Упростите процесс до 1-2 шагов, добавьте гостевой заказ.',
                examples: 'Одностраничное оформление, сохранение данных, быстрая оплата'
            });
        }
    }

    addInternationalSEORecommendations(recs, analysis) {
        const technical = analysis.technical || {};

        // Hreflang Implementation
        if (!technical.seo?.hreflang?.exists && this.hasMultipleLanguages()) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Международное SEO',
                title: 'Отсутствует hreflang разметка для мультиязычного сайта',
                description: 'hreflang помогает поисковым системам показывать правильную языковую версию.',
                suggestion: 'Добавьте hreflang теги для всех языковых версий страницы.',
                examples: '<link rel="alternate" hreflang="en" href="https://site.com/en/page/">'
            });
        }

        // Language Declaration
        if (!technical.language?.valid && this.hasMultipleLanguages()) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Международное SEO',
                title: 'Неполное объявление языка',
                description: 'Отсутствует правильное указание языка и региона.',
                suggestion: 'Используйте правильные коды языка и региона в атрибуте lang.',
                examples: 'lang="en-US" для американского английского, lang="en-GB" для британского'
            });
        }

        // Currency and Region
        if (this.isInternationalSite() && !this.hasCurrencyInfo()) {
            recs.push({
                priority: 'info',
                impact: 5,
                category: 'Международное SEO',
                title: 'Отсутствует информация о валютах и регионах',
                description: 'Пользователи из разных стран ожидают видеть местные цены и валюту.',
                suggestion: 'Реализуйте автоматическое определение региона и конвертацию валют.',
                examples: 'GeoIP определение, мультивалютность, локальные цены'
            });
        }
    }

    addTechnicalDebtRecommendations(recs, analysis) {
        const performance = analysis.performance || {};

        // JavaScript Optimization
        if (performance.scripts?.sync > 5) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Технический долг',
                title: 'Слишком много синхронных скриптов',
                description: 'Синхронные скрипты блокируют парсинг и рендеринг страницы.',
                suggestion: 'Переведите скрипты на async/defer, объедините мелкие файлы.',
                examples: '<script async src="...">, <script defer src="...">'
            });
        }

        // CSS Optimization
        if (performance.styles?.external > 3) {
            recs.push({
                priority: 'info',
                impact: 5,
                category: 'Технический долг',
                title: 'Много внешних CSS файлов',
                description: 'Множественные CSS запросы увеличивают время загрузки.',
                suggestion: 'Объедините CSS файлы, используйте critical CSS inline.',
                examples: 'Объединение в 1-2 файла, inline critical CSS, остальное async'
            });
        }

        // Legacy Code
        if (this.hasLegacyCode()) {
            recs.push({
                priority: 'info',
                impact: 4,
                category: 'Технический долг',
                title: 'Обнаружен устаревший код',
                description: 'Устаревшие библиотеки и методы могут вызывать проблемы с безопасностью и производительностью.',
                suggestion: 'Планируйте миграцию на современные технологии и фреймворки.',
                examples: 'jQuery → современный JS, табличная верстка → CSS Grid/Flexbox'
            });
        }

        // Code Maintainability
        if (this.hasMaintainabilityIssues()) {
            recs.push({
                priority: 'info',
                impact: 4,
                category: 'Технический долг',
                title: 'Проблемы с поддерживаемостью кода',
                description: 'Сложная структура кода затрудняет дальнейшую разработку и поддержку.',
                suggestion: 'Рефакторинг кода, внедрение coding standards, модульная архитектура.',
                examples: 'Компонентный подход, единый стиль кода, документация'
            });
        }
    }

    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ НОВЫХ ПРОВЕРОК
    hasPoorURLStructure() {
        const url = window.location.href;
        return url.includes('?') && 
               (url.includes('id=') || url.includes('page=') || url.length > 100);
    }

    hasPaginationIssues() {
        return document.querySelector('.pagination') && 
               !document.querySelector('link[rel="prev"], link[rel="next"]');
    }

    isEcommercePage() {
        return document.querySelector('.product, .price, .add-to-cart') !== null ||
               window.location.pathname.includes('/product/') ||
               document.body.innerHTML.includes('$') ||
               document.body.innerHTML.includes('₽');
    }

    hasFAQContent() {
        return document.querySelector('.faq, .question, .answer') !== null ||
               document.body.innerHTML.match(/вопрос|ответ|faq/i);
    }

    hasSmallTouchTargets() {
        const buttons = document.querySelectorAll('button, a, [onclick]');
        let smallTargets = 0;
        buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) smallTargets++;
        });
        return smallTargets > buttons.length * 0.3;
    }

    hasMobileNavigation() {
        return document.querySelector('.mobile-nav, .hamburger, [aria-label="mobile menu"]') !== null ||
               window.getComputedStyle(document.querySelector('nav') || {}).display === 'none';
    }

    hasPoorColorContrast() {
        // Простая проверка - можно расширить с помощью Accessibility API
        const styles = getComputedStyle(document.body);
        return styles.backgroundColor === styles.color; // Упрощенная проверка
    }

    hasProperKeyboardNavigation() {
        return document.querySelector('a, button, input, [tabindex]') !== null;
    }

    hasARIALabels() {
        return document.querySelector('[aria-label], [aria-describedby], [role]') !== null;
    }

    hasMultipleLanguages() {
        return document.querySelector('[hreflang], .language-switcher') !== null ||
               document.documentElement.lang !== 'ru';
    }

    isInternationalSite() {
        return window.location.hostname.includes('.com') || 
               document.querySelector('.currency-selector') !== null;
    }

    hasCurrencyInfo() {
        return document.querySelector('.price, .currency') !== null;
    }

    hasRealTimePriceInfo() {
        return document.querySelector('[data-price], .dynamic-price') !== null;
    }

    hasTrustSignals() {
        return document.querySelector('.reviews, .ratings, .guarantee, .trust-badge') !== null;
    }

    hasComplexCheckout() {
        return document.querySelector('.checkout-step, .multi-step') !== null;
    }

    hasLegacyCode() {
        return typeof jQuery !== 'undefined' ||
               document.querySelector('[style*="font"]') !== null || // Устаревшие inline стили
               document.querySelector('table[width]') !== null; // Табличная верстка
    }

    hasMaintainabilityIssues() {
        const scripts = document.querySelectorAll('script');
        let inlineScripts = 0;
        scripts.forEach(script => {
            if (!script.src && script.textContent.length > 100) inlineScripts++;
        });
        return inlineScripts > 3;
    }

}