export default class TechnicalAnalyzer {
    analyze(doc, url) {
        const analyses = {
            language: this.analyzeLanguage(doc),
            favicon: this.analyzeFavicon(doc),
            schema: this.analyzeSchemaMarkup(doc),
            social: this.analyzeSocialLinks(doc),
            structure: this.analyzeStructure(doc),
            performance: this.analyzePerformance(doc),
            security: this.analyzeSecurity(doc),
            metaTags: this.analyzeMetaTags(doc),
            scripts: this.analyzeScripts(doc),
            links: this.analyzeTechnicalLinks(doc),
            accessibility: this.analyzeAccessibility(doc),
            seo: this.analyzeTechnicalSEO(doc, url)
        };

        // Добавляем общую оценку
        const overallScore = this.calculateOverallScore(analyses);

        return {
            ...analyses,
            score: overallScore,
            grade: this.getTechnicalGrade(overallScore),
            recommendations: this.generateTechnicalRecommendations(analyses)
        };
    }

    calculateOverallScore(analyses) {
        const weights = {
            language: 0.08,        // Язык документа
            favicon: 0.05,         // Фавикон
            schema: 0.15,          // Schema markup
            structure: 0.12,       // Структура HTML
            performance: 0.10,     // Технические аспекты производительности
            security: 0.10,        // Безопасность
            metaTags: 0.12,        // Мета-теги
            scripts: 0.08,         // Скрипты
            links: 0.05,           // Технические ссылки
            accessibility: 0.08,   // Доступность
            seo: 0.07              // Техническое SEO
        };

        const scores = {
            language: this.calculateLanguageScore(analyses.language),
            favicon: this.calculateFaviconScore(analyses.favicon),
            schema: this.calculateSchemaScore(analyses.schema),
            structure: analyses.structure.score,
            performance: this.calculatePerformanceScore(analyses.performance),
            security: this.calculateSecurityScore(analyses.security),
            metaTags: this.calculateMetaTagsScore(analyses.metaTags),
            scripts: this.calculateScriptsScore(analyses.scripts),
            links: this.calculateLinksScore(analyses.links),
            accessibility: this.calculateAccessibilityScore(analyses.accessibility),
            seo: this.calculateTechnicalSEOScore(analyses.seo)
        };

        // Вычисляем общий взвешенный балл
        let totalScore = 0;
        Object.entries(weights).forEach(([category, weight]) => {
            totalScore += scores[category] * weight;
        });

        return Math.max(0, Math.min(100, Math.round(totalScore)));
    }

    // 🔧 Методы расчета оценок для каждой категории

    calculateLanguageScore(languageAnalysis) {
        let score = 0;
        if (languageAnalysis.exists) score += 70;
        if (languageAnalysis.valid) score += 30;
        return score;
    }

    calculateFaviconScore(faviconAnalysis) {
        if (!faviconAnalysis.exists) return 0;
        let score = 50; // Базовый балл за наличие
        
        if (faviconAnalysis.hasAppleTouch) score += 25;
        if (faviconAnalysis.count > 1) score += 15; // Несколько размеров
        if (faviconAnalysis.icons.some(icon => icon.sizes)) score += 10;
        
        return Math.min(score, 100);
    }

    calculateSchemaScore(schemaAnalysis) {
        if (schemaAnalysis.count === 0) return 0;
        
        let score = 0;
        
        // Баллы за количество и валидность
        score += Math.min(schemaAnalysis.validCount * 15, 40);
        
        // Баллы за покрытие важных типов
        const essentialTypes = ['Organization', 'WebSite', 'BreadcrumbList'];
        const foundEssential = essentialTypes.filter(type => 
            schemaAnalysis.foundCommonTypes.includes(type)
        ).length;
        
        score += foundEssential * 20;
        
        // Бонус за разнообразие
        if (schemaAnalysis.diversity >= 3) score += 10;
        
        return Math.min(score, 100);
    }

    calculatePerformanceScore(performanceAnalysis) {
        let score = 100;
        
        // Штрафы за проблемы с производительностью
        const scripts = performanceAnalysis.scripts;
        const styles = performanceAnalysis.styles;
        const images = performanceAnalysis.images;
        
        // Синхронные скрипты
        if (scripts.sync > 3) score -= 10;
        if (scripts.sync > 5) score -= 10;
        
        // Внешние стили
        if (styles.external > 5) score -= 5;
        
        // Изображения без размеров
        const imagesWithoutDimensions = images.count - images.withDimensions;
        if (imagesWithoutDimensions > 5) score -= 10;
        
        // Изображения без lazy loading
        if (images.lazy / images.count < 0.3) score -= 10;
        
        return Math.max(0, score);
    }

