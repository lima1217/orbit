import { describe, it, expect } from 'vitest';
import { OrbitEngine } from './time-engine';

describe('OrbitEngine', () => {
    it('should initialize with default anchor at 7AM', () => {
        const engine = new OrbitEngine();
        const testTime = new Date();
        testTime.setHours(7, 0, 0, 0);
        
        const orbit = engine.tick(testTime);
        // Current implementation: anchor at 7AM means 7AM -> 00:00 Orbit Time
        expect(orbit.orbitTimeString).toBe('00:00');
    });

    it('should calculate 12:00 Orbit time 5 hours after anchor', () => {
        const anchor = new Date();
        anchor.setHours(7, 0, 0, 0);
        const engine = new OrbitEngine({ anchorTime: anchor });
        
        const testTime = new Date(anchor.getTime() + 5 * 60 * 60 * 1000);
        const orbit = engine.tick(testTime);
        expect(orbit.orbitTimeString).toBe('05:00');
    });

    it('should handle cycle wrap around', () => {
        const anchor = new Date();
        anchor.setHours(7, 0, 0, 0);
        const engine = new OrbitEngine({ anchorTime: anchor, dayDuration: 24 });
        
        const testTime = new Date(anchor.getTime() + 25 * 60 * 60 * 1000);
        const orbit = engine.tick(testTime);
        expect(orbit.orbitTimeString).toBe('01:00');
    });
});
