import React from 'react';
import { motion } from 'framer-motion';
import { TimezoneInfo } from '../constants/timezones';

interface FixedTimezoneModalProps {
    timezone: TimezoneInfo;
    onFix: () => void;
    onAskEveryTime: () => void;
}

/**
 * Modal asking user if they want to fix their timezone or be asked every time
 */
export const FixedTimezoneModal: React.FC<FixedTimezoneModalProps> = ({
    timezone,
    onFix,
    onAskEveryTime
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/60"
            >
                {/* Emoji */}
                <div className="text-center mb-4">
                    <span className="text-5xl">{timezone.emoji}</span>
                </div>

                {/* Title */}
                <h2 className="text-headline text-gray-700 text-center mb-2">
                    Welcome to {timezone.city}
                </h2>

                {/* Description */}
                <p className="text-caption text-gray-500 text-center mb-8 leading-relaxed">
                    This is your new living timezone.
                    Would you like to stay here, or explore different timezones each day?
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onFix}
                        className="w-full py-4 bg-gradient-to-r from-sky-blue to-lavender-soft text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                        🏠 Make this my home
                    </button>
                    <button
                        onClick={onAskEveryTime}
                        className="w-full py-4 bg-white/80 text-gray-600 font-medium rounded-2xl border border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-300"
                    >
                        🌍 Ask me every time
                    </button>
                </div>

                {/* Hint */}
                <p className="text-caption-small text-gray-400 text-center mt-6">
                    You can always change this later
                </p>
            </motion.div>
        </motion.div>
    );
};