    calculateSecurityScore(securityAnalysis) {
        let score = 100;
        
        // CSP
        if (!securityAnalysis.csp.exists) score -= 20;
        
        // Небезопасные формы
        const insecureForms = securityAnalysis.forms.count - securityAnalysis.forms.secure;
        if (insecureForms > 0) score -= insecureForms * 5;
        
        // Внешние скрипты
        if (securityAnalysis.externalScripts.count > 10) score -= 10;
        
        return Math.max(0, score);
    }

    calculateMetaTagsScore(metaTagsAnalysis) {
        let score = 0;
        
        // Базовые мета-теги
        if (metaTagsAnalysis.basic.viewport) score += 20;
        if (metaTagsAnalysis.basic.description) score += 15;
        if (metaTagsAnalysis.basic.robots) score += 10;
        
        // Open Graph
        if (metaTagsAnalysis.hasOG) score += 25;
        
        // Twitter Cards
        if (metaTagsAnalysis.hasTwitter) score += 15;
        
        // Дополнительные баллы за полноту
        const ogTags = Object.keys(metaTagsAnalysis.openGraph).length;
        if (ogTags >= 4) score += 15;
        
        return Math.min(score, 100);
    }

    calculateScriptsScore(scriptsAnalysis) {
        let score = 100;
        
        // Штрафы за проблемы со скриптами
        if (scriptsAnalysis.inline > 5) score -= 10;
        if (scriptsAnalysis.external > 15) score -= 10;
        
        // Бонусы за оптимизации
        const totalScripts = scriptsAnalysis.total;
        if (totalScripts > 0) {
            const asyncDeferRatio = (scriptsAnalysis.async + scriptsAnalysis.defer) / totalScripts;
            if (asyncDeferRatio > 0.5) score += 10;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    calculateLinksScore(linksAnalysis) {
        let score = 0;
        
        if (linksAnalysis.hasCanonical) score += 30;
        if (linksAnalysis.hasPreload) score += 20;
        if (linksAnalysis.hasPreconnect) score += 15;
        if (linksAnalysis.hasDNS) score += 10;
        
        // Бонус за разнообразие типов ссылок
        const linkTypesCount = Object.keys(linksAnalysis.types).length;
        if (linkTypesCount >= 3) score += 25;
        
        return Math.min(score, 100);
    }

    calculateAccessibilityScore(accessibilityAnalysis) {
        let score = 0;
        
        // Изображения с alt
        if (accessibilityAnalysis.images.total > 0) {
            const altRatio = accessibilityAnalysis.images.withAlt / accessibilityAnalysis.images.total;
            score += Math.round(altRatio * 40);
        }
        
        // Формы с labels
        if (accessibilityAnalysis.forms.total > 0) {
            const labelsRatio = accessibilityAnalysis.forms.withLabels / accessibilityAnalysis.forms.total;
            score += Math.round(labelsRatio * 30);
        }
        
        // Лендмарки
        const landmarks = accessibilityAnalysis.landmarks;
        const landmarkCount = Object.values(landmarks).filter(Boolean).length;
        score += landmarkCount * 10;
        
        // Язык
        if (accessibilityAnalysis.language.defined) score += 10;
        
        return Math.min(score, 100);
    }

    calculateTechnicalSEOScore(seoAnalysis) {
        let score = 0;
        
        if (seoAnalysis.canonical.exists) score += 30;
        if (seoAnalysis.canonical.matchesCurrent) score += 20;
        
        if (seoAnalysis.robots.exists) score += 15;
        if (seoAnalysis.robots.allowsIndex) score += 15;
        
        if (seoAnalysis.hreflang.exists) score += 20;
        
        return Math.min(score, 100);
    }

    getTechnicalGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    generateTechnicalRecommendations(analyses) {
        const recommendations = [];
        
        // Язык
        if (!analyses.language.exists) {
            recommendations.push('Добавьте атрибут lang к тегу <html>');
        }
        
        // Schema markup
        if (analyses.schema.count === 0) {
            recommendations.push('Добавьте schema markup для улучшения SEO');
        } else if (analyses.schema.validCount < analyses.schema.count) {
            recommendations.push('Исправьте ошибки в schema markup');
        }
        
        // Структура
        if (!analyses.structure.header.exists) {
            recommendations.push('Добавьте семантический <header>');
        }
        if (!analyses.structure.main.exists) {
            recommendations.push('Добавьте семантический <main>');
        }
        
        // Безопасность
        if (!analyses.security.csp.exists) {
            recommendations.push('Рассмотрите добавление Content Security Policy');
        }
        
        // Open Graph
        if (!analyses.metaTags.hasOG) {
            recommendations.push('Добавьте Open Graph разметку для социальных сетей');
        }
        
        return recommendations.slice(0, 5); // Ограничиваем 5 рекомендациями
    }

    analyzeLanguage(doc) {
        const lang = doc.documentElement.getAttribute('lang');
        const validLanguages = ['ru', 'en', 'de', 'fr', 'es', 'it', 'zh', 'ja', 'ko'];
        
        return {
            exists: !!lang,
            value: lang || 'Не указан',
            valid: validLanguages.some(validLang => lang && lang.startsWith(validLang)),
            direction: doc.documentElement.getAttribute('dir') || 'ltr'
        };
    }

    analyzeFavicon(doc) {
        const favicons = doc.querySelectorAll('link[rel*="icon"]');
        const icons = Array.from(favicons).map(icon => ({
            rel: icon.getAttribute('rel'),
            href: icon.getAttribute('href'),
            sizes: icon.getAttribute('sizes'),
            type: icon.getAttribute('type')
        }));

        return {
            exists: favicons.length > 0,
            count: favicons.length,
            icons: icons,
            hasAppleTouch: doc.querySelector('link[rel="apple-touch-icon"]') !== null,
            hasMaskIcon: doc.querySelector('link[rel="mask-icon"]') !== null
        };
    }

    analyzeSchemaMarkup(doc) {
        const schemas = doc.querySelectorAll('script[type="application/ld+json"]');
        const foundSchemas = [];
        let validCount = 0;
        
        schemas.forEach(schema => {
            try {
                const data = JSON.parse(schema.textContent);
                const isValid = this.validateSchema(data);
                if (isValid) validCount++;
                
                // Определяем тип схемы (обрабатываем массивы и вложенные структуры)
                let schemaType = 'Unknown';
                if (Array.isArray(data)) {
                    schemaType = 'Array';
                } else if (data['@type']) {
                    if (Array.isArray(data['@type'])) {
                        schemaType = data['@type'].join(', ');
                    } else {
                        schemaType = data['@type'];
                    }
                }
                
                foundSchemas.push({
                    type: schemaType,
                    valid: isValid,
                    context: data['@context'],
                    data: this.simplifySchemaData(data)
                });
            } catch (e) {
                foundSchemas.push({ 
                    type: 'Invalid JSON', 
                    valid: false,
                    error: e.message 
                });
            }
        });

        const commonTypes = ['Organization', 'WebSite', 'Article', 'Product', 'BreadcrumbList', 'LocalBusiness'];
        
        // Используем commonTypes для проверки наличия популярных типов схем
        const foundTypes = new Set();
        foundSchemas.forEach(schema => {
            commonTypes.forEach(type => {
                if (schema.type && schema.type.includes(type)) {
                    foundTypes.add(type);
                }
            });
        });

        // Проверяем наличие конкретных типов схем
        const hasOrganization = foundTypes.has('Organization');
        const hasBreadcrumb = foundTypes.has('BreadcrumbList');
        const hasWebsite = foundTypes.has('WebSite');
        const hasArticle = foundTypes.has('Article');
        const hasProduct = foundTypes.has('Product');
        const hasLocalBusiness = foundTypes.has('LocalBusiness');
        
        return {
            count: schemas.length,
            validCount: validCount,
            schemas: foundSchemas,
            hasOrganization: hasOrganization,
            hasBreadcrumb: hasBreadcrumb,
            hasWebsite: hasWebsite,
            hasArticle: hasArticle,
            hasProduct: hasProduct,
            hasLocalBusiness: hasLocalBusiness,
            coverage: schemas.length > 0 ? Math.round((validCount / schemas.length) * 100) : 0,
            diversity: foundTypes.size, // Количество уникальных типов из commonTypes
            foundCommonTypes: Array.from(foundTypes) // Список найденных типов
        };
    }

    analyzeSocialLinks(doc) {
        const socialLinks = {};
        const socialPatterns = {
            facebook: ['facebook.com', 'fb.com'],
            twitter: ['twitter.com', 'x.com'],
            instagram: ['instagram.com'],
            linkedin: ['linkedin.com'],
            youtube: ['youtube.com', 'youtu.be'],
            telegram: ['t.me', 'telegram.me'],
            vk: ['vk.com', 'vkontakte.ru'],
            whatsapp: ['wa.me', 'whatsapp.com'],
            tiktok: ['tiktok.com']
        };
        
        doc.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            Object.entries(socialPatterns).forEach(([platform, patterns]) => {
                patterns.forEach(pattern => {
                    if (href.includes(pattern)) {
                        if (!socialLinks[platform]) {
                            socialLinks[platform] = [];
                        }
                        socialLinks[platform].push({
                            url: href,
                            text: link.textContent.trim(),
                            nofollow: link.getAttribute('rel')?.includes('nofollow') || false
                        });
                    }
                });
            });
        });
        
        return {
            platforms: Object.keys(socialLinks).length,
            links: socialLinks,
            total: Object.values(socialLinks).flat().length
        };
    }

