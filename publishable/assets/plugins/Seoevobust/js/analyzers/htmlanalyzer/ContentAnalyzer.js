export default class ContentAnalyzer {
    analyze(doc) {
        const images = this.analyzeImages(doc);
        const links = this.analyzeLinks(doc);
        const headings = this.analyzeHeadings(doc);
        const text = this.analyzeContent(doc);
        const structure = this.analyzeStructure(doc);
        const readability = this.analyzeReadability(doc);
        const keywords = this.analyzeKeywords(doc);
        const multimedia = this.analyzeMultimedia(doc);

        const score = this.calculateContentScore(images, text, headings, links, readability, structure);

        return {
            images: images,
            links: links,
            headings: headings,
            text: text,
            structure: structure,
            readability: readability,
            keywords: keywords,
            multimedia: multimedia,
            score: score
        };
    }

    analyzeImages(doc) {
        const images = doc.querySelectorAll('img');
        let withAlt = 0;
        let withDimensions = 0;
        let lazyLoaded = 0;
        let largeImages = 0;
        const imageFormats = {};

        images.forEach(img => {
            // ALT текст
            if (img.alt && img.alt.trim() !== '') {
                withAlt++;
            }
            
            // Размеры
            if (img.width || img.height || img.hasAttribute('width') || img.hasAttribute('height')) {
                withDimensions++;
            }
            
            // Lazy loading
            if (img.loading === 'lazy' || img.hasAttribute('data-lazy')) {
                lazyLoaded++;
            }
            
            // Большие изображения
            const src = img.src.toLowerCase();
            if (src.includes('large') || src.includes('big') || src.includes('hero')) {
                largeImages++;
            }
            
            // Форматы
            const format = this.getImageFormat(src);
            imageFormats[format] = (imageFormats[format] || 0) + 1;
        });

        return {
            total: images.length,
            withAlt: withAlt,
            withDimensions: withDimensions,
            lazyLoaded: lazyLoaded,
            largeImages: largeImages,
            altPercentage: images.length > 0 ? Math.round((withAlt / images.length) * 100) : 100,
            dimensionsPercentage: images.length > 0 ? Math.round((withDimensions / images.length) * 100) : 100,
            lazyPercentage: images.length > 0 ? Math.round((lazyLoaded / images.length) * 100) : 0,
            formats: imageFormats
        };
    }

    analyzeLinks(doc) {
        const links = doc.querySelectorAll('a[href]');
        let internalLinks = 0;
        let externalLinks = 0;
        let withTitle = 0;
        let withRel = 0;
        let brokenLinks = 0;
        const linkTypes = {};

        const currentHost = window.location.hostname;

        links.forEach(link => {
            const href = link.getAttribute('href');
            const rel = link.getAttribute('rel');
            const text = link.textContent.trim();
            
            // Типы ссылок
            try {
                const url = new URL(href, window.location.origin);
                if (url.hostname === currentHost || !href.startsWith('http')) {
                    internalLinks++;
                    linkTypes['internal'] = (linkTypes['internal'] || 0) + 1;
                } else {
                    externalLinks++;
                    linkTypes['external'] = (linkTypes['external'] || 0) + 1;
                    
                    // Проверка nofollow
                    if (rel && rel.includes('nofollow')) {
                        withRel++;
                    }
                }
            } catch (e) {
                internalLinks++;
                linkTypes['internal'] = (linkTypes['internal'] || 0) + 1;
            }

            // Title атрибут
            if (link.hasAttribute('title') && link.getAttribute('title').trim() !== '') {
                withTitle++;
            }
            
            // Якорные ссылки
            if (href.startsWith('#')) {
                linkTypes['anchor'] = (linkTypes['anchor'] || 0) + 1;
            }
            
            // Пустые ссылки
            if (!text || text.length === 0) {
                brokenLinks++;
            }
        });

        return {
            total: links.length,
            internal: internalLinks,
            external: externalLinks,
            withTitle: withTitle,
            withRel: withRel,
            brokenLinks: brokenLinks,
            titlePercentage: links.length > 0 ? Math.round((withTitle / links.length) * 100) : 100,
            nofollowPercentage: externalLinks > 0 ? Math.round((withRel / externalLinks) * 100) : 0,
            brokenPercentage: links.length > 0 ? Math.round((brokenLinks / links.length) * 100) : 0,
            types: linkTypes
        };
    }

    analyzeHeadings(doc) {
        const headings = {};
        const hierarchy = [];
        
        for (let i = 1; i <= 6; i++) {
            const hElements = doc.querySelectorAll(`h${i}`);
            const titles = Array.from(hElements).map(h => ({
                text: h.textContent.trim(),
                length: h.textContent.trim().length,
                words: h.textContent.trim().split(/\s+/).length
            }));
            
            headings[`h${i}`] = {
                count: hElements.length,
                titles: titles,
                totalLength: titles.reduce((sum, title) => sum + title.length, 0),
                avgLength: titles.length > 0 ? Math.round(titles.reduce((sum, title) => sum + title.length, 0) / titles.length) : 0
            };
            
            // Проверка иерархии
            if (hElements.length > 0) {
                hierarchy.push(`h${i}`);
            }
        }

        // Проверка правильности иерархии
        const validHierarchy = this.checkHeadingsHierarchy(hierarchy);

        return {
            ...headings,
            hierarchy: hierarchy,
            validHierarchy: validHierarchy,
            hasH1: headings.h1 && headings.h1.count > 0,
            hasH2: headings.h2 && headings.h2.count > 0
        };
    }

    checkHeadingsHierarchy(hierarchy) {
        if (hierarchy.length === 0) return true;
        
        const levels = hierarchy.map(h => parseInt(h.replace('h', '')));
        
        // Проверяем, что нет пропусков уровней (например, h1 -> h3)
        for (let i = 1; i < levels.length; i++) {
            if (levels[i] > levels[i-1] + 1) {
                return false;
            }
        }
        
        return true;
    }

    analyzeContent(doc) {
        const textContent = doc.body.textContent || '';
        const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
        const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        const paragraphs = doc.querySelectorAll('p');
        const lists = doc.querySelectorAll('ul, ol');
        const tables = doc.querySelectorAll('table');

        // Анализ плотности текста
        const contentText = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th'))
            .map(el => el.textContent)
            .join(' ');
        
        const contentWords = contentText.split(/\s+/).filter(word => word.length > 0);

        return {
            textAnalysis: {
                totalChars: textContent.length,
                totalWords: words.length,
                contentWords: contentWords.length,
                sentences: sentences.length,
                paragraphs: paragraphs.length,
                lists: lists.length,
                tables: tables.length,
                readingTime: Math.ceil(words.length / 200),
                avgSentenceLength: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
                avgParagraphLength: paragraphs.length > 0 ? Math.round(contentWords.length / paragraphs.length) : 0
            }
        };
    }

    analyzeReadability(doc) {
        const textContent = doc.body.textContent || '';
        const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
        const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // Простой расчет индекса удобочитаемости
        const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
        const avgCharsPerWord = words.length > 0 ? textContent.length / words.length : 0;
        
        let readabilityScore = 0;
        if (avgWordsPerSentence < 15 && avgCharsPerWord < 5) {
            readabilityScore = 90; // Очень легко
        } else if (avgWordsPerSentence < 20 && avgCharsPerWord < 6) {
            readabilityScore = 70; // Легко
        } else if (avgWordsPerSentence < 25 && avgCharsPerWord < 7) {
            readabilityScore = 50; // Средне
        } else {
            readabilityScore = 30; // Сложно
        }

        return {
            score: readabilityScore,
            level: this.getReadabilityLevel(readabilityScore),
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            avgCharsPerWord: Math.round(avgCharsPerWord * 10) / 10
        };
    }

    getReadabilityLevel(score) {
        if (score >= 80) return 'Очень легко';
        if (score >= 60) return 'Легко';
        if (score >= 40) return 'Средне';
        if (score >= 20) return 'Сложно';
        return 'Очень сложно';
    }

    analyzeKeywords(doc) {
        const text = doc.body.textContent || '';
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        
        // Простой анализ частоты слов (можно расширить)
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        // Топ 10 слов
        const topWords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));

        return {
            topWords: topWords,
            uniqueWords: Object.keys(wordFreq).length,
            totalWords: words.length
        };
    }

    analyzeMultimedia(doc) {
        const videos = doc.querySelectorAll('video');
        const iframes = doc.querySelectorAll('iframe');
        const audios = doc.querySelectorAll('audio');
        
        const embeddedContent = Array.from(iframes).map(iframe => {
            const src = iframe.src;
            return {
                type: this.getEmbeddedType(src),
                src: src
            };
        });

        return {
            videos: videos.length,
            audios: audios.length,
            iframes: iframes.length,
            embeddedContent: embeddedContent
        };
    }

    getEmbeddedType(src) {
        if (src.includes('youtube') || src.includes('youtu.be')) return 'YouTube';
        if (src.includes('vimeo')) return 'Vimeo';
        if (src.includes('twitter')) return 'Twitter';
        if (src.includes('instagram')) return 'Instagram';
        if (src.includes('facebook')) return 'Facebook';
        return 'Other';
    }

    getImageFormat(src) {
        if (src.includes('.jpg') || src.includes('.jpeg')) return 'JPEG';
        if (src.includes('.png')) return 'PNG';
        if (src.includes('.gif')) return 'GIF';
        if (src.includes('.webp')) return 'WebP';
        if (src.includes('.svg')) return 'SVG';
        return 'Other';
    }

    analyzeStructure(doc) {
        const structure = {
            header: doc.querySelector('header') ? '✅' : '❌',
            nav: doc.querySelector('nav') ? '✅' : '❌',
            main: doc.querySelector('main') ? '✅' : '❌',
            footer: doc.querySelector('footer') ? '✅' : '❌',
            semantic: this.analyzeSemanticElements(doc),
            breadcrumbs: this.analyzeBreadcrumbs(doc)
        };
        
        return structure;
    }

    analyzeSemanticElements(doc) {
        const semanticTags = ['header', 'nav', 'main', 'footer', 'article', 'section', 'aside', 'figure', 'figcaption'];
        const result = {};
        semanticTags.forEach(tag => {
            result[tag] = doc.querySelectorAll(tag).length;
        });
        return result;
    }

    analyzeBreadcrumbs(doc) {
        const breadcrumbs = doc.querySelector('[aria-label="breadcrumb"], .breadcrumbs, .breadcrumb');
        return {
            exists: !!breadcrumbs,
            elements: breadcrumbs ? breadcrumbs.querySelectorAll('*').length : 0
        };
    }

    calculateContentScore(images, text, headings, links, readability, structure) {
        let score = 0;
        
        // Изображения (макс 20)
        if (images.altPercentage > 80) score += 15;
        if (images.lazyPercentage > 50) score += 5;
        
        // Текст (макс 30)
        if (text.textAnalysis.contentWords > 300) score += 20;
        if (text.textAnalysis.paragraphs > 3) score += 10;
        
        // Заголовки (макс 20)
        if (headings.hasH1) score += 5;
        if (headings.hasH2) score += 5;
        if (headings.validHierarchy) score += 10;
        
        // Ссылки (макс 15)
        if (links.brokenPercentage < 10) score += 10;
        if (links.internal > 0) score += 5;
        
        // Читаемость (макс 10)
        if (readability.score > 60) score += 10;
        
        // Структура (макс 5)
        if (structure.header === '✅' && structure.footer === '✅') score += 5;

        return Math.min(score, 100);
    }
}