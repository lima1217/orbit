/**
 * Sky Configuration — continuous 24h palette
 *
 * 天空在关键帧之间按小时连续插值（OKLCH）。克制原则：
 * - 同一时段只用相邻色相（不在一屏里放蓝 ↔ 杏这种互补对）
 * - 低彩度：整屏背景 chroma ≤ 0.03，下半屏趋近纸白
 * - 夜晚是一层雾蓝灰，依旧明亮，而不是糖果紫粉
 */

export type Oklch = readonly [l: number, c: number, h: number];

interface SkyKeyframe {
    hour: number;
    top: Oklch;
    bottom: Oklch;
    /** 天体光晕色 */
    glow: Oklch;
}

const KEYFRAMES: SkyKeyframe[] = [
    { hour: 0, top: [0.800, 0.030, 265], bottom: [0.860, 0.022, 255], glow: [0.95, 0.010, 260] },
    { hour: 4, top: [0.815, 0.030, 262], bottom: [0.875, 0.024, 250], glow: [0.95, 0.010, 260] },
    { hour: 6, top: [0.900, 0.030, 70], bottom: [0.945, 0.020, 50], glow: [0.97, 0.040, 80] },
    { hour: 9, top: [0.910, 0.026, 215], bottom: [0.955, 0.010, 200], glow: [0.98, 0.030, 90] },
    { hour: 12, top: [0.905, 0.028, 225], bottom: [0.955, 0.010, 200], glow: [0.98, 0.020, 95] },
    { hour: 15, top: [0.905, 0.026, 215], bottom: [0.950, 0.012, 70], glow: [0.98, 0.030, 80] },
    { hour: 18, top: [0.875, 0.030, 330], bottom: [0.930, 0.028, 45], glow: [0.95, 0.040, 50] },
    { hour: 21, top: [0.820, 0.030, 285], bottom: [0.875, 0.024, 300], glow: [0.95, 0.010, 270] },
];

const smoothstep = (t: number) => t * t * (3 - 2 * t);

function lerpHue(a: number, b: number, t: number): number {
    const d = ((b - a + 540) % 360) - 180;
    return (a + d * t + 360) % 360;
}

function mix(a: Oklch, b: Oklch, t: number): Oklch {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, lerpHue(a[2], b[2], t)];
}

const css = ([l, c, h]: Oklch, alpha = 1) =>
    `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)}${alpha < 1 ? ` / ${alpha}` : ''})`;

export interface SkyPalette {
    top: string;
    bottom: string;
    glow: string;
    glowSoft: string;
    /** 0（白昼）→ 1（深夜），用于星点等夜间元素 */
    night: number;
}

/** 0–24 → 插值后的天空色（数值形式，供 Canvas 分享卡片使用） */
export function getSkyColors(orbitHour: number): { top: Oklch; bottom: Oklch; glow: Oklch; night: number } {
    const h = ((orbitHour % 24) + 24) % 24;
    let i = KEYFRAMES.length - 1;
    for (let k = 0; k < KEYFRAMES.length; k++) {
        if (KEYFRAMES[k].hour <= h) i = k;
    }
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[(i + 1) % KEYFRAMES.length];
    const span = ((b.hour - a.hour + 24) % 24) || 24;
    const t = smoothstep(((h - a.hour + 24) % 24) / span);
    return {
        top: mix(a.top, b.top, t),
        bottom: mix(a.bottom, b.bottom, t),
        glow: mix(a.glow, b.glow, t),
        night: getNightness(h),
    };
}

/** 0–24 → 插值后的天空色（CSS 字符串） */
export function getSkyPalette(orbitHour: number): SkyPalette {
    const c = getSkyColors(orbitHour);
    return {
        top: css(c.top),
        bottom: css(c.bottom),
        glow: css(c.glow, 0.38),
        glowSoft: css(c.glow, 0),
        night: c.night,
    };
}

function getNightness(h: number): number {
    // 19:00 渐入夜，5:00 渐出夜
    if (h >= 20 || h < 4) return 1;
    if (h >= 18) return (h - 18) / 2;
    if (h < 6) return 1 - (h - 4) / 2;
    return 0;
}

export function isDaytime(orbitHour: number): boolean {
    return orbitHour >= 6 && orbitHour < 18;
}

/**
 * 天体光晕在天空中的位置（百分比）
 * 白昼：日出在左地平线 → 正午最高 → 日落右地平线；夜晚同理给月亮。
 */
export function calculateCelestialPosition(orbitHour: number): { left: number; top: number } {
    const progress = isDaytime(orbitHour)
        ? (orbitHour - 6) / 12
        : orbitHour >= 18
            ? (orbitHour - 18) / 12
            : (orbitHour + 6) / 12;

    return {
        left: 8 + progress * 84,
        top: 62 - Math.sin(progress * Math.PI) * 50,
    };
}
