import BasicElementsAnalyzer from './htmlanalyzer/BasicElementsAnalyzer.js';
import ContentAnalyzer from './htmlanalyzer/ContentAnalyzer.js';
import MetaTagsAnalyzer from './htmlanalyzer/MetaTagsAnalyzer.js';
import TechnicalAnalyzer from './htmlanalyzer/TechnicalAnalyzer.js';

export default class HtmlAnalyzer {
    constructor() {
        this.basicAnalyzer = new BasicElementsAnalyzer();
        this.contentAnalyzer = new ContentAnalyzer();
        this.metaAnalyzer = new MetaTagsAnalyzer();
        this.technicalAnalyzer = new TechnicalAnalyzer();
    }

    analyze(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const basicAnalysis = this.basicAnalyzer.analyze(doc);
        const contentAnalysis = this.contentAnalyzer.analyze(doc);
        const metaAnalysis = this.metaAnalyzer.analyze(doc);
        const technicalAnalysis = this.technicalAnalyzer.analyze(doc);

        return {
            basic: basicAnalysis,
            content: contentAnalysis,
            meta: metaAnalysis,
            technical: technicalAnalysis,
            score: this.calculateHtmlScore(basicAnalysis, contentAnalysis)
        };
    }

    calculateHtmlScore(basic, content) {
        const basicScore = basic.score || 0;
        const contentScore = content.score || 0;
        
        return Math.round((basicScore + contentScore) / 2);
    }
}