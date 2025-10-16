export default class MetaTagsAnalyzer {
    analyze(doc) {
        return {
            og: this.analyzeOpenGraph(doc),
            twitter: this.analyzeTwitterCards(doc),
            robots: this.analyzeRobotsMeta(doc),
            canonical: this.analyzeCanonical(doc)
        };
    }

    analyzeOpenGraph(doc) {
        const ogTags = {};
        const tags = doc.querySelectorAll('meta[property^="og:"]');
        tags.forEach(tag => {
            const prop = tag.getAttribute('property');
            ogTags[prop] = tag.getAttribute('content') || '';
        });
        return ogTags;
    }

    analyzeTwitterCards(doc) {
        const twitterTags = {};
        const tags = doc.querySelectorAll('meta[name^="twitter:"]');
        tags.forEach(tag => {
            const name = tag.getAttribute('name');
            twitterTags[name] = tag.getAttribute('content') || '';
        });
        return twitterTags;
    }

    analyzeRobotsMeta(doc) {
        const robots = doc.querySelector('meta[name="robots"]');
        return {
            exists: !!robots,
            value: robots ? robots.getAttribute('content') : ''
        };
    }

    analyzeCanonical(doc) {
        const canonical = doc.querySelector('link[rel="canonical"]');
        return {
            exists: !!canonical,
            value: canonical ? canonical.getAttribute('href') : ''
        };
    }
}