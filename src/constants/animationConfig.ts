/**
 * Animation Configuration Constants
 * Unified animation timing system
 */

// Animation durations (in seconds)
export const DURATION = {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    glacial: 5,
    ambient: 3,     // For slow atmospheric changes
} as const;

// Stagger delays for sequential animations
export const STAGGER = {
    fast: 0.1,
    normal: 0.2,
    slow: 0.3,
} as const;

// Base delays for page entrance
// Jobs: "All primary content should appear as one unified moment"
export const ENTRANCE_DELAYS = {
    header: 0.3,
    primary: 0.3,      // Same as header - city and time appear together
    secondary: 0.5,
    tertiary: 0.7,
    footer: 0.8,
} as const;

// Easing curves
export const EASING = {
    smooth: [0.4, 0, 0.2, 1],      // Standard ease
    bounce: [0.68, -0.55, 0.265, 1.55],
    enter: [0, 0, 0.2, 1],         // ease-out
    out: [0.23, 1, 0.32, 1],       // strong ease-out for UI enter/exit
    exit: [0.4, 0, 1, 1],          // ease-in
    breathing: [0.22, 0.68, 0.35, 1.0],  // Jobs: 呼吸般的有机缓动
} as const;

// Breathing animation - 让元素真正"活着"
// Jobs: "生命感需要被感知到才有意义"
export const BREATHING = {
    // 天体呼吸 - 缓慢而有机
    celestial: {
        scale: [1, 1.06, 1],        // 6% 的缩放，足以被感知
        opacity: [1, 0.88, 1],       // 12% 的透明度变化
        duration: 5,                 // 5秒一个呼吸周期，像真正的呼吸
    },
    // 光晕呼吸 - 更柔和的脉动
    glow: {
        opacity: [0.6, 0.85, 0.6],   // 光晕的透明度变化
        scale: [1, 1.08, 1],         // 光晕可以膨胀更多
        duration: 6,                 // 稍慢于核心体，产生层次感
    },
    // 氛围云呼吸 - 最慢最柔和
    ambient: {
        opacity: [0.3, 0.5, 0.3],
        scale: [1, 1.05, 1],
        duration: 8,
    },
} as const;

// Common animation variants
export const FADE_IN = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
};

export const FADE_UP = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
};

export const FADE_DOWN = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
};

export const SCALE_IN = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
};

/**
 * Create entrance animation with stagger
 */
export function createEntranceAnimation(index: number, baseDelay = 0.3) {
    return {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: baseDelay + index * STAGGER.normal },
    };
}
