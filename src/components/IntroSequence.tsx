import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion';
import { unlockAudio } from '../utils/audioUnlock';
import { startGlobalAudio } from '../utils/globalAudio';
import { CORE_SLOGAN } from '../constants/dailyQuotes';

interface IntroSequenceProps {
    onComplete: () => void;
    targetOrbitHour: number;
    /** 是否从返回过渡进入（反向动画） */
    isReturning?: boolean;
}

type IntroPhase = 'HALO' | 'DISSOLVING' | 'COMPLETE';

/**
 * 乔布斯式的缓动曲线 - 呼吸般的节奏
 */
const BREATHING_EASE: [number, number, number, number] = [0.22, 0.68, 0.35, 1.0];

const HOLD_DURATION_MS = 1000;
const PROGRESS_RADIUS = 118;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;
const PROGRESS_STROKE = 3.5;

export const IntroSequence: React.FC<IntroSequenceProps> = ({
    onComplete,
    targetOrbitHour: _targetOrbitHour,
    isReturning = false
}) => {
    const [phase, setPhase] = useState<IntroPhase>('HALO');
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [isRetracting, setIsRetracting] = useState(false);
    const holdRafRef = useRef<number | null>(null);
    const holdStartRef = useRef<number | null>(null);
    const holdGenerationRef = useRef(0);
    const retractTimeoutRef = useRef<number | null>(null);
    const prefersReducedMotion = useReducedMotion();
    // SVG url(#id) breaks on React useId colons in some browsers
    const progressGradientId = `hold-progress-${useId().replace(/:/g, '')}`;

    // 🎵 音效状态 - Intro 页面直接使用全局音效系统
    const hasStartedAudioRef = useRef(false);

    // 用户首次触摸/点击页面时播放环境音（必须由用户手势触发）
    const startAudioOnInteraction = useCallback(() => {
        if (!hasStartedAudioRef.current) {
            hasStartedAudioRef.current = true;
            unlockAudio();
            startGlobalAudio();
        }
    }, []);

    // Apple: critically damped spring for press; no brightness jumps (刺眼源)
    const haloVariants: Variants = prefersReducedMotion
        ? {
            idle: { scale: 1, opacity: 1 },
            holding: { scale: 1, opacity: 1 },
        }
        : {
            idle: {
                scale: [0.97, 1.03, 0.97],
                opacity: 1,
                transition: {
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut" as const
                }
            },
            holding: {
                scale: 1.06,
                opacity: 1,
                transition: {
                    type: "spring",
                    bounce: 0,
                    duration: 0.35,
                }
            }
        };

    const clearHoldLoop = useCallback(() => {
        if (holdRafRef.current != null) {
            cancelAnimationFrame(holdRafRef.current);
            holdRafRef.current = null;
        }
        holdStartRef.current = null;
    }, []);

    const clearRetractTimeout = useCallback(() => {
        if (retractTimeoutRef.current != null) {
            clearTimeout(retractTimeoutRef.current);
            retractTimeoutRef.current = null;
        }
    }, []);

    const startHolding = useCallback(() => {
        if (phase !== 'HALO') return;
        if (holdRafRef.current != null) return;

        startAudioOnInteraction();
        holdGenerationRef.current += 1;
        clearRetractTimeout();
        setIsRetracting(false);

        // Reduced motion: enter immediately instead of a timed hold
        if (prefersReducedMotion) {
            setIsHolding(true);
            setHoldProgress(1);
            setPhase('DISSOLVING');
            return;
        }

        setIsHolding(true);
        holdStartRef.current = performance.now();

        const tick = (now: number) => {
            const start = holdStartRef.current ?? now;
            const percentage = Math.min((now - start) / HOLD_DURATION_MS, 1);
            setHoldProgress(percentage);

            if (percentage >= 1) {
                holdRafRef.current = null;
                holdStartRef.current = null;
                setPhase('DISSOLVING');
                return;
            }

            holdRafRef.current = requestAnimationFrame(tick);
        };

        holdRafRef.current = requestAnimationFrame(tick);
    }, [phase, prefersReducedMotion, startAudioOnInteraction, clearRetractTimeout]);

    const stopHolding = useCallback(() => {
        clearHoldLoop();
        setIsHolding(false);
        if (phase === 'HALO') {
            // Keep ring mounted while dashoffset retracts, then fade out
            const generation = holdGenerationRef.current;
            setIsRetracting(true);
            requestAnimationFrame(() => {
                if (holdGenerationRef.current !== generation) return;
                setHoldProgress(0);
            });
            clearRetractTimeout();
            retractTimeoutRef.current = window.setTimeout(() => {
                if (holdGenerationRef.current !== generation) return;
                setIsRetracting(false);
                retractTimeoutRef.current = null;
            }, 220);
        }
    }, [phase, clearHoldLoop, clearRetractTimeout]);

    useEffect(() => () => {
        clearHoldLoop();
        clearRetractTimeout();
    }, [clearHoldLoop, clearRetractTimeout]);

    useEffect(() => {
        if (phase === 'DISSOLVING') {
            onComplete();

            const timer = setTimeout(() => {
                setPhase('COMPLETE');
            }, prefersReducedMotion ? 0 : 1000);

            return () => clearTimeout(timer);
        }
    }, [phase, onComplete, prefersReducedMotion]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (phase !== 'HALO') return;
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!e.repeat) startHolding();
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            stopHolding();
        }
    };

    const progressPercent = Math.round(holdProgress * 100);
    const holdHint = prefersReducedMotion ? '按 Enter 或空格进入' : '长按进入';
    const showProgressRing = isHolding || holdProgress > 0 || isRetracting;

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none"
            onClick={startAudioOnInteraction}
            initial={{ opacity: isReturning ? 0 : 1 }}
            animate={phase === 'DISSOLVING' || phase === 'COMPLETE' ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: BREATHING_EASE }}
        >
            {/* 背景：晨曦但降一档亮度 — 薄荷绿→暖粉，避免高 key */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 95% 75% at 48% 40%, oklch(0.875 0.028 55) 0%, oklch(0.845 0.040 195) 48%, oklch(0.835 0.042 18) 100%)',
                }}
                aria-hidden="true"
            />
            {/* Soft vignette — rest eyes at edges */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 65% 55% at 50% 42%, transparent 30%, oklch(0.55 0.03 70 / 0.20) 100%)',
                }}
                aria-hidden="true"
            />

            <AnimatePresence>
                {phase !== 'COMPLETE' && (
                    <motion.div
                        className="relative flex flex-col items-center justify-center w-full h-full page-inline pt-safe pb-safe"
                        initial={{ scale: isReturning ? 1.15 : 1 }}
                        animate={phase === 'DISSOLVING' && !prefersReducedMotion ? {
                            scale: 1.15,
                        } : {
                            scale: 1,
                        }}
                        transition={{
                            duration: prefersReducedMotion ? 0 : 1.2,
                            ease: BREATHING_EASE,
                        }}
                    >
                        {/* ========== 氛围光晕：极低存在感 ========== */}
                        {!prefersReducedMotion && (
                            <>
                                <div
                                    className="absolute top-[-18%] left-[-14%] w-[55%] h-[55%] rounded-full bg-soul-gold/[0.05] blur-[140px]"
                                    aria-hidden="true"
                                />
                                <div
                                    className="absolute bottom-[-18%] right-[-14%] w-[55%] h-[55%] rounded-full bg-lavender-soft/10 blur-[140px]"
                                    aria-hidden="true"
                                />
                            </>
                        )}

                        {/* ========== 品牌 + 产品承诺 ========== */}
                        {phase === 'HALO' && (
                            <motion.div
                                className="relative z-10 mb-6 text-center shrink-0"
                                initial={false}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: 'spring',
                                    bounce: 0,
                                    duration: prefersReducedMotion ? 0.01 : 0.5,
                                }}
                            >
                                <h1 className="text-brand text-ink-primary" translate="no">
                                    Orbit
                                </h1>
                                <p className="text-quote text-ink-muted mt-3 max-w-[18em] mx-auto whitespace-pre-line">
                                    {CORE_SLOGAN.text}
                                </p>
                            </motion.div>
                        )}

                        {/* ========== 进入控件（光晕） ========== */}
                        <motion.button
                            type="button"
                            variants={haloVariants}
                            animate={holdProgress > 0 ? "holding" : "idle"}
                            className="relative w-[min(80vw,20rem,42vh)] h-[min(80vw,20rem,42vh)] rounded-full flex items-center justify-center cursor-pointer border-0 bg-transparent p-0 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[oklch(0.968_0.012_55)]"
                            aria-label={holdHint}
                            aria-describedby="intro-hold-hint"
                            aria-keyshortcuts="Enter Space"
                            onMouseDown={startHolding}
                            onMouseUp={stopHolding}
                            onMouseLeave={stopHolding}
                            onTouchStart={(e) => {
                                e.preventDefault();
                                startAudioOnInteraction();
                                startHolding();
                            }}
                            onTouchEnd={stopHolding}
                            onKeyDown={handleKeyDown}
                            onKeyUp={handleKeyUp}
                            disabled={phase !== 'HALO'}
                        >
                            {/* Soft outer veil — low opacity, no bloom glare */}
                            <span
                                className="absolute inset-[-28px] rounded-full blur-[48px] pointer-events-none opacity-70"
                                style={{
                                    background:
                                        'radial-gradient(circle, oklch(0.82 0.04 30 / 0.18) 0%, oklch(0.80 0.035 296 / 0.08) 60%, transparent 78%)',
                                }}
                                aria-hidden="true"
                            />

                            {/* Warm blush-cream disc — material surface */}
                            <motion.span
                                className="absolute inset-[16%] rounded-full pointer-events-none"
                                style={{
                                    background:
                                        'linear-gradient(155deg, oklch(0.88 0.035 40), oklch(0.84 0.055 22), oklch(0.86 0.04 55))',
                                    boxShadow:
                                        'inset 0 1px 0 oklch(1 0 0 / 0.4), inset 0 -3px 8px oklch(0.45 0.05 30 / 0.10), 0 14px 32px oklch(0.35 0.03 40 / 0.14)',
                                }}
                                animate={prefersReducedMotion ? undefined : { opacity: [0.94, 1, 0.94] }}
                                transition={prefersReducedMotion ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                                aria-hidden="true"
                            />

                            {/* Hold progress ring — contextual enter/exit, interruptible release */}
                            <motion.svg
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                viewBox="0 0 320 320"
                                aria-hidden="true"
                                initial={false}
                                animate={{
                                    opacity: showProgressRing ? 1 : 0,
                                    scale: showProgressRing ? 1 : 0.96,
                                    rotate: -90,
                                }}
                                transition={{
                                    opacity: {
                                        duration: isHolding ? 0.12 : 0.15,
                                        ease: 'easeOut',
                                    },
                                    scale: {
                                        type: 'spring',
                                        duration: 0.3,
                                        bounce: 0,
                                    },
                                    rotate: { duration: 0 },
                                }}
                            >
                                <defs>
                                    <filter
                                        id={`${progressGradientId}-glow`}
                                        x="-20%"
                                        y="-20%"
                                        width="140%"
                                        height="140%"
                                    >
                                        <feGaussianBlur stdDeviation="1.6" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                {/* Track — structure only while holding */}
                                <circle
                                    cx="160"
                                    cy="160"
                                    r={PROGRESS_RADIUS}
                                    fill="none"
                                    stroke="oklch(0.38 0.03 70 / 0.18)"
                                    strokeWidth={PROGRESS_STROKE}
                                />
                                {/* Progress fill — follows hold clock; soft retract on release */}
                                <circle
                                    cx="160"
                                    cy="160"
                                    r={PROGRESS_RADIUS}
                                    fill="none"
                                    stroke="oklch(0.62 0.12 72 / 0.88)"
                                    strokeWidth={PROGRESS_STROKE}
                                    strokeLinecap="round"
                                    strokeDasharray={PROGRESS_CIRCUMFERENCE}
                                    strokeDashoffset={PROGRESS_CIRCUMFERENCE * (1 - holdProgress)}
                                    filter={`url(#${progressGradientId}-glow)`}
                                    style={{
                                        transitionProperty: 'stroke-dashoffset',
                                        transitionDuration: isHolding ? '0ms' : '200ms',
                                        transitionTimingFunction: 'ease-out',
                                    }}
                                />
                            </motion.svg>
                        </motion.button>

                        {/* ========== 进入提示 ========== */}
                        {phase === 'HALO' && (
                            <motion.p
                                id="intro-hold-hint"
                                className="relative z-10 mt-8 text-caption-small text-ink-secondary shrink-0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: holdProgress > 0 ? 0.45 : prefersReducedMotion ? 0.85 : [0.55, 0.85, 0.55] }}
                                transition={
                                    holdProgress > 0 || prefersReducedMotion
                                        ? { duration: 0.2 }
                                        : { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }
                                }
                            >
                                {holdHint}
                            </motion.p>
                        )}

                        {/* Live region for hold progress (screen readers) */}
                        <div className="sr-only" role="status" aria-live="polite">
                            {holdProgress > 0 && holdProgress < 1 ? `进入进度 ${progressPercent}%` : ''}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default IntroSequence;
