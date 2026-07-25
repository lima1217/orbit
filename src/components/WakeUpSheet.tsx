import React, { useState, useRef, useEffect, useMemo, useId, useCallback } from 'react';
import {
    motion,
    AnimatePresence,
    useReducedMotion,
    useDragControls,
    type PanInfo,
} from 'framer-motion';
import { X } from 'lucide-react';
import { DURATION, EASING } from '../constants/animationConfig';

/** Dismiss if pulled far enough or flicked downward */
const DISMISS_OFFSET_Y = 80;
const DISMISS_VELOCITY_Y = 400;
/** How far the sheet may travel down before elastic resistance */
const DRAG_RANGE_Y = 220;

interface WakeUpSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (hour: number, minute: number) => void;
    initialHour?: number;
    initialMinute?: number;
    /** 首次校准时禁止关闭，必须设定起床时间 */
    required?: boolean;
}

interface WheelColumnProps {
    items: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    itemHeight?: number;
    label: string;
}

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const WheelColumn: React.FC<WheelColumnProps> = ({
    items,
    selectedIndex,
    onSelect,
    itemHeight = 48,
    label,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        if (containerRef.current && !isScrolling) {
            containerRef.current.scrollTo({
                top: selectedIndex * itemHeight,
                behavior: 'smooth'
            });
        }
    }, [selectedIndex, itemHeight, isScrolling]);

    const handleScroll = () => {
        if (!containerRef.current) return;
        setIsScrolling(true);

        const scrollTop = containerRef.current.scrollTop;
        const newIndex = Math.round(scrollTop / itemHeight);

        if (newIndex >= 0 && newIndex < items.length && newIndex !== selectedIndex) {
            onSelect(newIndex);
        }

        clearTimeout((containerRef.current as any).scrollTimeout);
        (containerRef.current as any).scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
        }, 150);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        let next = selectedIndex;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            next = Math.max(0, selectedIndex - 1);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            next = Math.min(items.length - 1, selectedIndex + 1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            next = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            next = items.length - 1;
        } else {
            return;
        }
        if (next !== selectedIndex) onSelect(next);
    };

    return (
        <div
            role="spinbutton"
            tabIndex={0}
            aria-label={label}
            aria-valuenow={selectedIndex}
            aria-valuemin={0}
            aria-valuemax={items.length - 1}
            aria-valuetext={items[selectedIndex]}
            onKeyDown={handleKeyDown}
            className="relative h-[144px] overflow-hidden select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2"
        >
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
                style={{
                    paddingTop: itemHeight,
                    paddingBottom: itemHeight,
                }}
                aria-hidden="true"
            >
                {items.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <div
                            key={item}
                            className="snap-center flex items-center justify-center"
                            style={{ height: itemHeight }}
                        >
                            <span
                                className={`
                                    transition-[color,opacity] duration-200 ease-out
                                    ${isSelected
                                        ? 'text-picker-selected text-ink-primary'
                                        : 'text-picker-option text-ink-faint/50'
                                    }
                                `}
                            >
                                {item}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Smart inference: determine if selected time is today or yesterday
const getInferredDateIndex = (hour: number, minute: number): number => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const selectedMinutes = hour * 60 + minute;
    // If selected time is <= current time, it's today (0); otherwise it's yesterday (1)
    return selectedMinutes <= nowMinutes ? 0 : 1;
};

export const WakeUpSheet: React.FC<WakeUpSheetProps> = ({
    isOpen,
    onClose,
    onSelect,
    initialHour = 7,
    initialMinute = 0,
    required = false,
}) => {
    // Date options: 今天 (0) / 昨天 (1)
    const dateOptions = ['今天', '昨天'];
    const titleId = useId();
    const sheetRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const bodyOverflowRef = useRef('');
    const isOpenRef = useRef(isOpen);
    isOpenRef.current = isOpen;
    const prefersReducedMotion = useReducedMotion();
    const dragControls = useDragControls();
    const canDragDismiss = !required && !prefersReducedMotion;

    // Infer initial date based on initial time
    const initialDateIndex = useMemo(
        () => getInferredDateIndex(initialHour, initialMinute),
        [initialHour, initialMinute]
    );

    const [selectedDateIndex, setSelectedDateIndex] = useState(initialDateIndex);
    const [selectedHourIndex, setSelectedHourIndex] = useState(initialHour);
    const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(
        Math.floor(initialMinute / 5)
    );

    // 24-hour format: 00-23
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    // Reset when initialHour/initialMinute changes
    useEffect(() => {
        setSelectedDateIndex(getInferredDateIndex(initialHour, initialMinute));
        setSelectedHourIndex(initialHour);
        setSelectedMinuteIndex(Math.floor(initialMinute / 5));
    }, [initialHour, initialMinute]);

    // Auto-update date when time changes (smart inference)
    useEffect(() => {
        const newDateIndex = getInferredDateIndex(selectedHourIndex, parseInt(minutes[selectedMinuteIndex]));
        setSelectedDateIndex(newDateIndex);
    }, [selectedHourIndex, selectedMinuteIndex]);

    // Current selected time
    const selectedHour = parseInt(hours[selectedHourIndex]);
    const selectedMinute = parseInt(minutes[selectedMinuteIndex]);

    const handleConfirm = () => {
        onSelect(selectedHour, selectedMinute);
        onClose();
    };

    const trapFocus = useCallback((e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !sheetRef.current) return;
        const focusable = Array.from(
            sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

        if (focusable.length === 0) {
            e.preventDefault();
            sheetRef.current.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        }
    }, []);

    // Focus management + Escape (scroll lock restored after exit — see onExitComplete)
    useEffect(() => {
        if (!isOpen) return;

        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
        const frame = requestAnimationFrame(() => {
            const firstFocusable = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
            (firstFocusable ?? sheetRef.current)?.focus();
        });

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !required) {
                e.preventDefault();
                onClose();
                return;
            }
            trapFocus(e);
        };

        document.addEventListener('keydown', onKeyDown);
        bodyOverflowRef.current = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener('keydown', onKeyDown);
            previouslyFocusedRef.current?.focus?.();
        };
    }, [isOpen, required, onClose, trapFocus]);

    const handleExitComplete = useCallback(() => {
        // Re-open during exit must not unlock scroll while the sheet is open again
        if (!isOpenRef.current) {
            document.body.style.overflow = bodyOverflowRef.current;
        }
    }, []);

    const handleDragEnd = useCallback(
        (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (!canDragDismiss) return;
            if (info.offset.y > DISMISS_OFFSET_Y || info.velocity.y > DISMISS_VELOCITY_Y) {
                onClose();
            }
        },
        [canDragDismiss, onClose]
    );

    const backdropTransition = prefersReducedMotion
        ? { duration: DURATION.fast, ease: EASING.enter }
        : { duration: 0.4, ease: EASING.enter };

    const sheetTransition = prefersReducedMotion
        ? { duration: DURATION.fast, ease: EASING.enter }
        : { type: 'spring' as const, damping: 32, stiffness: 350 };

    // dragTransition expects InertiaOptions (not spring Transition)
    const sheetSnapBack = { bounceStiffness: 500, bounceDamping: 35 };

    const sheetInitial = prefersReducedMotion ? { opacity: 0 } : { y: '100%' };
    const sheetAnimate = prefersReducedMotion ? { opacity: 1 } : { y: 0 };
    const sheetExit = prefersReducedMotion
        ? { opacity: 0, transition: { duration: DURATION.fast, ease: EASING.exit } }
        : { y: '100%' };

    return (
        <AnimatePresence onExitComplete={handleExitComplete}>
            {isOpen && (
                <motion.div
                    key="wakeup-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: {
                            duration: prefersReducedMotion ? DURATION.fast : 0.4,
                            ease: EASING.exit,
                        },
                    }}
                    transition={backdropTransition}
                    onClick={required ? undefined : onClose}
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50"
                    aria-hidden="true"
                />
            )}
            {isOpen && (
                <motion.div
                    key="wakeup-sheet"
                    ref={sheetRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    tabIndex={-1}
                    initial={sheetInitial}
                    animate={sheetAnimate}
                    exit={sheetExit}
                    transition={sheetTransition}
                    drag={canDragDismiss ? 'y' : false}
                    dragControls={dragControls}
                    dragListener={false}
                    dragConstraints={{ top: 0, bottom: DRAG_RANGE_Y }}
                    dragElastic={{ top: 0, bottom: 0.2 }}
                    dragSnapToOrigin
                    dragTransition={sheetSnapBack}
                    onDragEnd={handleDragEnd}
                    className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden overscroll-contain focus:outline-none"
                    style={{
                        background: 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 40%, rgba(255,255,255,0.75) 70%, rgba(255,255,255,0.4) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                    }}
                >
                {/* Subtle top edge glow */}
                <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                        background: 'linear-gradient(to right, transparent, rgba(252,211,77,0.3), rgba(255,182,193,0.3), transparent)'
                    }}
                    aria-hidden="true"
                />

                {/* Drag handle — only this region starts drag (avoids fighting the time wheels) */}
                <div
                    className={`flex justify-center items-center min-h-11 pt-2 pb-1 ${canDragDismiss ? 'cursor-grab active:cursor-grabbing touch-none select-none' : ''}`}
                    aria-hidden="true"
                    onPointerDown={(e) => {
                        if (canDragDismiss) dragControls.start(e);
                    }}
                >
                    <motion.div
                        className="w-10 h-1 rounded-full bg-ink-disabled/70"
                        whileHover={canDragDismiss ? { scale: 1.1 } : undefined}
                    />
                </div>

                {/* Close button - hidden during required first calibration */}
                {!required && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 end-3 min-w-11 min-h-11 flex items-center justify-center text-ink-disabled/60 hover:text-ink-faint transition-[color,transform] duration-150 ease-out active:scale-[0.96]"
                        aria-label="关闭起床时间选择"
                    >
                        <X size={18} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                )}

                {/* Content — inset from edges; pb includes home indicator */}
                <div className="page-inline pb-safe-sheet pt-2">
                    {/* Header - Poetic attitude statement */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <h2 id={titleId} className="text-quote text-ink-muted max-w-[16em] mx-auto">
                            {required ? '睁开眼时，是几点？' : '世界有它的时钟，你按你的身体醒来'}
                        </h2>
                    </motion.div>

                    {/* Time Picker Container with soft glow focus area */}
                    <motion.div
                        className="relative mb-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                    >
                        {/* Time Picker - 2 columns: Hour : Minute */}
                        <div className="flex items-center justify-center relative z-10" role="group" aria-label="起床时间">
                            <WheelColumn
                                items={hours}
                                selectedIndex={selectedHourIndex}
                                onSelect={setSelectedHourIndex}
                                label="小时"
                            />
                            <span className="text-picker-selected text-ink-muted mx-3" aria-hidden="true">:</span>
                            <WheelColumn
                                items={minutes}
                                selectedIndex={selectedMinuteIndex}
                                onSelect={setSelectedMinuteIndex}
                                label="分钟"
                            />
                        </div>
                    </motion.div>

                    {/* Date indicator - minimal elegance */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <span className="text-caption-small text-ink-faint whitespace-nowrap">
                            ·&nbsp;{dateOptions[selectedDateIndex]}&nbsp;·
                        </span>
                    </motion.div>

                    {/* Confirm Button - Pure, clean, high contrast */}
                    <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                    >
                        <motion.button
                            type="button"
                            onClick={handleConfirm}
                            className="px-14 py-3.5 min-h-11 rounded-full text-button cursor-pointer bg-action text-action-fg hover:bg-action-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2"
                            style={{
                                boxShadow:
                                    '0 0 0 1px oklch(0.28 0.018 70 / 0.08), 0 1px 2px -1px oklch(0.28 0.018 70 / 0.08), 0 4px 14px oklch(0.28 0.018 70 / 0.14)',
                            }}
                            whileHover={{
                                boxShadow:
                                    '0 0 0 1px oklch(0.28 0.018 70 / 0.12), 0 1px 2px -1px oklch(0.28 0.018 70 / 0.12), 0 6px 20px oklch(0.28 0.018 70 / 0.2)',
                            }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                        >
                            {required ? '进入时区' : '更改起床时间'}
                        </motion.button>
                    </motion.div>
                </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
