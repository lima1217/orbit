import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { getDailyQuote } from '../constants/dailyQuotes';
import { unlockAudio } from '../utils/audioUnlock';
import { startGlobalAudio } from '../utils/globalAudio';

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

export const IntroSequence: React.FC<IntroSequenceProps> = ({
    onComplete,
    targetOrbitHour: _targetOrbitHour,
    isReturning = false
}) => {
    const [phase, setPhase] = useState<IntroPhase>('HALO');
    const [holdProgress, setHoldProgress] = useState(0);
    const holdIntervalRef = useRef<number | null>(null);

    // Get today's quote
    const dailyQuote = getDailyQuote();

    // 🎵 音效状态 - Intro 页面直接使用全局音效系统
    // 播放用户上次选择的音效（默认是🧘 zen）
    const hasStartedAudioRef = useRef(false);

    // 用户首次触摸/点击页面时播放环境音（必须由用户手势触发）
    const startAudioOnInteraction = useCallback(() => {
        if (!hasStartedAudioRef.current) {
            hasStartedAudioRef.current = true;
            // 🔓 解锁全局音频上下文
            unlockAudio();
            // 🎵 直接启动全局音效（使用用户保存的或默认的🧘）
            // 这样音效会从 Intro 延续到主界面，无需重新启动
            startGlobalAudio();
        }
    }, []);

    // 音效淡出现在在长按过程中触发（见 startHolding）
    // 不再需要在 DISSOLVING 阶段额外触发

    // 原版呼吸动画 - 更明显的呼吸感，让用户想要触碰
    const haloVariants: Variants = {
        idle: {
            scale: [0.94, 1.06, 0.94],      // 增大呼吸幅度，更有"邀请感"
            opacity: [0.8, 1, 0.8],          // 更明显的亮度变化
            transition: {
                duration: 3.5,               // 稍微加快，更有活力
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        },
        holding: {
            scale: 1.1,
            opacity: 1,
            filter: "brightness(1.15)",
            transition: {
                duration: 0.5,
                ease: "easeOut" as const
            }
        }
    };

    const startHolding = () => {
        if (phase !== 'HALO') return;

        // 确保音频已启动（用户交互触发，绕过浏览器限制）
        startAudioOnInteraction();

        // 音效不需要淡出，因为从 Intro 延续到主界面

        let progress = 0;
        const duration = 1000;  // 1秒长按，快速响应
        const interval = 16;

        holdIntervalRef.current = window.setInterval(() => {
            progress += interval;
            const percentage = Math.min(progress / duration, 1);
            setHoldProgress(percentage);

            if (percentage >= 1) {
                if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
                triggerDissolve();
            }
        }, interval);
    };

    const stopHolding = () => {
        if (holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
        if (phase === 'HALO') {
            setHoldProgress(0);
        }
    };

    const triggerDissolve = () => {
        setPhase('DISSOLVING');
    };

    useEffect(() => {
        if (phase === 'DISSOLVING') {
            // 立即通知 App 开始渲染底层，让世界在光晕消散时浮现
            onComplete();

            // 光晕消散完成后标记为 COMPLETE
            const timer = setTimeout(() => {
                setPhase('COMPLETE');
            }, 1000); // 总消散时间 1 秒

            return () => clearTimeout(timer);
        }
    }, [phase, onComplete]);



    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden cursor-pointer select-none"
            onClick={startAudioOnInteraction}
            onMouseDown={startHolding}
            onMouseUp={stopHolding}
            onMouseLeave={stopHolding}
            onTouchStart={() => { startAudioOnInteraction(); startHolding(); }}
            onTouchEnd={stopHolding}
            initial={{ opacity: isReturning ? 0 : 1 }}
            animate={phase === 'DISSOLVING' || phase === 'COMPLETE' ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 1.2, ease: BREATHING_EASE }}
        >
            {/* 背景层：梦幻渐变 - 随整体一起消散 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-dream-cream via-dream-pink/20 to-dream-sky/20"
            />

            <AnimatePresence>
                {phase !== 'COMPLETE' && (
                    <motion.div
                        className="relative flex flex-col items-center justify-center w-full h-full"
                        initial={{ scale: isReturning ? 1.15 : 1 }}
                        animate={phase === 'DISSOLVING' ? {
                            scale: 1.15,
                        } : {
                            scale: 1,
                        }}
                        transition={{
                            duration: 1.2,
                            ease: BREATHING_EASE,
                        }}
                    >
                        {/* ========== 氛围背景光晕 ========== */}
                        <motion.div
                            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-soul-gold/30 blur-[80px]"
                            style={{ animation: phase === 'HALO' ? 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }}
                        />
                        <motion.div
                            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-lavender-soft/50 blur-[80px]"
                            style={{ animation: phase === 'HALO' ? 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }}
                        />
                        <motion.div
                            className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blush-soft/40 blur-[60px]"
                            style={{ animation: phase === 'HALO' ? 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }}
                        />

                        {/* ========== 核心光晕 - 简洁优雅 ========== */}
                        <motion.div
                            variants={haloVariants}
                            animate={holdProgress > 0 ? "holding" : "idle"}
                            className="relative w-80 h-80 rounded-full flex items-center justify-center"
                        >
                            {/* LAYER 3: Outer Atmosphere - 外层朦胧氛围 */}
                            <motion.div
                                className="absolute inset-[-60px] rounded-full blur-[80px] opacity-40"
                                style={{ background: 'radial-gradient(circle, transparent 30%, rgba(255,182,193,0.3) 60%, rgba(220,208,255,0.2) 80%, transparent 100%)' }}
                            />

                            {/* LAYER 2: Soft Glow - 柔和光晕 */}
                            <motion.div
                                className="absolute inset-[-20px] rounded-full blur-[40px]"
                                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6) 20%, rgba(252,211,77,0.15) 40%, rgba(255,182,193,0.1) 60%, transparent 80%)' }}
                                animate={{ opacity: [0.6, 0.8, 0.6] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {/* LAYER 1: Inner Soft Edge - 内部柔边 */}
                            <motion.div
                                className="absolute inset-4 rounded-full blur-[15px]"
                                style={{ background: 'radial-gradient(circle, white 60%, rgba(252,211,77,0.1) 80%, transparent 100%)' }}
                            />

                            {/* LAYER 0: Pure White Core - 纯白核心 */}
                            <motion.div
                                className="absolute inset-12 rounded-full"
                                style={{
                                    background: 'linear-gradient(135deg, white, #FDF8F3, white)',
                                    boxShadow: '0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(252,211,77,0.1)'
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Daily Quote - 每日名言 */}
            {phase === 'HALO' && (
                <motion.div
                    className="absolute bottom-24 left-0 right-0 px-8 text-center pb-safe"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                >
                    <p className="text-quote text-dream-text/70 tracking-wider whitespace-pre-line">
                        {dailyQuote.text}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default IntroSequence;
