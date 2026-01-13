/**
 * Life Events System
 * Supports user-customizable daily activities with emoji icons
 */

export interface LifeEvent {
    id: string;
    emoji: string;
    label: string;
    orbitHour: number;  // When this event occurs (in Orbit time, hours after wake-up)
}

// Default life events
const DEFAULT_EVENTS: LifeEvent[] = [
    { id: 'breakfast', emoji: '🍳', label: '早餐', orbitHour: 0 },    // Right after waking
    { id: 'lunch', emoji: '🍜', label: '主餐', orbitHour: 4 },        // 4 hours after waking
    { id: 'sleep', emoji: '😴', label: '睡觉', orbitHour: 15 },       // 15 hours after waking (bedtime)
];

const STORAGE_KEY = 'orbit_life_events';
const MAX_EVENTS = 5;

/**
 * Get all life events (from localStorage or defaults)
 */
export function getLifeEvents(): LifeEvent[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const events = JSON.parse(saved);
            if (Array.isArray(events) && events.length > 0) {
                return events;
            }
        }
    } catch (e) {
        console.error('Failed to parse life events:', e);
    }
    return [...DEFAULT_EVENTS];
}

/**
 * Save all life events to localStorage
 */
export function saveLifeEvents(events: LifeEvent[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/**
 * Add a new life event
 * Returns false if max limit reached
 */
export function addLifeEvent(event: Omit<LifeEvent, 'id'>): LifeEvent | null {
    const events = getLifeEvents();
    if (events.length >= MAX_EVENTS) {
        return null;
    }

    const newEvent: LifeEvent = {
        ...event,
        id: `custom_${Date.now()}`,
    };

    events.push(newEvent);
    saveLifeEvents(events);
    return newEvent;
}

/**
 * Update an existing life event
 */
export function updateLifeEvent(id: string, updates: Partial<Omit<LifeEvent, 'id'>>): boolean {
    const events = getLifeEvents();
    const index = events.findIndex(e => e.id === id);

    if (index === -1) return false;

    events[index] = { ...events[index], ...updates };
    saveLifeEvents(events);
    return true;
}

/**
 * Delete a life event
 */
export function deleteLifeEvent(id: string): boolean {
    const events = getLifeEvents();
    const filtered = events.filter(e => e.id !== id);

    if (filtered.length === events.length) return false;

    saveLifeEvents(filtered);
    return true;
}

/**
 * Reset to default events
 */
export function resetLifeEvents(): void {
    saveLifeEvents([...DEFAULT_EVENTS]);
}

/**
 * Check if can add more events
 */
export function canAddMoreEvents(): boolean {
    return getLifeEvents().length < MAX_EVENTS;
}

/**
 * Get max events limit
 */
export function getMaxEvents(): number {
    return MAX_EVENTS;
}

// Export for backward compatibility
export const LIFE_EVENTS = DEFAULT_EVENTS;
