export default class TechnicalSectionRenderer {
    render(technical) {
        const structure = technical?.structure || {};
        const schema = technical?.schema || {};
        const performance = technical?.performance || {};
        const security = technical?.security || {};
        const metaTags = technical?.metaTags || {};
        const scripts = technical?.scripts || {};
        const links = technical?.links || {};
        const accessibility = technical?.accessibility || {};
        const seo = technical?.seo || {};

        return `
            <h4>⚙️ Расширенный технический анализ</h4>
            
            <!-- Основные метрики -->
            <div class="metrics-grid">
                ${this.renderMetricCard('Структура', structure.score + '%', 'HTML5 семантика', structure.score > 70)}
                ${this.renderMetricCard('Schema', schema.count, `${schema.validCount} валидных`, schema.count > 0)}
                ${this.renderMetricCard('Производительность', performance.scripts.async, 'Async скрипты', performance.scripts.async > 0)}
                ${this.renderMetricCard('Безопасность', security.forms.secure, 'HTTPS формы', security.forms.secure === security.forms.count)}
                ${this.renderMetricCard('Доступность', Math.round((accessibility.images.withAlt / accessibility.images.total) * 100) + '%', 'ALT теги', accessibility.images.withAlt > 0)}
                ${this.renderMetricCard('SEO', seo.canonical.exists ? '✅' : '❌', 'Canonical', seo.canonical.exists)}
            </div>
            
            <!-- Детальные секции -->
            <div class="technical-sections">
                ${this.renderStructureSection(structure)}
                ${this.renderSchemaSection(schema)}
                ${this.renderPerformanceSection(performance)}
                ${this.renderSecuritySection(security)}
                ${this.renderMetaTagsSection(metaTags)}
                ${this.renderScriptsSection(scripts)}
                ${this.renderLinksSection(links)}
                ${this.renderAccessibilitySection(accessibility)}
                ${this.renderSEOSection(seo)}
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

    renderStructureSection(structure) {
        return `
            <div class="section-card">
                <h5>🏗️ Структура HTML5</h5>
                <div class="structure-grid">
                    <div class="structure-item ${structure.header.exists ? 'good' : 'bad'}">
                        <span class="structure-icon">${structure.header.exists ? '✅' : '❌'}</span>
                        <span class="structure-label">Header</span>
                        ${structure.header.hasH1 ? '<span class="structure-badge">H1</span>' : ''}
                        ${structure.header.hasNav ? '<span class="structure-badge">Nav</span>' : ''}
                    </div>
                    <div class="structure-item ${structure.main.exists ? 'good' : 'bad'}">
                        <span class="structure-icon">${structure.main.exists ? '✅' : '❌'}</span>
                        <span class="structure-label">Main</span>
                        ${structure.main.hasH1 ? '<span class="structure-badge">H1</span>' : ''}
                        ${structure.main.hasArticle ? '<span class="structure-badge">Article</span>' : ''}
                    </div>
                    <div class="structure-item ${structure.footer.exists ? 'good' : 'bad'}">
                        <span class="structure-icon">${structure.footer.exists ? '✅' : '❌'}</span>
                        <span class="structure-label">Footer</span>
                        ${structure.footer.hasLinks ? '<span class="structure-badge">Links</span>' : ''}
                        ${structure.footer.hasSocial ? '<span class="structure-badge">Social</span>' : ''}
                    </div>
                    <div class="structure-item ${structure.nav.exists ? 'good' : 'bad'}">
                        <span class="structure-icon">${structure.nav.exists ? '✅' : '❌'}</span>
                        <span class="structure-label">Navigation</span>
                        <span class="structure-count">${structure.nav.count}</span>
                    </div>
                </div>
                
                <div class="semantic-elements">
                    <h6>Семантические элементы:</h6>
                    <div class="semantic-tags">
                        ${Object.entries(structure.semantic || {}).map(([tag, count]) => `
                            <span class="semantic-tag ${count > 0 ? 'has-content' : 'no-content'}">
                                ${tag}: <strong>${count}</strong>
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                ${structure.breadcrumbs.exists ? `
                    <div class="breadcrumbs-info good">
                        ✅ Breadcrumbs найдены (${structure.breadcrumbs.elements} элементов)
                    </div>
                ` : '<div class="breadcrumbs-info bad">❌ Breadcrumbs не найдены</div>'}
            </div>
        `;
    }

    renderSchemaSection(schema) {
        return `
            <div class="section-card">
                <h5>🎯 Schema.org разметка</h5>
                <div class="schema-stats">
                    <div class="schema-metric">
                        <span class="metric-label">Всего схем:</span>
                        <span class="metric-value">${schema.count}</span>
                    </div>
                    <div class="schema-metric">
                        <span class="metric-label">Валидных:</span>
                        <span class="metric-value ${schema.coverage > 80 ? 'good' : 'warning'}">${schema.coverage}%</span>
                    </div>
                    <div class="schema-metric">
                        <span class="metric-label">Разнообразие:</span>
                        <span class="metric-value">${schema.diversity} типов</span>
                    </div>
                </div>
                
                ${schema.count > 0 ? `
                    <div class="schema-types">
                        <h6>Найденные типы:</h6>
                        <div class="type-badges">
                            ${schema.hasOrganization ? '<span class="type-badge good">Organization</span>' : ''}
                            ${schema.hasWebsite ? '<span class="type-badge good">WebSite</span>' : ''}
                            ${schema.hasBreadcrumb ? '<span class="type-badge good">Breadcrumb</span>' : ''}
                            ${schema.hasArticle ? '<span class="type-badge good">Article</span>' : ''}
                            ${schema.hasProduct ? '<span class="type-badge good">Product</span>' : ''}
                            ${schema.hasLocalBusiness ? '<span class="type-badge good">LocalBusiness</span>' : ''}
                        </div>
                    </div>
                    
                    ${schema.foundCommonTypes && schema.foundCommonTypes.length > 0 ? `
                        <div class="found-types">
                            <small>Обнаружены: ${schema.foundCommonTypes.join(', ')}</small>
                        </div>
                    ` : ''}
                    
                    <div class="schemas-list">
                        ${schema.schemas.map((item, index) => `
                            <div class="schema-item ${item.valid ? 'valid' : 'invalid'}">
                                <div class="schema-header">
                                    <span class="schema-type">${item.type}</span>
                                    <span class="schema-status">${item.valid ? '✅' : '❌'}</span>
                                </div>
                                ${item.data && Object.keys(item.data).length > 0 ? `
                                    <div class="schema-data">
                                        ${Object.entries(item.data).map(([key, value]) => `
                                            <div class="schema-field">
                                                <span class="field-name">${key}:</span>
                                                <span class="field-value">${this.truncateText(String(value), 50)}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="no-data">Schema разметка не найдена</div>'}
            </div>
        `;
    }

    renderPerformanceSection(performance) {
        return `
            <div class="section-card">
                <h5>⚡ Производительность</h5>
                <div class="performance-grid">
                    <div class="perf-category">
                        <h6>Скрипты (${performance.scripts.count})</h6>
                        <div class="perf-stats">
                            <div>Async: <strong>${performance.scripts.async}</strong></div>
                            <div>Defer: <strong>${performance.scripts.defer}</strong></div>
                            <div>Внешние: <strong>${performance.scripts.external}</strong></div>
                        </div>
                    </div>
                    <div class="perf-category">
                        <h6>Стили (${performance.styles.count})</h6>
                        <div class="perf-stats">
                            <div>Inline: <strong>${performance.styles.inline}</strong></div>
                            <div>Внешние: <strong>${performance.styles.external}</strong></div>
                        </div>
                    </div>
                    <div class="perf-category">
                        <h6>Изображения (${performance.images.count})</h6>
                        <div class="perf-stats">
                            <div>С размерами: <strong>${performance.images.withDimensions}</strong></div>
                            <div>Lazy: <strong>${performance.images.lazy}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSecuritySection(security) {
        return `
            <div class="section-card">
                <h5>🛡️ Безопасность</h5>
                <div class="security-items">
                    <div class="security-item ${security.csp.exists ? 'good' : 'warning'}">
                        <span class="security-icon">${security.csp.exists ? '✅' : '⚠️'}</span>
                        <span class="security-label">Content Security Policy</span>
                    </div>
                    <div class="security-item ${security.forms.secure === security.forms.count ? 'good' : 'warning'}">
                        <span class="security-icon">${security.forms.secure === security.forms.count ? '✅' : '⚠️'}</span>
                        <span class="security-label">Безопасные формы</span>
                        <span class="security-details">${security.forms.secure}/${security.forms.count}</span>
                    </div>
                    <div class="security-item ${security.externalScripts.count < 5 ? 'good' : 'warning'}">
                        <span class="security-icon">${security.externalScripts.count < 5 ? '✅' : '⚠️'}</span>
                        <span class="security-label">Внешние скрипты</span>
                        <span class="security-details">${security.externalScripts.count}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderMetaTagsSection(metaTags) {
        const hasSocialMeta = metaTags.hasOG || metaTags.hasTwitter;
        
        return `
            <div class="section-card">
                <h5>📱 Мета-теги</h5>
                <div class="meta-status">
                    <div class="meta-item ${metaTags.hasOG ? 'good' : 'warning'}">
                        Open Graph: <strong>${metaTags.hasOG ? '✅' : '❌'}</strong>
                    </div>
                    <div class="meta-item ${metaTags.hasTwitter ? 'good' : 'warning'}">
                        Twitter Cards: <strong>${metaTags.hasTwitter ? '✅' : '❌'}</strong>
                    </div>
                </div>
                
                ${hasSocialMeta ? `
                    <div class="meta-preview">
                        <h6>Социальные мета-теги:</h6>
                        ${metaTags.openGraph.title ? `<div><strong>Title:</strong> ${this.truncateText(metaTags.openGraph.title, 60)}</div>` : ''}
                        ${metaTags.openGraph.description ? `<div><strong>Description:</strong> ${this.truncateText(metaTags.openGraph.description, 100)}</div>` : ''}
                        ${metaTags.openGraph.image ? `<div><strong>Image:</strong> ${this.truncateText(metaTags.openGraph.image, 50)}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderScriptsSection(scripts) {
        return `
            <div class="section-card">
                <h5>📜 Скрипты</h5>
                <div class="scripts-stats">
                    <div class="script-stat">
                        <span class="stat-label">Всего:</span>
                        <span class="stat-value">${scripts.total}</span>
                    </div>
                    <div class="script-stat">
                        <span class="stat-label">Inline:</span>
                        <span class="stat-value">${scripts.inline}</span>
                    </div>
                    <div class="script-stat">
                        <span class="stat-label">Внешние:</span>
                        <span class="stat-value">${scripts.external}</span>
                    </div>
                    <div class="script-stat">
                        <span class="stat-label">Async/Defer:</span>
                        <span class="stat-value ${scripts.async + scripts.defer > 0 ? 'good' : 'warning'}">
                            ${scripts.async + scripts.defer}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderLinksSection(links) {
        return `
            <div class="section-card">
                <h5>🔗 Технические ссылки</h5>
                <div class="links-stats">
                    <div class="link-stat ${links.hasCanonical ? 'good' : 'warning'}">
                        Canonical: <strong>${links.hasCanonical ? '✅' : '❌'}</strong>
                    </div>
                    <div class="link-stat ${links.hasPreload ? 'good' : 'warning'}">
                        Preload: <strong>${links.hasPreload ? '✅' : '❌'}</strong>
                    </div>
                    <div class="link-stat ${links.hasPreconnect ? 'good' : 'warning'}">
                        Preconnect: <strong>${links.hasPreconnect ? '✅' : '❌'}</strong>
                    </div>
                </div>
                
                ${Object.keys(links.types || {}).length > 0 ? `
                    <div class="link-types">
                        <h6>Типы ссылок:</h6>
                        <div class="type-tags">
                            ${Object.entries(links.types).map(([type, items]) => `
                                <span class="type-tag">
                                    ${type}: <strong>${items.length}</strong>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderAccessibilitySection(accessibility) {
        const altPercentage = Math.round((accessibility.images.withAlt / accessibility.images.total) * 100) || 0;
        const labelPercentage = Math.round((accessibility.forms.withLabels / accessibility.forms.total) * 100) || 0;
        
        return `
            <div class="section-card">
                <h5>♿ Доступность</h5>
                <div class="a11y-stats">
                    <div class="a11y-stat ${altPercentage > 80 ? 'good' : 'warning'}">
                        <span class="a11y-label">ALT теги:</span>
                        <span class="a11y-value">${altPercentage}%</span>
                        <span class="a11y-details">${accessibility.images.withAlt}/${accessibility.images.total}</span>
                    </div>
                    <div class="a11y-stat ${labelPercentage > 80 ? 'good' : 'warning'}">
                        <span class="a11y-label">Labels форм:</span>
                        <span class="a11y-value">${labelPercentage}%</span>
                        <span class="a11y-details">${accessibility.forms.withLabels}/${accessibility.forms.total}</span>
                    </div>
                </div>
                
                <div class="a11y-landmarks">
                    <h6>Лендмарки:</h6>
                    <div class="landmark-tags">
                        ${accessibility.landmarks.hasMain ? '<span class="landmark-tag good">main</span>' : '<span class="landmark-tag bad">main</span>'}
                        ${accessibility.landmarks.hasHeader ? '<span class="landmark-tag good">header</span>' : '<span class="landmark-tag bad">header</span>'}
                        ${accessibility.landmarks.hasFooter ? '<span class="landmark-tag good">footer</span>' : '<span class="landmark-tag bad">footer</span>'}
                        ${accessibility.landmarks.hasNav ? '<span class="landmark-tag good">nav</span>' : '<span class="landmark-tag bad">nav</span>'}
                    </div>
                </div>
            </div>
        `;
    }

    renderSEOSection(seo) {
        return `
            <div class="section-card">
                <h5>🔍 Техническое SEO</h5>
                <div class="seo-items">
                    <div class="seo-item ${seo.canonical.exists ? 'good' : 'warning'}">
                        <span class="seo-icon">${seo.canonical.exists ? '✅' : '❌'}</span>
                        <span class="seo-label">Canonical URL</span>
                        ${seo.canonical.exists ? `
                            <div class="seo-details ${seo.canonical.matchesCurrent ? 'good' : 'warning'}">
                                ${seo.canonical.matchesCurrent ? '✓ Совпадает' : '✗ Не совпадает'}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="seo-item ${seo.robots.allowsIndex ? 'good' : 'warning'}">
                        <span class="seo-icon">${seo.robots.allowsIndex ? '✅' : '❌'}</span>
                        <span class="seo-label">Индексация</span>
                        <span class="seo-details">${seo.robots.allowsIndex ? 'Разрешена' : 'Запрещена'}</span>
                    </div>
                    
                    <div class="seo-item ${seo.hreflang.exists ? 'good' : 'warning'}">
                        <span class="seo-icon">${seo.hreflang.exists ? '✅' : '❌'}</span>
                        <span class="seo-label">Hreflang</span>
                        <span class="seo-details">${seo.hreflang.count} тегов</span>
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