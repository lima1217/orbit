import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { isDaytime } from '../constants/skyConfig';

interface OrbitDialProps {
    /** 映射城市当地小时（0–24） */
    orbitHour: number;
    /** 是否播放首次描绘动画 */
    animateIn?: boolean;
    children?: React.ReactNode;
}

const SIZE = 340;
const C = SIZE / 2;
const R = 146;
/** 起床 = Orbit 日出 */
const WAKE_HOUR = 6;

/** 小时 → 角度（弧度）：正午在顶，午夜在底，顺时针前进 */
const angleOf = (hour: number) => ((hour - 12) / 24) * Math.PI * 2;

const pointAt = (hour: number, radius = R) => {
    const a = angleOf(hour);
    return { x: C + radius * Math.sin(a), y: C - radius * Math.cos(a) };
};

/** 顺时针从 h1 画到 h2 */
function arcPath(h1: number, h2: number, radius = R): string {
    let span = (h2 - h1 + 24) % 24;
    if (span === 0) span = 24;
    const end = h1 + Math.min(span, 23.999);
    const s = pointAt(h1, radius);
    const e = pointAt(end, radius);
    const large = span > 12 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
}

const TICKS = Array.from({ length: 24 }, (_, h) => h);
const LABELS: Array<{ hour: number; text: string }> = [
    { hour: 6, text: '06' },
    { hour: 12, text: '12' },
    { hour: 18, text: '18' },
    { hour: 0, text: '00' },
];

/**
 * OrbitDial — 一天就是一圈轨道。
 * 上半圈是白昼，下半圈是夜晚；左侧 06:00 是你的日出（起床），
 * 光点沿轨道走到「此刻」，身后的弧线是你醒来以后走过的路。
 */
export const OrbitDial: React.FC<OrbitDialProps> = ({ orbitHour, animateIn = true, children }) => {
    const uid = useId().replace(/:/g, '');
    const reduce = useReducedMotion();
    const day = isDaytime(orbitHour);
    const marker = pointAt(orbitHour);
    const wake = pointAt(WAKE_HOUR);
    const draw = animateIn && !reduce;

    return (
        <div className="relative aspect-square w-[min(80vw,21rem,42dvh)]">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
                <defs>
                    <linearGradient id={`trail-${uid}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="oklch(0.82 0.12 65)" />
                        <stop offset="55%" stopColor="oklch(0.74 0.12 25)" />
                        <stop offset="100%" stopColor="oklch(0.66 0.12 300)" />
                    </linearGradient>
                    <radialGradient id={`sun-${uid}`} cx="35%" cy="30%" r="75%">
                        <stop offset="0%" stopColor="oklch(0.99 0.03 90)" />
                        <stop offset="60%" stopColor="oklch(0.90 0.11 70)" />
                        <stop offset="100%" stopColor="oklch(0.82 0.11 40)" />
                    </radialGradient>
                    <radialGradient id={`moon-${uid}`} cx="35%" cy="30%" r="75%">
                        <stop offset="0%" stopColor="oklch(1 0 0)" />
                        <stop offset="70%" stopColor="oklch(0.93 0.03 285)" />
                        <stop offset="100%" stopColor="oklch(0.84 0.05 290)" />
                    </radialGradient>
                    <radialGradient id={`halo-${uid}`}>
                        <stop offset="0%" stopColor="oklch(1 0 0 / 0.9)" />
                        <stop offset="100%" stopColor="oklch(1 0 0 / 0)" />
                    </radialGradient>
                </defs>

                {/* Inner disc — 一层极淡的乳白，让中心文字更安定 */}
                <circle cx={C} cy={C} r={R - 14} fill="oklch(1 0 0 / 0.16)" />

                {/* Track */}
                <circle cx={C} cy={C} r={R} fill="none" stroke="oklch(0.28 0.018 70 / 0.12)" strokeWidth={1} />

                {/* Night half — 下半圈薄薄一层薰衣草 */}
                <path d={arcPath(18, 6)} fill="none" stroke="oklch(0.70 0.06 290 / 0.22)" strokeWidth={6} strokeLinecap="round" />

                {/* Ticks */}
                {TICKS.map((h) => {
                    const major = h % 6 === 0;
                    const a = pointAt(h, R - 8);
                    const b = pointAt(h, R - (major ? 16 : 11));
                    return (
                        <line
                            key={h}
                            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                            stroke={`oklch(0.28 0.018 70 / ${major ? 0.32 : 0.14})`}
                            strokeWidth={major ? 1.25 : 1}
                            strokeLinecap="round"
                        />
                    );
                })}

                {/* Hour labels */}
                {LABELS.map(({ hour, text }) => {
                    const p = pointAt(hour, R - 30);
                    return (
                        <text
                            key={hour}
                            x={p.x} y={p.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="font-sans"
                            fontSize={10.5}
                            letterSpacing="0.08em"
                            fill="oklch(0.40 0.016 70 / 0.55)"
                        >
                            {text}
                        </text>
                    );
                })}

                {/* Awake trail — 从日出（起床）到此刻 */}
                <motion.path
                    d={arcPath(WAKE_HOUR, orbitHour)}
                    fill="none"
                    stroke={`url(#trail-${uid})`}
                    strokeWidth={4}
                    strokeLinecap="round"
                    initial={draw ? { pathLength: 0, opacity: 0 } : false}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.6, delay: 0.35, ease: [0.65, 0, 0.35, 1] }}
                />

                {/* Wake point — 你的日出 */}
                <circle cx={wake.x} cy={wake.y} r={5} fill="oklch(0.99 0.01 80)" stroke="oklch(0.80 0.12 65)" strokeWidth={2} />

                {/* Body-time marker */}
                <motion.g
                    initial={draw ? { opacity: 0, scale: 0.4 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: draw ? 1.7 : 0, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{ transformOrigin: `${marker.x}px ${marker.y}px` }}
                >
                    <motion.circle
                        cx={marker.x} cy={marker.y} r={30}
                        fill={`url(#halo-${uid})`}
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                        animate={reduce ? undefined : { opacity: [0.6, 1, 0.6], scale: [0.8, 1.05, 0.8] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <circle
                        cx={marker.x} cy={marker.y} r={11}
                        fill={`url(#${day ? 'sun' : 'moon'}-${uid})`}
                        style={{ filter: 'drop-shadow(0 3px 6px oklch(0.40 0.05 50 / 0.25))' }}
                    />
                </motion.g>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {children}
            </div>
        </div>
    );
};
