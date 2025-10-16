export default class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
    }

    loadSettings() {
        try {
            return JSON.parse(localStorage.getItem('seoAnalyzerSettings')) || {
                autoAnalyze: true,
                showNotifications: true,
                theme: 'light'
            };
        } catch {
            return {
                autoAnalyze: true,
                showNotifications: true,
                theme: 'light'
            };
        }
    }

    save(settings) {
        this.settings = { ...this.settings, ...settings };
        localStorage.setItem('seoAnalyzerSettings', JSON.stringify(this.settings));
    }

    get(key) {
        return this.settings[key];
    }

    getAll() {
        return this.settings;
    }
}