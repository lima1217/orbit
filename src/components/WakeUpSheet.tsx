import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface WakeUpSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (hour: number, minute: number) => void;
    initialHour?: number;
    initialMinute?: number;
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
                            key={item}
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

// Smart inference: determine if selected time is today or yesterday
const getInferredDateIndex = (hour: number, minute: number): number => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const selectedMinutes = hour * 60 + minute;
    // If selected time is <= current time, it's today (0); otherwise it's yesterday (1)
    return selectedMinutes <= nowMinutes ? 0 : 1;
};

export const WakeUpSheet: React.FC<WakeUpSheetProps> = ({
    isOpen,
    onClose,
    onSelect,
    initialHour = 7,
    initialMinute = 0
}) => {
    // Date options: 今天 (0) / 昨天 (1)
    const dateOptions = ['今天', '昨天'];

    // Infer initial date based on initial time
    const initialDateIndex = useMemo(
        () => getInferredDateIndex(initialHour, initialMinute),
        [initialHour, initialMinute]
    );

    const [selectedDateIndex, setSelectedDateIndex] = useState(initialDateIndex);
    const [selectedHourIndex, setSelectedHourIndex] = useState(initialHour);
    const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(
        Math.floor(initialMinute / 5)
    );

    // Reset when initialHour/initialMinute changes
    useEffect(() => {
        setSelectedDateIndex(getInferredDateIndex(initialHour, initialMinute));
        setSelectedHourIndex(initialHour);
        setSelectedMinuteIndex(Math.floor(initialMinute / 5));
    }, [initialHour, initialMinute]);

    // Auto-update date when time changes (smart inference)
    useEffect(() => {
        const newDateIndex = getInferredDateIndex(selectedHourIndex, parseInt(minutes[selectedMinuteIndex]));
        setSelectedDateIndex(newDateIndex);
    }, [selectedHourIndex, selectedMinuteIndex]);

    // 24-hour format: 00-23
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    // Current selected time
    const selectedHour = parseInt(hours[selectedHourIndex]);
    const selectedMinute = parseInt(minutes[selectedMinuteIndex]);

    const handleConfirm = () => {
        onSelect(selectedHour, selectedMinute);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - subtle blur to let sky peek through */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50"
            />

            {/* Sheet - Gradient that reveals the sky */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 350 }}
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
                style={{
                    background: 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 40%, rgba(255,255,255,0.75) 70%, rgba(255,255,255,0.4) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                }}
            >
                {/* Subtle top edge glow */}
                <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                        background: 'linear-gradient(to right, transparent, rgba(252,211,77,0.3), rgba(255,182,193,0.3), transparent)'
                    }}
                />

                {/* Handle bar - visible yet elegant */}
                <div className="flex justify-center pt-4 pb-3">
                    <motion.div
                        className="w-10 h-1 rounded-full bg-gray-300/70"
                        whileHover={{ scale: 1.1 }}
                    />
                </div>

                {/* Close button - more subtle */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-300/60 hover:text-gray-400 transition-all duration-300 hover:scale-110"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="px-6 pb-12 pt-2">
                    {/* Header - Poetic attitude statement */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <p className="text-caption text-gray-500/80 tracking-widest font-light">
                            世界有它的时钟，我按我的身体醒来
                        </p>
                    </motion.div>

                    {/* Time Picker Container with soft glow focus area */}
                    <motion.div
                        className="relative mb-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                    >
                        {/* No decoration needed - typography alone indicates selection */}

                        {/* Time Picker - 2 columns: Hour : Minute */}
                        <div className="flex items-center justify-center relative z-10">
                            <WheelColumn
                                items={hours}
                                selectedIndex={selectedHourIndex}
                                onSelect={setSelectedHourIndex}
                            />
                            <span className="text-2xl text-gray-500/70 font-light mx-3">:</span>
                            <WheelColumn
                                items={minutes}
                                selectedIndex={selectedMinuteIndex}
                                onSelect={setSelectedMinuteIndex}
                            />
                        </div>
                    </motion.div>

                    {/* Date indicator - minimal elegance */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <span className="text-xs text-gray-400/80 tracking-[0.25em] font-light">
                            ·  {dateOptions[selectedDateIndex]}  ·
                        </span>
                    </motion.div>

                    {/* Confirm Button - Pure, clean, high contrast */}
                    <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                    >
                        <motion.button
                            onClick={handleConfirm}
                            className="px-14 py-3.5 rounded-full text-sm font-medium tracking-widest cursor-pointer bg-gray-900 text-white"
                            style={{
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                            }}
                            whileHover={{
                                scale: 1.02,
                                boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                            }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            确 认
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};
