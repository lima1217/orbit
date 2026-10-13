import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { TimeWheel, HOUR_OPTIONS, MINUTE_OPTIONS } from './TimeWheel';
import { getTimezoneForWakeUp } from '../constants/timezones';

interface WakeUpPickerProps {
    initialHour: number;
    initialMinute: number;
    title: string;
    subtitle?: string;
    confirmLabel: string;
    onConfirm: (hour: number, minute: number) => void;
    /** 滚动中实时回报小时，用于让天空预览 */
    onPreviewHour?: (hour: number) => void;
    titleId?: string;
}

/**
 * 起床时间选择的内容体：问题 → 滚轮 → 实时城市预览 → 确认。
 * 首次校准（全屏）与之后修改（底部 Sheet）共用。
 */
export const WakeUpPicker: React.FC<WakeUpPickerProps> = ({
    initialHour,
    initialMinute,
    title,
    subtitle,
    confirmLabel,
    onConfirm,
    onPreviewHour,
    titleId,
}) => {
    const reduce = useReducedMotion();
    const [hourIndex, setHourIndex] = useState(initialHour);
    const [minuteIndex, setMinuteIndex] = useState(() => Math.round(initialMinute / 5) % 12);

    const hour = Number(HOUR_OPTIONS[hourIndex]);
    const minute = Number(MINUTE_OPTIONS[minuteIndex]);
    const city = getTimezoneForWakeUp(hour);

    const handleHour = (i: number) => {
        setHourIndex(i);
        onPreviewHour?.(Number(HOUR_OPTIONS[i]));
    };

    return (
        <div className="flex flex-col items-center text-center">
            <h2 id={titleId} className="text-quote text-ink-primary text-[1.375rem] leading-snug text-balance">
                {title}
            </h2>
            {subtitle && <p className="text-caption text-ink-muted mt-2 max-w-[18em]">{subtitle}</p>}

            <div className="mt-6 w-full max-w-[16rem]">
                <TimeWheel
                    hourIndex={hourIndex}
                    minuteIndex={minuteIndex}
                    onHourChange={handleHour}
                    onMinuteChange={setMinuteIndex}
                />
            </div>

            {/* Live preview — 滚动时城市跟着变 */}
            <div className="mt-6 flex flex-col items-center" aria-live="polite">
                <p className="text-overline text-ink-muted">你将住在</p>
                <div className="relative h-12 mt-1.5 w-full grid place-items-center">
                    <AnimatePresence initial={false} mode="popLayout">
                        <motion.p
                            key={city.city}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: 'blur(6px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: 'blur(6px)' }}
                            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                            className="col-start-1 row-start-1 font-serif text-[2.25rem] leading-none text-ink-primary whitespace-nowrap"
                            translate="no"
                        >
                            {city.city}
                        </motion.p>
                    </AnimatePresence>
                </div>
                <p className="text-caption text-ink-muted mt-1">
                    {city.countryCN} · {formatUtc(city.offset)}
                </p>
            </div>

            <motion.button
                type="button"
                onClick={() => onConfirm(hour, minute)}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                className="mt-8 min-h-12 px-10 rounded-full text-button text-[0.9375rem] bg-action text-action-fg hover:bg-action-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2"
                style={{ boxShadow: '0 1px 0 oklch(1 0 0 / 0.15) inset, 0 10px 24px -10px oklch(0.28 0.02 70 / 0.5)' }}
            >
                {confirmLabel}
            </motion.button>
        </div>
    );
};

export function formatUtc(offset: number): string {
    const sign = offset >= 0 ? '+' : '−';
    const abs = Math.abs(offset);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    return `UTC${sign}${h}${m ? `:${m.toString().padStart(2, '0')}` : ''}`;
}
