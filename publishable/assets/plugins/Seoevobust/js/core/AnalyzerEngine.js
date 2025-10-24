import HtmlAnalyzer from '../analyzers/HtmlAnalyzer.js';
import PerformanceAnalyzer from '../analyzers/PerformanceAnalyzer.js';
import SecurityAnalyzer from '../analyzers/SecurityAnalyzer.js';

export default class AnalyzerEngine {
    constructor() {
        this.htmlAnalyzer = new HtmlAnalyzer();
        this.performanceAnalyzer = new PerformanceAnalyzer();
        this.securityAnalyzer = new SecurityAnalyzer();
    }

    async analyze(url) {
        const html = document.documentElement.outerHTML;
        
        const [htmlAnalysis, performanceAnalysis, securityAnalysis] = await Promise.all([
            this.htmlAnalyzer.analyze(html),
            this.performanceAnalyzer.analyze(),
            this.securityAnalyzer.analyze(document)
        ]);

        const allRecommendations = [
            ...(htmlAnalysis.basic.recommendations || []),
            ...(htmlAnalysis.content.recommendations || []),
            ...(htmlAnalysis.technical.recommendations || []),
            ...(performanceAnalysis.recommendations || []),
            ...(securityAnalysis.recommendations || [])
        ];
        
        const overallScore = this.calculateOverallScore(
            htmlAnalysis.score,
            performanceAnalysis.score,
            securityAnalysis.score
        );

        return {
            basic: htmlAnalysis,
            performance: performanceAnalysis,
            security: securityAnalysis,
            timestamp: new Date().toISOString(),
            url: url,
            score: overallScore,
            recommendations: allRecommendations,
        };
    }

    calculateOverallScore(basicScore, performanceScore, securityScore) {
        const basic = basicScore || 0;
        const perf = performanceScore || 0;
        const sec = securityScore || 0;
        
        return Math.round(
            (basic * 0.4) + 
            (perf * 0.3) + 
            (sec * 0.3)
        );
    }
}