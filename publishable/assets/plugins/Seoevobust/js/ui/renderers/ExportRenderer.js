import BasicSectionRenderer from './BasicSectionRenderer.js';
import ContentSectionRenderer from './ContentSectionRenderer.js';
import TechnicalSectionRenderer from './TechnicalSectionRenderer.js';
import PerformanceSectionRenderer from './PerformanceSectionRenderer.js';
import SecuritySectionRenderer from './SecuritySectionRenderer.js';
import RecommendationsRenderer from './RecommendationsRenderer.js';

export default class ExportRenderer {
    constructor() {
        this.basicRenderer = new BasicSectionRenderer();
        this.contentRenderer = new ContentSectionRenderer();
        this.technicalRenderer = new TechnicalSectionRenderer();
        this.performanceRenderer = new PerformanceSectionRenderer();
        this.securityRenderer = new SecuritySectionRenderer();
        this.recommendationsRenderer = new RecommendationsRenderer();
    }

    async exportResults(analysis, format) {
        if (!analysis) return;
        
        let content, mimeType, filename;
        
        if (format === 'json') {
            content = JSON.stringify(analysis, null, 2);
            mimeType = 'application/json';
            filename = `seo-analysis-${new Date().toISOString().split('T')[0]}.json`;
        } else if (format === 'html') {
            content = await this.generateExportHtml(analysis);
            mimeType = 'text/html';
            filename = `seo-analysis-${new Date().toISOString().split('T')[0]}.html`;
        } else if (format === 'txt') {
            content = this.generateExportText(analysis);
            mimeType = 'text/plain';
            filename = `seo-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        }
        
        this.downloadFile(content, mimeType, filename);
    }

    downloadFile(content, mimeType, filename) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async generateExportHtml(analysis) {
        const basicHtml = this.basicRenderer.render(analysis?.basic || {});
        const contentHtml = this.contentRenderer.render(analysis.basic?.content, analysis.basic?.meta);
        const technicalHtml = this.technicalRenderer.render(analysis.basic?.technical);
        const performanceHtml = await this.performanceRenderer.render(analysis.performance);
        const securityHtml = this.securityRenderer.render(analysis.security);
        const recommendationsHtml = this.recommendationsRenderer.render(analysis);

        return `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Полный SEO Анализ - ${analysis.url}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        line-height: 1.6; 
                        color: #333; 
                        background: #f8f9fa; 
                        padding: 20px; 
                    }
                    .container { 
                        max-width: 1200px; 
                        margin: 0 auto; 
                        background: white; 
                        border-radius: 12px; 
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                        overflow: hidden; 
                    }
                    .header { 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 30px; 
                        text-align: center; 
                    }
                    .header h1 { 
                        font-size: 2.5em; 
                        margin-bottom: 10px; 
                    }
                    .header .url { 
                        font-size: 1.1em; 
                        opacity: 0.9; 
                        word-break: break-all; 
                    }
                    .summary { 
                        display: grid; 
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                        gap: 20px; 
                        padding: 30px; 
                        background: #f8f9fa; 
                    }
                    .score-card { 
                        background: white; 
                        padding: 20px; 
                        border-radius: 10px; 
                        text-align: center; 
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                    }
                    .score-value { 
                        font-size: 2.5em; 
                        font-weight: bold; 
                        margin-bottom: 5px; 
                    }
                    .score-good { color: #28a745; }
                    .score-warning { color: #ffc107; }
                    .score-bad { color: #dc3545; }
                    .score-label { 
                        font-size: 0.9em; 
                        color: #6c757d; 
                        text-transform: uppercase; 
                        letter-spacing: 1px; 
                    }
                    .section { 
                        margin: 30px; 
                        padding: 25px; 
                        background: white; 
                        border-radius: 10px; 
                        border-left: 5px solid #667eea; 
                    }
                    .section h2 { 
                        color: #495057; 
                        margin-bottom: 20px; 
                        padding-bottom: 10px; 
                        border-bottom: 2px solid #e9ecef; 
                    }
                    .metrics-grid { 
                        display: grid; 
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                        gap: 15px; 
                        margin-bottom: 20px; 
                    }
                    .metric-card { 
                        padding: 15px; 
                        border-radius: 8px; 
                        text-align: center; 
                        background: #f8f9fa; 
                        border: 1px solid #e9ecef; 
                    }
                    .metric-card.good { border-color: #28a745; background: #d4edda; }
                    .metric-card.warning { border-color: #ffc107; background: #fff3cd; }
                    .metric-card.bad { border-color: #dc3545; background: #f8d7da; }
                    .metric-value { 
                        font-size: 1.8em; 
                        font-weight: bold; 
                        margin-bottom: 5px; 
                    }
                    .metric-label { 
                        font-size: 0.9em; 
                        color: #495057; 
                        margin-bottom: 5px; 
                    }
                    .metric-details { 
                        font-size: 0.8em; 
                        color: #6c757d; 
                    }
                    .recommendations-list { 
                        display: flex; 
                        flex-direction: column; 
                        gap: 10px; 
                    }
                    .recommendation-item { 
                        padding: 15px; 
                        border-radius: 8px; 
                        border-left: 4px solid; 
                    }
                    .recommendation-item.critical { 
                        background: #f8d7da; 
                        border-left-color: #dc3545; 
                    }
                    .recommendation-item.warning { 
                        background: #fff3cd; 
                        border-left-color: #ffc107; 
                    }
                    .recommendation-item.info { 
                        background: #d1ecf1; 
                        border-left-color: #17a2b8; 
                    }
                    .footer { 
                        text-align: center; 
                        padding: 20px; 
                        color: #6c757d; 
                        font-size: 0.9em; 
                        border-top: 1px solid #e9ecef; 
                        margin-top: 30px; 
                    }
                    @media print {
                        body { background: white; padding: 0; }
                        .container { box-shadow: none; }
                        .header { background: #667eea !important; }
                    }

                    .seo-value {
                        background: #f8f9fa;
                        padding: 8px;
                        border-radius: 3px;
                        font-size: 14px;
                        color: #6c757d;
                        border: 1px solid #e9ecef;
                        word-break: break-word;
                    }

                    .content-stats {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin: 10px 0;
                    }

                    .stat-item {
                        padding: 8px;
                        background: #f8f9fa;
                        border-radius: 4px;
                        text-align: center;
                    }

                    .stat-value {
                        font-size: 18px;
                        font-weight: bold;
                        color: #495057;
                    }

                    .stat-label {
                        font-size: 12px;
                        color: #6c757d;
                    }

                    .overall-score {
                        display: flex;
                        align-items: center;
                        gap: 30px;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-radius: 10px;
                        margin-bottom: 20px;
                    }

                    .score-value {
                        font-size: 2rem;
                        font-weight: bold;
                    }

                    .score-breakdown {
                        flex: 1;
                    }

                    .metrics-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                        margin-top: 15px;
                    }

                    .metric-card {
                        padding: 15px;
                        border-radius: 6px;
                        text-align: center;
                        border-left: 4px solid;
                    }

                    .metric-card.good { border-color: #4CAF50; background: #e8f5e8; }
                    .metric-card.warning { border-color: #ff9800; background: #fff3e0; }
                    .metric-card.bad { border-color: #f44336; background: #ffebee; }

                    .metric-value {
                        font-size: 1.5rem;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }

                    .recommendations-list {
                        display: grid;
                        gap: 10px;
                    }

                    .recommendation-item {
                        padding: 15px;
                        border-radius: 6px;
                        display: flex;
                        align-items: flex-start;
                        gap: 10px;
                    }

                    .recommendation-item.critical {
                        background: #ffebee;
                        border-left: 4px solid #f44336;
                    }

                    .recommendation-item.warning {
                        background: #fff3e0;
                        border-left: 4px solid #ff9800;
                    }

                    .recommendation-item.info {
                        background: #e3f2fd;
                        border-left: 4px solid #2196f3;
                    }

                    .export-actions {
                        display: flex;
                        gap: 10px;
                        justify-content: center;
                        margin-top: 20px;
                    }

                    .export-btn {
                        padding: 10px 20px;
                        border: 1px solid #007cba;
                        background: white;
                        color: #007cba;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .export-btn:hover {
                        background: #007cba;
                        color: white;
                    }

                    .breakdown-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding: 5px 0;
                    }

                    .progress-bar {
                        width: 100px;
                        height: 8px;
                        background: rgba(255,255,255,0.3);
                        border-radius: 4px;
                        overflow: hidden;
                        margin-left: 10px;
                    }

                    .progress-fill {
                        height: 100%;
                        background: #4CAF50;
                        transition: width 0.3s ease;
                    }

                    .score-circle {
                        position: relative;
                        width: 120px;
                        height: 120px;
                        border-radius: 50%;
                        background: conic-gradient(#4CAF50 0% var(--score-percent), #e0e0e0 var(--score-percent) 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        color: white;
                    }

                    .headings-section {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f8f9fa;
                        border-radius: 8px;
                    }

                    .headings-section h5 {
                        margin: 0 0 15px 0;
                        color: #333;
                    }

                    .headings-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 10px;
                    }

                    .heading-level {
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 6px;
                        background: white;
                    }

                    .heading-level.optimal {
                        border-left: 4px solid #28a745;
                    }

                    .heading-level.not-optimal {
                        border-left: 4px solid #ffc107;
                    }

                    .heading-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }

                    .heading-tag {
                        font-weight: bold;
                        color: #495057;
                    }

                    .heading-count {
                        background: #e9ecef;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                    }

                    .heading-titles {
                        max-height: 120px;
                        overflow-y: auto;
                    }

                    .heading-title {
                        padding: 4px 0;
                        font-size: 12px;
                        border-bottom: 1px solid #f1f1f1;
                        word-break: break-word;
                    }

                    .heading-title:last-child {
                        border-bottom: none;
                    }

                    .no-headings {
                        color: #6c757d;
                        font-style: italic;
                        font-size: 12px;
                    }

                    .detailed-sections {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        margin-top: 20px;
                    }

                    .section-card {
                        background: white;
                        border: 1px solid #e1e5e9;
                        border-radius: 8px;
                        padding: 15px;
                    }

                    .section-card h5 {
                        margin: 0 0 12px 0;
                        color: #2c3e50;
                        font-size: 14px;
                    }

                    .headings-hierarchy.valid {
                        border-left: 3px solid #28a745;
                    }

                    .headings-hierarchy.invalid {
                        border-left: 3px solid #ffc107;
                    }

                    .hierarchy-status {
                        font-weight: bold;
                        margin-bottom: 10px;
                    }

                    .hierarchy-levels {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                    }

                    .hierarchy-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 5px 0;
                        border-bottom: 1px solid #f1f1f1;
                    }

                    .level-tag {
                        font-weight: bold;
                        color: #495057;
                    }

                    .level-count, .level-avg {
                        font-size: 12px;
                        color: #6c757d;
                    }

                    .readability-info {
                        display: flex;
                        align-items: center;
                        gap: 20px;
                    }

                    .readability-score {
                        text-align: center;
                        padding: 10px;
                        border-radius: 6px;
                        min-width: 100px;
                    }

                    .readability-score.good {
                        background: #d4edda;
                        color: #155724;
                    }

                    .readability-score.warning {
                        background: #fff3cd;
                        color: #856404;
                    }

                    .score-value {
                        font-size: 18px;
                        font-weight: bold;
                    }

                    .score-label {
                        font-size: 12px;
                    }

                    .readability-details {
                        flex: 1;
                        font-size: 13px;
                    }

                    .links-distribution, .images-stats, .multimedia-stats {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                        font-size: 13px;
                    }

                    .link-type, .structure-item {
                        display: flex;
                        justify-content: space-between;
                    }

                    .keywords-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                        margin-bottom: 10px;
                    }

                    .keyword-item {
                        background: #e9ecef;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }

                    .keyword-count {
                        background: #6c757d;
                        color: white;
                        border-radius: 50%;
                        width: 18px;
                        height: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                    }

                    .og-tags {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                        font-size: 13px;
                    }

                    .og-tag {
                        display: flex;
                    }

                    .og-key {
                        font-weight: bold;
                        min-width: 120px;
                        color: #495057;
                    }

                    .og-value {
                        color: #6c757d;
                        word-break: break-word;
                    }

                    .semantic-elements {
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top: 1px solid #e9ecef;
                        font-size: 13px;
                    }

                    .no-data {
                        color: #6c757d;
                        font-style: italic;
                        text-align: center;
                        padding: 10px;
                    }
                    .technical-sections {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        margin-top: 20px;
                    }

                    .structure-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 10px;
                        margin-bottom: 15px;
                    }

                    .structure-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 10px;
                        border-radius: 6px;
                        text-align: center;
                    }

                    .structure-item.good {
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                    }

                    .structure-item.bad {
                        background: #f8d7da;
                        border: 1px solid #f5c6cb;
                    }

                    .structure-icon {
                        font-size: 18px;
                        margin-bottom: 5px;
                    }

                    .structure-label {
                        font-weight: bold;
                        margin-bottom: 5px;
                    }

                    .structure-count {
                        background: #6c757d;
                        color: white;
                        padding: 2px 6px;
                        border-radius: 10px;
                        font-size: 12px;
                    }

                    .structure-badge {
                        background: #17a2b8;
                        color: white;
                        padding: 1px 4px;
                        border-radius: 4px;
                        font-size: 10px;
                        margin: 1px;
                    }

                    .semantic-elements {
                        margin-top: 15px;
                        padding-top: 15px;
                        border-top: 1px solid #e9ecef;
                    }

                    .semantic-elements h6 {
                        margin: 0 0 8px 0;
                        font-size: 13px;
                        color: #495057;
                    }

                    .semantic-tags {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .semantic-tag {
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                    }

                    .semantic-tag.has-content {
                        background: #e7f3ff;
                        border: 1px solid #b3d9ff;
                    }

                    .semantic-tag.no-content {
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        color: #6c757d;
                    }

                    .breadcrumbs-info {
                        padding: 8px;
                        border-radius: 4px;
                        margin-top: 10px;
                        font-size: 13px;
                    }

                    .breadcrumbs-info.good {
                        background: #d4edda;
                        color: #155724;
                    }

                    .breadcrumbs-info.bad {
                        background: #f8d7da;
                        color: #721c24;
                    }

                    .schema-stats {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 15px;
                    }

                    .schema-metric {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .metric-label {
                        font-size: 12px;
                        color: #6c757d;
                    }

                    .metric-value {
                        font-size: 18px;
                        font-weight: bold;
                    }

                    .metric-value.good {
                        color: #28a745;
                    }

                    .metric-value.warning {
                        color: #ffc107;
                    }

                    .schema-types {
                        margin-bottom: 15px;
                    }

                    .type-badges {
                        display: flex;
                        gap: 8px;
                        flex-wrap: wrap;
                    }

                    .type-badge {
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                    }

                    .type-badge.good {
                        background: #d4edda;
                        color: #155724;
                    }

                    .schemas-list {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .schema-item {
                        padding: 10px;
                        border-radius: 6px;
                        border-left: 4px solid;
                    }

                    .schema-item.valid {
                        background: #f8fff9;
                        border-left-color: #28a745;
                    }

                    .schema-item.invalid {
                        background: #fffbfb;
                        border-left-color: #dc3545;
                    }

                    .schema-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 5px;
                    }

                    .schema-type {
                        font-weight: bold;
                        color: #495057;
                    }

                    .schema-status {
                        font-size: 14px;
                    }

                    .schema-data {
                        font-size: 12px;
                    }

                    .schema-field {
                        display: flex;
                        margin-bottom: 2px;
                    }

                    .field-name {
                        font-weight: bold;
                        min-width: 80px;
                        color: #6c757d;
                    }

                    .field-value {
                        color: #495057;
                        word-break: break-word;
                    }

                    .performance-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                    }

                    .perf-category {
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 6px;
                    }

                    .perf-category h6 {
                        margin: 0 0 8px 0;
                        font-size: 13px;
                        color: #495057;
                    }

                    .perf-stats {
                        font-size: 12px;
                    }

                    .perf-stats div {
                        margin-bottom: 3px;
                    }

                    .security-items, .seo-items {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .security-item, .seo-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 8px;
                        background: #f8f9fa;
                        border-radius: 6px;
                    }

                    .security-icon, .seo-icon {
                        font-size: 16px;
                    }

                    .security-label, .seo-label {
                        flex: 1;
                        font-weight: bold;
                    }

                    .security-details, .seo-details {
                        font-size: 12px;
                        padding: 2px 6px;
                        border-radius: 10px;
                        background: #e9ecef;
                    }

                    .seo-details.good {
                        background: #d4edda;
                        color: #155724;
                    }

                    .seo-details.warning {
                        background: #fff3cd;
                        color: #856404;
                    }

                    .meta-status {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 15px;
                    }

                    .meta-item {
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 14px;
                    }

                    .meta-item.good {
                        background: #d4edda;
                    }

                    .meta-item.warning {
                        background: #fff3cd;
                    }

                    .meta-preview {
                        font-size: 13px;
                    }

                    .meta-preview h6 {
                        margin: 0 0 8px 0;
                        color: #495057;
                    }

                    .scripts-stats, .links-stats {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 10px;
                    }

                    .script-stat, .link-stat {
                        text-align: center;
                        padding: 8px;
                        background: #f8f9fa;
                        border-radius: 6px;
                        font-size: 13px;
                    }

                    .stat-label {
                        display: block;
                        color: #6c757d;
                        font-size: 11px;
                    }

                    .stat-value {
                        display: block;
                        font-weight: bold;
                        font-size: 16px;
                    }

                    .link-types {
                        margin-top: 15px;
                        padding-top: 15px;
                        border-top: 1px solid #e9ecef;
                    }

                    .type-tags {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .type-tag {
                        background: #e7f3ff;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                    }

                    .a11y-stats {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                        margin-bottom: 15px;
                    }

                    .a11y-stat {
                        text-align: center;
                        padding: 10px;
                        border-radius: 6px;
                    }

                    .a11y-stat.good {
                        background: #d4edda;
                    }

                    .a11y-stat.warning {
                        background: #fff3cd;
                    }

                    .a11y-label {
                        display: block;
                        font-size: 12px;
                        color: #495057;
                        margin-bottom: 5px;
                    }

                    .a11y-value {
                        display: block;
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 3px;
                    }

                    .a11y-details {
                        font-size: 11px;
                        color: #6c757d;
                    }

                    .a11y-landmarks h6 {
                        margin: 0 0 8px 0;
                        font-size: 13px;
                        color: #495057;
                    }

                    .landmark-tags {
                        display: flex;
                        gap: 8px;
                        flex-wrap: wrap;
                    }

                    .landmark-tag {
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        text-transform: uppercase;
                    }

                    .landmark-tag.good {
                        background: #d4edda;
                        color: #155724;
                    }

                    .landmark-tag.bad {
                        background: #f8d7da;
                        color: #721c24;
                    }

                    .no-data {
                        text-align: center;
                        color: #6c757d;
                        font-style: italic;
                        padding: 20px;
                    }

                    .recommendations-stats {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 20px;
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 6px;
                        font-size: 14px;
                    }

                    .stat-critical {
                        color: #dc3545;
                        font-weight: bold;
                    }

                    .stat-warning {
                        color: #ffc107;
                        font-weight: bold;
                    }

                    .stat-info {
                        color: #17a2b8;
                        font-weight: bold;
                    }

                    .priority-critical {
                        color: #dc3545;
                        border-left: 4px solid #dc3545;
                        padding-left: 10px;
                    }

                    .priority-warning {
                        color: #856404;
                        border-left: 4px solid #ffc107;
                        padding-left: 10px;
                    }

                    .priority-info {
                        color: #0c5460;
                        border-left: 4px solid #17a2b8;
                        padding-left: 10px;
                    }

                    .recommendations-list {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        margin-bottom: 25px;
                    }

                    .recommendation-item {
                        padding: 15px;
                        border-radius: 8px;
                        border-left: 4px solid;
                    }

                    .recommendation-item.critical {
                        background: #f8d7da;
                        border-left-color: #dc3545;
                    }

                    .recommendation-item.warning {
                        background: #fff3cd;
                        border-left-color: #ffc107;
                    }

                    .recommendation-item.info {
                        background: #d1ecf1;
                        border-left-color: #17a2b8;
                    }

                    .rec-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 8px;
                    }

                    .rec-impact {
                        background: #6c757d;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 10px;
                        font-size: 12px;
                        white-space: nowrap;
                    }

                    .rec-description {
                        margin: 8px 0;
                        line-height: 1.5;
                    }

                    .rec-solution {
                        background: rgba(255, 255, 255, 0.7);
                        padding: 8px;
                        border-radius: 4px;
                        margin: 8px 0;
                        font-size: 14px;
                    }

                    .rec-examples {
                        background: rgba(255, 255, 255, 0.5);
                        padding: 8px;
                        border-radius: 4px;
                        margin: 8px 0;
                        font-size: 13px;
                        font-family: monospace;
                    }

                    .rec-category {
                        font-size: 12px;
                        color: #6c757d;
                        margin-top: 8px;
                        text-align: right;
                    }

                    .score-summary {
                        margin-top: 25px;
                        padding: 15px;
                        background: #f8f9fa;
                        border-radius: 8px;
                    }

                    .score-summary h5 {
                        margin: 0 0 15px 0;
                        color: #495057;
                    }

                    .score-breakdown {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 10px;
                    }

                    .score-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 12px;
                        background: white;
                        border-radius: 6px;
                    }

                    .score-item.total {
                        background: #e9ecef;
                        font-weight: bold;
                    }

                    .score-label {
                        color: #495057;
                    }

                    .score-value {
                        font-weight: bold;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 14px;
                    }

                    .score-value.good {
                        background: #d4edda;
                        color: #155724;
                    }

                    .score-value.warning {
                        background: #fff3cd;
                        color: #856404;
                    }

                    .score-value.bad {
                        background: #f8d7da;
                        color: #721c24;
                    }

                    .critical-list .recommendation-item {
                        animation: pulse 2s infinite;
                    }

                    @keyframes pulse {
                        0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
                    }

                    .security-sections {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        margin-top: 20px;
                    }

                    .mixed-content-stats, .forms-stats, .resources-stats, .cookies-stats {
                        margin-bottom: 10px;
                    }

                    .mixed-breakdown {
                        display: flex;
                        gap: 15px;
                        flex-wrap: wrap;
                        margin: 10px 0;
                    }

                    .mixed-content-list {
                        max-height: 200px;
                        overflow-y: auto;
                        border: 1px solid #e9ecef;
                        border-radius: 4px;
                        padding: 10px;
                    }

                    .mixed-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 5px 0;
                        border-bottom: 1px solid #f1f1f1;
                        font-size: 12px;
                    }

                    .mixed-url {
                        color: #495057;
                        word-break: break-all;
                    }

                    .mixed-host {
                        color: #6c757d;
                        font-size: 11px;
                    }

                    .headers-list {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        margin-top: 10px;
                    }

                    .header-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 8px;
                        border-radius: 4px;
                    }

                    .header-item.implemented {
                        background: #d4edda;
                    }

                    .header-item.missing {
                        background: #f8d7da;
                    }

                    .header-name {
                        font-weight: bold;
                        min-width: 200px;
                        color: #495057;
                    }

                    .header-status {
                        font-size: 14px;
                    }

                    .header-value {
                        font-size: 12px;
                        color: #6c757d;
                        word-break: break-word;
                    }

                    .forms-stats, .resources-stats, .cookies-stats {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 10px;
                        margin-bottom: 15px;
                    }

                    .forms-warning {
                        background: #fff3cd;
                        color: #856404;
                        padding: 8px;
                        border-radius: 4px;
                        margin: 10px 0;
                    }

                    .forms-details {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                    }

                    .form-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 5px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                    }

                    .form-item.secure {
                        background: #d4edda;
                    }

                    .form-item.insecure {
                        background: #f8d7da;
                    }

                    .form-id {
                        font-weight: bold;
                    }

                    .form-method {
                        color: #6c757d;
                    }

                    .resources-breakdown {
                        margin-top: 10px;
                    }

                    .resource-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 4px 0;
                        border-bottom: 1px solid #f1f1f1;
                        font-size: 12px;
                    }

                    .resource-type {
                        background: #e9ecef;
                        padding: 2px 6px;
                        border-radius: 10px;
                        font-size: 11px;
                    }

                    .resource-url {
                        color: #495057;
                        word-break: break-all;
                    }

                    .vulnerabilities-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .vulnerability-item {
                        padding: 12px;
                        border-radius: 6px;
                        border-left: 4px solid;
                    }

                    .vulnerability-item.critical {
                        background: #f8d7da;
                        border-left-color: #dc3545;
                    }

                    .vulnerability-item.high {
                        background: #ffeaa7;
                        border-left-color: #fdcb6e;
                    }

                    .vulnerability-item.medium {
                        background: #fff3cd;
                        border-left-color: #ffc107;
                    }

                    .vulnerability-item.low {
                        background: #d1ecf1;
                        border-left-color: #17a2b8;
                    }

                    .vuln-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }

                    .vuln-severity {
                        font-weight: bold;
                        padding: 2px 8px;
                        border-radius: 10px;
                        font-size: 12px;
                    }

                    .vuln-severity.critical {
                        background: #dc3545;
                        color: white;
                    }

                    .vuln-severity.high {
                        background: #fd7e14;
                        color: white;
                    }

                    .vuln-severity.medium {
                        background: #ffc107;
                        color: #212529;
                    }

                    .vuln-severity.low {
                        background: #17a2b8;
                        color: white;
                    }

                    .vuln-type {
                        font-size: 12px;
                        color: #6c757d;
                    }

                    .vuln-description {
                        margin: 5px 0;
                        font-size: 14px;
                    }

                    .vuln-recommendation {
                        font-size: 13px;
                        color: #28a745;
                        font-weight: bold;
                    }

                    .security-recommendations {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .security-recommendation {
                        padding: 8px;
                        background: #e7f3ff;
                        border-radius: 4px;
                        border-left: 3px solid #007bff;
                    }

                    .no-issues, .no-vulnerabilities {
                        text-align: center;
                        color: #28a745;
                        padding: 20px;
                        font-weight: bold;
                    }

                    .performance-sections {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        margin-top: 20px;
                    }

                    .timing-metrics {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 10px;
                    }

                    .timing-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px;
                        background: #f8f9fa;
                        border-radius: 4px;
                    }

                    .timing-label {
                        color: #495057;
                        font-size: 14px;
                    }

                    .timing-value {
                        font-weight: bold;
                        padding: 2px 8px;
                        border-radius: 10px;
                        font-size: 14px;
                    }

                    .timing-value.good {
                        background: #d4edda;
                        color: #155724;
                    }

                    .timing-value.warning {
                        background: #fff3cd;
                        color: #856404;
                    }

                    .vitals-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 10px;
                        margin-bottom: 15px;
                    }

                    .vital-card {
                        text-align: center;
                        padding: 15px;
                        border-radius: 8px;
                        background: #f8f9fa;
                    }

                    .vital-card.good {
                        border: 2px solid #28a745;
                    }

                    .vital-card.needs-improvement {
                        border: 2px solid #ffc107;
                    }

                    .vital-card.poor {
                        border: 2px solid #dc3545;
                    }

                    .vital-name {
                        font-weight: bold;
                        margin-bottom: 5px;
                        color: #495057;
                    }

                    .vital-value {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }

                    .vital-rating {
                        font-size: 12px;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                        font-weight: bold;
                    }

                    .vital-card.good .vital-rating { color: #28a745; }
                    .vital-card.needs-improvement .vital-rating { color: #ffc107; }
                    .vital-card.poor .vital-rating { color: #dc3545; }

                    .vital-bar {
                        height: 4px;
                        background: #e9ecef;
                        border-radius: 2px;
                        overflow: hidden;
                    }

                    .vital-progress {
                        height: 100%;
                        transition: width 0.3s ease;
                    }

                    .vital-progress.good { background: #28a745; }
                    .vital-progress.needs-improvement { background: #ffc107; }
                    .vital-progress.poor { background: #dc3545; }

                    .vital-details {
                        margin-top: 10px;
                        padding: 8px;
                        background: #e7f3ff;
                        border-radius: 4px;
                        font-size: 14px;
                    }

                    .resource-stats {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                        margin-bottom: 15px;
                    }

                    .resource-total {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 6px;
                    }

                    .largest-resource {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px;
                        background: #fff3cd;
                        border-radius: 6px;
                        margin-bottom: 15px;
                        font-size: 14px;
                    }

                    .resource-name {
                        flex: 1;
                        margin: 0 10px;
                        word-break: break-all;
                    }

                    .resource-size {
                        font-weight: bold;
                        color: #dc3545;
                    }

                    .resource-types {
                        margin-top: 15px;
                    }

                    .resource-type-item {
                        display: grid;
                        grid-template-columns: 80px 60px 80px 80px;
                        gap: 10px;
                        align-items: center;
                        padding: 8px;
                        border-bottom: 1px solid #e9ecef;
                        font-size: 14px;
                    }

                    .type-name {
                        font-weight: bold;
                        text-transform: uppercase;
                        color: #495057;
                    }

                    .type-count, .type-size, .type-time {
                        text-align: center;
                        padding: 2px 6px;
                        background: #e9ecef;
                        border-radius: 10px;
                        font-size: 12px;
                    }

                    .optimization-metrics {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .optimization-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px;
                        border-radius: 6px;
                    }

                    .optimization-item.good {
                        background: #d4edda;
                    }

                    .optimization-item.warning {
                        background: #fff3cd;
                    }

                    .optimization-item.info {
                        background: #d1ecf1;
                    }

                    .opt-label {
                        flex: 1;
                        color: #495057;
                    }

                    .opt-value {
                        font-weight: bold;
                        margin: 0 10px;
                    }

                    .opt-details {
                        color: #6c757d;
                        font-size: 12px;
                    }

                    .performance-recommendations {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .performance-recommendation {
                        padding: 8px;
                        background: #e7f3ff;
                        border-radius: 4px;
                        border-left: 3px solid #007bff;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Полный SEO Анализ</h1>
                        <div class="url">${analysis.url || window.location.href}</div>
                        <div style="margin-top: 15px; font-size: 0.9em;">
                            Сгенерировано: ${new Date().toLocaleString('ru-RU')}
                        </div>
                    </div>
                    
                    <div class="summary">
                        <div class="score-card">
                            <div class="score-value ${this.getScoreClass(analysis.score)}">${analysis.score}%</div>
                            <div class="score-label">Общий балл SEO</div>
                        </div>
                        <div class="score-card">
                            <div class="score-value ${this.getScoreClass(analysis.basic?.basic?.score)}">${analysis.basic?.basic?.score || 0}%</div>
                            <div class="score-label">Базовое SEO</div>
                        </div>
                        <div class="score-card">
                            <div class="score-value ${this.getScoreClass(analysis.performance?.score)}">${analysis.performance?.score || 0}%</div>
                            <div class="score-label">Производительность</div>
                        </div>
                        <div class="score-card">
                            <div class="score-value ${this.getScoreClass(analysis.security?.score)}">${analysis.security?.score || 0}%</div>
                            <div class="score-label">Безопасность</div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Базовые SEO элементы</h2>
                        ${basicHtml}
                    </div>
                    
                    <div class="section">
                        <h2>Анализ контента</h2>
                        ${contentHtml}
                    </div>
                    
                    <div class="section">
                        <h2>Технический анализ</h2>
                        ${technicalHtml}
                    </div>
                    
                    <div class="section">
                        <h2>Производительность</h2>
                        ${performanceHtml}
                    </div>
                    
                    <div class="section">
                        <h2>Безопасность</h2>
                        ${securityHtml}
                    </div>
                    
                    <div class="section">
                        <h2>Рекомендации по улучшению</h2>
                        ${recommendationsHtml}
                    </div>
                    
                    <div class="footer">
                        <p>Отчет сгенерирован с помощью SEO Analyzer Evolution CE</p>
                        <p>Дата создания: ${new Date().toLocaleString('ru-RU')}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    generateExportText(analysis) {
        let text = `SEO АНАЛИЗ ОТЧЕТ\n`;
        text += `================\n\n`;
        text += `URL: ${analysis.url || window.location.href}\n`;
        text += `Дата анализа: ${new Date().toLocaleString('ru-RU')}\n`;
        text += `Общий балл: ${analysis.score}%\n\n`;
        
        text += `БАЗОВЫЕ ЭЛЕМЕНТЫ:\n`;
        text += `----------------\n`;
        text += `Заголовок: ${analysis.basic?.basic?.title?.value || 'Не задан'}\n`;
        text += `Описание: ${analysis.basic?.basic?.description?.value || 'Не задан'}\n`;
        text += `H1 заголовков: ${analysis.basic?.basic?.h1?.count || 0}\n`;
        text += `Балл: ${analysis.basic?.basic?.score || 0}%\n\n`;
        
        text += `ПРОИЗВОДИТЕЛЬНОСТЬ:\n`;
        text += `------------------\n`;
        text += `Время загрузки: ${analysis.performance?.loadTime || 0}ms\n`;
        text += `Размер страницы: ${Math.round((analysis.performance?.pageSize || 0) / 1024)}KB\n`;
        text += `Запросов: ${analysis.performance?.requests || 0}\n`;
        text += `Балл: ${analysis.performance?.score || 0}%\n\n`;
        
        text += `БЕЗОПАСНОСТЬ:\n`;
        text += `------------\n`;
        text += `HTTPS: ${analysis.security?.https ? 'Да' : 'Нет'}\n`;
        text += `Mixed Content: ${analysis.security?.mixedContent?.total || 0} проблем\n`;
        text += `Балл: ${analysis.security?.score || 0}%\n\n`;
        
        text += `РЕКОМЕНДАЦИИ:\n`;
        text += `-------------\n`;
        const recommendations = analysis.recommendations || [];
        recommendations.forEach((rec, index) => {
            text += `${index + 1}. [${rec.priority?.toUpperCase()}] ${rec.title}\n`;
            text += `    ${rec.description}\n`;
            text += `    Решение: ${rec.suggestion}\n\n`;
        });
        
        return text;
    }

    getScoreClass(score) {
        if (score >= 80) return 'score-good';
        if (score >= 60) return 'score-warning';
        return 'score-bad';
    }
}