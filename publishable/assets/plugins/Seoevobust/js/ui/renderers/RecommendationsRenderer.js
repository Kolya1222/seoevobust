export default class RecommendationsRenderer {
    render(safeAnalysis) {
        // Получаем рекомендации из данных анализа
        const recommendations = safeAnalysis.recommendations || [];
        const analysis = safeAnalysis || {};
        
        // Группируем рекомендации по приоритету
        const criticalRecs = recommendations.filter(rec => rec.priority === 'critical');
        const warningRecs = recommendations.filter(rec => rec.priority === 'warning');
        const infoRecs = recommendations.filter(rec => rec.priority === 'info');
        
        let html = '<div class="recommendations-container">';
        html += '<h4>Рекомендации по улучшению сайта</h4>';
        
        // Счетчик рекомендаций
        html += `
            <div class="recommendations-stats">
                <span class="stat-critical">🚨 Критические: ${criticalRecs.length}</span>
                <span class="stat-warning">⚠️ Важные: ${warningRecs.length}</span>
                <span class="stat-info">💡 Дополнительные: ${infoRecs.length}</span>
                <span class="stat-total">Всего: ${recommendations.length}</span>
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

        // Если рекомендаций нет
        if (recommendations.length === 0) {
            html += `
                <div class="no-recommendations">
                    <h5>🎉 Отличная работа!</h5>
                    <p>Все рекомендации выполнены. Ваш сайт соответствует лучшим практикам SEO и веб-разработки.</p>
                    <div class="success-message">
                        Продолжайте поддерживать высокое качество сайта и регулярно проводите аудит для выявления новых возможностей улучшения.
                    </div>
                </div>
            `;
        }
        
        // Сводка по баллам
        html += this.renderScoreSummary(analysis);
        html += '</div>';
        
        return html;
    }

    renderRecommendationItem(rec) {
        return `
            <div class="recommendation-item ${rec.priority}" data-category="${rec.category || 'general'}">
                <div class="rec-header">
                    <div class="rec-title-section">
                        <strong class="rec-title">${rec.title}</strong>
                        ${rec.category ? `<span class="rec-category-badge">${rec.category}</span>` : ''}
                    </div>
                    <div class="rec-meta">
                        <span class="rec-impact">Влияние: ${rec.impact}/10</span>
                        <span class="rec-priority ${rec.priority}">${this.getPriorityText(rec.priority)}</span>
                    </div>
                </div>
                <p class="rec-description">${rec.description}</p>
                <div class="rec-solution">
                    <strong>Решение:</strong> ${rec.suggestion}
                </div>
                ${rec.examples ? this.renderCodeExample(rec.examples) : ''}
            </div>
        `;
    }

    getPriorityText(priority) {
        const priorityTexts = {
            'critical': 'Критический',
            'warning': 'Важный', 
            'info': 'Информационный'
        };
        return priorityTexts[priority] || priority;
    }

    renderCodeExample(code) {
        const escapedCode = this.escapeHtml(code);
        
        return `
            <div class="rec-examples">
                <strong>Примеры кода:</strong>
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
            basic: analysis.basic?.basic?.score || 0,
            content: analysis.basic?.content?.score || 0,
            technical: analysis.basic?.technical?.score || 0,
            performance: analysis.performance?.score || 0,
            security: analysis.security?.score || 0,
            overall: analysis.score || 0
        };
        
        return `
            <div class="score-summary">
                <h5>Сводка по баллам</h5>
                <div class="score-breakdown">
                    <div class="score-item">
                        <span class="score-label">Базовые элементы:</span>
                        <span class="score-value ${scores.basic >= 80 ? 'good' : scores.basic >= 60 ? 'warning' : 'bad'}">
                            ${scores.basic}%
                        </span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Контент:</span>
                        <span class="score-value ${scores.content >= 80 ? 'good' : scores.content >= 60 ? 'warning' : 'bad'}">
                            ${scores.content}%
                        </span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Технические:</span>
                        <span class="score-value ${scores.technical >= 80 ? 'good' : scores.technical >= 60 ? 'warning' : 'bad'}">
                            ${scores.technical}%
                        </span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Производительность:</span>
                        <span class="score-value ${scores.performance >= 80 ? 'good' : scores.performance >= 60 ? 'warning' : 'bad'}">
                            ${scores.performance}%
                        </span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Безопасность:</span>
                        <span class="score-value ${scores.security >= 80 ? 'good' : scores.security >= 60 ? 'warning' : 'bad'}">
                            ${scores.security}%
                        </span>
                    </div>
                    <div class="score-item total">
                        <span class="score-label">Общий балл:</span>
                        <span class="score-value ${scores.overall >= 80 ? 'good' : scores.overall >= 60 ? 'warning' : 'bad'}">
                            ${scores.overall}%
                        </span>
                    </div>
                </div>
                ${this.renderImprovementTips(scores)}
            </div>
        `;
    }

    renderImprovementTips(scores) {
        const tips = [];
        
        if (scores.basic < 80) {
            tips.push('Улучшите базовые SEO элементы: title, description, заголовки H1');
        }
        
        if (scores.content < 80) {
            tips.push('Оптимизируйте контент: добавьте ALT тексты, улучшите читаемость');
        }
        
        if (scores.technical < 80) {
            tips.push('Улучшите техническую реализацию: Schema.org, семантические теги');
        }
        
        if (scores.performance < 80) {
            tips.push('Повысьте производительность: оптимизируйте изображения, скрипты');
        }
        
        if (scores.security < 80) {
            tips.push('Усильте безопасность: HTTPS, security headers');
        }

        if (tips.length === 0) {
            return '<div class="improvement-tips success">🎉 Все показатели на высоком уровне!</div>';
        }

        return `
            <div class="improvement-tips">
                <strong>Основные направления улучшения:</strong>
                <ul>
                    ${tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;
    }
}