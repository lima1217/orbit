import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface WakeUpPickerProps {
    onSelect: (hour: number, minute: number) => void;
}

interface WheelColumnProps {
    items: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    itemHeight?: number;
}

const WheelColumn: React.FC<WheelColumnProps> = ({
    items,
    selectedIndex,
    onSelect,
    itemHeight = 56
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        if (containerRef.current && !isScrolling) {
            containerRef.current.scrollTo({
                top: selectedIndex * itemHeight,
                behavior: 'smooth'
            });
        }
    }, [selectedIndex, itemHeight, isScrolling]);

    const handleScroll = () => {
        if (!containerRef.current) return;
        setIsScrolling(true);

        const scrollTop = containerRef.current.scrollTop;
        const newIndex = Math.round(scrollTop / itemHeight);

        if (newIndex >= 0 && newIndex < items.length && newIndex !== selectedIndex) {
            onSelect(newIndex);
        }

        // Debounce scroll end
        clearTimeout((containerRef.current as any).scrollTimeout);
        (containerRef.current as any).scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
        }, 150);
    };

    return (
        <div className="relative h-[168px] overflow-hidden">
            {/* No fade gradients - let it blend naturally */}

            {/* Scrollable items */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
                style={{
                    paddingTop: itemHeight,
                    paddingBottom: itemHeight,
                }}
            >
                {items.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <div
                            key={item}
                            className="snap-center flex items-center justify-center transition-all duration-200"
                            style={{ height: itemHeight }}
                        >
                            <span
                                className={`
                                    font-light tracking-wider transition-all duration-300
                                    ${isSelected
                                        ? 'text-4xl text-gray-800'
                                        : 'text-xl text-gray-400/50'
                                    }
                                `}
                            >
                                {item}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Smart inference: determine if selected time is today or yesterday
const getInferredDate = (hour: number, minute: number): 'today' | 'yesterday' => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const selectedMinutes = hour * 60 + minute;
    // If selected time is <= current time, it's today; otherwise it's yesterday
    return selectedMinutes <= nowMinutes ? 'today' : 'yesterday';
};

export const WakeUpPicker: React.FC<WakeUpPickerProps> = ({ onSelect }) => {
    // Default to 07:00
    const [selectedHourIndex, setSelectedHourIndex] = useState(7);
    const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(0);

    // 24-hour format: 00-23
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    // Current selected time
    const selectedHour = parseInt(hours[selectedHourIndex]);
    const selectedMinute = parseInt(minutes[selectedMinuteIndex]);

    // Smart inference for today/yesterday
    const inferredDate = useMemo(
        () => getInferredDate(selectedHour, selectedMinute),
        [selectedHour, selectedMinute]
    );

    // Format display text
    const displayText = useMemo(() => {
        const dateLabel = inferredDate === 'today' ? '今天' : '昨天';
        const timeStr = `${hours[selectedHourIndex]}:${minutes[selectedMinuteIndex]}`;
        return `${dateLabel} ${timeStr}`;
    }, [inferredDate, selectedHourIndex, selectedMinuteIndex, hours, minutes]);

    const handleConfirm = () => {
        onSelect(selectedHour, selectedMinute);
    };

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
                key="picker"
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
                exit={{ opacity: 0, y: -30, scale: 0.98, transition: { duration: 0.5 } }}
                className="relative z-10 flex flex-col items-center text-center w-full px-4"
            >
                {/* Poetic Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1.0, ease: "easeOut" }}
                    className="mb-10"
                >
                    <p className="text-caption text-gray-500/80 tracking-wide mb-2">
                        世界按它的时钟行走
                    </p>
                    <h1 className="text-headline text-gray-700 tracking-wide mb-2">
                        你按你的身体醒来
                    </h1>
                    <p className="text-caption text-gray-500/70 tracking-wide">
                        睁开眼时，是几点？
                    </p>
                </motion.div>

                {/* Time Wheel Picker - 24h format, 2 columns */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0, duration: 1.0, ease: [0.2, 0.8, 0.2, 1] }}
                    className="flex flex-col items-center mb-12"
                >
                    <div className="flex items-center justify-center">
                        <WheelColumn
                            items={hours}
                            selectedIndex={selectedHourIndex}
                            onSelect={setSelectedHourIndex}
                        />
                        <span className="text-3xl text-gray-600 font-light mx-2">:</span>
                        <WheelColumn
                            items={minutes}
                            selectedIndex={selectedMinuteIndex}
                            onSelect={setSelectedMinuteIndex}
                        />
                    </div>

                    {/* Smart inference feedback */}
                    <motion.p
                        key={displayText}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 text-body text-gray-600/80 tracking-wide"
                    >
                        {displayText}
                    </motion.p>
                </motion.div>

                {/* Glass Pill Button CTA */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
                    onClick={handleConfirm}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-8 py-3 rounded-full bg-white/40 border border-white/60 shadow-sm backdrop-blur-md transition-all duration-300 cursor-pointer"
                >
                    <span className="text-body text-gray-600 tracking-wide group-hover:text-gray-800 transition-colors">
                        时间将以你的节奏流淌
                    </span>

                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.button>
            </motion.div>
        </motion.div>
    );
};
