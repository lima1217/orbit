import React, { useRef, useEffect, useEffectEvent } from 'react';
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
const DRAG_RANGE_Y = 220;
const SHEET_SNAP_BACK = { bounceStiffness: 500, bounceDamping: 35 };

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    /** 标题元素的 id（aria-labelledby） */
    labelledBy: string;
    /** 打开后优先聚焦的元素选择器；缺省聚焦第一个可聚焦元素 */
    initialFocus?: string;
    children: React.ReactNode;
}

/**
 * 乳白玻璃底部 Sheet：拖动把手 / Esc / 点背景关闭，焦点圈定在内部，关闭后归还焦点。
 * 渲染在 App 的 inert 外壳之外。
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, labelledBy, initialFocus, children }) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const reduce = useReducedMotion();
    const dragControls = useDragControls();
    const onCloseEvent = useEffectEvent(onClose);

    useEffect(() => {
        if (!isOpen) return;
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

        let inner = 0;
        const outer = requestAnimationFrame(() => {
            inner = requestAnimationFrame(() => {
                const sheet = sheetRef.current;
                const target =
                    (initialFocus && sheet?.querySelector<HTMLElement>(initialFocus)) ||
                    sheet?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
                (target ?? sheet)?.focus({ preventScroll: true });
            });
        });

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCloseEvent();
                return;
            }
            if (e.key !== 'Tab' || !sheetRef.current) return;
            const focusable = Array.from(
                sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
            ).filter((el) => el.offsetParent !== null);
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            cancelAnimationFrame(outer);
            cancelAnimationFrame(inner);
            document.removeEventListener('keydown', onKeyDown);
            const opener = previouslyFocusedRef.current;
            requestAnimationFrame(() => opener?.focus?.({ preventScroll: true }));
        };
    }, [isOpen, initialFocus]);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (info.offset.y > DISMISS_OFFSET_Y || info.velocity.y > DISMISS_VELOCITY_Y) onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="sheet-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? DURATION.fast : 0.4, ease: EASING.enter }}
                    onClick={onClose}
                    className="fixed inset-0 z-50"
                    style={{ background: 'oklch(0.35 0.03 260 / 0.12)' }}
                    aria-hidden="true"
                />
            )}
            {isOpen && (
                <motion.div
                    key="sheet"
                    ref={sheetRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={labelledBy}
                    tabIndex={-1}
                    initial={reduce ? { opacity: 0 } : { y: '100%' }}
                    animate={reduce ? { opacity: 1 } : { y: 0 }}
                    exit={reduce ? { opacity: 0 } : { y: '100%' }}
                    transition={reduce ? { duration: DURATION.fast } : { type: 'spring', damping: 34, stiffness: 320 }}
                    drag={reduce ? false : 'y'}
                    dragControls={dragControls}
                    dragListener={false}
                    dragConstraints={{ top: 0, bottom: DRAG_RANGE_Y }}
                    dragElastic={{ top: 0, bottom: 0.2 }}
                    dragSnapToOrigin
                    dragTransition={SHEET_SNAP_BACK}
                    onDragEnd={handleDragEnd}
                    className="glass-sheet fixed bottom-0 inset-x-0 mx-auto max-w-md z-50 max-h-[100dvh] rounded-t-[2rem] overflow-hidden overscroll-contain focus:outline-none"
                >
                    <div
                        className={`flex justify-center items-center min-h-9 pt-2 ${reduce ? '' : 'cursor-grab active:cursor-grabbing touch-none'}`}
                        aria-hidden="true"
                        onPointerDown={(e) => !reduce && dragControls.start(e)}
                    >
                        <div className="w-9 h-1 rounded-full bg-ink-disabled/60" />
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 end-3 min-w-11 min-h-11 flex items-center justify-center rounded-full text-ink-muted hover:text-ink-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary"
                        aria-label="关闭"
                    >
                        <X size={18} strokeWidth={1.5} aria-hidden="true" />
                    </button>

                    <div className="page-inline pt-3 pb-safe-sheet max-h-[calc(100dvh-2.5rem)] overflow-y-auto overscroll-contain">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
