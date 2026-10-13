import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { unlockAudio } from '../utils/audioUnlock';
import { startGlobalAudio } from '../utils/globalAudio';
import type { DailyQuote } from '../constants/dailyQuotes';

interface IntroSequenceProps {
    onEnter: () => void;
    /** 轨道内的那句话（核心 Slogan） */
    quote: DailyQuote;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * Intro — 一条轨道，一颗缓慢绕行的小太阳；轨道中央是词标「逆旅」与 Slogan。
 * 轨道尺寸与主页 OrbitDial 一致，进入时它放大淡出，主页的轨道接着浮现。
 * 轨道略高于几何中心（视觉中心）；全页只有太阳绕行这一处持续运动。
 */
export const IntroSequence: React.FC<IntroSequenceProps> = ({ onEnter, quote }) => {
    const reduce = useReducedMotion();
    const enteredRef = useRef(false);

    const enter = () => {
        if (enteredRef.current) return;
        enteredRef.current = true;
        // 必须在用户手势里启动音频
        unlockAudio();
        startGlobalAudio();
        onEnter();
    };

    return (
        <motion.main
            className="absolute inset-0 z-10 flex flex-col items-center justify-center page-inline pt-safe pb-[calc(env(safe-area-inset-bottom,0px)+6dvh)] select-none cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.7, ease: EASE_OUT } }}
            transition={{ duration: reduce ? 0 : 0.9, ease: EASE_OUT }}
            onClick={enter}
        >
            {/* 轨道 + 词标 */}
            <motion.button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    enter();
                }}
                aria-label="进入逆旅"
                aria-describedby="intro-hint"
                className="relative aspect-square w-[min(80vw,21rem,42dvh)] rounded-full grid place-items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary/40 focus-visible:ring-offset-8 focus-visible:ring-offset-transparent"
                whileTap={reduce ? undefined : { scale: 0.97 }}
                exit={reduce ? undefined : { scale: 1.12, opacity: 0, transition: { duration: 0.8, ease: EASE_OUT } }}
            >
                {/* Ring */}
                <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: '1px solid oklch(0.28 0.018 70 / 0.14)',
                        background: 'radial-gradient(circle, oklch(1 0 0 / 0.22) 0%, oklch(1 0 0 / 0.05) 70%)',
                    }}
                    initial={reduce ? false : { scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.4, ease: EASE_OUT }}
                    aria-hidden="true"
                />

                {/* Orbiting sun */}
                <motion.span
                    className="absolute inset-0"
                    animate={reduce ? undefined : { rotate: 360 }}
                    transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
                    style={{ rotate: reduce ? -60 : undefined }}
                    aria-hidden="true"
                >
                    <span
                        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                        style={{
                            background: 'radial-gradient(circle at 35% 30%, oklch(0.99 0.03 90), oklch(0.88 0.11 65) 60%, oklch(0.80 0.11 40))',
                            boxShadow: '0 0 0 8px oklch(1 0 0 / 0.25), 0 0 28px 8px oklch(0.95 0.08 80 / 0.7)',
                        }}
                    />
                </motion.span>

                {/* Wordmark + Slogan */}
                <span className="relative flex flex-col items-center">
                    <motion.span
                        className="text-brand text-ink-primary"
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: EASE_OUT }}
                    >
                        逆旅
                    </motion.span>
                    <motion.span
                        className="flex flex-col items-center"
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.7 }}
                    >
                        <span className="block w-6 h-px bg-ink-primary/20 mt-5" aria-hidden="true" />
                        <span className="text-quote text-[0.9375rem] text-ink-secondary mt-4 text-center leading-[1.8]">
                            {quote.text.split('\n').map((line) => (
                                <span key={line} className="block whitespace-nowrap">
                                    {line}
                                </span>
                            ))}
                        </span>
                    </motion.span>
                </span>
            </motion.button>

            {/* Hint */}
            <motion.p
                id="intro-hint"
                className="absolute inset-x-0 bottom-0 pb-safe-lg text-center text-caption text-ink-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0 : 1.2, delay: reduce ? 0 : 1.4 }}
            >
                轻触轨道，回到你的时区
            </motion.p>
        </motion.main>
    );
};

export default IntroSequence;
