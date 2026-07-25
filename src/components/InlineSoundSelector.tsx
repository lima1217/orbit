import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AMBIENT_SOUNDS, AmbientSound } from '../constants/ambientSounds';
import { SoundIcon } from './icons/SoundIcon';

interface InlineSoundSelectorProps {
    selectedIds: string[];
    onToggleSound: (soundId: string) => void;
    /** 展开时通知父级，便于 dim 背后内容（Apple: dim to focus） */
    onExpandChange?: (expanded: boolean) => void;
}

/**
 * Soft glass — denser than page chrome so the display clock doesn't bleed through icons.
 * Shadow ring for elevation (better-ui: shadows for depth, not solid borders).
 */
const PANEL_SURFACE: React.CSSProperties = {
    background: 'oklch(0.975 0.010 55 / 0.88)',
    backdropFilter: 'blur(40px) saturate(170%)',
    WebkitBackdropFilter: 'blur(40px) saturate(170%)',
    boxShadow:
        'inset 0 1px 0 oklch(1 0 0 / 0.55), 0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06), 0 12px 32px oklch(0.35 0.03 50 / 0.12)',
};

/** Selected chip — static cue strong enough without relying on motion */
const SELECTED_CHIP: React.CSSProperties = {
    background: 'oklch(0.93 0.045 25 / 0.78)',
    boxShadow:
        'inset 0 1px 0 oklch(1 0 0 / 0.45), 0 0 0 1px oklch(0.55 0.06 25 / 0.16)',
};

/**
 * 🎵 InlineSoundSelector
 * 展开为触发钮上方的玻璃面板；收起：点外部 / Escape / 再点触发钮。
 */
export const InlineSoundSelector: React.FC<InlineSoundSelectorProps> = ({
    selectedIds,
    onToggleSound,
    onExpandChange,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listId = useId();

    const setExpanded = (open: boolean) => {
        setIsExpanded(open);
        onExpandChange?.(open);
    };

    useEffect(() => {
        if (!isExpanded) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
                onExpandChange?.(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsExpanded(false);
                onExpandChange?.(false);
                triggerRef.current?.focus();
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isExpanded, onExpandChange]);

    const selectedSounds = AMBIENT_SOUNDS
        .filter(s => selectedIds.includes(s.id))
        .slice(0, 4);

    const collapsedLabel =
        selectedSounds.length > 0
            ? `环境音：${selectedSounds.map((s) => s.name).join('、')}。点击${isExpanded ? '收起' : '展开选择'}`
            : isExpanded
                ? '收起环境音选择'
                : '选择环境音';

    return (
        <div ref={containerRef} className="relative flex flex-col items-center">
            <motion.button
                ref={triggerRef}
                type="button"
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                onClick={() => setExpanded(!isExpanded)}
                aria-label={collapsedLabel}
                aria-expanded={isExpanded}
                aria-controls={listId}
                aria-haspopup="dialog"
                className="relative z-10 flex items-center justify-center gap-2 min-h-11 min-w-11 px-3.5 py-2.5 rounded-full
                           glass-button cursor-pointer
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2"
            >
                <AnimatePresence initial={false} mode="popLayout">
                    {selectedSounds.length > 0 ? (
                        <motion.span
                            key={selectedSounds.map((s) => s.id).join('-')}
                            initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                            className="inline-flex items-center gap-2"
                        >
                            {selectedSounds.map((sound) => (
                                <span key={sound.id} className="inline-flex" aria-hidden="true">
                                    <SoundIcon sound={sound} size={18} />
                                </span>
                            ))}
                        </motion.span>
                    ) : (
                        <motion.span
                            key="empty"
                            initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                            className="inline-flex text-ink-faint/70"
                            aria-hidden="true"
                        >
                            <MusicNoteIcon />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Glass panel — grows from trigger (origin bottom) */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="expanded"
                        id={listId}
                        role="dialog"
                        aria-modal="false"
                        aria-label="环境音"
                        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                        className="absolute bottom-full inset-x-0 z-20 mb-3 flex justify-center origin-bottom"
                    >
                        {/*
                          Concentric radii: outer 22px = inner 14px + padding 8px
                          w-fit：面板随 4×44px 格子收缩，左右内边距对称（勿用 w-full，否则固定宽按钮会贴左）
                        */}
                        <div
                            className="grid grid-cols-4 gap-1.5 w-fit mx-auto p-2 rounded-[1.375rem]"
                            style={PANEL_SURFACE}
                        >
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

const SoundButton: React.FC<SoundButtonProps> = ({
    sound,
    isSelected,
    onClick,
    autoFocus = false,
}) => {
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            onClick={onClick}
            autoFocus={autoFocus}
            className="relative flex items-center justify-center w-11 h-11 min-w-11 min-h-11 cursor-pointer
                       transition-transform duration-150 ease-out
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2
                       rounded-[0.875rem]"
            aria-label={sound.name}
            aria-pressed={isSelected}
        >
            <AnimatePresence initial={false}>
                {isSelected && (
                    <motion.div
                        key="glow"
                        initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                        className="absolute inset-0 rounded-[0.875rem]"
                        style={SELECTED_CHIP}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            <span
                aria-hidden="true"
                className={`relative z-10 inline-flex transition-[opacity] duration-150 ease-out ${
                    isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
            >
                <SoundIcon sound={sound} size={22} />
            </span>
        </motion.button>
    );
};

/** Outline music note — empty trigger; stroke matches caption weight (~1.5) */
function MusicNoteIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    );
}

export default InlineSoundSelector;
