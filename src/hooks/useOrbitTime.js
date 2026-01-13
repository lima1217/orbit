import { useState, useEffect } from 'react';

/**
 * useOrbitTime
 * Calculates the current 'subjective' time based on a custom day duration.
 * 
 * @param {number} dayDurationHours - Length of the subjective day in real hours (e.g., 24, 28, 10).
 * @param {number} wakeUpOffsetHours - The 'real' time hour when the user's day typically starts (0-23). 
 *                                     This aligns 00:00 Orbit Time to this real hour.
 *                                     Defaulting to 0 (midnight) for now.
 * @returns {object} { 
 *   orbitTime: number, // 0 to dayDurationHours
 *   progress: number,  // 0.0 to 1.0 (percentage of day complete)
 *   phase: string      // 'Dawn', 'Day', 'Dusk', 'Night'
 * }
 */
export function useOrbitTime(dayDurationHours = 24, wakeUpOffsetHours = 0) {
    const [timeState, setTimeState] = useState({
        orbitTime: 0,
        progress: 0,
        phase: 'Day'
    });

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            // Total milliseconds since epoch
            const totalMs = now.getTime();

            // Length of one subjective day in ms
            const dayDurationMs = dayDurationHours * 60 * 60 * 1000;

            // Calculate offset in ms
            const offsetMs = wakeUpOffsetHours * 60 * 60 * 1000;

            // We anchor 00:00 Orbit Time to the 'wakeUpOffset' of the current real day?
            // Actually, if dayDuration != 24, 'current real day' is meaningless.
            // The simplest model for "Unbound Rhythm":
            // Just run a cycle of length X starting from... when?
            // Let's anchor it to a fixed date for consistency, or just use raw modulo.
            // Detailed approach:
            // If I live a 28 hour day, my schedule shifts 4 hours every real day.
            // So (Time % 28h) is the only thing that matters.

            // To allow the user to "align" it, we would need a 'referenceTimestamp'.
            // For now, we'll just use 0 (Epoch) as the reference, plus an offset user might set.
            // Realistically, user would say "It is morning NOW", and we reset the cycle.
            // Let's implement that 'anchor' later. For now: Modulo from Epoch.

            const currentCyclePos = (totalMs - offsetMs) % dayDurationMs;

            // Current 'hour' in the subjective day
            const orbitHour = (currentCyclePos / dayDurationMs) * dayDurationHours;

            const progress = currentCyclePos / dayDurationMs;

            // Determine Phase
            // Let's assume:
            // 0% - 25% : Dawn/Morning
            // 25% - 75% : Day
            // 75% - 85% : Dusk
            // 85% - 100% : Night
            // This is a rough approximation.
            let phase = 'Night';
            if (progress > 0.1 && progress < 0.3) phase = 'Dawn';
            else if (progress >= 0.3 && progress < 0.7) phase = 'Day';
            else if (progress >= 0.7 && progress < 0.9) phase = 'Dusk';

            setTimeState({
                orbitTime: orbitHour,
                progress,
                phase
            });
        };

        const interval = setInterval(tick, 1000); // Update every second
        tick(); // Initial call

        return () => clearInterval(interval);
    }, [dayDurationHours, wakeUpOffsetHours]);

    return timeState;
}
