import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { unlockAudio } from '../utils/audioUnlock';
import { startGlobalAudio } from '../utils/globalAudio';
import { CORE_SLOGAN } from '../constants/dailyQuotes';
import { EASING } from '../constants/animationConfig';

interface IntroSequenceProps {
    onComplete: () => void;
    targetOrbitHour: number;
    /** 是否从返回过渡进入（反向动画） */
    isReturning?: boolean;
    /** 仅在 Intro 独占屏幕时声明 main，避免与 TimeZoneHome 双地标 */
    isPrimary?: boolean;
}

type IntroPhase = 'HALO' | 'DISSOLVING' | 'COMPLETE';

/** Intro ↔ 主页交叉淡出时长（秒）；需与 App reveal / returning 定时对齐 */
export const INTRO_DISSOLVE_DURATION_S = 0.9;
const INTRO_DISSOLVE_MS = INTRO_DISSOLVE_DURATION_S * 1000;

/** 按下停顿，让挤压可感知；再弹起后才 dissolve，形成完整点击行程 */
const PRESS_DOWN_MS = 240;
const PRESS_UP_MS = 140;

const SPRING_PRESS = { type: 'spring' as const, duration: 0.18, bounce: 0.18 };

export const IntroSequence: React.FC<IntroSequenceProps> = ({
    onComplete,
    targetOrbitHour: _targetOrbitHour,
    isReturning = false,
    isPrimary = false,
}) => {
    const [phase, setPhase] = useState<IntroPhase>('HALO');
    const [isPressed, setIsPressed] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const hasStartedAudioRef = useRef(false);
    const hasEnteredRef = useRef(false);
    const pressTimerRef = useRef<number | null>(null);
    const dissolveTimerRef = useRef<number | null>(null);

    // 用户首次触摸/点击页面时播放环境音（必须由用户手势触发）
    const startAudioOnInteraction = useCallback(() => {
        if (!hasStartedAudioRef.current) {
            hasStartedAudioRef.current = true;
            unlockAudio();
            startGlobalAudio();
        }
    }, []);

    const beginDissolve = useCallback(() => {
        setPhase('DISSOLVING');
        // 在事件路径通知父级，避免 useEffect 同步 prop callback
        onComplete();
        if (dissolveTimerRef.current != null) {
            clearTimeout(dissolveTimerRef.current);
        }
        dissolveTimerRef.current = window.setTimeout(() => {
            dissolveTimerRef.current = null;
            setPhase('COMPLETE');
        }, prefersReducedMotion ? 0 : INTRO_DISSOLVE_MS);
    }, [onComplete, prefersReducedMotion]);

    const enter = useCallback(() => {
        if (phase !== 'HALO' || hasEnteredRef.current) return;
        hasEnteredRef.current = true;
        startAudioOnInteraction();
        setIsPressed(true);

        if (prefersReducedMotion) {
            setIsPressed(false);
            beginDissolve();
            return;
        }

        // 按下 → 停顿 → 弹起 → 再进入，避免「一按就走」
        pressTimerRef.current = window.setTimeout(() => {
            setIsPressed(false);
            pressTimerRef.current = window.setTimeout(() => {
                pressTimerRef.current = null;
                beginDissolve();
            }, PRESS_UP_MS);
        }, PRESS_DOWN_MS);
    }, [phase, startAudioOnInteraction, prefersReducedMotion, beginDissolve]);

    useEffect(() => () => {
        if (pressTimerRef.current != null) {
            clearTimeout(pressTimerRef.current);
        }
        if (dissolveTimerRef.current != null) {
            clearTimeout(dissolveTimerRef.current);
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (phase !== 'HALO') return;
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!e.repeat) enter();
        }
    };

    const enterHint = prefersReducedMotion ? '按 Enter 或空格进入' : '点击进入';
    const dissolveDuration = prefersReducedMotion ? 0 : INTRO_DISSOLVE_DURATION_S;
    const isDissolving = phase === 'DISSOLVING' || phase === 'COMPLETE';

    // 不用动画 filter:blur —— 整页模糊会拖垮移动端主线程（子树已有静态大半径 blur）
    const contentMotion = prefersReducedMotion
        ? { scale: 1 }
        : isDissolving
          ? { scale: 0.97 }
          : { scale: 1 };

    return (
        <motion.div
            className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden select-none"
            onPointerDown={startAudioOnInteraction}
            initial={{ opacity: isReturning ? 0 : 1 }}
            animate={isDissolving ? { opacity: 0 } : { opacity: 1 }}
            transition={{
                duration: dissolveDuration,
                ease: EASING.out,
            }}
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
                        role={isPrimary ? 'main' : undefined}
                        initial={
                            prefersReducedMotion
                                ? { scale: 1 }
                                : isReturning
                                  ? { scale: 0.97 }
                                  : { scale: 1 }
                        }
                        animate={contentMotion}
                        transition={{
                            duration: dissolveDuration,
                            ease: EASING.out,
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

                        {/* ========== 品牌 + 产品承诺（随整页淡出，不抢先消失） ========== */}
                        <div className="relative z-10 mb-6 text-center shrink-0">
                            <h1 className="text-brand text-ink-primary" translate="no">
                                Orbit
                            </h1>
                            <p className="text-quote text-ink-muted mt-3 mx-auto w-max max-w-full leading-snug text-center">
                                {CORE_SLOGAN.text.split('\n').map((line) => (
                                    <span key={line} className="block whitespace-nowrap">
                                        {line}
                                    </span>
                                ))}
                            </p>
                        </div>

                        {/* ========== 进入控件（光晕） ========== */}
                        {/*
                          按压缩放在按钮上；呼吸只做内层 opacity，避免与 whileTap/press scale 抢同一属性。
                        */}
                        <motion.button
                            type="button"
                            className="relative w-[min(80vw,20rem,42vh)] h-[min(80vw,20rem,42vh)] rounded-full flex items-center justify-center cursor-pointer border-0 bg-transparent p-0 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[oklch(0.968_0.012_55)]"
                            aria-label={enterHint}
                            aria-describedby="intro-enter-hint"
                            aria-keyshortcuts="Enter Space"
                            onPointerDown={(e) => {
                                // Primary press only; feel scale on finger-down, not mouseup
                                if (e.button !== 0) return;
                                e.stopPropagation();
                                enter();
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                enter();
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={phase !== 'HALO'}
                            animate={{
                                scale: prefersReducedMotion ? 1 : isPressed ? 0.93 : 1,
                            }}
                            transition={SPRING_PRESS}
                        >
                            {/* Soft outer veil */}
                            <motion.span
                                className="absolute inset-[-28px] rounded-full blur-[48px] pointer-events-none"
                                style={{
                                    background:
                                        'radial-gradient(circle, oklch(0.82 0.04 30 / 0.18) 0%, oklch(0.80 0.035 296 / 0.08) 60%, transparent 78%)',
                                }}
                                animate={{
                                    opacity: prefersReducedMotion ? 0.7 : isPressed ? 0.98 : 0.7,
                                }}
                                transition={SPRING_PRESS}
                                aria-hidden="true"
                            />

                            {/* Breathing lives on an inner wrapper — scale-free so press isn't cancelled */}
                            <motion.span
                                className="absolute inset-[16%] rounded-full pointer-events-none"
                                animate={
                                    prefersReducedMotion
                                        ? { scale: 1, opacity: 1 }
                                        : isPressed && !isDissolving
                                          ? { scale: 0.88, opacity: 1 }
                                          : isDissolving
                                            ? { scale: 1, opacity: 0.88 }
                                            : {
                                                  scale: [0.97, 1.03, 0.97],
                                                  opacity: [0.94, 1, 0.94],
                                              }
                                }
                                transition={
                                    prefersReducedMotion || isPressed || isDissolving
                                        ? SPRING_PRESS
                                        : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }
                                }
                                aria-hidden="true"
                            >
                                <span
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background:
                                            'linear-gradient(155deg, oklch(0.88 0.035 40), oklch(0.84 0.055 22), oklch(0.86 0.04 55))',
                                        boxShadow:
                                            'inset 0 1px 0 oklch(1 0 0 / 0.4), inset 0 -3px 8px oklch(0.45 0.05 30 / 0.10), 0 14px 32px oklch(0.35 0.03 40 / 0.14)',
                                    }}
                                />
                            </motion.span>
                        </motion.button>

                        {/* ========== 进入提示 ========== */}
                        <motion.p
                            id="intro-enter-hint"
                            className="relative z-10 mt-8 text-caption text-ink-secondary shrink-0"
                            initial={{ opacity: 0 }}
                            animate={
                                isPressed
                                    ? { opacity: 0.45 }
                                    : {
                                          opacity: prefersReducedMotion
                                              ? 0.95
                                              : [0.75, 0.95, 0.75],
                                      }
                            }
                            transition={
                                isPressed || prefersReducedMotion
                                    ? {
                                          duration: prefersReducedMotion ? 0 : 0.16,
                                          ease: EASING.out,
                                      }
                                    : {
                                          duration: 3.2,
                                          repeat: Infinity,
                                          ease: 'easeInOut',
                                          delay: 1.2,
                                      }
                            }
                        >
                            {enterHint}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default IntroSequence;