    analyzeStructure(doc) {
        const structure = {
            header: this.analyzeHeader(doc),
            nav: this.analyzeNavigation(doc),
            main: this.analyzeMain(doc),
            footer: this.analyzeFooter(doc),
            semantic: this.analyzeSemanticElements(doc),
            breadcrumbs: this.analyzeBreadcrumbs(doc),
            forms: this.analyzeForms(doc)
        };
        
        structure.score = this.calculateStructureScore(structure);
        return structure;
    }

    analyzeHeader(doc) {
        const header = doc.querySelector('header');
        return {
            exists: !!header,
            multiple: doc.querySelectorAll('header').length > 1,
            hasH1: header ? header.querySelector('h1') !== null : false,
            hasNav: header ? header.querySelector('nav') !== null : false
        };
    }

    analyzeNavigation(doc) {
        const navs = doc.querySelectorAll('nav');
        return {
            exists: navs.length > 0,
            count: navs.length,
            hasList: Array.from(navs).some(nav => nav.querySelector('ul, ol') !== null),
            hasLinks: Array.from(navs).some(nav => nav.querySelector('a[href]') !== null)
        };
    }

    analyzeMain(doc) {
        const main = doc.querySelector('main');
        return {
            exists: !!main,
            multiple: doc.querySelectorAll('main').length > 1,
            hasH1: main ? main.querySelector('h1') !== null : false,
            hasArticle: main ? main.querySelector('article') !== null : false
        };
    }

