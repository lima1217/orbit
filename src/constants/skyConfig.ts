/**
 * Sky Configuration Constants
 * Soft 「晨曦星海」 palette — matched to IntroSequence luminance & chroma
 */

// Time period boundaries (in Orbit hours)
export const TIME_PERIODS = {
    DAWN: { start: 5, end: 7 },
    DAY: { start: 7, end: 17 },
    DUSK: { start: 17, end: 19 },
    NIGHT: { start: 19, end: 5 },
} as const;

/**
 * Soft sky washes (oklch) — same key as Intro:
 * L ≈ 0.82–0.88, chroma low, mint ↔ warm blush family.
 * Avoid high-sat soul-gold / lavender-deep glare.
 */
export const SKY_GRADIENTS = {
    dawn: 'linear-gradient(180deg, oklch(0.875 0.040 40) 0%, oklch(0.865 0.035 70) 38%, oklch(0.850 0.038 200) 100%)',
    day: 'linear-gradient(180deg, oklch(0.860 0.038 195) 0%, oklch(0.875 0.025 55) 48%, oklch(0.855 0.036 22) 100%)',
    dusk: 'linear-gradient(180deg, oklch(0.835 0.042 25) 0%, oklch(0.850 0.038 55) 42%, oklch(0.820 0.035 295) 100%)',
    night: 'linear-gradient(180deg, oklch(0.780 0.032 275) 0%, oklch(0.800 0.030 240) 45%, oklch(0.825 0.028 30) 100%)',
} as const;

// Celestial body positioning
// Jobs: "天体绝不能侵入内容区域 - 这是不可协商的设计边界"
export const CELESTIAL_POSITION = {
    horizontalRange: 70,     // percentage of screen width (inset from edges)
    horizontalOffset: 15,    // starting offset — keeps glow clear of viewport edges
    verticalBase: 18,        // base vertical position (%) - 上移避免与城市名重叠
    verticalAmplitude: 12,   // arc height (%) - 减小振幅保持在安全区域
    safeZoneTop: 8,          // minimum top position (%) — clears notch / status bar
} as const;

// Celestial body styles — material discs, not lamps (mirrors Intro orb)
export const CELESTIAL_STYLES = {
    sun: {
        gradient: 'linear-gradient(155deg, oklch(0.88 0.055 70), oklch(0.84 0.065 45), oklch(0.86 0.050 25))',
        shadow: '0 10px 28px oklch(0.40 0.04 50 / 0.12), 0 0 36px oklch(0.85 0.06 70 / 0.18)',
    },
    moon: {
        gradient: 'linear-gradient(155deg, oklch(0.90 0.018 280), oklch(0.86 0.035 296), oklch(0.84 0.040 30))',
        shadow: '0 10px 28px oklch(0.40 0.03 280 / 0.12), 0 0 32px oklch(0.80 0.04 296 / 0.16)',
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
