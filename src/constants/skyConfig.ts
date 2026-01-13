/**
 * Sky Configuration Constants
 * Semantic constants for sky gradients and time periods
 */

// Time period boundaries (in Orbit hours)
export const TIME_PERIODS = {
    DAWN: { start: 5, end: 7 },
    DAY: { start: 7, end: 17 },
    DUSK: { start: 17, end: 19 },
    NIGHT: { start: 19, end: 5 },
} as const;

// Sky gradient configurations
export const SKY_GRADIENTS = {
    dawn: 'from-blush-soft via-soul-gold/30 to-sky-blue/50',
    day: 'from-sky-mint via-sky-blue/40 to-lavender-soft/30',
    dusk: 'from-blush-rose/50 via-soul-gold/40 to-lavender-deep/30',
    night: 'from-lavender-deep/40 via-sky-deep/50 to-blush-deep/30',
} as const;

// Celestial body positioning
// Jobs: "天体绝不能侵入内容区域 - 这是不可协商的设计边界"
export const CELESTIAL_POSITION = {
    horizontalRange: 80,     // percentage of screen width
    horizontalOffset: 10,    // starting offset
    verticalBase: 18,        // base vertical position (%) - 上移避免与城市名重叠
    verticalAmplitude: 12,   // arc height (%) - 减小振幅保持在安全区域
    safeZoneTop: 5,          // minimum top position (%) - 安全边距
} as const;

// Celestial body styles
export const CELESTIAL_STYLES = {
    sun: {
        gradient: 'bg-gradient-to-br from-soul-gold to-blush-soft',
        shadow: 'shadow-[0_0_60px_rgba(252,211,77,0.6)]',
    },
    moon: {
        gradient: 'bg-gradient-to-br from-lavender-soft to-white',
        shadow: 'shadow-[0_0_40px_rgba(220,208,255,0.5)]',
    },
} as const;

/**
 * Get sky gradient based on current orbit hour
 */
export function getSkyGradient(orbitHour: number): string {
    const { DAWN, DAY, DUSK } = TIME_PERIODS;

    if (orbitHour >= DAWN.start && orbitHour < DAWN.end) return SKY_GRADIENTS.dawn;
    if (orbitHour >= DAY.start && orbitHour < DAY.end) return SKY_GRADIENTS.day;
    if (orbitHour >= DUSK.start && orbitHour < DUSK.end) return SKY_GRADIENTS.dusk;
    return SKY_GRADIENTS.night;
}

/**
 * Check if current time is daytime
 */
export function isDaytime(orbitHour: number): boolean {
    return orbitHour >= 6 && orbitHour < 18;
}

/**
 * Calculate celestial body position
 * Jobs: "天体轨迹必须完全避开内容区域 - 这是设计的铁律"
 */
export function calculateCelestialPosition(orbitHour: number): { left: number; top: number } {
    const { horizontalRange, horizontalOffset, verticalBase, verticalAmplitude, safeZoneTop } = CELESTIAL_POSITION;
    const daytime = isDaytime(orbitHour);

    const progress = daytime
        ? (orbitHour - 6) / 12
        : orbitHour >= 18
            ? (orbitHour - 18) / 12
            : (orbitHour + 6) / 12;

    // 计算垂直位置（弧形轨迹）
    // 最高点在正午/午夜，两端在日出/日落
    const rawTop = verticalBase - Math.sin(progress * Math.PI) * verticalAmplitude;

    // 安全边界保护：确保永远不会低于安全区域
    const top = Math.max(safeZoneTop, rawTop);

    return {
        left: horizontalOffset + progress * horizontalRange,
        top,
    };
}
