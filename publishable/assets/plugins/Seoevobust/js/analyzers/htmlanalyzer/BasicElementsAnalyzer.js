export default class BasicElementsAnalyzer {
    analyze(doc) {
        const title = this.analyzeTitle(doc);
        const description = this.analyzeDescription(doc);
        const h1 = this.analyzeH1(doc);
        const viewport = this.analyzeViewport(doc);
        const charset = this.analyzeCharset(doc);
        const lang = this.analyzeLang(doc);
        const canonical = this.analyzeCanonical(doc);
        const robots = this.analyzeRobots(doc);
        const headings = this.analyzeHeadings(doc);
        const favicon = this.analyzeFavicon(doc);

        const score = this.calculateBasicScore(title, description, h1, viewport, lang, canonical, robots);

        return {
            title,
            description,
            h1,
            viewport,
            charset,
            lang,
            canonical,
            robots,
            headings,
            favicon,
            score
        };
    }

    analyzeTitle(doc) {
        const title = doc.querySelector('title');
        const text = title ? title.textContent.trim() : '';
        
        return {
            exists: !!title,
            length: text.length,
            optimal: text.length >= 30 && text.length <= 60,
            value: text || 'Не задан'
        };
    }

    analyzeDescription(doc) {
        const meta = doc.querySelector('meta[name="description"]');
        const content = meta ? meta.getAttribute('content') : '';
        
        return {
            exists: !!meta,
            length: content.length,
            optimal: content.length >= 70 && content.length <= 160,
            value: content || 'Не задан'
        };
    }

    analyzeH1(doc) {
        const h1Elements = doc.querySelectorAll('h1');
        const titles = Array.from(h1Elements).map(h1 => h1.textContent.trim());
        
        return {
            count: h1Elements.length,
            optimal: h1Elements.length === 1,
            titles: titles
        };
    }

    analyzeViewport(doc) {
        const viewport = doc.querySelector('meta[name="viewport"]');
        return {
            exists: !!viewport,
            value: viewport ? viewport.getAttribute('content') : '',
            optimal: viewport && viewport.getAttribute('content').includes('width=device-width')
        };
    }

    analyzeCharset(doc) {
        const charset = doc.querySelector('meta[charset]') || doc.querySelector('meta[http-equiv="Content-Type"]');
        return {
            exists: !!charset,
            value: charset ? (charset.getAttribute('charset') || charset.getAttribute('content')) : ''
        };
    }

    analyzeLang(doc) {
        const html = doc.documentElement;
        const lang = html.getAttribute('lang');
        return {
            exists: !!lang,
            value: lang || 'Не задан',
            optimal: !!lang
        };
    }

    analyzeCanonical(doc) {
        const canonical = doc.querySelector('link[rel="canonical"]');
        return {
            exists: !!canonical,
            value: canonical ? canonical.getAttribute('href') : 'Не задана',
            optimal: !!canonical
        };
    }

    analyzeRobots(doc) {
        const robots = doc.querySelector('meta[name="robots"]');
        const content = robots ? robots.getAttribute('content') : '';
        return {
            exists: !!robots,
            value: content || 'Не задан',
            allowsIndexing: !content.includes('noindex'),
            allowsFollowing: !content.includes('nofollow')
        };
    }

    analyzeHeadings(doc) {
        const headings = {};
        for (let i = 1; i <= 6; i++) {
            const hElements = doc.querySelectorAll(`h${i}`);
            headings[`h${i}`] = {
                count: hElements.length,
                titles: Array.from(hElements).map(h => h.textContent.trim())
            };
        }
        return headings;
    }

    analyzeFavicon(doc) {
        const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        return {
            exists: !!favicon,
            value: favicon ? favicon.getAttribute('href') : 'Не задана'
        };
    }

    analyzeOpenGraph(doc) {
        const og = {};
        const properties = ['title', 'description', 'type', 'image'];
        
        properties.forEach(prop => {
            const meta = doc.querySelector(`meta[property="og:${prop}"]`);
            og[prop] = {
                exists: !!meta,
                value: meta ? meta.getAttribute('content') : 'Не задан'
            };
        });
        
        return og;
    }

    calculateBasicScore(title, description, h1, viewport, lang, canonical, robots) {
        let score = 0;

        if (title.exists) score += 20;
        if (title.optimal) score += 10;
        if (description.exists) score += 20;
        if (description.optimal) score += 10;
        if (h1.optimal) score += 10;
        if (viewport.exists) score += 5;

        if (lang.exists) score += 5;
        if (canonical.exists) score += 10;
        if (robots.exists && robots.allowsIndexing) score += 10;

        return Math.min(score, 100);
    }
}