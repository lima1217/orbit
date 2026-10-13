import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AMBIENT_SOUNDS, AmbientSound } from '../constants/ambientSounds';
import { SoundIcon } from './icons/SoundIcon';
import { MutedIcon, PlayIcon } from './icons/LineIcon';
import { useNow } from '../hooks/useNow';

interface InlineSoundSelectorProps {
    selectedIds: string[];
    onToggleSound: (soundId: string) => void;
    /** 已选但浏览器尚未允许播放（回访用户还没有任何手势） */
    isPaused?: boolean;
    /** 定时淡出时刻（epoch ms） */
    sleepAt?: number | null;
    onSetSleepTimer?: (minutes: number | null) => void;
}

const SLEEP_OPTIONS = [15, 30, 60] as const;

const SPRING = { type: 'spring' as const, duration: 0.35, bounce: 0.1 };

/**
 * 环境音混音 — 右下角触发钮，向上展开的乳白玻璃面板。
 * 收起：点外部 / Escape / 再点触发钮。
 */
export const InlineSoundSelector: React.FC<InlineSoundSelectorProps> = ({
    selectedIds,
    onToggleSound,
    isPaused = false,
    sleepAt = null,
    onSetSleepTimer,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelId = useId();
    const reduce = useReducedMotion();
    const now = useNow(10_000);
    const [sleepChoice, setSleepChoice] = useState<number | null>(null);
    const activeChoice = sleepAt === null ? null : sleepChoice;
    const sleepLeft = sleepAt === null ? null : Math.max(1, Math.round((sleepAt - now.getTime()) / 60_000));

    const chooseSleep = (minutes: number | null) => {
        setSleepChoice(minutes);
        onSetSleepTimer?.(minutes);
    };

    useEffect(() => {
        if (!isExpanded) return;

        const handlePointer = (event: PointerEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsExpanded(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('pointerdown', handlePointer);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('pointerdown', handlePointer);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isExpanded]);

    const selected = AMBIENT_SOUNDS.filter((s) => selectedIds.includes(s.id));
    const label = isPaused
        ? '轻触播放'
        : selected.length === 0
            ? '静音'
            : selected.length === 1
                ? selected[0].name
                : `${selected.length} 种声音`;

    return (
        <div ref={containerRef} className="relative">
            <motion.button
                ref={triggerRef}
                type="button"
                whileTap={{ scale: 0.96 }}
                transition={SPRING}
                onClick={() => setIsExpanded((v) => !v)}
                aria-label={`环境音：${selected.length ? selected.map((s) => s.name).join('、') : '无'}${isPaused ? '，尚未播放' : ''}${sleepLeft !== null ? `，${sleepLeft} 分钟后淡出` : ''}`}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                className="glass-button min-h-11 pl-3 pr-4 rounded-full inline-flex items-center gap-2 text-button text-ink-secondary hover:text-ink-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary/40"
            >
                <span className="inline-flex items-center -space-x-1.5" aria-hidden="true">
                    {selected.length === 0 ? (
                        <MutedIcon size={16} />
                    ) : (
                        selected.slice(0, 3).map((s) => (
                            <span key={s.id} className="inline-flex w-6 h-6 rounded-full items-center justify-center bg-white/70 ring-2 ring-white/40 text-ink-primary">
                                <SoundIcon sound={s} size={14} />
                            </span>
                        ))
                    )}
                </span>
                <span>{label}</span>
                {sleepLeft !== null && !isPaused && (
                    <span className="text-caption-small text-ink-muted tabular-nums">· {sleepLeft} 分</span>
                )}
                {isPaused ? (
                    <PlayIcon size={12} className="ml-0.5 opacity-70" />
                ) : (
                    selected.length > 0 && <Equalizer />
                )}
            </motion.button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        key="panel"
                        id={panelId}
                        role="group"
                        aria-label="选择环境音，可叠加"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
                        transition={SPRING}
                        className="absolute bottom-full right-0 mb-3 origin-bottom-right glass-sheet rounded-[1.75rem] p-3 w-[min(21rem,calc(100vw-3rem))]"
                    >
                        <div className="flex items-baseline justify-between px-1.5 pb-2">
                            <p className="text-caption text-ink-secondary">环境音</p>
                            <p className="text-caption-small text-ink-muted">可叠加</p>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {AMBIENT_SOUNDS.map((sound, index) => (
                                <SoundButton
                                    key={sound.id}
                                    sound={sound}
                                    isSelected={selectedIds.includes(sound.id)}
                                    onClick={() => onToggleSound(sound.id)}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        {/* 定时淡出 — 睡前开着声音也不必惦记关掉 */}
                        <div className="mt-3 pt-3 border-t border-ink-primary/[0.06] flex items-center justify-between gap-2 px-1.5">
                            <p className="text-caption-small text-ink-secondary whitespace-nowrap">
                                定时淡出
                                {sleepLeft !== null && (
                                    <span className="text-ink-muted tabular-nums"> · 剩 {sleepLeft} 分钟</span>
                                )}
                            </p>
                            <div className="flex gap-1" role="radiogroup" aria-label="定时淡出">
                                {[null, ...SLEEP_OPTIONS].map((m) => {
                                    const active = activeChoice === m;
                                    return (
                                        <button
                                            key={m ?? 'off'}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            onClick={() => chooseSleep(m)}
                                            className={`min-h-9 min-w-9 px-2.5 rounded-full text-caption-small tabular-nums cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary/40 ${
                                                active
                                                    ? 'bg-white/85 text-ink-primary shadow-[0_0_0_1px_oklch(0.80_0.07_40/0.5)]'
                                                    : 'text-ink-muted hover:bg-white/40'
                                            }`}
                                        >
                                            {m === null ? '关' : `${m}′`}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface SoundButtonProps {
    sound: AmbientSound;
    isSelected: boolean;
    onClick: () => void;
    autoFocus?: boolean;
}

const SoundButton: React.FC<SoundButtonProps> = ({ sound, isSelected, onClick, autoFocus = false }) => (
    <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        transition={SPRING}
        onClick={onClick}
        autoFocus={autoFocus}
        aria-pressed={isSelected}
        className={`relative flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl cursor-pointer transition-colors duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary/40
            ${isSelected ? 'bg-white/80 shadow-[0_0_0_1px_oklch(0.80_0.07_40/0.5),0_6px_16px_-8px_oklch(0.6_0.08_40/0.5)]' : 'hover:bg-white/40'}`}
    >
        <span className={`inline-flex transition-[color,transform] duration-200 ${isSelected ? 'text-ink-primary scale-110' : 'text-ink-muted'}`} aria-hidden="true">
            <SoundIcon sound={sound} size={24} />
        </span>
        <span className={`text-caption-small ${isSelected ? 'text-ink-primary' : 'text-ink-muted'}`}>{sound.name}</span>
    </motion.button>
);

/** 三根静止的小竖条：正在播放（不做动画，主页只保留表盘光点一处呼吸） */
function Equalizer() {
    return (
        <span className="inline-flex items-end gap-[2px] h-3 ml-0.5 opacity-60" aria-hidden="true">
            {['45%', '100%', '70%'].map((h, i) => (
                <span key={i} className="w-[2px] rounded-full bg-current" style={{ height: h }} />
            ))}
        </span>
    );
}

export default InlineSoundSelector;
