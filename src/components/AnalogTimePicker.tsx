import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AnalogTimePickerProps {
    initialHour?: number;
    initialMinute?: number;
    onChange?: (hour: number, minute: number) => void;
}

/**
 * Analog clock time picker with draggable hands
 * Jobs-inspired: Intuitive, beautiful, minimal
 */
export const AnalogTimePicker: React.FC<AnalogTimePickerProps> = ({
    initialHour = 7,
    initialMinute = 0,
    onChange
}) => {
    const [hour, setHour] = useState(initialHour);
    const [minute, setMinute] = useState(initialMinute);
    const clockRef = useRef<SVGSVGElement>(null);
    const isDraggingRef = useRef<'hour' | 'minute' | null>(null);

    // Calculate angles from time
    const minuteAngle = (minute / 60) * 360;
    const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30; // Hour hand moves gradually

    // Convert mouse position to angle
    const getAngleFromEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!clockRef.current) return 0;

        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        return angle;
    }, []);

    // Handle mouse move
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current) return;

        const angle = getAngleFromEvent(e);

        if (isDraggingRef.current === 'minute') {
            const newMinute = Math.round((angle / 360) * 12) * 5; // Snap to 5-minute increments
            const clampedMinute = newMinute === 60 ? 0 : newMinute;
            setMinute(clampedMinute);
            onChange?.(hour, clampedMinute);
        } else if (isDraggingRef.current === 'hour') {
            const newHour = Math.round((angle / 360) * 12);
            const clampedHour = newHour === 12 ? 0 : newHour;
            // Preserve AM/PM by checking if current hour is >= 12
            const finalHour = hour >= 12 ? clampedHour + 12 : clampedHour;
            setHour(finalHour);
            onChange?.(finalHour, minute);
        }
    }, [hour, minute, onChange, getAngleFromEvent]);

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = null;
    }, []);

    // Start dragging
    const handleMouseDown = useCallback((hand: 'hour' | 'minute') => (e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingRef.current = hand;
    }, []);

    // Attach global listeners
    React.useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div className="relative flex flex-col items-center">
            {/* Clock Face */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative"
            >
                <svg
                    ref={clockRef}
                    width="280"
                    height="280"
                    viewBox="0 0 280 280"
                    className="relative z-10"
                    style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
                >
                    {/* Clock background with subtle gradient */}
                    <defs>
                        <radialGradient id="clockGradient" cx="50%" cy="50%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.85)" />
                        </radialGradient>

                        {/* Gradient for hour hand */}
                        <linearGradient id="hourGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#93c5fd" />
                            <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>

                        {/* Gradient for minute hand */}
                        <linearGradient id="minuteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                    </defs>

                    {/* Clock face circle */}
                    <circle
                        cx="140"
                        cy="140"
                        r="130"
                        fill="url(#clockGradient)"
                        stroke="rgba(167, 139, 250, 0.2)"
                        strokeWidth="1"
                    />

                    {/* Hour markers */}
                    {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i * 30 - 90) * (Math.PI / 180);
                        const x1 = 140 + Math.cos(angle) * 110;
                        const y1 = 140 + Math.sin(angle) * 110;
                        const x2 = 140 + Math.cos(angle) * 120;
                        const y2 = 140 + Math.sin(angle) * 120;

                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="rgba(156, 163, 175, 0.3)"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Minute markers (subtle) */}
                    {Array.from({ length: 60 }).map((_, i) => {
                        if (i % 5 === 0) return null; // Skip hour positions
                        const angle = (i * 6 - 90) * (Math.PI / 180);
                        const x1 = 140 + Math.cos(angle) * 115;
                        const y1 = 140 + Math.sin(angle) * 115;
                        const x2 = 140 + Math.cos(angle) * 120;
                        const y2 = 140 + Math.sin(angle) * 120;

                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="rgba(156, 163, 175, 0.15)"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Hour numbers */}
                    {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
                        const angle = (i * 30 - 90) * (Math.PI / 180);
                        const x = 140 + Math.cos(angle) * 90;
                        const y = 140 + Math.sin(angle) * 90;

                        return (
                            <text
                                key={num}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-sm font-light select-none"
                                fill="rgba(107, 114, 128, 0.6)"
                            >
                                {num}
                            </text>
                        );
                    })}

                    {/* Hour hand - shorter, thicker, blue */}
                    <line
                        x1="140"
                        y1="140"
                        x2={140 + Math.sin(hourAngle * (Math.PI / 180)) * 55}
                        y2={140 - Math.cos(hourAngle * (Math.PI / 180)) * 55}
                        stroke="#6366f1"
                        strokeWidth="8"
                        strokeLinecap="round"
                        style={{ cursor: 'grab' }}
                        onMouseDown={handleMouseDown('hour')}
                    />

                    {/* Minute hand - longer, thinner, purple */}
                    <line
                        x1="140"
                        y1="140"
                        x2={140 + Math.sin(minuteAngle * (Math.PI / 180)) * 95}
                        y2={140 - Math.cos(minuteAngle * (Math.PI / 180)) * 95}
                        stroke="#a855f7"
                        strokeWidth="5"
                        strokeLinecap="round"
                        style={{ cursor: 'grab' }}
                        onMouseDown={handleMouseDown('minute')}
                    />

                    {/* Hour hand knob */}
                    <circle
                        cx={140 + Math.sin(hourAngle * (Math.PI / 180)) * 55}
                        cy={140 - Math.cos(hourAngle * (Math.PI / 180)) * 55}
                        r="10"
                        fill="#6366f1"
                        stroke="white"
                        strokeWidth="3"
                        style={{ cursor: 'grab' }}
                        onMouseDown={handleMouseDown('hour')}
                    />

                    {/* Minute hand knob */}
                    <circle
                        cx={140 + Math.sin(minuteAngle * (Math.PI / 180)) * 95}
                        cy={140 - Math.cos(minuteAngle * (Math.PI / 180)) * 95}
                        r="8"
                        fill="#a855f7"
                        stroke="white"
                        strokeWidth="3"
                        style={{ cursor: 'grab' }}
                        onMouseDown={handleMouseDown('minute')}
                    />

                    {/* Center dot */}
                    <circle
                        cx="140"
                        cy="140"
                        r="8"
                        fill="#4f46e5"
                        stroke="white"
                        strokeWidth="2"
                    />
                </svg>
            </motion.div>


        </div>
    );
};