    analyzeFooter(doc) {
        const footer = doc.querySelector('footer');
        return {
            exists: !!footer,
            multiple: doc.querySelectorAll('footer').length > 1,
            hasLinks: footer ? footer.querySelector('a[href]') !== null : false,
            hasSocial: footer ? this.hasSocialLinks(footer) : false
        };
    }

    analyzeForms(doc) {
        const forms = doc.querySelectorAll('form');
        const analyzedForms = Array.from(forms).map(form => ({
            hasSubmit: form.querySelector('[type="submit"]') !== null,
            hasLabels: form.querySelector('label') !== null,
            method: form.getAttribute('method') || 'GET',
            action: form.getAttribute('action') || '',
            inputs: form.querySelectorAll('input, textarea, select').length
        }));

        return {
            count: forms.length,
            forms: analyzedForms,
            hasContactForm: this.hasContactForm(forms)
        };
    }

    analyzePerformance(doc) {
        const scripts = doc.querySelectorAll('script');
        const styles = doc.querySelectorAll('link[rel="stylesheet"], style');
        const images = doc.querySelectorAll('img');
        
        return {
            scripts: {
                count: scripts.length,
                sync: Array.from(scripts).filter(s => !s.async && !s.defer).length,
                async: Array.from(scripts).filter(s => s.async).length,
                defer: Array.from(scripts).filter(s => s.defer).length,
                external: Array.from(scripts).filter(s => s.src).length
            },
            styles: {
                count: styles.length,
                inline: Array.from(styles).filter(s => s.tagName === 'STYLE').length,
                external: Array.from(styles).filter(s => s.href).length
            },
            images: {
                count: images.length,
                withDimensions: Array.from(images).filter(img => 
                    img.width || img.height || img.hasAttribute('width') || img.hasAttribute('height')
                ).length,
                lazy: Array.from(images).filter(img => 
                    img.loading === 'lazy' || img.hasAttribute('data-lazy')
                ).length
            }
        };
    }

