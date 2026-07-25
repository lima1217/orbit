import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    formatOrbitTime,
    TimezoneInfo
} from '../constants/timezones';
import { ENTRANCE_DELAYS, FADE_IN } from '../constants/animationConfig';
import { SkyBackground } from './SkyBackground';
import { getSyncStatement } from '../constants/cityPoetry';
import { InlineSoundSelector } from './InlineSoundSelector';
import { useAmbientPlayer } from '../hooks/useAmbientPlayer';

interface TimeZoneHomeProps {
    wakeUpTime: Date;
    timezone: TimezoneInfo;
    onChangeTimezone: () => void;
    onReturnToIntro?: () => void;
    isTransitioningFromIntro?: boolean;
}

export const TimeZoneHome: React.FC<TimeZoneHomeProps> = ({
    wakeUpTime: _wakeUpTime,
    timezone,
    onChangeTimezone,
    onReturnToIntro,
    isTransitioningFromIntro = false
}) => {
    // Calculate the real current time in the mapped timezone city
    const [currentTime, setCurrentTime] = useState(() => {
        const now = new Date();
        const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
        let localHour = utcHours + timezone.offset;
        if (localHour < 0) localHour += 24;
        if (localHour >= 24) localHour -= 24;
        return localHour;
    });

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
            let localHour = utcHours + timezone.offset;
            if (localHour < 0) localHour += 24;
            if (localHour >= 24) localHour -= 24;
            setCurrentTime(localHour);
        }, 1000);
        return () => clearInterval(interval);
    }, [timezone.offset]);

    // 🎵 环境音效 - 自动播放
    const { selectedIds, toggleSound } = useAmbientPlayer();
    const [soundPickerOpen, setSoundPickerOpen] = useState(false);

    const syncStatement = getSyncStatement(timezone.cityCN);
    const formattedTime = formatOrbitTime(currentTime);

    return (
        <motion.div
            initial={{ opacity: isTransitioningFromIntro ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: isTransitioningFromIntro ? 0 : 0.5 }}
            className="fixed inset-0 flex flex-col"
        >
            {/* Sky with gradient, celestial body - click to return to intro */}
            <SkyBackground
                orbitHour={currentTime}
                hideCelestial={isTransitioningFromIntro}
                onCelestialClick={onReturnToIntro}
            />

            {/* Content - 过渡期间隐藏，避免与 IntroSequence 冲突 */}
            <AnimatePresence>
                {!isTransitioningFromIntro && (
                    <motion.main
                        id="main"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="relative z-10 flex-1 flex flex-col items-center justify-center page-inline pt-safe pb-safe-lg"
                    >
                        {/* City & Two-line Poetic Description */}
                        <motion.div
                            {...FADE_IN}
                            animate={{ opacity: soundPickerOpen ? 0.35 : 1 }}
                            transition={{
                                delay: soundPickerOpen ? 0 : ENTRANCE_DELAYS.header,
                                duration: 0.3,
                                ease: 'easeOut',
                            }}
                            className="text-center mb-8 max-w-sm mx-auto"
                        >
                            <h1 className="text-headline text-ink-primary mb-4 text-balance">
                                <span aria-hidden="true">{timezone.emoji}</span>{' '}
                                <span translate="no">{timezone.city}</span>
                            </h1>
                            <p className="text-quote text-ink-muted">
                                {syncStatement}
                            </p>
                        </motion.div>

                        {/* Main Time Display — timer role, not live (avoids second-by-second chatter) */}
                        <motion.div
                            {...FADE_IN}
                            animate={{ opacity: soundPickerOpen ? 0.18 : 1 }}
                            transition={{
                                delay: soundPickerOpen ? 0 : ENTRANCE_DELAYS.primary,
                                duration: 0.3,
                                ease: 'easeOut',
                            }}
                            className="text-center mb-8"
                        >
                            <p
                                role="timer"
                                aria-live="off"
                                aria-atomic="true"
                                aria-label={`身体时间 ${formattedTime}`}
                                className="text-display text-ink-primary tabular-nums"
                            >
                                {formattedTime}
                            </p>
                        </motion.div>

                        {/* 🎵 内嵌式音效选择器 */}
                        <motion.div
                            {...FADE_IN}
                            transition={{ delay: ENTRANCE_DELAYS.primary + 0.2, duration: 0.5 }}
                            className="relative w-full max-w-xs min-h-11"
                        >
                            <InlineSoundSelector
                                selectedIds={selectedIds}
                                onToggleSound={toggleSound}
                                onExpandChange={setSoundPickerOpen}
                            />
                        </motion.div>
                    </motion.main>
                )}
            </AnimatePresence>

            {/* Footer - Change Button (过渡期间隐藏) */}
            {!isTransitioningFromIntro && (
                <motion.div
                    {...FADE_IN}
                    transition={{ delay: ENTRANCE_DELAYS.footer, duration: 0.6 }}
                    className="absolute inset-x-0 bottom-0 z-50 flex justify-center page-inline pb-safe-lg"
                >
                    <button
                        type="button"
                        onClick={onChangeTimezone}
                        className="text-button text-ink-muted hover:text-ink-primary glass-button rounded-full min-h-11 px-5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2"
                    >
                        更改起床时间
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};
