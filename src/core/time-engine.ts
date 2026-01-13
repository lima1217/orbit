import { OrbitTime, UserRhythmConfig, TimePhase } from '../types/time';

const DEFAULT_CONFIG: UserRhythmConfig = {
    wakingTime: 7,
    bedTime: 23,
    peakEnergyTime: 14,
    dayDuration: 24,
    anchorTime: new Date() // Will be set to a reasonable default on init
};

export class OrbitEngine {
    private config: UserRhythmConfig;

    constructor(config: Partial<UserRhythmConfig> = {}) {
        // Ensure anchorTime is valid
        const anchor = config.anchorTime || new Date();
        anchor.setHours(7, 0, 0, 0); // Default anchor at 7AM today if not specified

        this.config = { ...DEFAULT_CONFIG, ...config };
        if (!config.anchorTime) {
            this.config.anchorTime = anchor;
        }
    }

    public tick(now: Date = new Date()): OrbitTime {
        const { dayDuration, anchorTime } = this.config;

        // Calculate time difference in milliseconds
        const diffMs = now.getTime() - anchorTime.getTime();
        const hourMs = 60 * 60 * 1000;
        const cycleMs = dayDuration * hourMs;

        // Calculate position in the current cycle
        // Using modulo to wrap around, handling negative diffs
        let currentCycleMs = diffMs % cycleMs;
        if (currentCycleMs < 0) currentCycleMs += cycleMs;

        const currentOrbitHour = currentCycleMs / hourMs;
        const progress = currentOrbitHour / dayDuration;

        const phase = this.determinePhase(progress);
        const intensity = this.calculateIntensity(progress);
        const label = this.getSoulLabel(phase, currentOrbitHour);
        const orbitTimeString = this.formatOrbitTime(currentOrbitHour);

        return {
            standard: now,
            orbitTimeString,
            orbitHour: currentOrbitHour,
            cycleProgress: progress,
            phase,
            intensity,
            label
        };
    }

    private formatOrbitTime(hours: number): string {
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    private determinePhase(progress: number): TimePhase {
        // progress is 0.0 to 1.0
        if (progress < 0.1) return 'Dawn';      // 0% - 10%
        if (progress < 0.5) return 'Day';       // 10% - 50%
        if (progress < 0.6) return 'Dusk';      // 50% - 60%
        if (progress < 0.85) return 'Night';    // 60% - 85%
        return 'Late Night';                    // 85% - 100%
    }

    private calculateIntensity(progress: number): number {
        // Peak at 30% (Day), Lowest at 90% (Late Night)
        // Simple sine wave shifted
        return 0.4 + 0.6 * Math.sin(progress * Math.PI * 2);
    }

    private getSoulLabel(phase: TimePhase, hour: number): string {
        // Creative labels
        switch (phase) {
            case 'Dawn': return 'The Awakening';
            case 'Day': return 'The Flow';
            case 'Dusk': return 'The Reflection';
            case 'Night': return 'The Void';
            case 'Late Night': return 'Star Dreaming';
        }
    }
}
