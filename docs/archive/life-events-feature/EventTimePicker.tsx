import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { LifeEvent } from '../constants/lifeEvents';

interface EventTimePickerProps {
    event: LifeEvent;
    currentHour: number;
    onSave: (hour: number) => void;
    onClose: () => void;
    timezoneOffset: number;  // Timezone offset to calculate local time
    wakeUpHour: number;      // User's wake up hour (local time)
}

/**
 * Reusable wheel column component
 */
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
    itemHeight = 48
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

        clearTimeout((containerRef.current as any).scrollTimeout);
        (containerRef.current as any).scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
        }, 150);
    };

    return (
        <div className="relative h-[144px] overflow-hidden">
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
                            key={`${item}-${index}`}
                            className="snap-center flex items-center justify-center transition-all duration-200"
                            style={{ height: itemHeight }}
                        >
                            <span
                                className={`
                                    transition-all duration-300
                                    ${isSelected
                                        ? 'text-picker-selected text-gray-800'
                                        : 'text-picker-option text-gray-400/50'
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

/**
 * Convert hours after waking to Orbit time display (HH:00)
 * Assuming wake-up = 06:00 Orbit time (standard mapping)
 */
const hoursToOrbitTime = (hoursAfterWaking: number): string => {
    const orbitHour = (6 + hoursAfterWaking) % 24;
    return `${orbitHour.toString().padStart(2, '0')}:00`;
};

/**
 * Convert hours after waking to local time
 */
const hoursToLocalTime = (hoursAfterWaking: number, wakeUpHour: number): string => {
    const localHour = (wakeUpHour + hoursAfterWaking) % 24;
    const period = localHour >= 12 ? 'PM' : 'AM';
    const hour12 = localHour % 12 || 12;
    return `${hour12}:00 ${period}`;
};

export const EventTimePicker: React.FC<EventTimePickerProps> = ({
    event,
    currentHour,
    onSave,
    onClose,
    timezoneOffset,
    wakeUpHour,
}) => {
    const [selectedHourIndex, setSelectedHourIndex] = useState(Math.floor(currentHour));

    // Generate Orbit time display options (06:00, 07:00, ... 05:00)
    const orbitTimes = Array.from({ length: 24 }, (_, i) => {
        const orbitHour = (6 + i) % 24;
        return `${orbitHour.toString().padStart(2, '0')}:00`;
    });

    // Calculate local time reference for current selection
    const localTimeRef = hoursToLocalTime(selectedHourIndex, wakeUpHour);

    const handleConfirm = () => {
        onSave(selectedHourIndex);
        onClose();
    };

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />

            {/* Sheet */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl"
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-400 transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="px-6 pb-10 pt-4">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="text-2xl mb-2">{event.emoji}</div>
                        <h3 className="text-title text-gray-800">
                            {event.label}
                        </h3>
                    </div>

                    {/* Time Picker */}
                    <div className="flex flex-col items-center mb-6">
                        <WheelColumn
                            items={orbitTimes}
                            selectedIndex={selectedHourIndex}
                            onSelect={setSelectedHourIndex}
                        />

                        {/* Local time reference */}
                        <p className="text-caption text-gray-400 mt-4">
                            本地 {localTimeRef}
                        </p>
                    </div>

                    {/* Confirm Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleConfirm}
                            className="px-10 py-3 rounded-full bg-gray-800 text-white text-button hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                            确认
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
