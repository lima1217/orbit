import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CircleTimePickerProps {
    initialHour?: number;
    initialMinute?: number;
    onChange?: (hour: number, minute: number) => void;
}

/**
 * Circle Time Picker - 24-hour circular ring
 * Minimalist design with draggable light orb
 */
export const CircleTimePicker: React.FC<CircleTimePickerProps> = ({
    initialHour = 7,
    initialMinute = 0,
    onChange
}) => {
    const [hour, setHour] = useState(initialHour);
    const [minute, setMinute] = useState(initialMinute);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Ring parameters
    const size = 260;
    const center = size / 2;
    const ringRadius = 100;
    const orbSize = 24;

    // Convert time to angle (0 at top, clockwise)
    // 0:00 = 0°, 6:00 = 90°, 12:00 = 180°, 18:00 = 270°
    const timeToAngle = (h: number, m: number) => {
        const totalMinutes = h * 60 + m;
        return (totalMinutes / (24 * 60)) * 360;
    };

    // Convert angle to time
    const angleToTime = (angle: number) => {
        // Normalize to 0-360
        angle = ((angle % 360) + 360) % 360;

        let totalMinutes = (angle / 360) * 24 * 60;

        // Snap to 5-minute increments
        totalMinutes = Math.round(totalMinutes / 5) * 5;

        if (totalMinutes >= 24 * 60) totalMinutes = 0;

        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;

        return { hour: h, minute: m };
    };

    const angle = timeToAngle(hour, minute);

    // Calculate orb position
    const angleRad = (angle - 90) * (Math.PI / 180); // -90 to start from top
    const orbX = center + Math.cos(angleRad) * ringRadius;
    const orbY = center + Math.sin(angleRad) * ringRadius;

    // Handle drag
    const updateTimeFromEvent = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left - center;
        const y = clientY - rect.top - center;

        // Calculate angle from position
        let newAngle = Math.atan2(y, x) * (180 / Math.PI);
        newAngle = newAngle + 90; // Adjust so 0° is at top
        if (newAngle < 0) newAngle += 360;

        const { hour: newHour, minute: newMinute } = angleToTime(newAngle);
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

    return (
        <div className="relative flex flex-col items-center">
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative cursor-pointer"
                style={{ width: size, height: size }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                {/* Dreamy Ring Glow Layer */}
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                        filter: 'blur(12px)',
                    }}
                >
                    <div
                        className="rounded-full"
                        style={{
                            width: ringRadius * 2 + 20,
                            height: ringRadius * 2 + 20,
                            border: '8px solid rgba(167, 139, 250, 0.3)',
                            boxShadow: '0 0 40px rgba(167, 139, 250, 0.4), 0 0 80px rgba(139, 92, 246, 0.2)',
                        }}
                    />
                </div>

                {/* SVG Ring - Subtle core */}
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(167, 139, 250, 0.25)" />
                            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
                            <stop offset="100%" stopColor="rgba(167, 139, 250, 0.25)" />
                        </linearGradient>
                    </defs>

                    {/* Main ring - subtle core */}
                    <circle
                        cx={center}
                        cy={center}
                        r={ringRadius}
                        fill="none"
                        stroke="url(#ringGradient)"
                        strokeWidth="3"
                    />
                </svg>

                {/* Center time display */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-3xl font-light text-gray-600 tracking-wide">
                        {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
                    </span>
                </div>

                {/* Draggable orb */}
                <motion.div
                    className="absolute cursor-grab active:cursor-grabbing"
                    style={{
                        left: orbX - orbSize / 2,
                        top: orbY - orbSize / 2,
                        width: orbSize,
                        height: orbSize,
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div
                        className="w-full h-full rounded-full"
                        style={{
                            background: 'radial-gradient(circle at center, #FFFFFF 0%, #C4B5FD 100%)',
                            boxShadow: '0 0 16px rgba(196, 181, 253, 0.8), 0 0 32px rgba(167, 139, 250, 0.4)',
                        }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
};
