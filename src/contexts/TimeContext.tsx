import React, { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { OrbitEngine } from '../core/time-engine';
import { OrbitTime, UserRhythmConfig } from '../types/time';

interface TimeContextType {
    orbitTime: OrbitTime;
    config: Partial<UserRhythmConfig>;
    updateConfig: (config: Partial<UserRhythmConfig>) => void;
}

export const TimeContext = createContext<TimeContextType | null>(null);

export const TimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default config: 24h day
    const configRef = useRef<Partial<UserRhythmConfig>>({ dayDuration: 24 });
    const engineRef = useRef(new OrbitEngine(configRef.current));

    // State for the current time tick
    const [orbitTime, setOrbitTime] = useState<OrbitTime>(engineRef.current.tick());

    // We expose config to UI so controls can show current value
    const [configState, setConfigState] = useState<Partial<UserRhythmConfig>>(configRef.current);

    useEffect(() => {
        // Update every second instead of every frame (60fps -> 1fps)
        // Time display only needs per-second precision
        const intervalId = setInterval(() => {
            const newOrbitTime = engineRef.current.tick(new Date());
            setOrbitTime(prev => {
                // Only update if the time string changed to avoid unnecessary re-renders
                if (prev.orbitTimeString !== newOrbitTime.orbitTimeString || 
                    prev.phase !== newOrbitTime.phase) {
                    return newOrbitTime;
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const updateConfig = useCallback((newConfig: Partial<UserRhythmConfig>) => {
        const mergedConfig = { ...configRef.current, ...newConfig };
        configRef.current = mergedConfig;
        setConfigState(mergedConfig);

        // Re-instantiate engine with new config
        engineRef.current = new OrbitEngine(mergedConfig);

        // Immediate update
        setOrbitTime(engineRef.current.tick(new Date()));
    }, []);

    const value = useMemo(() => ({
        orbitTime,
        config: configState,
        updateConfig
    }), [orbitTime, configState, updateConfig]);

    return (
        <TimeContext.Provider value={value}>
            {children}
        </TimeContext.Provider>
    );
};

// Custom Hook for consuming the context
export const useSoulTime = () => {
    const context = useContext(TimeContext);
    if (!context) {
        throw new Error('useSoulTime must be used within a TimeProvider');
    }
    return context;
};
