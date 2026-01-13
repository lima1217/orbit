import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    formatOrbitTime,
    TimezoneInfo
} from '../constants/timezones';
import { ENTRANCE_DELAYS, FADE_IN } from '../constants/animationConfig';
import { SkyBackground } from './SkyBackground';
import { getSyncStatement, getSceneDescription } from '../constants/cityPoetry';
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
    wakeUpTime,
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

    // 获取两行诗意描述
    const syncStatement = getSyncStatement(timezone.cityCN);
    const sceneDescription = getSceneDescription(Math.floor(currentTime));

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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6"
                    >
                        {/* City & Two-line Poetic Description */}
                        <motion.div
                            {...FADE_IN}
                            transition={{ delay: ENTRANCE_DELAYS.header, duration: 0.6 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-headline text-gray-700 mb-4">
                                {timezone.emoji} {timezone.city}
                            </h2>
                            <div className="space-y-1">
                                <p className="text-caption text-gray-600/90">
                                    {syncStatement}
                                </p>
                                <p className="text-caption text-gray-500/70">
                                    {sceneDescription}
                                </p>
                            </div>
                        </motion.div>

                        {/* Main Time Display */}
                        <motion.div
                            {...FADE_IN}
                            transition={{ delay: ENTRANCE_DELAYS.primary, duration: 0.6 }}
                            className="text-center mb-8"
                        >
                            <div className="text-display text-gray-800">
                                {formatOrbitTime(currentTime)}
                            </div>
                        </motion.div>

                        {/* 🎵 内嵌式音效选择器 - 时间下方 */}
                        <motion.div
                            {...FADE_IN}
                            transition={{ delay: ENTRANCE_DELAYS.primary + 0.2, duration: 0.5 }}
                        >
                            <InlineSoundSelector
                                selectedIds={selectedIds}
                                onToggleSound={toggleSound}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer - Change Button (过渡期间隐藏) */}
            {!isTransitioningFromIntro && (
                <motion.div
                    {...FADE_IN}
                    transition={{ delay: ENTRANCE_DELAYS.footer, duration: 0.6 }}
                    className="absolute bottom-10 left-0 right-0 text-center z-50"
                >
                    <button
                        onClick={onChangeTimezone}
                        className="text-button text-gray-500/60 hover:text-gray-700 hover:opacity-100 transition-all cursor-pointer"
                    >
                        选择起床时间
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};
