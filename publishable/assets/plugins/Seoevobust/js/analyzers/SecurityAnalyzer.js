export default class SecurityAnalyzer {
    analyze(doc) {
        const isHTTPS = window.location.protocol === 'https:';
        const mixedContent = this.checkMixedContent(doc);
        const securityHeaders = this.checkSecurityHeaders();
        const formsSecurity = this.analyzeFormsSecurity(doc);
        const externalResources = this.analyzeExternalResources(doc);
        const cookies = this.analyzeCookies();
        const vulnerabilities = this.checkCommonVulnerabilities(doc);

        const score = this.calculateSecurityScore(
            isHTTPS, 
            mixedContent, 
            securityHeaders, 
            formsSecurity,
            externalResources,
            cookies
        );

        return {
            https: isHTTPS,
            mixedContent: mixedContent,
            securityHeaders: securityHeaders,
            formsSecurity: formsSecurity,
            externalResources: externalResources,
            cookies: cookies,
            vulnerabilities: vulnerabilities,
            score: score,
            riskLevel: this.getRiskLevel(score)
        };
    }

    checkMixedContent(doc) {
        const mixed = {
            total: 0,
            images: [],
            scripts: [],
            styles: [],
            iframes: [],
            other: []
        };

        if (window.location.protocol === 'https:') {
            const selectors = [
                'img[src^="http://"]',
                'script[src^="http://"]', 
                'link[href^="http://"][rel="stylesheet"]',
                'iframe[src^="http://"]',
                'video[src^="http://"]',
                'audio[src^="http://"]',
                'source[src^="http://"]',
                'object[data^="http://"]',
                'embed[src^="http://"]'
            ];

            selectors.forEach(selector => {
                doc.querySelectorAll(selector).forEach(el => {
                    const url = el.src || el.href || el.data;
                    try {
                        const parsed = new URL(url);
                        const resourceType = this.getResourceType(el.tagName);
                        
                        mixed[resourceType].push({
                            url: url,
                            element: el.tagName,
                            hostname: parsed.hostname
                        });
                        mixed.total++;
                    } catch (e) {
                        mixed.other.push({
                            url: url,
                            element: el.tagName,
                            error: 'Invalid URL'
                        });
                        mixed.total++;
                    }
                });
            });
        }

        return mixed;
    }

    getResourceType(tagName) {
        const typeMap = {
            'IMG': 'images',
            'SCRIPT': 'scripts', 
            'LINK': 'styles',
            'IFRAME': 'iframes',
            'VIDEO': 'other',
            'AUDIO': 'other',
            'SOURCE': 'other',
            'OBJECT': 'other',
            'EMBED': 'other'
        };
        return typeMap[tagName] || 'other';
    }

    checkSecurityHeaders() {
        // В браузере мы не можем получить реальные заголовки ответа,
        // но можем проверить наличие некоторых через meta-теги и другие индикаторы
        return {
            'content-security-policy': this.checkCSP(),
            'x-frame-options': this.checkFrameOptions(),
            'x-content-type-options': this.checkContentTypeOptions(),
            'strict-transport-security': this.checkHSTS(),
            'x-xss-protection': this.checkXSSProtection(),
            'referrer-policy': this.checkReferrerPolicy()
        };
    }

    checkCSP() {
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (cspMeta) {
            return {
                exists: true,
                value: cspMeta.getAttribute('content'),
                source: 'meta-tag',
                status: 'implemented'
            };
        }

        // Попытка обнаружить CSP через другие индикаторы
        const scriptNonces = document.querySelectorAll('script[nonce]');
        const styleNonces = document.querySelectorAll('style[nonce]');
        
        return {
            exists: scriptNonces.length > 0 || styleNonces.length > 0,
            value: null,
            source: scriptNonces.length > 0 ? 'nonce-detected' : 'not-detected',
            status: scriptNonces.length > 0 ? 'likely-implemented' : 'not-detected'
        };
    }

    checkFrameOptions() {
        // В браузере мы не можем напрямую проверить заголовки,
        // но можем проверить некоторые индикаторы
        try {
            if (window.self === window.top) {
                return {
                    exists: true,
                    value: 'SAMEORIGIN or DENY',
                    status: 'likely-implemented'
                };
            }
        } catch (e) {
            return {
                exists: true,
                value: 'DENY',
                status: 'implemented'
            };
        }

        return {
            exists: false,
            value: null,
            status: 'not-detected'
        };
    }

    checkContentTypeOptions() {
        // Проверяем наличие nosniff индикаторов
        const nosniffMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
        if (nosniffMeta && nosniffMeta.getAttribute('content') === 'nosniff') {
            return {
                exists: true,
                value: 'nosniff',
                source: 'meta-tag',
                status: 'implemented'
            };
        }

        return {
            exists: false,
            value: null,
            status: 'not-detected'
        };
    }

    checkHSTS() {
        const isHTTPS = window.location.protocol === 'https:';
        return {
            exists: isHTTPS,
            value: isHTTPS ? 'Likely implemented' : 'Not applicable',
            status: isHTTPS ? 'likely-implemented' : 'not-applicable'
        };
    }

    checkXSSProtection() {
        // Проверяем через meta-теги
        const xssMeta = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
        if (xssMeta) {
            return {
                exists: true,
                value: xssMeta.getAttribute('content'),
                source: 'meta-tag',
                status: 'implemented'
            };
        }

        return {
            exists: false,
            value: null,
            status: 'not-detected'
        };
    }

    checkReferrerPolicy() {
        const referrerMeta = document.querySelector('meta[name="referrer"]');
        if (referrerMeta) {
            return {
                exists: true,
                value: referrerMeta.getAttribute('content'),
                source: 'meta-tag',
                status: 'implemented'
            };
        }

        return {
            exists: false,
            value: null,
            status: 'not-detected'
        };
    }

    analyzeFormsSecurity(doc) {
        const forms = doc.querySelectorAll('form');
        const analysis = {
            total: forms.length,
            secure: 0,
            insecure: 0,
            hasPasswordFields: false,
            hasFileUploads: false,
            forms: []
        };

        forms.forEach((form, index) => {
            const formAnalysis = {
                id: form.id || `form-${index}`,
                action: form.getAttribute('action') || '',
                method: (form.getAttribute('method') || 'GET').toUpperCase(),
                isSecure: false,
                hasCSRF: false,
                hasPassword: false,
                hasFileUpload: false,
                issues: []
            };

            // Проверка HTTPS в action
            if (formAnalysis.action) {
                try {
                    const url = new URL(formAnalysis.action, window.location.origin);
                    formAnalysis.isSecure = url.protocol === 'https:';
                } catch (e) {
                    formAnalysis.isSecure = false;
                    formAnalysis.issues.push('Invalid action URL');
                }
            } else {
                formAnalysis.isSecure = window.location.protocol === 'https:';
            }

            // Проверка CSRF токенов
            const csrfInputs = form.querySelectorAll('input[name*="csrf"], input[name*="token"], input[type="hidden"]');
            formAnalysis.hasCSRF = csrfInputs.length > 0;

            // Проверка парольных полей
            const passwordInputs = form.querySelectorAll('input[type="password"]');
            formAnalysis.hasPassword = passwordInputs.length > 0;
            if (passwordInputs.length > 0) {
                analysis.hasPasswordFields = true;
            }

            // Проверка загрузки файлов
            const fileInputs = form.querySelectorAll('input[type="file"]');
            formAnalysis.hasFileUpload = fileInputs.length > 0;
            if (fileInputs.length > 0) {
                analysis.hasFileUploads = true;
            }

            // Подсчет безопасных форм
            if (formAnalysis.isSecure) {
                analysis.secure++;
            } else {
                analysis.insecure++;
            }

            analysis.forms.push(formAnalysis);
        });

        return analysis;
    }

    analyzeExternalResources(doc) {
        const resources = {
            total: 0,
            scripts: [],
            styles: [],
            iframes: [],
            fonts: [],
            analytics: [],
            ads: []
        };

        // Внешние скрипты
        doc.querySelectorAll('script[src]').forEach(script => {
            const src = script.getAttribute('src');
            if (this.isExternalResource(src)) {
                resources.scripts.push({
                    url: src,
                    async: script.async,
                    defer: script.defer,
                    type: this.classifyScript(src)
                });
                resources.total++;
            }
        });

        // Внешние стили
        doc.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
            const href = link.getAttribute('href');
            if (this.isExternalResource(href)) {
                resources.styles.push({
                    url: href,
                    type: 'stylesheet'
                });
                resources.total++;
            }
        });

        // Внешние iframe
        doc.querySelectorAll('iframe[src]').forEach(iframe => {
            const src = iframe.getAttribute('src');
            if (this.isExternalResource(src)) {
                resources.iframes.push({
                    url: src,
                    sandbox: iframe.getAttribute('sandbox'),
                    type: this.classifyIframe(src)
                });
                resources.total++;
            }
        });

        // Внешние шрифты
        doc.querySelectorAll('link[rel*="icon"], link[rel*="preload"][as="font"]').forEach(link => {
            const href = link.getAttribute('href');
            if (this.isExternalResource(href)) {
                resources.fonts.push({
                    url: href,
                    rel: link.getAttribute('rel')
                });
                resources.total++;
            }
        });

        return resources;
    }

    isExternalResource(url) {
        try {
            const parsed = new URL(url, window.location.origin);
            return parsed.hostname !== window.location.hostname && 
                   !parsed.hostname.endsWith('.' + window.location.hostname);
        } catch (e) {
            return false;
        }
    }

    classifyScript(src) {
        const srcLower = src.toLowerCase();
        if (srcLower.includes('google-analytics') || srcLower.includes('gtag')) return 'analytics';
        if (srcLower.includes('googletag') || srcLower.includes('doubleclick')) return 'ads';
        if (srcLower.includes('facebook') && srcLower.includes('sdk')) return 'social';
        if (srcLower.includes('recaptcha')) return 'captcha';
        if (srcLower.includes('jquery') || srcLower.includes('bootstrap')) return 'library';
        return 'other';
    }

    classifyIframe(src) {
        const srcLower = src.toLowerCase();
        if (srcLower.includes('youtube') || srcLower.includes('youtu.be')) return 'youtube';
        if (srcLower.includes('vimeo')) return 'vimeo';
        if (srcLower.includes('google.com/maps')) return 'maps';
        if (srcLower.includes('facebook.com/plugins')) return 'facebook';
        return 'other';
    }

    analyzeCookies() {
        const cookies = document.cookie ? document.cookie.split(';') : [];
        const analysis = {
            total: cookies.length,
            secure: 0,
            httpOnly: 0,
            sameSite: 0,
            cookies: []
        };

        cookies.forEach(cookie => {
            const cookieStr = cookie.trim();
            const parts = cookieStr.split('=');
            const name = parts[0];
            const attributes = parts.slice(1).join('=');

            const cookieAnalysis = {
                name: name,
                secure: cookieStr.toLowerCase().includes('secure'),
                httpOnly: cookieStr.toLowerCase().includes('httponly'),
                sameSite: this.getSameSiteAttribute(cookieStr)
            };

            if (cookieAnalysis.secure) analysis.secure++;
            if (cookieAnalysis.httpOnly) analysis.httpOnly++;
            if (cookieAnalysis.sameSite) analysis.sameSite++;

            analysis.cookies.push(cookieAnalysis);
        });

        return analysis;
    }

    getSameSiteAttribute(cookieStr) {
        if (cookieStr.toLowerCase().includes('samesite=strict')) return 'Strict';
        if (cookieStr.toLowerCase().includes('samesite=lax')) return 'Lax';
        if (cookieStr.toLowerCase().includes('samesite=none')) return 'None';
        return null;
    }

    checkCommonVulnerabilities(doc) {
        const vulnerabilities = [];

        // Проверка устаревших библиотек
        const jqueryVersion = this.detectJQueryVersion();
        if (jqueryVersion && this.isVulnerableJQuery(jqueryVersion)) {
            vulnerabilities.push({
                type: 'outdated-library',
                severity: 'high',
                description: `Обнаружена устаревшая версия jQuery: ${jqueryVersion}`,
                recommendation: 'Обновите jQuery до актуальной версии'
            });
        }

        // Проверка inline JavaScript
        const inlineScripts = doc.querySelectorAll('script:not([src])');
        if (inlineScripts.length > 5) {
            vulnerabilities.push({
                type: 'inline-scripts',
                severity: 'medium',
                description: `Обнаружено ${inlineScripts.length} inline скриптов`,
                recommendation: 'Вынесите JavaScript во внешние файлы для лучшей безопасности'
            });
        }

        // Проверка старых протоколов
        const oldProtocolLinks = doc.querySelectorAll('a[href^="ftp://"], a[href^="mailto:"]');
        if (oldProtocolLinks.length > 0) {
            vulnerabilities.push({
                type: 'old-protocols',
                severity: 'low',
                description: `Обнаружены ссылки на устаревшие протоколы`,
                recommendation: 'Замените FTP ссылки на HTTPS где это возможно'
            });
        }

        return vulnerabilities;
    }

    detectJQueryVersion() {
        if (window.jQuery) {
            return window.jQuery.fn.jquery;
        }
        return null;
    }

    isVulnerableJQuery(version) {
        // Простая проверка на очень старые версии jQuery
        const [major, minor] = version.split('.').map(Number);
        return major < 3 || (major === 1 && minor < 12) || (major === 2 && minor < 2);
    }

    calculateSecurityScore(isHTTPS, mixedContent, securityHeaders, formsSecurity, externalResources, cookies) {
        let score = 100;

        // HTTPS (20 баллов)
        if (!isHTTPS) score -= 20;

        // Mixed Content (20 баллов)
        if (mixedContent.total > 0) {
            score -= Math.min(20, mixedContent.total * 2);
        }

        // Security Headers (20 баллов)
        const headerScore = this.calculateHeadersScore(securityHeaders);
        score -= (20 - headerScore);

        // Forms Security (15 баллов)
        if (formsSecurity.total > 0 && formsSecurity.insecure > 0) {
            const insecureRatio = formsSecurity.insecure / formsSecurity.total;
            score -= Math.min(15, insecureRatio * 15);
        }

        // External Resources (15 баллов)
        if (externalResources.total > 10) {
            score -= Math.min(10, (externalResources.total - 10) * 0.5);
        }

        // Cookies Security (10 баллов)
        if (cookies.total > 0) {
            const secureRatio = cookies.secure / cookies.total;
            score -= Math.min(10, (1 - secureRatio) * 10);
        }

        return Math.max(0, Math.round(score));
    }

    calculateHeadersScore(headers) {
        let score = 0;
        const headerWeights = {
            'content-security-policy': 5,
            'x-frame-options': 4,
            'x-content-type-options': 3,
            'strict-transport-security': 3,
            'x-xss-protection': 3,
            'referrer-policy': 2
        };

        Object.entries(headers).forEach(([header, data]) => {
            if (data.exists && data.status.includes('implemented')) {
                score += headerWeights[header] || 1;
            }
        });

        return score;
    }

    getRiskLevel(score) {
        if (score >= 90) return 'Низкий';
        if (score >= 70) return 'Средний';
        if (score >= 50) return 'Высокий';
        return 'Критический';
    }
}