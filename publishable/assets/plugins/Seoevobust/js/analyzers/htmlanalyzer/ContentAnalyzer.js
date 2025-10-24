export default class ContentAnalyzer {
    constructor() {
        // Паттерны для фильтрации технического контента
        this.technicalPatterns = [
            /function\s*\(/i,
            /var\s+\w+\s*=/i,
            /let\s+\w+\s*=/i,
            /const\s+\w+\s*=/i,
            /console\.log/i,
            /document\./i,
            /window\./i,
            /\.addEventListener/i,
            /setTimeout/i,
            /setInterval/i,
            /\.querySelector/i,
            /\.getElementById/i,
            /import\s+.*from/i,
            /export\s+default/i,
            /class\s+\w+/i,
            /=>/,
            /`[^`]*\$\{/,
            /<\/?script/i,
            /<\/?style/i
        ];
    }

    analyze(doc) {
        // Создаем копию документа для анализа, исключая noindex контент
        const analysisDoc = this.prepareDocumentForAnalysis(doc);
        
        const images = this.analyzeImages(analysisDoc);
        const links = this.analyzeLinks(analysisDoc);
        const headings = this.analyzeHeadings(analysisDoc);
        const text = this.analyzeContent(analysisDoc);
        const readability = this.analyzeReadability(analysisDoc);
        const keywords = this.analyzeKeywords(analysisDoc);
        const multimedia = this.analyzeMultimedia(analysisDoc);
        const semanticElements = this.analyzeSemanticElements(analysisDoc);
        const breadcrumbs = this.analyzeBreadcrumbs(analysisDoc);

        const score = this.calculateContentScore(images, text, headings, links, readability);

        // Генерируем рекомендации по контенту
        const recommendations = this.generateContentRecommendations(
            images,
            links,
            headings,
            text,
            readability,
            keywords,
            multimedia,
            semanticElements,
            breadcrumbs,
            score
        );

        return {
            images: images,
            links: links,
            headings: headings,
            text: text,
            readability: readability,
            keywords: keywords,
            multimedia: multimedia,
            semanticElements: semanticElements,
            breadcrumbs: breadcrumbs,
            score: score,
            recommendations: recommendations
        };
    }

    prepareDocumentForAnalysis(doc) {
        // Создаем глубокую копию документа
        const analysisDoc = doc.cloneNode(true);
        
        // Удаляем noindex контент
        this.removeNoindexContent(analysisDoc);
        
        // Удаляем технический контент
        this.removeTechnicalContent(analysisDoc);
        
        return analysisDoc;
    }

    removeNoindexContent(doc) {
        // Удаляем элементы с noindex атрибутами
        const noindexSelectors = [
            '[noindex]',
            '.noindex',
            '[data-noindex]',
            'noindex'
        ];

        noindexSelectors.forEach(selector => {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });

        // Удаляем meta noindex
        const metaNoindex = doc.querySelectorAll('meta[name="robots"][content*="noindex"], meta[name="googlebot"][content*="noindex"]');
        metaNoindex.forEach(meta => {
            const parent = meta.parentElement;
            if (parent) {
                parent.removeChild(meta);
            }
        });

        // Удаляем комментарии noindex (если есть)
        const comments = this.findComments(doc);
        comments.forEach(comment => {
            if (comment.nodeValue.includes('noindex') || comment.nodeValue.includes('NOINDEX')) {
                comment.remove();
            }
        });
    }

    removeTechnicalContent(doc) {
        // Удаляем script и style теги
        const technicalTags = ['script', 'style', 'code', 'pre'];
        
        technicalTags.forEach(tag => {
            const elements = doc.querySelectorAll(tag);
            elements.forEach(el => {
                // Проверяем, не является ли это критически важным контентом
                if (!this.isImportantContent(el)) {
                    el.remove();
                }
            });
        });

        // Удаляем элементы с техническим контентом
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
            if (this.containsTechnicalContent(el.textContent)) {
                // Вместо полного удаления, очищаем текст или удаляем в зависимости от контекста
                this.cleanTechnicalContent(el);
            }
        });
    }

    containsTechnicalContent(text) {
        if (!text || text.trim().length === 0) return false;
        
        return this.technicalPatterns.some(pattern => 
            pattern.test(text)
        );
    }

    cleanTechnicalContent(element) {
        const children = element.children;
        
        // Если у элемента есть дети, рекурсивно проверяем их
        if (children.length > 0) {
            Array.from(children).forEach(child => {
                this.cleanTechnicalContent(child);
            });
        } else {
            // Для текстовых элементов проверяем и очищаем контент
            const text = element.textContent;
            if (this.containsTechnicalContent(text)) {
                // Заменяем технический контент на пустую строку
                // или можно установить data-атрибут для отладки
                element.textContent = this.filterTechnicalText(text);
            }
        }
    }

    filterTechnicalText(text) {
        // Удаляем строки, содержащие технические паттерны
        const lines = text.split('\n')
            .filter(line => !this.containsTechnicalContent(line))
            .filter(line => line.trim().length > 0);
        
        return lines.join('\n');
    }

    isImportantContent(element) {
        // Проверяем, является ли контент важным (например, контент внутри main, article и т.д.)
        const importantSelectors = [
            'main', 'article', 'section', 
            '[role="main"]', '.content', '#content'
        ];
        
        return importantSelectors.some(selector => 
            element.closest(selector) !== null
        );
    }

    findComments(node) {
        const comments = [];
        
        function traverse(currentNode) {
            if (!currentNode) return;
            
            // Проверяем все дочерние узлы
            currentNode.childNodes.forEach(child => {
                if (child.nodeType === Node.COMMENT_NODE) {
                    comments.push(child);
                } else {
                    traverse(child);
                }
            });
        }
        
        traverse(node);
        return comments;
    }

    // Модифицируем analyzeContent для использования очищенного документа
    analyzeContent(doc) {
        // Получаем только релевантные для SEO элементы
        const seoElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, article, section, main, [role="main"]');
        
        let contentText = '';
        let totalChars = 0;
        let totalWords = 0;
        let sentences = 0;
        
        seoElements.forEach(el => {
            const text = el.textContent || '';
            if (text.trim().length > 0 && !this.containsTechnicalContent(text)) {
                contentText += text + ' ';
                totalChars += text.length;
                
                const words = text.trim().split(/\s+/).filter(word => word.length > 0);
                totalWords += words.length;
                
                const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
                sentences += sentenceCount;
            }
        });

        const paragraphs = doc.querySelectorAll('p');
        const lists = doc.querySelectorAll('ul, ol');
        const tables = doc.querySelectorAll('table');

        // Фильтруем параграфы, исключая технические
        const filteredParagraphs = Array.from(paragraphs).filter(p => 
            !this.containsTechnicalContent(p.textContent)
        );

        const contentWords = contentText.split(/\s+/).filter(word => word.length > 0);

        return {
            textAnalysis: {
                totalChars: totalChars,
                totalWords: totalWords,
                contentWords: contentWords.length,
                sentences: sentences,
                paragraphs: filteredParagraphs.length,
                lists: lists.length,
                tables: tables.length,
                readingTime: Math.ceil(totalWords / 200),
                avgSentenceLength: sentences > 0 ? Math.round(totalWords / sentences) : 0,
                avgParagraphLength: filteredParagraphs.length > 0 ? Math.round(contentWords.length / filteredParagraphs.length) : 0,
                filteredTechnicalContent: true // Флаг что контент был отфильтрован
            }
        };
    }

    // Модифицируем analyzeKeywords для исключения технических слов
    analyzeKeywords(doc) {
        const seoElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, article, section');
        
        let allText = '';
        seoElements.forEach(el => {
            const text = el.textContent || '';
            if (text.trim().length > 0 && !this.containsTechnicalContent(text)) {
                allText += text + ' ';
            }
        });

        const words = allText.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !this.isTechnicalWord(word));
        
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        const topWords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));

        return {
            topWords: topWords,
            uniqueWords: Object.keys(wordFreq).length,
            totalWords: words.length,
            filtered: true
        };
    }

    isTechnicalWord(word) {
        const technicalWords = [
            'function', 'var', 'let', 'const', 'console', 'document', 
            'window', 'queryselector', 'addeventlistener', 'settimeout',
            'setinterval', 'import', 'export', 'class', 'return', 'if',
            'else', 'for', 'while', 'switch', 'case', 'default'
        ];
        
        return technicalWords.includes(word.toLowerCase());
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
        
        if (words.length === 0 || sentences.length === 0) {
            return {
                score: 0,
                level: 'Недостаточно текста',
                gunningFogIndex: 0,
                avgWordsPerSentence: 0,
                avgCharsPerWord:0,
                complexWordsPercentage: 0,
                totalSentences: 0,
                totalWords: 0
            };
        }

        const avgWordsPerSentence = words.length / sentences.length;
        
        // Считаем "сложные" слова (с 3+ слогами)
        const complexWords = words.filter(word => this.countSyllables(word) >= 3);
        const complexWordsPercentage = complexWords.length / words.length;
        
        // Рассчитываем индекс туманности Ганнинга
        const gunningFogIndex = this.calculateGunningFogIndex(avgWordsPerSentence, complexWordsPercentage);
        
        // Конвертируем в 100-балльную шкалу (чем ниже индекс - тем лучше читаемость)
        const readabilityScore = this.convertFogToScore(gunningFogIndex);
        const avgCharsPerWordlocal = words.reduce((sum, word) => sum + word.length, 0);
        const averageWordLength = words.length > 0 ? (avgCharsPerWordlocal / words.length) : 0;
        return {
            score: Math.max(0, Math.min(100, Math.round(readabilityScore))),
            level: this.getReadabilityLevel(readabilityScore),
            gunningFogIndex: Math.round(gunningFogIndex * 10) / 10,
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            avgCharsPerWord:Math.round(averageWordLength * 10) / 10,
            complexWordsPercentage: Math.round(complexWordsPercentage * 100),
            complexWordsCount: complexWords.length,
            totalSentences: sentences.length,
            totalWords: words.length,
            interpretation: this.getFogInterpretation(gunningFogIndex)
        };
    }

    calculateGunningFogIndex(avgWordsPerSentence, complexWordsPercentage) {
        // Формула индекса туманности Ганнинга: 0.4 * (средняя длина предложения + процент сложных слов)
        return 0.4 * (avgWordsPerSentence + 100 * complexWordsPercentage);
    }

    convertFogToScore(gunningFogIndex) {
        // Конвертируем индекс Ганнинга в 100-балльную шкалу
        // Чем ниже индекс - тем лучше читаемость
        
        if (gunningFogIndex <= 6) return 95;  // Очень легко
        if (gunningFogIndex <= 8) return 85;  // Легко
        if (gunningFogIndex <= 10) return 75; // Достаточно легко
        if (gunningFogIndex <= 12) return 65; // Средне
        if (gunningFogIndex <= 14) return 55; // Достаточно сложно
        if (gunningFogIndex <= 16) return 45; // Сложно
        if (gunningFogIndex <= 18) return 35; // Очень сложно
        return 25; // Крайне сложно
    }

    countSyllables(word) {
        // Упрощенный подсчет слогов для русского языка
        const vowels = 'аеёиоуыэюя';
        let syllables = 0;
        let prevCharWasVowel = false;
        
        // Приводим к нижнему регистру и убираем лишние символы
        const cleanWord = word.toLowerCase().replace(/[^а-яё]/g, '');
        
        if (cleanWord.length === 0) return 0;
        
        for (let char of cleanWord) {
            const isVowel = vowels.includes(char);
            if (isVowel && !prevCharWasVowel) {
                syllables++;
            }
            prevCharWasVowel = isVowel;
        }
        
        // Минимум 1 слог для слов с согласными
        return syllables > 0 ? syllables : 1;
    }

    getReadabilityLevel(score) {
        if (score >= 80) return 'Очень легко';
        if (score >= 60) return 'Легко';
        if (score >= 40) return 'Средне';
        if (score >= 20) return 'Сложно';
        return 'Очень сложно';
    }

    getFogInterpretation(gunningFogIndex) {
        if (gunningFogIndex <= 6) return 'Текст для 6 класса (очень легко)';
        if (gunningFogIndex <= 8) return 'Текст для 8 класса (легко)';
        if (gunningFogIndex <= 10) return 'Текст для 10 класса (достаточно легко)';
        if (gunningFogIndex <= 12) return 'Текст для 12 класса (средне)';
        if (gunningFogIndex <= 14) return 'Текст для студента (сложно)';
        if (gunningFogIndex <= 16) return 'Текст для выпускника (очень сложно)';
        return 'Текст для эксперта (крайне сложно)';
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

    calculateContentScore(images, text, headings, links, readability) {
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
        
        // Читаемость (макс 15)
        if (readability.score > 60) score += 15;

        return Math.min(score, 100);
    }

    generateContentRecommendations(images, links, headings, text, readability, keywords, multimedia, semanticElements, breadcrumbs, score) {
        const recommendations = [];

        // Рекомендации по изображениям
        if (images.total > 0 && images.altPercentage < 80) {
            recommendations.push({
                id: 'content-images-no-alt',
                title: 'Недостаточно изображений с ALT текстом',
                description: `Только ${images.altPercentage}% изображений имеют ALT текст. ALT текст важен для доступности и SEO.`,
                suggestion: 'Добавьте описательные ALT тексты ко всем информативным изображениям. Для декоративных изображений используйте пустой alt="".',
                priority: 'warning',
                impact: 7,
                category: 'images',
                examples: '<img src="product.jpg" alt="Красное платье с цветочным принтом">'
            });
        }

        if (images.total > 5 && images.lazyPercentage < 50) {
            recommendations.push({
                id: 'content-no-lazy-loading',
                title: 'Отсутствует lazy loading для изображений',
                description: `Только ${images.lazyPercentage}% изображений используют lazy loading, что замедляет загрузку страницы.`,
                suggestion: 'Добавьте атрибут loading="lazy" для изображений ниже сгиба страницы.',
                priority: 'warning',
                impact: 6,
                category: 'images',
                examples: '<img src="image.jpg" loading="lazy" alt="Описание">'
            });
        }

        if (images.total === 0) {
            recommendations.push({
                id: 'content-no-images',
                title: 'На странице нет изображений',
                description: 'Страница не содержит изображений, что может ухудшить пользовательский опыт.',
                suggestion: 'Добавьте релевантные изображения, инфографику или иллюстрации для улучшения визуального восприятия.',
                priority: 'info',
                impact: 4,
                category: 'images'
            });
        }

        // Рекомендации по ссылкам
        if (links.brokenLinks > 0) {
            recommendations.push({
                id: 'content-broken-links',
                title: 'Обнаружены пустые ссылки',
                description: `Найдено ${links.brokenLinks} ссылок без текста, что плохо для доступности и SEO.`,
                suggestion: 'Добавьте осмысленный текст ко всем ссылкам. Избегайте текстов "кликните здесь" или "подробнее".',
                priority: 'warning',
                impact: 6,
                category: 'links',
                examples: '<a href="/about">О нашей компании</a> вместо <a href="/about">тут</a>'
            });
        }

        if (links.external > 0 && links.nofollowPercentage < 50) {
            recommendations.push({
                id: 'content-external-links',
                title: 'Внешние ссылки без nofollow',
                description: `Большинство внешних ссылок не используют rel="nofollow", что может влиять на SEO.`,
                suggestion: 'Добавьте rel="nofollow" к внешним ссылкам, особенно к пользовательскому контенту и рекламе.',
                priority: 'info',
                impact: 5,
                category: 'links',
                examples: '<a href="https://external.com" rel="nofollow">Внешний сайт</a>'
            });
        }

        // Рекомендации по заголовкам
        if (!headings.hasH1) {
            recommendations.push({
                id: 'content-no-h1',
                title: 'Отсутствует заголовок H1',
                description: 'На странице нет основного заголовка H1, что важно для структуры и SEO.',
                suggestion: 'Добавьте один заголовок H1, который четко описывает содержание страницы.',
                priority: 'critical',
                impact: 8,
                category: 'headings',
                examples: '<h1>Основной заголовок страницы</h1>'
            });
        }

        if (!headings.validHierarchy) {
            recommendations.push({
                id: 'content-heading-hierarchy',
                title: 'Неправильная иерархия заголовков',
                description: 'Обнаружены пропуски в иерархии заголовков (например, H1 сразу за H3).',
                suggestion: 'Соблюдайте правильную последовательность заголовков: H1 → H2 → H3 и т.д.',
                priority: 'warning',
                impact: 6,
                category: 'headings'
            });
        }

        if (headings.h1 && headings.h1.count > 1) {
            recommendations.push({
                id: 'content-multiple-h1',
                title: 'Несколько заголовков H1',
                description: `Обнаружено ${headings.h1.count} заголовков H1. На странице должен быть только один H1.`,
                suggestion: 'Оставьте один основной заголовок H1, остальные преобразуйте в H2.',
                priority: 'warning',
                impact: 7,
                category: 'headings'
            });
        }

        // Рекомендации по текстовому контенту
        if (text.textAnalysis.contentWords < 300) {
            recommendations.push({
                id: 'content-insufficient-text',
                title: 'Недостаточно текстового контента',
                description: `Страница содержит только ${text.textAnalysis.contentWords} слов, что может быть недостаточно для хорошего SEO.`,
                suggestion: 'Добавьте больше качественного текстового контента, раскрывающего тему страницы.',
                priority: 'warning',
                impact: 7,
                category: 'text'
            });
        }

        if (text.textAnalysis.paragraphs < 3) {
            recommendations.push({
                id: 'content-few-paragraphs',
                title: 'Мало текстовых блоков',
                description: `Страница содержит только ${text.textAnalysis.paragraphs} параграфов.`,
                suggestion: 'Разбейте текст на большее количество логических блоков для лучшей читаемости.',
                priority: 'info',
                impact: 4,
                category: 'text'
            });
        }

        // Рекомендации по читаемости
        if (readability.score < 60) {
            recommendations.push({
                id: 'content-poor-readability',
                title: 'Низкая читаемость текста',
                description: `Индекс читаемости: ${readability.score}/100. Текст может быть сложен для понимания.`,
                suggestion: 'Упростите предложения, разбейте длинные абзацы, используйте более простые слова.',
                priority: 'warning',
                impact: 6,
                category: 'readability'
            });
        }

        if (readability.avgWordsPerSentence > 20) {
            recommendations.push({
                id: 'content-long-sentences',
                title: 'Слишком длинные предложения',
                description: `Средняя длина предложения: ${readability.avgWordsPerSentence} слов. Рекомендуется до 15-20 слов.`,
                suggestion: 'Разбейте длинные предложения на более короткие для лучшей читаемости.',
                priority: 'info',
                impact: 5,
                category: 'readability'
            });
        }

        // Рекомендации по семантическим элементам
        const semanticTags = Object.values(semanticElements).reduce((sum, count) => sum + count, 0);
        if (semanticTags === 0) {
            recommendations.push({
                id: 'content-no-semantic',
                title: 'Отсутствуют семантические HTML5 теги',
                description: 'Страница не использует современные семантические теги (header, nav, main, footer и др.).',
                suggestion: 'Замените div на семантические теги для улучшения доступности и SEO.',
                priority: 'info',
                impact: 4,
                category: 'semantics',
                examples: '<header>, <nav>, <main>, <article>, <section>, <footer>'
            });
        }

        // Рекомендации по хлебным крошкам
        if (!breadcrumbs.exists) {
            recommendations.push({
                id: 'content-no-breadcrumbs',
                title: 'Отсутствуют хлебные крошки',
                description: 'На странице нет навигационной цепочки (breadcrumbs), что ухудшает пользовательский опыт.',
                suggestion: 'Добавьте хлебные крошки для улучшения навигации по сайту.',
                priority: 'info',
                impact: 4,
                category: 'navigation'
            });
        }

        // Рекомендации по ключевым словам
        if (keywords.topWords.length > 0) {
            const topWord = keywords.topWords[0];
            if (topWord.count / keywords.totalWords > 0.05) {
                recommendations.push({
                    id: 'content-keyword-stuffing',
                    title: 'Возможный переспам ключевых слов',
                    description: `Слово "${topWord.word}" встречается слишком часто (${topWord.count} раз).`,
                    suggestion: 'Уменьшите плотность ключевых слов, используйте синонимы и естественный язык.',
                    priority: 'warning',
                    impact: 6,
                    category: 'keywords'
                });
            }
        }

        // Положительные рекомендации
        if (score >= 80) {
            recommendations.push({
                id: 'content-excellent',
                title: 'Отличное качество контента',
                description: 'Контент страницы хорошо оптимизирован и имеет хорошую структуру.',
                suggestion: 'Продолжайте поддерживать высокое качество контента на всех страницах сайта.',
                priority: 'info',
                impact: 2,
                category: 'maintenance'
            });
        }

        // Сортируем рекомендации по приоритету и влиянию
        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 0, warning: 1, info: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.impact - a.impact;
        });
    }

}