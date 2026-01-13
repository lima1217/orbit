import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WakeUpPickerOptimizedProps {
    onSelect: (hour: number, minute: number) => void;
}

interface WheelColumnProps {
    items: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    itemHeight?: number;
}

/**
 * Scroll wheel column component using CSS scroll-snap
 */
const WheelColumn: React.FC<WheelColumnProps> = ({
    items,
    selectedIndex,
    onSelect,
    itemHeight = 72
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (containerRef.current && !isScrollingRef.current) {
            containerRef.current.scrollTop = selectedIndex * itemHeight;
        }
    }, [selectedIndex, itemHeight]);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        isScrollingRef.current = true;

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            if (!containerRef.current) return;

            const scrollTop = containerRef.current.scrollTop;
            const newIndex = Math.round(scrollTop / itemHeight);
            const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex));

            if (clampedIndex !== selectedIndex) {
                onSelect(clampedIndex);
            }

            isScrollingRef.current = false;
        }, 100);
    }, [items.length, itemHeight, selectedIndex, onSelect]);

    return (
        <div className="relative h-[216px] overflow-hidden">
            {/* Scrollable container */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
                style={{
                    scrollBehavior: 'smooth',
                    paddingTop: itemHeight,
                    paddingBottom: itemHeight,
                }}
            >
                {items.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <div
                            key={item}
                            className={`flex items-center justify-center snap-center transition-all duration-300 cursor-pointer ${isSelected
                                ? 'text-gray-800 font-medium'
                                : 'text-gray-300 font-light'
                                }`}
                            style={{
                                height: `${itemHeight}px`,
                                fontSize: isSelected ? '56px' : '24px',
                                opacity: isSelected ? 1 : 0.4,
                            }}
                            onClick={() => {
                                onSelect(index);
                                if (containerRef.current) {
                                    containerRef.current.scrollTo({
                                        top: index * itemHeight,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                        >
                            {item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Optimized Wake-up time picker with larger, more prominent numbers
 * and floating text without background card
 */
export const WakeUpPickerOptimized: React.FC<WakeUpPickerOptimizedProps> = ({ onSelect }) => {
    const [selectedHourIndex, setSelectedHourIndex] = useState(7);
    const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(0);

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    const handleConfirm = () => {
        const hour24 = parseInt(hours[selectedHourIndex]);
        const minute = parseInt(minutes[selectedMinuteIndex]);
        onSelect(hour24, minute);
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
                {/* Floating Poetic Header - NO background card, just text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="mb-12"
                >
                    <p className="text-caption text-gray-400/80 tracking-wide mb-2">
                        世界按它的时钟行走
                    </p>
                    <h1 className="text-headline text-gray-600 tracking-wide mb-3">
                        你按你的身体醒来
                    </h1>
                    <p className="text-caption text-gray-400/70 tracking-wide">
                        告诉我这个时刻
                    </p>
                </motion.div>

                {/* Scroll Wheel Picker with subtle orbit glow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 1.0, ease: [0.2, 0.8, 0.2, 1] }}
                    className="relative w-full flex justify-center mb-16"
                >
                    {/* Subtle circular glow behind the picker */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)',
                        }}
                    />

                    {/* Time picker container */}
                    <div className="relative flex items-center justify-center gap-4">
                        {/* Hour wheel */}
                        <div className="w-24">
                            <WheelColumn
                                items={hours}
                                selectedIndex={selectedHourIndex}
                                onSelect={setSelectedHourIndex}
                            />
                        </div>

                        {/* Colon separator */}
                        <div className="text-5xl font-light text-gray-300 h-[216px] flex items-center">:</div>

                        {/* Minute wheel */}
                        <div className="w-24">
                            <WheelColumn
                                items={minutes}
                                selectedIndex={selectedMinuteIndex}
                                onSelect={setSelectedMinuteIndex}
                            />
                        </div>
                    </div>
                </motion.div>

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
