import ProfessionalSeoAnalyzer from './core/SeoAnalyzer.js';

// Инициализация с обработкой ошибок
document.addEventListener('DOMContentLoaded', function() {
    try {
        const seoAnalyzer = new ProfessionalSeoAnalyzer();
        seoAnalyzer.init().catch(error => {
            console.error('❌ SEO Analyzer init failed:', error);
        });
    } catch (error) {
        console.error('❌ SEO Analyzer initialization error:', error);
    }
});

// Экспорт для использования как модуля
export default ProfessionalSeoAnalyzer;