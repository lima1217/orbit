import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WakeUpPickerOptimized } from './WakeUpPickerOptimized';
import { AnalogClockPicker } from './AnalogClockPicker';

type PickerType = 'digital' | 'analog';

/**
 * Demo component to compare digital scroll wheel vs analog clock picker
 */
export const PickerComparisonDemo: React.FC = () => {
    const [activeType, setActiveType] = useState<PickerType>('digital');

    const handleSelect = (hour: number, minute: number) => {
        console.log(`Selected time: ${hour}:${minute.toString().padStart(2, '0')}`);
    };

    return (
        <div className="relative w-full h-screen">
            {/* Type Switcher - Fixed at top */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg">
                <button
                    onClick={() => setActiveType('digital')}
                    className={`px-5 py-2 text-sm font-light tracking-wide rounded-full transition-all duration-300 ${activeType === 'digital'
                            ? 'bg-white text-gray-700 shadow-md'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    数字滚轮 (优化版)
                </button>
                <button
                    onClick={() => setActiveType('analog')}
                    className={`px-5 py-2 text-sm font-light tracking-wide rounded-full transition-all duration-300 ${activeType === 'analog'
                            ? 'bg-white text-gray-700 shadow-md'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    圆形时钟
                </button>
            </div>

            {/* Info badge */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/5 backdrop-blur-sm text-xs text-gray-500 font-light">
                {activeType === 'digital' ? '滑动数字选择时间' : '拖动指针选择时间'}
            </div>

            {/* Picker Display */}
            <AnimatePresence mode="wait">
                {activeType === 'digital' ? (
                    <motion.div
                        key="digital"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <WakeUpPickerOptimized onSelect={handleSelect} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="analog"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AnalogClockPicker onSelect={handleSelect} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
