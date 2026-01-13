import React from 'react';
import { motion } from 'framer-motion';
import { getSkyGradient, isDaytime, calculateCelestialPosition, CELESTIAL_STYLES } from '../constants/skyConfig';
import { DURATION, BREATHING, EASING } from '../constants/animationConfig';

interface SkyBackgroundProps {
    orbitHour: number;
    onCelestialClick?: () => void;
    hideCelestial?: boolean; // Hide celestial body during intro transition
}

/**
 * Ambient cloud effect with organic breathing animation
 * Creates a subtle, living atmosphere that complements the celestial body
 */
const AmbientCloud: React.FC<{
    position: 'top-left' | 'bottom-right';
}> = ({ position }) => {
    const configs = {
        'top-left': {
            className: 'top-20 left-10 w-32 h-32',
            background: 'rgba(255, 255, 255, 0.15)',
            blur: '60px',
            duration: 7,
            delay: 0,
        },
        'bottom-right': {
            className: 'bottom-40 right-10 w-40 h-40',
            background: 'rgba(255, 182, 193, 0.2)',
            blur: '80px',
            duration: 8,
            delay: 1.5,
        },
    };

    const config = configs[position];

    return (
        <motion.div
            className={`absolute rounded-full ${config.className}`}
            style={{
                background: config.background,
                filter: `blur(${config.blur})`,
            }}
            animate={{
                opacity: BREATHING.ambient.opacity,
                scale: BREATHING.ambient.scale,
                x: [0, 5, 0],
                y: [0, -3, 0],
            }}
            transition={{
                duration: BREATHING.ambient.duration,
                repeat: Infinity,
                ease: EASING.breathing,
                delay: config.delay,
            }}
            aria-hidden="true"
        />
    );
};

/**
 * Celestial body (sun or moon) with living, breathing effects
 * Bridges the gap between intro's magical feel and daily use
 */
