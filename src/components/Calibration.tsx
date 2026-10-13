import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { WakeUpPicker } from './WakeUpPicker';

interface CalibrationProps {
    initialHour: number;
    initialMinute: number;
    onConfirm: (hour: number, minute: number) => void;
    onPreviewHour: (hour: number) => void;
    /** 每日校准（已有起床记录）：预填昨天的时间，一下确认即可 */
    daily?: boolean;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * 校准 — 全屏，在揭晓城市之前。首次访问与每日第一次打开共用。
 * 滚动起床时间时，背后的天空与城市名实时变化，揭晓留给确认那一刻。
 */
export const Calibration: React.FC<CalibrationProps> = ({ initialHour, initialMinute, onConfirm, onPreviewHour, daily = false }) => {
    const reduce = useReducedMotion();

    return (
        <motion.main
            className="absolute inset-0 z-10 flex flex-col items-center justify-center page-inline pt-safe pb-safe-lg"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, transition: { duration: 0.5, ease: EASE_OUT } }}
            transition={{ duration: 0.8, delay: reduce ? 0 : 0.35, ease: EASE_OUT }}
        >
            <WakeUpPicker
                initialHour={initialHour}
                initialMinute={initialMinute}
                title={daily ? '新的一天，今天几点醒的？' : '今天，你在几点睁开眼？'}
                subtitle={daily ? '和昨天一样的话，直接进入就好' : '不是闹钟响的时刻，是身体醒来的时刻'}
                confirmLabel={daily ? '进入今天的时区' : '进入我的时区'}
                onConfirm={onConfirm}
                onPreviewHour={onPreviewHour}
            />
        </motion.main>
    );
};
