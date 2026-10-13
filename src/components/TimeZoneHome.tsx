import React from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { formatOrbitTime, TimezoneInfo } from '../constants/timezones';
import { getDayPhase } from '../constants/cityPoetry';
import { OrbitDial } from './OrbitDial';
import { InlineSoundSelector } from './InlineSoundSelector';
import { formatUtc } from './WakeUpPicker';
import { useAmbientPlayer } from '../hooks/useAmbientPlayer';
import { SunriseIcon, ShareIcon, RouteIcon } from './icons/LineIcon';

interface TimeZoneHomeProps {
    timezone: TimezoneInfo;
    /** 映射城市当地小时（0–24） */
    orbitHour: number;
    now: Date;
    wakeUpHour: number;
    wakeUpMinute: number;
    onChangeWakeUp: () => void;
    onReturnToIntro: () => void;
    onOpenJourney: () => void;
    onOpenShare: () => void;
    /** 首次揭晓：逐层浮现 + 轨道描绘 */
    reveal?: boolean;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const pad = (n: number) => n.toString().padStart(2, '0');

function describeDrift(livingOffset: number): string {
    const local = -new Date().getTimezoneOffset() / 60;
    // 归一到 (-12, 12]：住在 UTC−8 的北京人，是身体早了 8 小时，而不是晚了 16 小时
    let diff = livingOffset - local;
    if (diff > 12) diff -= 24;
    if (diff <= -12) diff += 24;
    if (diff === 0) return '与手表同步';
    const n = Math.abs(diff);
    return `${diff < 0 ? '晚' : '早'} ${Number.isInteger(n) ? n : n.toFixed(1)} 小时`;
}

export const TimeZoneHome: React.FC<TimeZoneHomeProps> = ({
    timezone,
    orbitHour,
    now,
    wakeUpHour,
    wakeUpMinute,
    onChangeWakeUp,
    onReturnToIntro,
    onOpenJourney,
    onOpenShare,
    reveal = false,
}) => {
    const reduce = useReducedMotion();
    const { selectedIds, toggleSound, isPlaying, resume, sleepAt, setSleepTimer } = useAmbientPlayer();
    // 回访用户没有经过 Intro 的手势：首次轻触主页任意处时开始播放
    const isPaused = selectedIds.length > 0 && !isPlaying;
    const phase = getDayPhase(orbitHour, timezone.cityCN);
    const time = formatOrbitTime(orbitHour);
    const watch = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const stagger = !reduce;
    const container: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: stagger ? (reveal ? 0.14 : 0.06) : 0, delayChildren: reveal ? 0.2 : 0 } },
    };
    const item: Variants = {
        hidden: stagger ? { opacity: 0, y: 12 } : { opacity: 0 },
        show: { opacity: 1, y: 0, transition: { duration: reveal ? 0.9 : 0.6, ease: EASE_OUT } },
    };

    return (
        <motion.div
            className="absolute inset-0 z-10 flex flex-col"
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.6, ease: EASE_OUT } }}
            variants={container}
            onPointerDown={isPaused ? resume : undefined}
        >
            {/* Header — 词标即返回 */}
            <motion.header variants={item} className="pt-safe page-inline flex items-center justify-between max-w-md w-full mx-auto">
                <button
                    type="button"
                    onClick={onOpenShare}
                    className="mt-3 min-w-11 min-h-11 grid place-items-center rounded-full text-ink-muted hover:text-ink-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary/40"
                    aria-label="分享此刻"
                >
                    <ShareIcon size={20} />
                </button>
                <button
                    type="button"
                    onClick={onReturnToIntro}
                    className="mt-3 min-h-11 px-4 text-wordmark text-ink-primary/70 hover:text-ink-primary transition-colors cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary/40"
                    aria-label="回到开场"
                >
                    逆旅
                </button>
                <button
                    type="button"
                    onClick={onOpenJourney}
                    className="mt-3 min-w-11 min-h-11 grid place-items-center rounded-full text-ink-muted hover:text-ink-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary/40"
                    aria-label="逆旅行程"
                >
                    <RouteIcon size={20} />
                </button>
            </motion.header>

            <main id="main" className="flex-1 flex flex-col items-center justify-center page-inline -mt-4">
                {/* Identity */}
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={timezone.city}
                        className="flex flex-col items-center text-center"
                        variants={container}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
                    >
                        <motion.p variants={item} className="text-overline text-ink-muted">
                            此刻你住在
                        </motion.p>
                        <motion.h1
                            variants={item}
                            className="text-headline text-ink-primary mt-2.5 whitespace-nowrap"
                            // 长译名（如「费尔南多·迪诺罗尼亚」）降一档，保持单行
                            style={timezone.cityCN.length > 6 ? { fontSize: 'clamp(1.625rem, 7.5vw, 2.125rem)' } : undefined}
                        >
                            {timezone.cityCN}
                        </motion.h1>
                        <motion.p variants={item} className="mt-2 flex items-baseline gap-2 text-ink-muted">
                            <span className="font-serif italic text-[1.0625rem] leading-none" translate="no">
                                {timezone.city}
                            </span>
                            <span className="text-caption-small tabular-nums">{formatUtc(timezone.offset)}</span>
                        </motion.p>
                    </motion.div>
                </AnimatePresence>

                {/* Dial */}
                <motion.div variants={item} className="mt-6">
                    <OrbitDial orbitHour={orbitHour} animateIn={reveal}>
                        <p className="text-overline text-ink-muted">{phase.label}</p>
                        <p
                            role="timer"
                            aria-live="off"
                            aria-label={`身体时间 ${time}`}
                            className="text-display text-ink-primary mt-2"
                        >
                            {time}
                        </p>
                        <p className="text-caption-small text-ink-muted mt-2.5 tabular-nums">
                            手表 {watch} · {describeDrift(timezone.offset)}
                        </p>
                    </OrbitDial>
                </motion.div>

                {/* Poetry */}
                <motion.p variants={item} className="text-quote text-ink-secondary mt-7 text-center text-balance">
                    {phase.line}
                </motion.p>
            </main>

            {/* Bottom bar */}
            <motion.div
                variants={item}
                className="relative z-20 flex items-end justify-between gap-3 page-inline pb-safe-lg max-w-md w-full mx-auto"
            >
                <button
                    type="button"
                    onClick={onChangeWakeUp}
                    className="glass-button min-h-11 pl-3.5 pr-4 rounded-full inline-flex items-center gap-2 text-button text-ink-secondary hover:text-ink-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary/40"
                    aria-label={`起床时间 ${pad(wakeUpHour)}:${pad(wakeUpMinute)}，点击修改`}
                >
                    <SunriseIcon size={16} />
                    <span>
                        醒于 <span className="tabular-nums">{pad(wakeUpHour)}:{pad(wakeUpMinute)}</span>
                    </span>
                </button>

                <InlineSoundSelector
                    selectedIds={selectedIds}
                    onToggleSound={toggleSound}
                    isPaused={isPaused}
                    sleepAt={sleepAt}
                    onSetSleepTimer={setSleepTimer}
                />
            </motion.div>
        </motion.div>
    );
};
