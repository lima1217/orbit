import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    formatOrbitTime,
    TimezoneInfo
} from '../constants/timezones';
import { DURATION, EASING, ENTRANCE_DELAYS, FADE_IN } from '../constants/animationConfig';
import { SkyBackground } from './SkyBackground';
import { getSyncStatement } from '../constants/cityPoetry';
import { InlineSoundSelector } from './InlineSoundSelector';
import { useAmbientPlayer } from '../hooks/useAmbientPlayer';

interface TimeZoneHomeProps {
    wakeUpTime: Date;
    timezone: TimezoneInfo;
    onChangeTimezone: () => void;
    onReturnToIntro?: () => void;
    /**
     * Intro → 主页交叉淡出中。
     * 内容保持完整可见，由 App 层 wrapper 做与回退对称的整页透明度过渡。
     */
    isTransitioningFromIntro?: boolean;
}

export const TimeZoneHome: React.FC<TimeZoneHomeProps> = ({
    wakeUpTime: _wakeUpTime,
    timezone,
    onChangeTimezone,
    onReturnToIntro,
    isTransitioningFromIntro = false
}) => {
    // 进场节奏在挂载时锁定，避免 reveal→timezone 时 transition 翻转告重播
    const [enterFromIntro] = useState(isTransitioningFromIntro);

    const [currentTime, setCurrentTime] = useState(() => {
        const now = new Date();
        const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
        let localHour = utcHours + timezone.offset;
        if (localHour < 0) localHour += 24;
        if (localHour >= 24) localHour -= 24;
        return localHour;
    });

    useEffect(() => {
        const readHour = () => {
            const now = new Date();
            const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
            let localHour = utcHours + timezone.offset;
            if (localHour < 0) localHour += 24;
            if (localHour >= 24) localHour -= 24;
            return localHour;
        };

        setCurrentTime(readHour());
        const interval = setInterval(() => setCurrentTime(readHour()), 1000);
        return () => clearInterval(interval);
    }, [timezone.offset]);

    const { selectedIds, toggleSound } = useAmbientPlayer();
    const [soundPickerOpen, setSoundPickerOpen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const syncStatement = getSyncStatement(timezone.cityCN);
    const formattedTime = formatOrbitTime(currentTime);

    const identityTransition = prefersReducedMotion
        ? { duration: DURATION.fast }
        : { duration: DURATION.normal, ease: EASING.enter };

    const identityExit = prefersReducedMotion
        ? { opacity: 0, transition: { duration: DURATION.fast } }
        : {
            opacity: 0,
            y: 8,
            transition: { duration: DURATION.fast, ease: EASING.exit },
        };

    return (
        <motion.div
            // 从 Intro 进入时内容已完整，透明度交给 App wrapper（与回退对称）
            initial={{ opacity: enterFromIntro ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: enterFromIntro ? 0 : 0.5 }}
            className="fixed inset-0 flex flex-col"
        >
            <SkyBackground
                orbitHour={currentTime}
                hideCelestial={false}
                onCelestialClick={isTransitioningFromIntro ? undefined : onReturnToIntro}
            />

            <motion.main
                id="main"
                initial={enterFromIntro ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                    enterFromIntro
                        ? { duration: 0 }
                        : {
                            delay: prefersReducedMotion ? 0 : 0.08,
                            duration: prefersReducedMotion ? DURATION.fast : 0.45,
                            ease: EASING.enter,
                        }
                }
                className="relative z-10 flex-1 flex flex-col items-center justify-center page-inline pt-safe pb-safe-lg"
                style={{
                    pointerEvents: isTransitioningFromIntro ? 'none' : undefined,
                }}
            >
                <motion.div
                    {...(enterFromIntro ? {} : FADE_IN)}
                    transition={
                        enterFromIntro
                            ? { duration: 0 }
                            : {
                                delay: prefersReducedMotion ? 0 : ENTRANCE_DELAYS.header * 0.5,
                                duration: DURATION.normal,
                            }
                    }
                    className="grid w-full justify-items-center"
                >
                    <AnimatePresence initial={false}>
                        <motion.div
                            key={timezone.offset}
                            initial={
                                enterFromIntro
                                    ? false
                                    : prefersReducedMotion
                                      ? { opacity: 0 }
                                      : { opacity: 0, y: 8 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={identityExit}
                            transition={
                                enterFromIntro ? { duration: 0 } : identityTransition
                            }
                            className="col-start-1 row-start-1 flex flex-col items-center w-full"
                        >
                            <motion.div
                                animate={{ opacity: soundPickerOpen ? 0.35 : 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="text-center mb-8 max-w-sm mx-auto"
                            >
                                <h1 className="text-headline text-ink-primary mb-4 text-balance">
                                    <span aria-hidden="true">{timezone.emoji}</span>{' '}
                                    <span translate="no">{timezone.city}</span>
                                </h1>
                                <p className="text-quote text-ink-secondary text-pretty">
                                    {syncStatement}
                                </p>
                            </motion.div>

                            <motion.div
                                animate={{ opacity: soundPickerOpen ? 0.18 : 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
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
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <motion.div
                    {...(enterFromIntro ? {} : FADE_IN)}
                    transition={
                        enterFromIntro
                            ? { duration: 0 }
                            : {
                                delay: prefersReducedMotion ? 0 : ENTRANCE_DELAYS.secondary * 0.55,
                                duration: DURATION.slow,
                            }
                    }
                    className="relative w-full max-w-xs min-h-11"
                >
                    <InlineSoundSelector
                        selectedIds={selectedIds}
                        onToggleSound={toggleSound}
                        onExpandChange={setSoundPickerOpen}
                    />
                </motion.div>
            </motion.main>

            <motion.div
                initial={enterFromIntro ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                    enterFromIntro
                        ? { duration: 0 }
                        : {
                            delay: prefersReducedMotion ? 0 : ENTRANCE_DELAYS.footer * 0.55,
                            duration: DURATION.slow,
                        }
                }
                className="absolute inset-x-0 bottom-0 z-50 flex justify-center page-inline pb-safe-lg"
                style={{
                    pointerEvents: isTransitioningFromIntro ? 'none' : undefined,
                }}
            >
                <button
                    type="button"
                    onClick={onChangeTimezone}
                    className="text-button text-ink-secondary hover:text-ink-primary glass-button rounded-full min-h-11 px-5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2"
                >
                    更改起床时间
                </button>
            </motion.div>
        </motion.div>
    );
};