    analyzeSecurity(doc) {
        const meta = doc.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const forms = doc.querySelectorAll('form');
        
        return {
            csp: {
                exists: !!meta,
                value: meta ? meta.getAttribute('content') : ''
            },
            forms: {
                count: forms.length,
                secure: Array.from(forms).filter(form => {
                    const action = form.getAttribute('action') || '';
                    return action.startsWith('https://') || action.startsWith('//') || !action.includes('http');
                }).length,
                hasCaptcha: Array.from(forms).some(form => 
                    form.innerHTML.includes('g-recaptcha') || 
                    form.querySelector('[class*="captcha"]')
                )
            },
            externalScripts: {
                count: Array.from(doc.querySelectorAll('script[src]')).filter(s => {
                    const src = s.getAttribute('src');
                    return src && !src.startsWith('/') && !src.includes(window.location.hostname);
                }).length
            }
        };
    }

    analyzeMetaTags(doc) {
        const metaTags = {};
        const importantMeta = [
            'viewport', 'description', 'keywords', 'robots', 'generator',
            'author', 'theme-color', 'msapplication-TileColor'
        ];
        
        importantMeta.forEach(name => {
            const meta = doc.querySelector(`meta[name="${name}"]`);
            if (meta) {
                metaTags[name] = meta.getAttribute('content');
            }
        });

        // Open Graph
        const ogTags = {};
        doc.querySelectorAll('meta[property^="og:"]').forEach(meta => {
            const property = meta.getAttribute('property').replace('og:', '');
            ogTags[property] = meta.getAttribute('content');
        });

        // Twitter Cards
        const twitterTags = {};
        doc.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
            const name = meta.getAttribute('name').replace('twitter:', '');
            twitterTags[name] = meta.getAttribute('content');
        });

        return {
            basic: metaTags,
            openGraph: ogTags,
            twitter: twitterTags,
            hasOG: Object.keys(ogTags).length > 0,
            hasTwitter: Object.keys(twitterTags).length > 0
        };
    }

    analyzeScripts(doc) {
        const scripts = doc.querySelectorAll('script');
        const analyzed = Array.from(scripts).map(script => ({
            src: script.getAttribute('src'),
            async: script.async,
            defer: script.defer,
            type: script.getAttribute('type'),
            module: script.getAttribute('type') === 'module'
        }));

        return {
            total: scripts.length,
            inline: analyzed.filter(s => !s.src).length,
            external: analyzed.filter(s => s.src).length,
            async: analyzed.filter(s => s.async).length,
            defer: analyzed.filter(s => s.defer).length,
            modules: analyzed.filter(s => s.module).length
        };
    }

    analyzeTechnicalLinks(doc) {
        const links = doc.querySelectorAll('link[rel]');
        const linkTypes = {};
        
        links.forEach(link => {
            const rel = link.getAttribute('rel');
            if (!linkTypes[rel]) {
                linkTypes[rel] = [];
            }
            linkTypes[rel].push({
                href: link.getAttribute('href'),
                type: link.getAttribute('type'),
                sizes: link.getAttribute('sizes')
            });
        });

        return {
            total: links.length,
            types: linkTypes,
            hasPreload: !!linkTypes.preload,
            hasPreconnect: !!linkTypes.preconnect,
            hasDNS: !!linkTypes['dns-prefetch'],
            hasCanonical: !!linkTypes.canonical
        };
    }

    analyzeAccessibility(doc) {
        const images = doc.querySelectorAll('img');
        const forms = doc.querySelectorAll('form');
        
        return {
            images: {
                withAlt: Array.from(images).filter(img => 
                    img.alt && img.alt.trim() !== ''
                ).length,
                total: images.length
            },
            forms: {
                withLabels: Array.from(forms).filter(form => 
                    form.querySelector('label')
                ).length,
                total: forms.length
            },
            landmarks: {
                hasMain: !!doc.querySelector('main'),
                hasHeader: !!doc.querySelector('header'),
                hasFooter: !!doc.querySelector('footer'),
                hasNav: !!doc.querySelector('nav')
            },
            language: {
                defined: !!doc.documentElement.getAttribute('lang')
            }
        };
    }

    analyzeTechnicalSEO(doc, url) {
        const canonical = doc.querySelector('link[rel="canonical"]');
        const robots = doc.querySelector('meta[name="robots"]');
        
        return {
            canonical: {
                exists: !!canonical,
                url: canonical ? canonical.getAttribute('href') : '',
                matchesCurrent: canonical ? 
                    this.normalizeUrl(canonical.getAttribute('href')) === this.normalizeUrl(url) : false
            },
            robots: {
                exists: !!robots,
                content: robots ? robots.getAttribute('content') : '',
                allowsIndex: robots ? !robots.getAttribute('content')?.includes('noindex') : true,
                allowsFollow: robots ? !robots.getAttribute('content')?.includes('nofollow') : true
            },
            hreflang: {
                exists: doc.querySelector('link[rel="alternate"][hreflang]') !== null,
                count: doc.querySelectorAll('link[rel="alternate"][hreflang]').length
            }
        };
    }

    // Вспомогательные методы
    analyzeSemanticElements(doc) {
        const semanticTags = ['header', 'nav', 'main', 'footer', 'article', 'section', 'aside', 'figure', 'time'];
        const result = {};
        semanticTags.forEach(tag => {
            result[tag] = doc.querySelectorAll(tag).length;
        });
        return result;
    }

    analyzeBreadcrumbs(doc) {
        const breadcrumbs = doc.querySelector('[aria-label="breadcrumb"], .breadcrumbs, .breadcrumb');
        
        // Исправленная проверка Schema.org BreadcrumbList
        let hasSchema = false;
        const schemaScripts = doc.querySelectorAll('script[type="application/ld+json"]');
        
        schemaScripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                if (data['@type'] === 'BreadcrumbList' || 
                    (Array.isArray(data['@type']) && data['@type'].includes('BreadcrumbList')) ||
                    (data['@type'] === 'WebPage' && data.breadcrumb)) {
                    hasSchema = true;
                }
            } catch (e) {
                // Игнорируем невалидный JSON
            }
        });

        return {
            exists: !!breadcrumbs,
            elements: breadcrumbs ? breadcrumbs.querySelectorAll('*').length : 0,
            hasSchema: hasSchema
        };
    }

    hasSocialLinks(element) {
        const socialPatterns = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
        const links = element.querySelectorAll('a[href]');
        return Array.from(links).some(link => {
            const href = link.getAttribute('href');
            return socialPatterns.some(pattern => href && href.includes(pattern));
        });
    }

    hasContactForm(forms) {
        return Array.from(forms).some(form => {
            const html = form.innerHTML.toLowerCase();
            return html.includes('contact') || html.includes('message') || html.includes('email');
        });
    }

    simplifySchemaData(data) {
        const simple = {};
        
        if (Array.isArray(data)) {
            // Обрабатываем массивы схем
            simple.items = data.length;
            if (data[0] && data[0]['@type']) {
                simple.types = data.map(item => item['@type']).filter(Boolean).join(', ');
            }
            return simple;
        }
        
        // Обрабатываем одиночные схемы
        if (data.name) simple.name = data.name;
        if (data.url) simple.url = data.url;
        if (data.description) simple.description = data.description;
        if (data.headline) simple.headline = data.headline;
        
        // Для BreadcrumbList
        if (data['@type'] === 'BreadcrumbList' && data.itemListElement) {
            simple.breadcrumbs = data.itemListElement.length;
        }
        
        // Для Organization
        if (data['@type'] === 'Organization' && data.logo) {
            simple.hasLogo = true;
        }
        
        return simple;
    }

    validateSchema(schema) {
        // Базовые обязательные поля
        const hasContext = '@context' in schema;
        const hasType = '@type' in schema;
        
        // Дополнительные проверки в зависимости от типа
        if (hasContext && hasType) {
            const context = schema['@context'];
            const type = schema['@type'];
            
            // Проверяем валидность @context
            if (context !== 'https://schema.org' && context !== 'http://schema.org') {
                return false;
            }
            
            // Проверяем что @type не пустой
            if (!type || (typeof type === 'string' && type.trim() === '')) {
                return false;
            }
            
            return true;
        }
        
        return false;
    }

    normalizeUrl(url) {
        return url.replace(/https?:\/\//, '').replace(/\/$/, '');
    }

    calculateStructureScore(structure) {
        let score = 0;
        if (structure.header.exists) score += 20;
        if (structure.nav.exists) score += 20;
        if (structure.main.exists) score += 20;
        if (structure.footer.exists) score += 20;
        if (structure.breadcrumbs.exists) score += 10;
        if (structure.semantic.article > 0) score += 10;
        return Math.min(score, 100);
    }
}