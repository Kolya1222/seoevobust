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

        // Безопасные вложенные объекты
        const safePerformance = {
            scripts: performance.scripts || { count: 0, async: 0, defer: 0, external: 0 },
            styles: performance.styles || { count: 0, inline: 0, external: 0 },
            images: performance.images || { count: 0, withDimensions: 0, lazy: 0 }
        };

        const safeSecurity = {
            csp: security.csp || { exists: false, value: '' },
            forms: security.forms || { secure: 0, count: 0 },
            externalScripts: security.externalScripts || { count: 0 }
        };

        const safeAccessibility = {
            images: accessibility.images || { withAlt: 0, total: 1 },
            forms: accessibility.forms || { withLabels: 0, total: 1 },
            landmarks: accessibility.landmarks || { hasMain: false, hasHeader: false, hasFooter: false, hasNav: false }
        };

        const safeSeo = {
            canonical: seo.canonical || { exists: false, matchesCurrent: false },
            robots: seo.robots || { exists: false, allowsIndex: true, allowsFollow: true },
            hreflang: seo.hreflang || { exists: false, count: 0 }
        };

        return `
            <h4>Расширенный технический анализ</h4>
            
            <!-- Основные метрики -->
            <div class="metrics-grid">
                ${this.renderMetricCard('Структура', (structure.score || 0) + '%', 'HTML5 семантика', (structure.score || 0) > 70)}
                ${this.renderMetricCard('Schema', schema.count || 0, `${schema.validCount || 0} валидных`, (schema.count || 0) > 0)}
                ${this.renderMetricCard('Производительность', safePerformance.scripts.async, 'Async скрипты', safePerformance.scripts.async > 0)}
                ${this.renderMetricCard('Безопасность', safeSecurity.forms.secure, 'HTTPS формы', safeSecurity.forms.secure === safeSecurity.forms.count)}
                ${this.renderMetricCard('Доступность', this.calculateAltPercentage(safeAccessibility.images) + '%', 'ALT теги', safeAccessibility.images.withAlt > 0)}
                ${this.renderMetricCard('SEO', safeSeo.canonical.exists ? '✅' : '❌', 'Canonical', safeSeo.canonical.exists)}
            </div>
            
            <!-- Детальные секции -->
            <div class="technical-sections">
                ${this.renderStructureSection(structure)}
                ${this.renderSchemaSection(schema)}
                ${this.renderPerformanceSection(safePerformance)}
                ${this.renderSecuritySection(safeSecurity)}
                ${this.renderMetaTagsSection(metaTags)}
                ${this.renderScriptsSection(scripts)}
                ${this.renderLinksSection(links)}
                ${this.renderAccessibilitySection(safeAccessibility)}
                ${this.renderSEOSection(safeSeo)}
            </div>
        `;
    }

    calculateAltPercentage(images) {
        const total = images.total || 1;
        const withAlt = images.withAlt || 0;
        return Math.round((withAlt / total) * 100);
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
        const safeStructure = {
            header: structure.header || { exists: false, hasH1: false, hasNav: false },
            main: structure.main || { exists: false, hasH1: false, hasArticle: false },
            footer: structure.footer || { exists: false, hasLinks: false, hasSocial: false },
            nav: structure.nav || { exists: false, count: 0 },
            semantic: structure.semantic || {},
            breadcrumbs: structure.breadcrumbs || { exists: false, elements: 0 }
        };

        return `
            <div class="section-card">
                <h5>Структура HTML5</h5>
                <div class="structure-grid">
                    <div class="structure-item ${safeStructure.header.exists ? 'good' : 'bad'}">
                        <span class="structure-icon">${safeStructure.header.exists ? '✅' : '❌'}</span>
                        <span class="structure-label">Header</span>
                        ${safeStructure.header.hasH1 ? '<span class="structure-badge">H1</span>' : ''}
                        ${safeStructure.header.hasNav ? '<span class="structure-badge">Nav</span>' : ''}
                    </div>
                    <div class="structure-item ${safeStructure.main.exists ? 'good' : 'bad'}">
                        <span class="structure-icon">${safeStructure.main.exists ? '✅' : '❌'}</span>
                        <span class="structure-label">Main</span>
                        ${safeStructure.main.hasH1 ? '<span class="structure-badge">H1</span>' : ''}
                        ${safeStructure.main.hasArticle ? '<span class="structure-badge">Article</span>' : ''}
                    </div>
                    <div class="structure-item ${safeStructure.footer.exists ? 'good' : 'bad'}">
                        <span class="structure-icon">${safeStructure.footer.exists ? '✅' : '❌'}</span>
                        <span class="structure-label">Footer</span>
                        ${safeStructure.footer.hasLinks ? '<span class="structure-badge">Links</span>' : ''}
                        ${safeStructure.footer.hasSocial ? '<span class="structure-badge">Social</span>' : ''}
                    </div>
                    <div class="structure-item ${safeStructure.nav.exists ? 'good' : 'bad'}">
                        <span class="structure-icon">${safeStructure.nav.exists ? '✅' : '❌'}</span>
                        <span class="structure-label">Navigation</span>
                        <span class="structure-count">${safeStructure.nav.count}</span>
                    </div>
                </div>
                
                <div class="semantic-elements">
                    <h6>Семантические элементы:</h6>
                    <div class="semantic-tags">
                        ${Object.entries(safeStructure.semantic).map(([tag, count]) => `
                            <span class="semantic-tag ${(count || 0) > 0 ? 'has-content' : 'no-content'}">
                                ${tag}: <strong>${count || 0}</strong>
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                ${safeStructure.breadcrumbs.exists ? `
                    <div class="breadcrumbs-info good">
                        ✅ Breadcrumbs найдены (${safeStructure.breadcrumbs.elements} элементов)
                    </div>
                ` : '<div class="breadcrumbs-info bad">❌ Breadcrumbs не найдены</div>'}
            </div>
        `;
    }

    renderSchemaSection(schema) {
        const safeSchema = {
            count: schema.count || 0,
            validCount: schema.validCount || 0,
            coverage: schema.coverage || 0,
            diversity: schema.diversity || 0,
            hasOrganization: schema.hasOrganization || false,
            hasWebsite: schema.hasWebsite || false,
            hasBreadcrumb: schema.hasBreadcrumb || false,
            hasArticle: schema.hasArticle || false,
            hasProduct: schema.hasProduct || false,
            hasLocalBusiness: schema.hasLocalBusiness || false,
            foundCommonTypes: schema.foundCommonTypes || [],
            schemas: schema.schemas || []
        };

        return `
            <div class="section-card">
                <h5>Schema.org разметка</h5>
                <div class="schema-stats">
                    <div class="schema-metric">
                        <span class="metric-label">Всего схем:</span>
                        <span class="metric-value">${safeSchema.count}</span>
                    </div>
                    <div class="schema-metric">
                        <span class="metric-label">Валидных:</span>
                        <span class="metric-value ${safeSchema.coverage > 80 ? 'good' : 'warning'}">${safeSchema.coverage}%</span>
                    </div>
                    <div class="schema-metric">
                        <span class="metric-label">Разнообразие:</span>
                        <span class="metric-value">${safeSchema.diversity} типов</span>
                    </div>
                </div>
                
                ${safeSchema.count > 0 ? `
                    <div class="schema-types">
                        <h6>Найденные типы:</h6>
                        <div class="type-badges">
                            ${safeSchema.hasOrganization ? '<span class="type-badge good">Organization</span>' : ''}
                            ${safeSchema.hasWebsite ? '<span class="type-badge good">WebSite</span>' : ''}
                            ${safeSchema.hasBreadcrumb ? '<span class="type-badge good">Breadcrumb</span>' : ''}
                            ${safeSchema.hasArticle ? '<span class="type-badge good">Article</span>' : ''}
                            ${safeSchema.hasProduct ? '<span class="type-badge good">Product</span>' : ''}
                            ${safeSchema.hasLocalBusiness ? '<span class="type-badge good">LocalBusiness</span>' : ''}
                        </div>
                    </div>
                    
                    ${safeSchema.foundCommonTypes.length > 0 ? `
                        <div class="found-types">
                            <small>Обнаружены: ${safeSchema.foundCommonTypes.join(', ')}</small>
                        </div>
                    ` : ''}
                    
                    <div class="schemas-list">
                        ${safeSchema.schemas.map((item, index) => {
                            const safeItem = {
                                type: item.type || 'Unknown',
                                valid: item.valid || false,
                                data: item.data || {}
                            };
                            return `
                                <div class="schema-item ${safeItem.valid ? 'valid' : 'invalid'}">
                                    <div class="schema-header">
                                        <span class="schema-type">${safeItem.type}</span>
                                        <span class="schema-status">${safeItem.valid ? '✅' : '❌'}</span>
                                    </div>
                                    ${Object.keys(safeItem.data).length > 0 ? `
                                        <div class="schema-data">
                                            ${Object.entries(safeItem.data).map(([key, value]) => `
                                                <div class="schema-field">
                                                    <span class="field-name">${key}:</span>
                                                    <span class="field-value">${this.truncateText(String(value), 50)}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<div class="no-data">Schema разметка не найдена</div>'}
            </div>
        `;
    }

    renderPerformanceSection(performance) {
        return `
            <div class="section-card">
                <h5>Производительность</h5>
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
        const safeSecurity = security || {};
        const safeForms = safeSecurity.forms || {};
        const formsCount = safeForms.count || 0;
        const formsSecure = safeForms.secure || 0;
        const externalScriptsCount = safeSecurity.externalScripts?.count || 0;

        return `
            <div class="section-card">
                <h5>Безопасность</h5>
                <div class="security-items">
                    <div class="security-item ${safeSecurity.csp?.exists ? 'good' : 'warning'}">
                        <span class="security-icon">${safeSecurity.csp?.exists ? '✅' : '⚠️'}</span>
                        <span class="security-label">Content Security Policy</span>
                    </div>
                    <div class="security-item ${formsSecure === formsCount ? 'good' : 'warning'}">
                        <span class="security-icon">${formsSecure === formsCount ? '✅' : '⚠️'}</span>
                        <span class="security-label">Безопасные формы</span>
                        <span class="security-details">${formsSecure}/${formsCount}</span>
                    </div>
                    <div class="security-item ${externalScriptsCount < 5 ? 'good' : 'warning'}">
                        <span class="security-icon">${externalScriptsCount < 5 ? '✅' : '⚠️'}</span>
                        <span class="security-label">Внешние скрипты</span>
                        <span class="security-details">${externalScriptsCount}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderMetaTagsSection(metaTags) {
        const safeMetaTags = {
            hasOG: metaTags.hasOG || false,
            hasTwitter: metaTags.hasTwitter || false,
            openGraph: metaTags.openGraph || {},
            twitter: metaTags.twitter || {}
        };

        const hasSocialMeta = safeMetaTags.hasOG || safeMetaTags.hasTwitter;
        
        return `
            <div class="section-card">
                <h5>Мета-теги</h5>
                <div class="meta-status">
                    <div class="meta-item ${safeMetaTags.hasOG ? 'good' : 'warning'}">
                        Open Graph: <strong>${safeMetaTags.hasOG ? '✅' : '❌'}</strong>
                    </div>
                    <div class="meta-item ${safeMetaTags.hasTwitter ? 'good' : 'warning'}">
                        Twitter Cards: <strong>${safeMetaTags.hasTwitter ? '✅' : '❌'}</strong>
                    </div>
                </div>
                
                ${hasSocialMeta ? `
                    <div class="meta-preview">
                        <h6>Социальные мета-теги:</h6>
                        ${safeMetaTags.openGraph.title ? `<div><strong>Title:</strong> ${this.truncateText(safeMetaTags.openGraph.title, 60)}</div>` : ''}
                        ${safeMetaTags.openGraph.description ? `<div><strong>Description:</strong> ${this.truncateText(safeMetaTags.openGraph.description, 100)}</div>` : ''}
                        ${safeMetaTags.openGraph.image ? `<div><strong>Image:</strong> ${this.truncateText(safeMetaTags.openGraph.image, 50)}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderScriptsSection(scripts) {
        const safeScripts = scripts || {
            total: 0,
            inline: 0,
            external: 0,
            async: 0,
            defer: 0,
            modules: 0
        };

        return `
            <div class="section-card">
                <h5>Скрипты</h5>
                <div class="scripts-stats">
                    <div class="script-stat">
                        <span class="stat-label">Всего:</span>
                        <span class="stat-value">${safeScripts.total}</span>
                    </div>
                    <div class="script-stat">
                        <span class="stat-label">Inline:</span>
                        <span class="stat-value">${safeScripts.inline}</span>
                    </div>
                    <div class="script-stat">
                        <span class="stat-label">Внешние:</span>
                        <span class="stat-value">${safeScripts.external}</span>
                    </div>
                    <div class="script-stat">
                        <span class="stat-label">Async/Defer:</span>
                        <span class="stat-value ${(safeScripts.async + safeScripts.defer) > 0 ? 'good' : 'warning'}">
                            ${safeScripts.async + safeScripts.defer}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderLinksSection(links) {
        const safeLinks = links || {
            total: 0,
            types: {},
            hasPreload: false,
            hasPreconnect: false,
            hasDNS: false,
            hasCanonical: false
        };

        // Дополнительная проверка для types
        const safeTypes = safeLinks.types || {};

        return `
            <div class="section-card">
                <h5>Технические ссылки</h5>
                <div class="links-stats">
                    <div class="link-stat ${safeLinks.hasCanonical ? 'good' : 'warning'}">
                        Canonical: <strong>${safeLinks.hasCanonical ? '✅' : '❌'}</strong>
                    </div>
                    <div class="link-stat ${safeLinks.hasPreload ? 'good' : 'warning'}">
                        Preload: <strong>${safeLinks.hasPreload ? '✅' : '❌'}</strong>
                    </div>
                    <div class="link-stat ${safeLinks.hasPreconnect ? 'good' : 'warning'}">
                        Preconnect: <strong>${safeLinks.hasPreconnect ? '✅' : '❌'}</strong>
                    </div>
                    <div class="link-stat ${safeLinks.hasDNS ? 'good' : 'warning'}">
                        DNS Prefetch: <strong>${safeLinks.hasDNS ? '✅' : '❌'}</strong>
                    </div>
                </div>
                
                ${Object.keys(safeTypes).length > 0 ? `
                    <div class="link-types">
                        <h6>Типы ссылок:</h6>
                        <div class="type-tags">
                            ${Object.entries(safeTypes).map(([type, items]) => {
                                const itemsArray = Array.isArray(items) ? items : [];
                                return `
                                    <span class="type-tag">
                                        ${type}: <strong>${itemsArray.length}</strong>
                                    </span>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : '<div class="no-types">Типы ссылок не обнаружены</div>'}
                
                <div class="links-total">
                    Всего технических ссылок: <strong>${safeLinks.total}</strong>
                </div>
            </div>
        `;
    }

    renderAccessibilitySection(accessibility) {
        const safeAccessibility = accessibility || {};
        const safeImages = safeAccessibility.images || { withAlt: 0, total: 1 };
        const safeForms = safeAccessibility.forms || { withLabels: 0, total: 1 };
        const safeLandmarks = safeAccessibility.landmarks || {};

        const altPercentage = Math.round((safeImages.withAlt / safeImages.total) * 100);
        const labelPercentage = Math.round((safeForms.withLabels / safeForms.total) * 100);
        
        return `
            <div class="section-card">
                <h5>Доступность</h5>
                <div class="a11y-stats">
                    <div class="a11y-stat ${altPercentage > 80 ? 'good' : 'warning'}">
                        <span class="a11y-label">ALT теги:</span>
                        <span class="a11y-value">${altPercentage}%</span>
                        <span class="a11y-details">${safeImages.withAlt}/${safeImages.total}</span>
                    </div>
                    <div class="a11y-stat ${labelPercentage > 80 ? 'good' : 'warning'}">
                        <span class="a11y-label">Labels форм:</span>
                        <span class="a11y-value">${labelPercentage}%</span>
                        <span class="a11y-details">${safeForms.withLabels}/${safeForms.total}</span>
                    </div>
                </div>
                
                <div class="a11y-landmarks">
                    <h6>Лендмарки:</h6>
                    <div class="landmark-tags">
                        ${safeLandmarks.hasMain ? '<span class="landmark-tag good">main</span>' : '<span class="landmark-tag bad">main</span>'}
                        ${safeLandmarks.hasHeader ? '<span class="landmark-tag good">header</span>' : '<span class="landmark-tag bad">header</span>'}
                        ${safeLandmarks.hasFooter ? '<span class="landmark-tag good">footer</span>' : '<span class="landmark-tag bad">footer</span>'}
                        ${safeLandmarks.hasNav ? '<span class="landmark-tag good">nav</span>' : '<span class="landmark-tag bad">nav</span>'}
                    </div>
                </div>
            </div>
        `;
    }

    renderSEOSection(seo) {
        return `
            <div class="section-card">
                <h5>Техническое SEO</h5>
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