const CelestialBody: React.FC<{ orbitHour: number; onClick?: () => void }> = ({ orbitHour, onClick }) => {
    const daytime = isDaytime(orbitHour);
    const position = calculateCelestialPosition(orbitHour);

    // Breathing animation - 让天体真正"活着"
    // Jobs: "生命感需要被感知到才有意义"
    const breathingAnimation = {
        scale: BREATHING.celestial.scale,
        opacity: BREATHING.celestial.opacity,
    };

    const breathingTransition = {
        duration: BREATHING.celestial.duration,
        repeat: Infinity,
        ease: EASING.breathing,
    };

    return (
        <motion.button
            className="absolute cursor-pointer z-20"
            style={{
                left: `${position.left}%`,
                top: `${position.top}%`,
                transition: `left ${DURATION.glacial}s ease-in-out, top ${DURATION.glacial}s ease-in-out`
            }}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            {/* Container with all layers */}
            <motion.div
                className="relative"
                animate={breathingAnimation}
                transition={breathingTransition}
            >
                {daytime ? (
                    // ========== SUN - Warm Living Glow ==========
                    <>
                        {/* Outer atmosphere - very subtle warm haze */}
                        <motion.div
                            className="absolute -inset-8 rounded-full blur-[30px]"
                            style={{
                                background: 'radial-gradient(circle, rgba(252,211,77,0.15) 20%, rgba(255,182,193,0.08) 50%, transparent 70%)'
                            }}
                            animate={{
                                opacity: BREATHING.glow.opacity,
                                scale: BREATHING.glow.scale,
                            }}
                            transition={{
                                duration: BREATHING.glow.duration,
                                repeat: Infinity,
                                ease: EASING.breathing,
                            }}
                        />

                        {/* Middle glow ring */}
                        <motion.div
                            className="absolute -inset-4 rounded-full blur-[15px]"
                            style={{
                                background: 'radial-gradient(circle, rgba(252,211,77,0.25) 30%, rgba(255,255,255,0.1) 60%, transparent 80%)'
                            }}
                            animate={{
                                opacity: [0.65, 0.92, 0.65],
                            }}
                            transition={{
                                duration: BREATHING.glow.duration * 0.7,
                                repeat: Infinity,
                                ease: EASING.breathing,
                                delay: 0.3,
                            }}
                        />

                        {/* Core sun body */}
                        <div
                            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-soul-gold via-amber-300 to-blush-soft"
                            style={{
                                boxShadow: '0 0 40px rgba(252,211,77,0.5), 0 0 80px rgba(252,211,77,0.2), inset -2px -2px 8px rgba(255,255,255,0.3)'
                            }}
                        >
                            {/* Inner highlight */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
                        </div>
                    </>
                ) : (
                    // ========== MOON - Ethereal Zen Sphere ==========
                    <>
                        {/* Outer atmosphere - soft lavender haze */}
                        <motion.div
                            className="absolute -inset-8 rounded-full blur-[30px]"
                            style={{
                                background: 'radial-gradient(circle, rgba(167,139,250,0.12) 20%, rgba(196,181,253,0.06) 50%, transparent 70%)'
                            }}
                            animate={{
                                opacity: BREATHING.glow.opacity,
                                scale: BREATHING.glow.scale,
                            }}
                            transition={{
                                duration: BREATHING.glow.duration,
                                repeat: Infinity,
                                ease: EASING.breathing,
                            }}
                        />

                        {/* Middle glow ring */}
                        <motion.div
                            className="absolute -inset-4 rounded-full blur-[15px]"
                            style={{
                                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 30%, rgba(167,139,250,0.1) 60%, transparent 80%)'
                            }}
                            animate={{
                                opacity: [0.55, 0.85, 0.55],
                            }}
                            transition={{
                                duration: BREATHING.glow.duration * 0.7,
                                repeat: Infinity,
                                ease: EASING.breathing,
                                delay: 0.3,
                            }}
                        />

                        {/* Core moon body */}
                        <div
                            className="relative w-16 h-16 rounded-full"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.9) 30%, rgba(196,181,253,0.5) 100%)',
                                boxShadow: '0 0 30px rgba(167, 139, 250, 0.25), 0 0 60px rgba(167, 139, 250, 0.1), inset -3px -3px 8px rgba(139, 92, 246, 0.1), inset 2px 2px 6px rgba(255, 255, 255, 0.9)'
                            }}
                        >
                            {/* Inner highlight - pearly sheen */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-white/20 to-transparent" />

                            {/* Subtle texture hint */}
                            <div
                                className="absolute inset-0 rounded-full opacity-20"
                                style={{
                                    background: 'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.15) 0%, transparent 30%)'
                                }}
                            />
                        </div>
                    </>
                )}
            </motion.div>
        </motion.button>
    );
};

/**
 * SkyBackground Component
 * Renders the dynamic sky with gradient, celestial body, and ambient effects
 */
export const SkyBackground: React.FC<SkyBackgroundProps> = ({ orbitHour, onCelestialClick, hideCelestial = false }) => {
    const gradient = getSkyGradient(orbitHour);

    return (
        <>
            {/* Sky gradient */}
            <div
                className={`absolute inset-0 bg-gradient-to-b ${gradient} transition-all duration-[3000ms]`}
                aria-hidden="true"
            />

            {/* Ambient clouds */}
            <AmbientCloud position="top-left" />
            <AmbientCloud position="bottom-right" />

            {/* Sun or Moon - clickable to open settings, hidden during intro transition */}
            <motion.div
                initial={{ opacity: hideCelestial ? 0 : 1 }}
                animate={{ opacity: hideCelestial ? 0 : 1 }}
                transition={{
                    duration: hideCelestial ? 0 : 1.2, // 淡入时间 1.2 秒，与 IntroSequence 淡出交叉
                    ease: [0.22, 0.68, 0.35, 1.0],
                    delay: hideCelestial ? 0 : 0.3 // 稍微延迟开始，让淡出先进行一点
                }}
            >
                <CelestialBody orbitHour={orbitHour} onClick={onCelestialClick} />
            </motion.div>
        </>
    );
};
