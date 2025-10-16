export default class SecuritySectionRenderer {
    render(security) {
        const mixedContent = security.mixedContent || {};
        const securityHeaders = security.securityHeaders || {};
        const formsSecurity = security.formsSecurity || {};
        const externalResources = security.externalResources || {};
        const cookies = security.cookies || {};
        const vulnerabilities = security.vulnerabilities || [];

        return `
            <h4>🔒 Расширенный анализ безопасности</h4>
            
            <!-- Основные метрики -->
            <div class="metrics-grid">
                ${this.renderMetricCard('Общий балл', security.score + '%', security.riskLevel, security.score >= 70)}
                ${this.renderMetricCard('HTTPS', security.https ? '✅' : '❌', 'Протокол', security.https)}
                ${this.renderMetricCard('Mixed Content', mixedContent.total || 0, 'Проблемы', mixedContent.total === 0)}
                ${this.renderMetricCard('Формы', formsSecurity.secure + '/' + formsSecurity.total, 'Безопасные', formsSecurity.insecure === 0)}
                ${this.renderMetricCard('Внешние ресурсы', externalResources.total || 0, 'Связи', externalResources.total < 20)}
                ${this.renderMetricCard('Уязвимости', vulnerabilities.length, 'Обнаружено', vulnerabilities.length === 0)}
            </div>
            
            <!-- Детальные секции -->
            <div class="security-sections">
                ${this.renderMixedContentSection(mixedContent)}
                ${this.renderSecurityHeadersSection(securityHeaders)}
                ${this.renderFormsSecuritySection(formsSecurity)}
                ${this.renderExternalResourcesSection(externalResources)}
                ${this.renderCookiesSection(cookies)}
                ${this.renderVulnerabilitiesSection(vulnerabilities)}
                ${this.renderSecurityRecommendations(security)}
            </div>
        `;
    }

    renderMetricCard(label, value, details, isGood) {
        const className = isGood ? 'good' : 'bad';
        return `
            <div class="metric-card ${className}">
                <div class="metric-value">${value}</div>
                <div class="metric-label">${label}</div>
                <div class="metric-details">${details}</div>
            </div>
        `;
    }

    renderMixedContentSection(mixedContent) {
        return `
            <div class="section-card ${mixedContent.total === 0 ? 'good' : 'bad'}">
                <h5>🚫 Mixed Content</h5>
                <div class="mixed-content-stats">
                    <div class="mixed-total">Всего проблем: <strong>${mixedContent.total}</strong></div>
                    ${mixedContent.total > 0 ? `
                        <div class="mixed-breakdown">
                            ${mixedContent.images.length > 0 ? `<div>Изображения: ${mixedContent.images.length}</div>` : ''}
                            ${mixedContent.scripts.length > 0 ? `<div>Скрипты: ${mixedContent.scripts.length}</div>` : ''}
                            ${mixedContent.styles.length > 0 ? `<div>Стили: ${mixedContent.styles.length}</div>` : ''}
                            ${mixedContent.iframes.length > 0 ? `<div>Iframe: ${mixedContent.iframes.length}</div>` : ''}
                        </div>
                        ${this.renderMixedContentList(mixedContent)}
                    ` : '<div class="no-issues">✅ Нет проблем с mixed content</div>'}
                </div>
            </div>
        `;
    }

    renderMixedContentList(mixedContent) {
        let html = '<div class="mixed-content-list">';
        
        ['images', 'scripts', 'styles', 'iframes', 'other'].forEach(type => {
            if (mixedContent[type].length > 0) {
                html += `<h6>${this.capitalizeFirstLetter(type)}:</h6>`;
                mixedContent[type].forEach((item, index) => {
                    html += `
                        <div class="mixed-item">
                            <span class="mixed-url">${this.truncateText(item.url, 60)}</span>
                            <span class="mixed-host">${item.hostname}</span>
                        </div>
                    `;
                });
            }
        });
        
        html += '</div>';
        return html;
    }

    renderSecurityHeadersSection(headers) {
        const implementedHeaders = Object.values(headers).filter(h => h.exists && h.status.includes('implemented')).length;
        
        return `
            <div class="section-card ${implementedHeaders >= 3 ? 'good' : 'warning'}">
                <h5>🛡️ Заголовки безопасности</h5>
                <div class="headers-stats">
                    Реализовано: <strong>${implementedHeaders}/6</strong>
                </div>
                <div class="headers-list">
                    ${Object.entries(headers).map(([name, data]) => `
                        <div class="header-item ${data.exists && data.status.includes('implemented') ? 'implemented' : 'missing'}">
                            <span class="header-name">${name}</span>
                            <span class="header-status">${this.getHeaderStatusIcon(data)}</span>
                            <span class="header-value">${data.value || 'Не обнаружено'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFormsSecuritySection(formsSecurity) {
        return `
            <div class="section-card ${formsSecurity.insecure === 0 ? 'good' : 'warning'}">
                <h5>📝 Безопасность форм</h5>
                <div class="forms-stats">
                    <div>Всего форм: <strong>${formsSecurity.total}</strong></div>
                    <div>Безопасные: <strong>${formsSecurity.secure}</strong></div>
                    <div>Небезопасные: <strong>${formsSecurity.insecure}</strong></div>
                </div>
                ${formsSecurity.hasPasswordFields ? `
                    <div class="forms-warning">
                        ⚠️ Обнаружены формы с паролями
                    </div>
                ` : ''}
                ${formsSecurity.forms.length > 0 ? `
                    <div class="forms-details">
                        ${formsSecurity.forms.map(form => `
                            <div class="form-item ${form.isSecure ? 'secure' : 'insecure'}">
                                <span class="form-id">${form.id}</span>
                                <span class="form-method">${form.method}</span>
                                <span class="form-status">${form.isSecure ? '🔒' : '🔓'}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderExternalResourcesSection(externalResources) {
        return `
            <div class="section-card ${externalResources.total < 15 ? 'good' : 'warning'}">
                <h5>🌐 Внешние ресурсы</h5>
                <div class="resources-stats">
                    <div>Всего: <strong>${externalResources.total}</strong></div>
                    <div>Скрипты: <strong>${externalResources.scripts.length}</strong></div>
                    <div>Стили: <strong>${externalResources.styles.length}</strong></div>
                    <div>Iframe: <strong>${externalResources.iframes.length}</strong></div>
                </div>
                ${this.renderResourcesBreakdown(externalResources)}
            </div>
        `;
    }

    renderResourcesBreakdown(resources) {
        let html = '<div class="resources-breakdown">';
        
        if (resources.scripts.length > 0) {
            html += '<h6>Внешние скрипты:</h6>';
            resources.scripts.forEach(script => {
                html += `
                    <div class="resource-item">
                        <span class="resource-type">${script.type}</span>
                        <span class="resource-url">${this.truncateText(script.url, 50)}</span>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        return html;
    }

    renderCookiesSection(cookies) {
        const securePercentage = cookies.total > 0 ? Math.round((cookies.secure / cookies.total) * 100) : 100;
        
        return `
            <div class="section-card ${securePercentage > 80 ? 'good' : 'warning'}">
                <h5>🍪 Cookies</h5>
                <div class="cookies-stats">
                    <div>Всего cookies: <strong>${cookies.total}</strong></div>
                    <div>Secure: <strong>${cookies.secure} (${securePercentage}%)</strong></div>
                    <div>HttpOnly: <strong>${cookies.httpOnly}</strong></div>
                    <div>SameSite: <strong>${cookies.sameSite}</strong></div>
                </div>
            </div>
        `;
    }

    renderVulnerabilitiesSection(vulnerabilities) {
        if (vulnerabilities.length === 0) {
            return `
                <div class="section-card good">
                    <h5>✅ Уязвимости</h5>
                    <div class="no-vulnerabilities">Критических уязвимостей не обнаружено</div>
                </div>
            `;
        }

        return `
            <div class="section-card bad">
                <h5>🚨 Обнаруженные уязвимости</h5>
                <div class="vulnerabilities-list">
                    ${vulnerabilities.map(vuln => `
                        <div class="vulnerability-item ${vuln.severity}">
                            <div class="vuln-header">
                                <span class="vuln-severity ${vuln.severity}">${this.getSeverityIcon(vuln.severity)} ${vuln.severity}</span>
                                <span class="vuln-type">${vuln.type}</span>
                            </div>
                            <div class="vuln-description">${vuln.description}</div>
                            <div class="vuln-recommendation">💡 ${vuln.recommendation}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSecurityRecommendations(security) {
        const recommendations = [];
        
        if (!security.https) {
            recommendations.push('Переведите сайт на HTTPS протокол');
        }
        
        if (security.mixedContent.total > 0) {
            recommendations.push('Исправьте mixed content проблемы');
        }
        
        if (security.formsSecurity.insecure > 0) {
            recommendations.push('Обновите формы для использования HTTPS');
        }
        
        if (security.vulnerabilities.length > 0) {
            recommendations.push('Исправьте обнаруженные уязвимости');
        }

        if (recommendations.length === 0) {
            recommendations.push('Продолжайте поддерживать текущий уровень безопасности');
        }

        return `
            <div class="section-card">
                <h5>💡 Рекомендации по безопасности</h5>
                <div class="security-recommendations">
                    ${recommendations.map(rec => `
                        <div class="security-recommendation">• ${rec}</div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Вспомогательные методы
    getHeaderStatusIcon(headerData) {
        if (headerData.exists && headerData.status.includes('implemented')) return '✅';
        if (headerData.exists && headerData.status.includes('likely')) return '⚠️';
        return '❌';
    }

    getSeverityIcon(severity) {
        const icons = {
            'critical': '🔴',
            'high': '🟠', 
            'medium': '🟡',
            'low': '🔵'
        };
        return icons[severity] || '⚪';
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}