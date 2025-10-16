export default class RecommendationsRenderer {
    render(analysis) {
        const recommendations = this.generateRecommendations(analysis);
        
        // Группируем рекомендации по приоритету
        const criticalRecs = recommendations.filter(rec => rec.priority === 'critical');
        const warningRecs = recommendations.filter(rec => rec.priority === 'warning');
        const infoRecs = recommendations.filter(rec => rec.priority === 'info');
        
        let html = '<h4>💡 Рекомендации по улучшению SEO</h4>';
        
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
                ${rec.examples ? `
                    <div class="rec-examples">
                        <strong>Примеры:</strong> ${rec.examples}
                    </div>
                ` : ''}
                ${rec.category ? `<div class="rec-category">Категория: ${rec.category}</div>` : ''}
            </div>
        `;
    }

    renderScoreSummary(analysis) {
        const scores = {
            basic: analysis.basic?.basic?.score || 0,
            content: analysis.basic?.content?.score || 0,
            technical: analysis.technical?.structure?.score || 0
        };
        
        const totalScore = Math.round((scores.basic + scores.content + scores.technical) / 3);
        
        return `
            <div class="score-summary">
                <h5>📊 Сводка по баллам</h5>
                <div class="score-breakdown">
                    <div class="score-item">
                        <span class="score-label">Базовое SEO:</span>
                        <span class="score-value ${scores.basic >= 70 ? 'good' : scores.basic >= 50 ? 'warning' : 'bad'}">
                            ${scores.basic}%
                        </span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Контент:</span>
                        <span class="score-value ${scores.content >= 70 ? 'good' : scores.content >= 50 ? 'warning' : 'bad'}">
                            ${scores.content}%
                        </span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Техническое SEO:</span>
                        <span class="score-value ${scores.technical >= 70 ? 'good' : scores.technical >= 50 ? 'warning' : 'bad'}">
                            ${scores.technical}%
                        </span>
                    </div>
                    <div class="score-item total">
                        <span class="score-label">Общий балл:</span>
                        <span class="score-value ${totalScore >= 70 ? 'good' : totalScore >= 50 ? 'warning' : 'bad'}">
                            ${totalScore}%
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

        // Базовые SEO рекомендации
        this.addBasicSEORecommendations(recs, basic);
        
        // Контент рекомендации
        this.addContentRecommendations(recs, content);
        
        // Технические рекомендации
        this.addTechnicalRecommendations(recs, technical);
        
        // Производительность
        this.addPerformanceRecommendations(recs, performance);
        
        // Структура и доступность
        this.addStructureRecommendations(recs, technical);
        
        // Сортировка по приоритету и влиянию
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
        if (content.text?.textAnalysis?.contentWords < 300) {
            recs.push({
                priority: 'warning',
                impact: 7,
                category: 'Контент',
                title: 'Недостаточно текстового контента',
                description: `На странице всего ${content.text.textAnalysis.contentWords} слов контента. Рекомендуется минимум 300 слов для хорошего SEO.`,
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
        // Lazy loading изображений
        if (performance.images?.lazyPercentage < 50) {
            recs.push({
                priority: 'warning',
                impact: 6,
                category: 'Производительность',
                title: 'Мало изображений с lazy loading',
                description: `Только ${performance.images.lazyPercentage}% изображений используют lazy loading. Это замедляет загрузку страницы.`,
                suggestion: 'Добавьте lazy loading для изображений ниже первого экрана.',
                examples: '<img src="image.jpg" loading="lazy" alt="...">'
            });
        }

        // Оптимизация скриптов
        if (performance.scripts?.async + performance.scripts?.defer < performance.scripts?.external / 2) {
            recs.push({
                priority: 'warning',
                impact: 5,
                category: 'Производительность',
                title: 'Неоптимизированные внешние скрипты',
                description: 'Большинство внешних скриптов блокируют загрузку страницы.',
                suggestion: 'Добавьте async или defer атрибуты к некритичным скриптам.',
                examples: '<script src="analytics.js" async></script>'
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
                suggestion: 'Используйте тег <header> для шапки сайта.',
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
                suggestion: 'Оберните основной контент в тег <main>.',
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
                suggestion: 'Используйте тег <footer> для подвала сайта.',
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
    }
}