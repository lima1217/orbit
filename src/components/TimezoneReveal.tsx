import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimezoneInfo } from '../constants/timezones';

interface TimezoneRevealProps {
    timezone: TimezoneInfo;
    onComplete: () => void;
}

/**
 * A ceremonial reveal animation when user first discovers their body timezone.
 * Creates a moment of anticipation before showing the result.
 */
export const TimezoneReveal: React.FC<TimezoneRevealProps> = ({
    timezone,
    onComplete
}) => {
    const [phase, setPhase] = useState<'searching' | 'found' | 'reveal'>('searching');

    useEffect(() => {
        // Phase 1: Searching (1.5s)
        const timer1 = setTimeout(() => {
            setPhase('found');
        }, 1500);

        // Phase 2: Found (1s pause before reveal)
        const timer2 = setTimeout(() => {
            setPhase('reveal');
        }, 2500);

        // Phase 3: Complete, transition to home
        const timer3 = setTimeout(() => {
            onComplete();
        }, 4500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center p-8"
        >
            {/* Background - soft gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-100/80 via-white to-lavender-soft/30" />

            {/* Ambient glow */}
            <motion.div
                className="absolute w-80 h-80 rounded-full bg-sky-blue/20 blur-[100px]"
                animate={{
                    scale: phase === 'reveal' ? 1.5 : 1,
                    opacity: phase === 'reveal' ? 0.4 : 0.2,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Content */}
            <div className="relative z-10 text-center">
                <AnimatePresence mode="wait">
                    {phase === 'searching' && (
                        <motion.div
                            key="searching"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <p className="text-body text-gray-500 tracking-wide">
                                正在寻找你的节奏...
                            </p>
                        </motion.div>
                    )}

                    {phase === 'found' && (
                        <motion.div
                            key="found"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <p className="text-body text-gray-600 tracking-wide">
                                找到了
                            </p>
                        </motion.div>
                    )}

                    {phase === 'reveal' && (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                            className="text-center"
                        >
                            {/* Emoji with glow */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
                                className="text-6xl mb-6"
                            >
                                {timezone.emoji}
                            </motion.div>

                            {/* City name */}
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="text-headline text-gray-800 mb-3"
                            >
                                {timezone.cityCN}
                            </motion.h1>

                            {/* Poetic subtitle */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="text-body text-gray-500"
                            >
                                你的身体，此刻与这座城市同频
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
