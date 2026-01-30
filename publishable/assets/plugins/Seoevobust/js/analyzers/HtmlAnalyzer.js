import BasicElementsAnalyzer from './htmlanalyzer/BasicElementsAnalyzer.js';
import ContentAnalyzer from './htmlanalyzer/ContentAnalyzer.js';
import TechnicalAnalyzer from './htmlanalyzer/TechnicalAnalyzer.js';

export default class HtmlAnalyzer {
    constructor() {
        this.basicAnalyzer = new BasicElementsAnalyzer();
        this.contentAnalyzer = new ContentAnalyzer();
        this.technicalAnalyzer = new TechnicalAnalyzer();
    }

    analyze(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const currentUrl = window.location.href;

        const basicAnalysis = this.basicAnalyzer.analyze(doc);
        const contentAnalysis = this.contentAnalyzer.analyze(doc);
        const technicalAnalysis = this.technicalAnalyzer.analyze(doc, currentUrl);

        return {
            basic: basicAnalysis,
            content: contentAnalysis,
            technical: technicalAnalysis,
            score: this.calculateHtmlScore(basicAnalysis, contentAnalysis, technicalAnalysis),
        };
    }

    calculateHtmlScore(basic, content, technical) {
        const basicScore = basic.score || 0;
        const contentScore = content.score || 0;
        const technicalScore = technical.score || 0;
        return Math.round((basicScore + contentScore + technicalScore) / 3);
    }
}