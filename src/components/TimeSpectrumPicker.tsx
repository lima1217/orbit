import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TimeSpectrumPickerProps {
    initialHour?: number;
    initialMinute?: number;
    onChange?: (hour: number, minute: number) => void;
}

/**
 * Time Spectrum Picker - A horizontal gradient bar representing 24 hours
 * Drag the light orb to select time
 */
export const TimeSpectrumPicker: React.FC<TimeSpectrumPickerProps> = ({
    initialHour = 7,
    initialMinute = 0,
    onChange
}) => {
    const [hour, setHour] = useState(initialHour);
    const [minute, setMinute] = useState(initialMinute);
    const trackRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Convert time to position (0-100%)
    const timeToPosition = (h: number, m: number) => {
        const totalMinutes = h * 60 + m;
        return (totalMinutes / (24 * 60)) * 100;
    };

    // Convert position to time
    const positionToTime = (percent: number) => {
        // Clamp to 0-100
        percent = Math.max(0, Math.min(100, percent));

        let totalMinutes = (percent / 100) * 24 * 60;

        // Snap to 5-minute increments
        totalMinutes = Math.round(totalMinutes / 5) * 5;

        // Handle edge case where it rounds to 24:00
        if (totalMinutes >= 24 * 60) totalMinutes = 0;

        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;

        return { hour: h, minute: m };
    };

    const position = timeToPosition(hour, minute);

    // Handle drag on track
    const updateTimeFromEvent = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
        if (!trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

        const relativeX = clientX - rect.left;
        const percent = (relativeX / rect.width) * 100;

        const { hour: newHour, minute: newMinute } = positionToTime(percent);
        setHour(newHour);
        setMinute(newMinute);
        onChange?.(newHour, newMinute);
    }, [onChange]);

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging.current) return;
        updateTimeFromEvent(e);
    }, [updateTimeFromEvent]);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDragging.current = true;
        updateTimeFromEvent(e);
    }, [updateTimeFromEvent]);

    // Attach global listeners
    React.useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
        const handleUp = () => handleMouseUp();

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleUp);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Get orb color based on time
    const getOrbColor = () => {
        if (hour >= 5 && hour < 8) return '#FCD34D'; // Dawn - golden
        if (hour >= 8 && hour < 17) return '#FEFCE8'; // Day - light
        if (hour >= 17 && hour < 20) return '#FB923C'; // Sunset - orange
        return '#E0E7FF'; // Night - soft blue-white
    };

    // Get orb glow based on time
    const getOrbGlow = () => {
        if (hour >= 5 && hour < 8) return '0 0 20px rgba(252, 211, 77, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)';
        if (hour >= 8 && hour < 17) return '0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(253, 230, 138, 0.5)';
        if (hour >= 17 && hour < 20) return '0 0 20px rgba(251, 146, 60, 0.8), 0 0 40px rgba(249, 115, 22, 0.4)';
        return '0 0 20px rgba(224, 231, 255, 0.8), 0 0 40px rgba(165, 180, 252, 0.5)';
    };

    return (
        <div className="relative flex flex-col items-center w-full max-w-sm">
            {/* Time markers */}
            <div className="w-full flex justify-between px-2 mb-2">
                {[0, 6, 12, 18, 24].map((h) => (
                    <span
                        key={h}
                        className="text-xs text-gray-400 font-light"
                        style={{ opacity: h === 24 ? 0 : 1 }}
                    >
                        {h.toString().padStart(2, '0')}
                    </span>
                ))}
            </div>

            {/* Spectrum track */}
            <motion.div
                ref={trackRef}
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative w-full h-12 rounded-full cursor-pointer overflow-hidden"
                style={{
                    background: `linear-gradient(to right, 
                        #1e1b4b 0%,      /* 0:00 - deep night */
                        #312e81 8%,      /* 2:00 - late night */
                        #4c1d95 16%,     /* 4:00 - pre-dawn */
                        #f97316 25%,     /* 6:00 - sunrise */
                        #fbbf24 33%,     /* 8:00 - morning */
                        #fef3c7 42%,     /* 10:00 - late morning */
                        #e0f2fe 50%,     /* 12:00 - noon */
                        #bae6fd 58%,     /* 14:00 - afternoon */
                        #7dd3fc 67%,     /* 16:00 - late afternoon */
                        #f97316 75%,     /* 18:00 - sunset */
                        #7c3aed 83%,     /* 20:00 - dusk */
                        #312e81 92%,     /* 22:00 - night */
                        #1e1b4b 100%     /* 24:00 - deep night */
                    )`,
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                {/* Light orb */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                    style={{
                        left: `calc(${position}% - 14px)`,
                        width: 28,
                        height: 28,
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div
                        className="w-full h-full rounded-full border-2 border-white/80"
                        style={{
                            background: `radial-gradient(circle at center, #FFFFFF 0%, ${getOrbColor()} 100%)`,
                            boxShadow: getOrbGlow(),
                        }}
                    />
                </motion.div>
            </motion.div>

            {/* Subtle time labels below */}
            <div className="w-full flex justify-between px-2 mt-2">
                <span className="text-xs text-gray-400/60 font-light">midnight</span>
                <span className="text-xs text-gray-400/60 font-light">noon</span>
                <span className="text-xs text-gray-400/60 font-light">midnight</span>
            </div>
        </div>
    );
};
