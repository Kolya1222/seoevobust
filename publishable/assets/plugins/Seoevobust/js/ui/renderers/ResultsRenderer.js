import BasicSectionRenderer from './BasicSectionRenderer.js';
import ContentSectionRenderer from './ContentSectionRenderer.js';
import TechnicalSectionRenderer from './TechnicalSectionRenderer.js';
import PerformanceSectionRenderer from './PerformanceSectionRenderer.js';
import SecuritySectionRenderer from './SecuritySectionRenderer.js';
import RecommendationsRenderer from './RecommendationsRenderer.js';
import ExportRenderer from './ExportRenderer.js';

export default class ResultsRenderer {
    constructor() {
        this.basicRenderer = new BasicSectionRenderer();
        this.contentRenderer = new ContentSectionRenderer();
        this.technicalRenderer = new TechnicalSectionRenderer();
        this.performanceRenderer = new PerformanceSectionRenderer();
        this.securityRenderer = new SecuritySectionRenderer();
        this.recommendationsRenderer = new RecommendationsRenderer();
        this.exportRenderer = new ExportRenderer();
    }

    async generateResultsHtml(analysis) {
        const safeAnalysis = {
            score: analysis?.score || 0,
            url: analysis?.url || window.location.href,
            basic: analysis?.basic || {},
            performance: analysis?.performance || {},
            security: analysis?.security || {}
        };

        // Асинхронно получаем HTML для производительности
        const performanceHtml = await this.performanceRenderer.render(safeAnalysis.performance);

        return `
            <div class="seo-dashboard">
                <div class="overall-score">
                    <div class="score-circle" style="--score-percent: ${safeAnalysis.score}%">
                        <div class="score-value">${safeAnalysis.score}</div>
                        <small>Общий балл</small>
                    </div>
                    <div class="score-breakdown">
                        <div class="breakdown-item">
                            <span>Базовые элементы: ${safeAnalysis.basic?.score || 0}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${safeAnalysis.basic?.score || 0}%"></div>
                            </div>
                        </div>
                        <div class="breakdown-item">
                            <span>Производительность: ${safeAnalysis.performance?.score || 0}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${safeAnalysis.performance?.score || 0}%"></div>
                            </div>
                        </div>
                        <div class="breakdown-item">
                            <span>Безопасность: ${safeAnalysis.security?.score || 0}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${safeAnalysis.security?.score || 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="seo-navigation">
                    <button class="nav-btn active" data-section="basic">Базовые</button>
                    <button class="nav-btn" data-section="content">Контент</button>
                    <button class="nav-btn" data-section="technical">Технические</button>
                    <button class="nav-btn" data-section="performance">Производительность</button>
                    <button class="nav-btn" data-section="security">Безопасность</button>
                    <button class="nav-btn" data-section="recommendations">Рекомендации</button>
                </div>
                
                <div class="seo-sections">
                    <div class="seo-section" id="basic-section">
                        ${this.basicRenderer.render(safeAnalysis.basic)}
                    </div>
                    <div class="seo-section" id="content-section" style="display: none;">
                        ${this.contentRenderer.render(safeAnalysis.basic?.content)}
                    </div>
                    <div class="seo-section" id="technical-section" style="display: none;">
                        ${this.technicalRenderer.render(safeAnalysis.basic?.technical)}
                    </div>
                    <div class="seo-section" id="performance-section" style="display: none;">
                        ${performanceHtml}
                    </div>
                    <div class="seo-section" id="security-section" style="display: none;">
                        ${this.securityRenderer.render(safeAnalysis.security)}
                    </div>
                    <div class="seo-section" id="recommendations-section" style="display: none;">
                        ${this.recommendationsRenderer.render(safeAnalysis)}
                    </div>
                </div>
                
                <div class="export-actions">
                    <button class="export-btn" data-format="json">Экспорт JSON</button>
                    <button class="export-btn" data-format="html">Экспорт HTML</button>
                </div>
            </div>
        `;
    }

    exportResults(analysis, format) {
        this.exportRenderer.exportResults(analysis, format);
    }
}