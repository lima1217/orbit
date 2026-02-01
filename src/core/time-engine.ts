import { OrbitTime, UserRhythmConfig, TimePhase } from '../types/time';
import { calculateLivingTimezone, getTimezoneByOffset } from '../constants/timezones';

const DEFAULT_CONFIG: UserRhythmConfig = {
    wakingTime: 7,
    bedTime: 23,
    peakEnergyTime: 14,
    dayDuration: 24,
    anchorTime: new Date() 
};

export class OrbitEngine {
    private config: UserRhythmConfig;

    constructor(config: Partial<UserRhythmConfig> = {}) {
        const mergedConfig = { ...DEFAULT_CONFIG, ...config };
        
        // If anchorTime is not provided but wakingTime is, calculate anchorTime
        // so that wakingTime corresponds to 06:00 Orbit Time.
        if (!config.anchorTime && config.wakingTime !== undefined) {
            const anchor = new Date();
            const anchorHour = (config.wakingTime - 6 + 24) % 24;
            anchor.setHours(anchorHour, 0, 0, 0);
            mergedConfig.anchorTime = anchor;
        } else if (!config.anchorTime) {
            const anchor = new Date();
            const anchorHour = (DEFAULT_CONFIG.wakingTime - 6 + 24) % 24;
            anchor.setHours(anchorHour, 0, 0, 0);
            mergedConfig.anchorTime = anchor;
        }

        this.config = mergedConfig;
    }

    public tick(now: Date = new Date()): OrbitTime {
        const { dayDuration, anchorTime, wakingTime } = this.config;

        // Calculate time difference in milliseconds
        const diffMs = now.getTime() - anchorTime.getTime();
        const hourMs = 60 * 60 * 1000;
        const cycleMs = dayDuration * hourMs;

        let currentCycleMs = diffMs % cycleMs;
        if (currentCycleMs < 0) currentCycleMs += cycleMs;

        const currentOrbitHour = currentCycleMs / hourMs;
        const progress = (currentOrbitHour / dayDuration) % 1.0;

        const phase = this.determinePhase(progress);
        const intensity = this.calculateIntensity(progress);
        const label = this.getSoulLabel(phase);
        const orbitTimeString = this.formatOrbitTime(currentOrbitHour);

        // Living Timezone calculation
        // Get local timezone offset dynamically (getTimezoneOffset returns minutes, negative for east)
        const localTimezoneOffset = -(new Date().getTimezoneOffset() / 60);
        const livingOffset = calculateLivingTimezone(wakingTime, localTimezoneOffset);
        const livingTimezone = getTimezoneByOffset(livingOffset);

        return {
            standard: now,
            orbitTimeString,
            orbitHour: currentOrbitHour,
            cycleProgress: progress,
            phase,
            intensity,
            label,
            livingTimezone
        };
    }

    private formatOrbitTime(hours: number): string {
        // Convert to total minutes first to avoid floating point precision issues
        const totalMinutes = Math.round(hours * 60);
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    private determinePhase(progress: number): TimePhase {
        // progress is 0.0 to 1.0 representing a 24-hour cycle
        // Phase mapping (assuming 24h day):
        //   00:00-01:12 (0.00-0.05): Night
        //   01:12-04:48 (0.05-0.20): Late Night  
        //   04:48-07:12 (0.20-0.30): Dawn
        //   07:12-16:48 (0.30-0.70): Day
        //   16:48-19:12 (0.70-0.80): Dusk
        //   19:12-24:00 (0.80-1.00): Night
        
        if (progress >= 0.2 && progress < 0.3) return 'Dawn';
        if (progress >= 0.3 && progress < 0.7) return 'Day';
        if (progress >= 0.7 && progress < 0.8) return 'Dusk';
        if (progress >= 0.8 || progress < 0.05) return 'Night';
        return 'Late Night';
    }

    private calculateIntensity(progress: number): number {
        // Peak at 0.5 (Noon), Lowest at 0.0 (Midnight)
        // Use a shifted cosine to stay in 0.0 - 1.0 range
        // intensity = (1 - cos(x)) / 2
        return (1 - Math.cos(progress * Math.PI * 2)) / 2;
    }

    private getSoulLabel(phase: TimePhase): string {
        switch (phase) {
            case 'Dawn': return 'The Awakening';
            case 'Day': return 'The Flow';
            case 'Dusk': return 'The Reflection';
            case 'Night': return 'The Void';
            case 'Late Night': return 'Star Dreaming';
        }
    }
}
