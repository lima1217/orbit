export type TimePhase = 'Dawn' | 'Day' | 'Dusk' | 'Night' | 'Late Night';

// Configuration for a user's unique rhythm
export interface UserRhythmConfig {
    wakingTime: number; // Keep for backward compatibility or UI init
    bedTime: number;
    peakEnergyTime: number;

    // New Fields
    dayDuration: number; // Hours in a full cycle (e.g. 10, 24, 30)
    anchorTime: Date;    // The reference point for 00:00 (Orbit Time)
}

export interface OrbitTime {
    // The raw mechanical time (for reference)
    standard: Date;

    // The subjective "Orbit" time
    orbitTimeString: string; // "HH:MM" e.g. "25:30"
    orbitHour: number;       // Numeric hour e.g. 25.5

    cycleProgress: number; // 0.0 to 1.0 (Day cycle)
    phase: TimePhase;
    intensity: number; // 0.0 (calm) to 1.0 (intense) - affects animation speed

    // A descriptive "Soul Label"
    label: string;
}
