import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AnalogClockPickerProps {
    onSelect: (hour: number, minute: number) => void;
}

/**
 * Analog clock time picker with draggable hour and minute hands
 */
export const AnalogClockPicker: React.FC<AnalogClockPickerProps> = ({ onSelect }) => {
    const [hour, setHour] = useState(7);
    const [minute, setMinute] = useState(0);
    const [isDraggingHour, setIsDraggingHour] = useState(false);
    const [isDraggingMinute, setIsDraggingMinute] = useState(false);
    const clockRef = useRef<HTMLDivElement>(null);

    // Convert angle to time
    const angleToHour = (angle: number): number => {
        // Normalize angle to 0-360
        let normalized = ((angle % 360) + 360) % 360;
        // Convert to 24-hour format (each hour = 15 degrees for 24-hour, or 30 degrees for 12-hour)
        // Using 12-hour display but tracking 24-hour internally
        let h = Math.round(normalized / 30) % 12;
        if (h === 0) h = 12;
        return h;
    };

    const angleToMinute = (angle: number): number => {
        let normalized = ((angle % 360) + 360) % 360;
        // Each minute = 6 degrees
        let m = Math.round(normalized / 6) % 60;
        // Round to nearest 5
        m = Math.round(m / 5) * 5;
        if (m === 60) m = 0;
        return m;
    };

    const handleDrag = useCallback((e: React.MouseEvent | React.TouchEvent, isHour: boolean) => {
        if (!clockRef.current) return;

        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;

        if (isHour) {
            setHour(angleToHour(angle));
        } else {
            setMinute(angleToMinute(angle));
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDraggingHour) {
            handleDrag(e as unknown as React.MouseEvent, true);
        } else if (isDraggingMinute) {
            handleDrag(e as unknown as React.MouseEvent, false);
        }
    }, [isDraggingHour, isDraggingMinute, handleDrag]);

    const handleMouseUp = useCallback(() => {
        setIsDraggingHour(false);
        setIsDraggingMinute(false);
    }, []);

    React.useEffect(() => {
        if (isDraggingHour || isDraggingMinute) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove as unknown as EventListener);
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove as unknown as EventListener);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDraggingHour, isDraggingMinute, handleMouseMove, handleMouseUp]);

    // Calculate hand angles
    const hourAngle = (hour % 12) * 30 + minute * 0.5; // Hour hand moves slightly with minutes
    const minuteAngle = minute * 6;

    const handleConfirm = () => {
        onSelect(hour, minute);
    };

    // Generate hour markers
    const hourMarkers = Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const radius = 110;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const displayHour = i === 0 ? 12 : i;
        return { x, y, hour: displayHour };
    });

    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(8px) brightness(1.3)" }}
            animate={{
                opacity: 1,
                filter: "blur(0px) brightness(1)",
                transition: {
                    duration: 1.2,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.3
                }
            }}
            exit={{
                opacity: 0,
                y: -60,
                filter: "blur(12px)",
                transition: { duration: 0.8, ease: "easeInOut" }
            }}
            className="fixed inset-0 flex flex-col items-center justify-center p-8"
        >
            {/* Background gradient */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-dawn-cream via-sky-mint/30 to-blush-soft/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.1 }}
            />

            {/* Ambient blobs */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-lavender-soft/40 blur-[100px]"
                initial={{ opacity: 0, scale: 0.6, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.4, ease: "easeOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blush-soft/40 blur-[80px]"
                initial={{ opacity: 0, scale: 0.6, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
            />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        duration: 1.0,
                        delay: 0.6,
                        ease: [0.4, 0, 0.2, 1]
                    }
                }}
                className="relative z-10 flex flex-col items-center text-center w-full px-4"
            >
                {/* Floating Poetic Header - No background card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="mb-8"
                >
                    <p className="text-caption text-gray-400/80 tracking-wide mb-2">
                        世界按它的时钟行走
                    </p>
                    <h1 className="text-headline text-gray-600 tracking-wide mb-3">
                        你按你的身体醒来
                    </h1>
                    <p className="text-caption text-gray-400/70 tracking-wide">
                        拖动指针选择时间
                    </p>
                </motion.div>

                {/* Analog Clock */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0, duration: 1.0, ease: [0.2, 0.8, 0.2, 1] }}
                    className="relative mb-8"
                >
                    <div
                        ref={clockRef}
                        className="relative w-64 h-64 rounded-full"
                        style={{
                            background: 'rgba(255, 255, 255, 0.5)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '2px solid rgba(255, 255, 255, 0.6)',
                            boxShadow: '0 8px 40px rgba(167, 139, 250, 0.2), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 0 30px rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        {/* Hour markers */}
                        {hourMarkers.map(({ x, y, hour: h }) => (
                            <div
                                key={h}
                                className="absolute text-sm font-light text-gray-400"
                                style={{
                                    left: `calc(50% + ${x}px - 10px)`,
                                    top: `calc(50% + ${y}px - 10px)`,
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {h}
                            </div>
                        ))}

                        {/* Minute ticks */}
                        {Array.from({ length: 60 }, (_, i) => {
                            const angle = (i * 6 - 90) * (Math.PI / 180);
                            const isHourMark = i % 5 === 0;
                            const innerRadius = isHourMark ? 92 : 96;
                            const outerRadius = 100;
                            return (
                                <div
                                    key={i}
                                    className={`absolute ${isHourMark ? 'bg-gray-300' : 'bg-gray-200'}`}
                                    style={{
                                        width: isHourMark ? '2px' : '1px',
                                        height: `${outerRadius - innerRadius}px`,
                                        left: '50%',
                                        top: '50%',
                                        transformOrigin: 'center top',
                                        transform: `translate(-50%, 0) rotate(${i * 6}deg) translateY(-${innerRadius}px)`
                                    }}
                                />
                            );
                        })}

                        {/* Center dot */}
                        <div
                            className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-lavender-deep to-blush-deep"
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                boxShadow: '0 2px 8px rgba(167, 139, 250, 0.4)'
                            }}
                        />

                        {/* Hour hand */}
                        <div
                            className={`absolute cursor-grab ${isDraggingHour ? 'cursor-grabbing' : ''}`}
                            style={{
                                width: '6px',
                                height: '60px',
                                left: '50%',
                                top: '50%',
                                transformOrigin: 'center bottom',
                                transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
                                background: 'linear-gradient(to top, #A78BFA, #C48B9F)',
                                borderRadius: '3px',
                                boxShadow: '0 2px 8px rgba(167, 139, 250, 0.4)'
                            }}
                            onMouseDown={() => setIsDraggingHour(true)}
                            onTouchStart={() => setIsDraggingHour(true)}
                        >
                            {/* Grab handle */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-lavender-deep" />
                        </div>

                        {/* Minute hand */}
                        <div
                            className={`absolute cursor-grab ${isDraggingMinute ? 'cursor-grabbing' : ''}`}
                            style={{
                                width: '4px',
                                height: '85px',
                                left: '50%',
                                top: '50%',
                                transformOrigin: 'center bottom',
                                transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
                                background: 'linear-gradient(to top, #5BA4C9, #87CEEB)',
                                borderRadius: '2px',
                                boxShadow: '0 2px 8px rgba(91, 164, 201, 0.4)'
                            }}
                            onMouseDown={() => setIsDraggingMinute(true)}
                            onTouchStart={() => setIsDraggingMinute(true)}
                        >
                            {/* Grab handle */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-sky-deep" />
                        </div>
                    </div>

                    {/* Digital time display */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-2xl font-light text-gray-500"
                    >
                        {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
                    </motion.div>
                </motion.div>

                {/* Spacer for digital display */}
                <div className="h-8" />

                {/* Navigation */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
                    onClick={handleConfirm}
                    className="text-button text-gray-400 hover:text-gray-600 transition-colors duration-300 cursor-pointer mt-8"
                >
                    ↑ 进入你的时区
                </motion.button>
            </motion.div>
        </motion.div>
    );
};
