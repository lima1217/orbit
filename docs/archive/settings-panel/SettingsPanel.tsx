import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { TimezoneInfo } from '../constants/timezones';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    timezone: TimezoneInfo;
    wakeUpHour: number;
    wakeUpMinute: number;
    onChangeWakeUpTime: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onClose,
    timezone,
    wakeUpHour,
    wakeUpMinute,
    onChangeWakeUpTime
}) => {
    const formatTime = (hour: number, minute: number = 0) => {
        const h = hour % 12 || 12;
        const period = hour >= 12 ? 'PM' : 'AM';
        return `${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Panel - slides in from left */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                            <h2 className="text-title text-gray-800">设置</h2>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-6">
                            {/* Personal Info Section */}
                            <section>
                                <h3 className="text-overline text-gray-400 mb-3">
                                    个人信息
                                </h3>
                                <div className="space-y-3">
                                    {/* Wake Up Time */}
                                    <button
                                        onClick={onChangeWakeUpTime}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="text-caption text-gray-500">起床时间</span>
                                            <span className="text-body font-medium text-gray-800">
                                                {formatTime(wakeUpHour, wakeUpMinute)}
                                            </span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                                    </button>

                                    {/* Living Timezone */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex flex-col items-start">
                                            <span className="text-caption text-gray-500">身体时区</span>
                                            <span className="text-body font-medium text-gray-800">
                                                {timezone.emoji} {timezone.cityCN}
                                            </span>
                                        </div>
                                        <span className="text-caption text-gray-400">
                                            UTC{timezone.offset >= 0 ? '+' : ''}{timezone.offset}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Footer hint */}
                            <p className="text-caption-small text-gray-400 text-center pt-4">
                                你的时间，你来落款
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
