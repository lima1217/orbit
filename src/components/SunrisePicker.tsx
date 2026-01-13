import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SunrisePickerProps {
    initialHour?: number;
    initialMinute?: number;
    onChange?: (hour: number, minute: number) => void;
}

/**
 * Sunrise Time Picker - Jobs-inspired minimalist design
 * A sun moves along an arc above the horizon to select time
 */
export const SunrisePicker: React.FC<SunrisePickerProps> = ({
    initialHour = 7,
    initialMinute = 0,
    onChange
}) => {
    const [hour, setHour] = useState(initialHour);
    const [minute, setMinute] = useState(initialMinute);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Convert time to angle (0-180 degrees for 6AM-6PM arc)
    // 6:00 = 0°, 12:00 = 90°, 18:00 = 180°
    const timeToAngle = (h: number, m: number) => {
        const totalMinutes = (h * 60 + m) - (6 * 60); // Offset from 6:00
        const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);

        if (normalizedMinutes <= 12 * 60) {
            // 6AM to 6PM: sun above horizon (0° to 180°)
            return (normalizedMinutes / (12 * 60)) * 180;
        } else {
            // 6PM to 6AM: sun below horizon (180° to 360°, mapped as negative)
            return 180 + ((normalizedMinutes - 12 * 60) / (12 * 60)) * 180;
        }
    };

    // Convert angle back to time
    const angleToTime = (angle: number) => {
        // Normalize angle to 0-360
        const normalizedAngle = ((angle % 360) + 360) % 360;

        let totalMinutes: number;
        if (normalizedAngle <= 180) {
            // Above horizon: 6AM to 6PM
            totalMinutes = (normalizedAngle / 180) * 12 * 60 + 6 * 60;
        } else {
            // Below horizon: 6PM to 6AM (next day)
            totalMinutes = ((normalizedAngle - 180) / 180) * 12 * 60 + 18 * 60;
        }

        // Snap to 5-minute increments
        totalMinutes = Math.round(totalMinutes / 5) * 5;

        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;

        return { hour: h, minute: m };
    };

    const angle = timeToAngle(hour, minute);
    const isAboveHorizon = angle <= 180;

    // Arc parameters
    const arcRadius = 120;
    const centerX = 160;
    const horizonY = 160;

    // Calculate sun position
    const sunAngle = isAboveHorizon ? angle : angle;
    const radians = (180 - sunAngle) * (Math.PI / 180);
    const sunX = centerX + Math.cos(radians) * arcRadius;
    const sunY = horizonY - Math.sin(radians) * arcRadius;

    // Handle drag
    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left - centerX;
        const y = horizonY - (clientY - rect.top);

        // Calculate angle from position
        let newAngle = Math.atan2(y, -x) * (180 / Math.PI);
        if (newAngle < 0) newAngle += 360;

        // Clamp to valid range (above horizon only for now: 0-180)
        newAngle = Math.max(0, Math.min(180, newAngle));

        const { hour: newHour, minute: newMinute } = angleToTime(newAngle);
        setHour(newHour);
        setMinute(newMinute);
        onChange?.(newHour, newMinute);
    }, [onChange]);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDragging.current = true;
    }, []);

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

    // Background color based on sun position
    const getBackgroundGradient = () => {
        const progress = angle / 180; // 0 to 1 for above horizon

        if (angle <= 30) {
            // Early morning - orange/pink dawn
            return 'linear-gradient(to top, #ffecd2 0%, #fcb69f 50%, #ffb6c1 100%)';
        } else if (angle <= 90) {
            // Morning - warm yellow
            return 'linear-gradient(to top, #fff5e6 0%, #ffe4c4 50%, #87ceeb 100%)';
        } else if (angle <= 150) {
            // Afternoon - soft blue
            return 'linear-gradient(to top, #e0f4f1 0%, #87ceeb 50%, #5ba4c9 100%)';
        } else {
            // Evening - sunset colors
            return 'linear-gradient(to top, #ffecd2 0%, #fcb69f 50%, #c48b9f 100%)';
        }
    };

    return (
        <div className="relative flex flex-col items-center">
            {/* Sky container */}
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative w-80 h-44 rounded-t-full overflow-hidden"
                style={{
                    background: getBackgroundGradient(),
                }}
            >
                {/* Arc path (dotted line showing sun's trajectory) */}
                <svg
                    width="320"
                    height="176"
                    viewBox="0 0 320 176"
                    className="absolute inset-0"
                >
                    {/* Dotted arc path */}
                    <path
                        d={`M ${centerX - arcRadius} ${horizonY} A ${arcRadius} ${arcRadius} 0 0 1 ${centerX + arcRadius} ${horizonY}`}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth="2"
                        strokeDasharray="6 8"
                    />

                    {/* Hour markers */}
                    {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => {
                        const markerAngle = ((h - 6) / 12) * 180;
                        const rad = (180 - markerAngle) * (Math.PI / 180);
                        const x = centerX + Math.cos(rad) * (arcRadius + 15);
                        const y = horizonY - Math.sin(rad) * (arcRadius + 15);
                        const isSelected = h === hour;

                        // Only show key hours to reduce noise
                        if (h % 3 !== 0 && h !== hour) return null;

                        return (
                            <text
                                key={h}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-light select-none"
                                fill={isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}
                            >
                                {h}
                            </text>
                        );
                    })}
                </svg>

                {/* Sun - Pure Light */}
                <motion.div
                    className="absolute cursor-grab active:cursor-grabbing"
                    style={{
                        left: sunX - 16,
                        top: sunY - 16,
                        width: 32,
                        height: 32,
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div
                        className="w-full h-full rounded-full"
                        style={{
                            background: 'radial-gradient(circle at center, #FFFFFF 0%, #FEF3C7 100%)',
                            boxShadow: '0 0 24px rgba(255, 255, 255, 0.9), 0 0 48px rgba(253, 230, 138, 0.5)',
                        }}
                    />
                </motion.div>
            </motion.div>

            {/* Horizon line */}
            <div className="w-80 h-px bg-gradient-to-r from-transparent via-gray-400/50 to-transparent" />

            {/* Ground/base area */}
            <div
                className="w-80 h-8 rounded-b-2xl"
                style={{
                    background: 'linear-gradient(to bottom, rgba(200, 180, 160, 0.3), rgba(180, 160, 140, 0.1))',
                }}
            />
        </div>
    );
};
