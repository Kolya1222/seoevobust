export default class BasicSectionRenderer {
    render(basic) {
        const data = basic?.basic || {};
        const {
            title = {},
            description = {},
            h1 = {},
            viewport = {},
            charset = {},
            lang = {},
            canonical = {},
            robots = {},
            headings = {},
            favicon = {}
        } = data;

        return `
            <h4>📊 Базовые SEO элементы</h4>
            <div class="metrics-grid">
                ${this.renderMetricCard('Заголовок', title.exists ? '✅' : '❌', 
                    `${title.length || 0} символов`, title.value || 'Не задан', 
                    title.exists && title.optimal)}
                
                ${this.renderMetricCard('Описание', description.exists ? '✅' : '❌',
                    `${description.length || 0} символов`, description.value || 'Не задан',
                    description.exists && description.optimal)}
                
                ${this.renderMetricCard('H1 заголовки', h1.count || 0,
                    h1.optimal ? 'Оптимально' : 'Не оптимально', 
                    h1.titles?.join('; ') || 'Нет', h1.optimal)}
                
                ${this.renderMetricCard('Viewport', viewport.exists ? '✅' : '❌',
                    '', viewport.value || 'Не задан', viewport.exists)}
                
                ${this.renderMetricCard('Кодировка', charset.exists ? '✅' : '❌',
                    '', charset.value || 'Не задана', charset.exists)}
                
                ${this.renderMetricCard('Язык', lang.exists ? '✅' : '❌',
                    '', lang.value || 'Не задан', lang.exists)}
                
                ${this.renderMetricCard('Canonical', canonical.exists ? '✅' : '❌',
                    '', canonical.value || 'Не задана', canonical.exists)}
                
                ${this.renderMetricCard('Robots', robots.exists ? '✅' : '❌',
                    robots.allowsIndexing ? 'Индексация разрешена' : 'Индексация запрещена',
                    robots.value || 'Не задан', robots.exists && robots.allowsIndexing)}
                
                ${this.renderMetricCard('Favicon', favicon.exists ? '✅' : '❌',
                    '', favicon.value || 'Не задана', favicon.exists)}
            </div>
            
            ${this.renderHeadingsSection(headings)}
        `;
    }

    renderMetricCard(label, value, details, seoValue, isGood) {
        const className = isGood ? 'good' : (value === '❌' || value === 0 ? 'bad' : 'warning');
        return `
            <div class="metric-card ${className}">
                <div class="metric-value">${value}</div>
                <div class="metric-label">${label}</div>
                ${details ? `<div class="metric-details">${details}</div>` : ''}
                ${seoValue ? `<div class="seo-value">${seoValue}</div>` : ''}
            </div>
        `;
    }

    renderHeadingsSection(headings) {
        if (!headings || Object.keys(headings).length === 0) {
            return '';
        }

        let headingsHtml = `
            <div class="headings-section">
                <h5>📑 Структура заголовков</h5>
                <div class="headings-grid">
        `;

        for (let i = 1; i <= 6; i++) {
            const heading = headings[`h${i}`] || { count: 0, titles: [] };
            const isOptimal = this.isHeadingLevelOptimal(i, heading.count);
            
            headingsHtml += `
                <div class="heading-level ${isOptimal ? 'optimal' : 'not-optimal'}">
                    <div class="heading-header">
                        <span class="heading-tag">H${i}</span>
                        <span class="heading-count">${heading.count} шт</span>
                    </div>
                    ${heading.titles.length > 0 ? `
                        <div class="heading-titles">
                            ${heading.titles.map(title => 
                                `<div class="heading-title">${this.truncateText(title, 50)}</div>`
                            ).join('')}
                        </div>
                    ` : '<div class="no-headings">Нет заголовков</div>'}
                </div>
            `;
        }

        headingsHtml += `
                </div>
            </div>
        `;

        return headingsHtml;
    }

    isHeadingLevelOptimal(level, count) {
        // H1 должен быть один, остальные уровни могут быть в разумных количествах
        if (level === 1) return count === 1;
        if (level === 2) return count <= 10; // До 10 H2 - нормально
        if (level === 3) return count <= 20; // До 20 H3 - нормально
        return count <= 30; // Для H4-H6 более либеральные ограничения
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}