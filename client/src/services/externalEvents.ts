import type { ScrapedEvent } from '../types/externalEvents';

const API_URL = 'http://localhost:5050/api/external-events';

export const fetchExternalEvents = async (): Promise<ScrapedEvent[]> => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching external events:', error);
        return [];
    }
};

export const triggerScrape = async (): Promise<void> => {
    try {
        await fetch(`${API_URL}/scrape`, { method: 'POST' });
    } catch (error) {
        console.error('Error triggering scrape:', error);
    }
};
