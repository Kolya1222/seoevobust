export default class ContentSectionRenderer {
    render(content, meta) {
        const images = content?.images || {};
        const links = content?.links || {};
        const textAnalysis = content?.text?.textAnalysis || {};
        const headings = content?.headings || {};
        const readability = content?.readability || {};
        const keywords = content?.keywords || {};
        const multimedia = content?.multimedia || {};
        const structure = content?.structure || {};

        return `
            <h4>📝 Расширенный анализ контента</h4>
            
            <!-- Основная статистика -->
            <div class="content-stats">
                <div class="stat-item">
                    <div class="stat-value">${textAnalysis.contentWords || 0}</div>
                    <div class="stat-label">Слов контента</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${textAnalysis.readingTime || 0} мин</div>
                    <div class="stat-label">Время чтения</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${readability.score || 0}/100</div>
                    <div class="stat-label">Читаемость</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${content?.score || 0}%</div>
                    <div class="stat-label">Общий балл</div>
                </div>
            </div>
            
            <!-- Основные метрики -->
            <div class="metrics-grid">
                ${this.renderMetricCard('Изображения с ALT', `${images.altPercentage || 0}%`, 
                    `${images.withAlt || 0}/${images.total || 0}`, images.altPercentage > 80)}
                
                ${this.renderMetricCard('Lazy Loading', `${images.lazyPercentage || 0}%`, 
                    `${images.lazyLoaded || 0}/${images.total || 0}`, images.lazyPercentage > 50)}
                
                ${this.renderMetricCard('Ссылки с title', `${links.titlePercentage || 0}%`, 
                    `${links.withTitle || 0}/${links.total || 0}`, links.titlePercentage > 50)}
                
                ${this.renderMetricCard('Битые ссылки', `${links.brokenPercentage || 0}%`, 
                    `${links.brokenLinks || 0}/${links.total || 0}`, links.brokenPercentage < 10)}
                
                ${this.renderMetricCard('H2 заголовки', headings.h2?.count || 0, 
                    'Структурные элементы', headings.h2?.count > 0)}
                
                ${this.renderMetricCard('Внутренние ссылки', links.internal || 0, 
                    `${Math.round((links.internal / links.total) * 100) || 0}% от всех`, links.internal > 0)}
            </div>
            
            <!-- Детальные секции -->
            <div class="detailed-sections">
                ${this.renderHeadingsSection(headings)}
                ${this.renderReadabilitySection(readability, textAnalysis)}
                ${this.renderLinksSection(links)}
                ${this.renderImagesSection(images)}
                ${this.renderKeywordsSection(keywords)}
                ${this.renderMultimediaSection(multimedia)}
                ${this.renderStructureSection(structure)}
            </div>
            
            ${this.renderOpenGraphSection(meta)}
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

    renderHeadingsSection(headings) {
        if (!headings.hierarchy || headings.hierarchy.length === 0) {
            return '<div class="section-card warning">Нет заголовков на странице</div>';
        }

        let html = `
            <div class="section-card">
                <h5>📑 Иерархия заголовков</h5>
                <div class="headings-hierarchy ${headings.validHierarchy ? 'valid' : 'invalid'}">
                    <div class="hierarchy-status">
                        ${headings.validHierarchy ? '✅ Правильная иерархия' : '⚠️ Нарушена иерархия'}
                    </div>
                    <div class="hierarchy-levels">
        `;

        headings.hierarchy.forEach(level => {
            const heading = headings[level];
            html += `
                <div class="hierarchy-item">
                    <span class="level-tag">${level.toUpperCase()}</span>
                    <span class="level-count">${heading.count} шт</span>
                    <span class="level-avg">~${heading.avgLength} симв.</span>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    renderReadabilitySection(readability, textAnalysis) {
        return `
            <div class="section-card">
                <h5>📖 Анализ читаемости</h5>
                <div class="readability-info">
                    <div class="readability-score ${readability.score > 60 ? 'good' : 'warning'}">
                        <div class="score-value">${readability.score}/100</div>
                        <div class="score-label">${readability.level}</div>
                    </div>
                    <div class="readability-details">
                        <div>Средняя длина предложения: <strong>${readability.avgWordsPerSentence} слов</strong></div>
                        <div>Средняя длина слова: <strong>${readability.avgCharsPerWord} симв.</strong></div>
                        <div>Абзацев: <strong>${textAnalysis.paragraphs || 0}</strong></div>
                        <div>Предложений: <strong>${textAnalysis.sentences || 0}</strong></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLinksSection(links) {
        return `
            <div class="section-card">
                <h5>🔗 Анализ ссылок</h5>
                <div class="links-distribution">
                    <div class="link-type">
                        <span class="type-label">Внутренние:</span>
                        <span class="type-value">${links.internal || 0} (${Math.round((links.internal / links.total) * 100) || 0}%)</span>
                    </div>
                    <div class="link-type">
                        <span class="type-label">Внешние:</span>
                        <span class="type-value">${links.external || 0} (${Math.round((links.external / links.total) * 100) || 0}%)</span>
                    </div>
                    <div class="link-type">
                        <span class="type-label">Nofollow:</span>
                        <span class="type-value">${links.withRel || 0} (${links.nofollowPercentage || 0}%)</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderImagesSection(images) {
        const formats = Object.entries(images.formats || {})
            .map(([format, count]) => `${format}: ${count}`)
            .join(', ');

        return `
            <div class="section-card">
                <h5>🖼️ Анализ изображений</h5>
                <div class="images-stats">
                    <div>Всего: <strong>${images.total || 0}</strong></div>
                    <div>С размерами: <strong>${images.withDimensions || 0} (${images.dimensionsPercentage || 0}%)</strong></div>
                    <div>Большие изображения: <strong>${images.largeImages || 0}</strong></div>
                    <div>Форматы: <strong>${formats || 'Не определены'}</strong></div>
                </div>
            </div>
        `;
    }

    renderKeywordsSection(keywords) {
        const topWords = keywords.topWords?.slice(0, 5) || [];
        
        return `
            <div class="section-card">
                <h5>🔤 Ключевые слова</h5>
                <div class="keywords-list">
                    ${topWords.length > 0 ? 
                        topWords.map(word => `
                            <div class="keyword-item">
                                <span class="keyword">${word.word}</span>
                                <span class="keyword-count">${word.count}</span>
                            </div>
                        `).join('') :
                        '<div class="no-data">Недостаточно данных для анализа</div>'
                    }
                </div>
                <div class="keywords-meta">
                    Уникальных слов: ${keywords.uniqueWords || 0}
                </div>
            </div>
        `;
    }

    renderMultimediaSection(multimedia) {
        if (multimedia.videos === 0 && multimedia.audios === 0 && multimedia.iframes === 0) {
            return '';
        }

        return `
            <div class="section-card">
                <h5>🎬 Мультимедиа</h5>
                <div class="multimedia-stats">
                    <div>Видео: <strong>${multimedia.videos || 0}</strong></div>
                    <div>Аудио: <strong>${multimedia.audios || 0}</strong></div>
                    <div>Встроенный контент: <strong>${multimedia.iframes || 0}</strong></div>
                </div>
            </div>
        `;
    }

    renderStructureSection(structure) {
        const semanticElements = Object.entries(structure.semantic || {})
            .filter(([_, count]) => count > 0)
            .map(([tag, count]) => `${tag}: ${count}`)
            .join(', ');

        return `
            <div class="section-card">
                <h5>🏗️ Структура страницы</h5>
                <div class="structure-elements">
                    <div class="structure-item">
                        <span>Header:</span> <strong>${structure.header}</strong>
                    </div>
                    <div class="structure-item">
                        <span>Main:</span> <strong>${structure.main}</strong>
                    </div>
                    <div class="structure-item">
                        <span>Footer:</span> <strong>${structure.footer}</strong>
                    </div>
                    <div class="structure-item">
                        <span>Breadcrumbs:</span> <strong>${structure.breadcrumbs?.exists ? '✅' : '❌'}</strong>
                    </div>
                </div>
                ${semanticElements ? `
                    <div class="semantic-elements">
                        Семантические теги: <strong>${semanticElements}</strong>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderOpenGraphSection(meta) {
        if (!meta?.og || Object.keys(meta.og).length === 0) {
            return '<div class="section-card warning">Open Graph теги не найдены</div>';
        }

        return `
            <div class="section-card">
                <h5>📱 Open Graph теги</h5>
                <div class="og-tags">
                    ${Object.entries(meta.og).map(([key, value]) => `
                        <div class="og-tag">
                            <span class="og-key">${key}:</span>
                            <span class="og-value">${value || 'Не задан'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}