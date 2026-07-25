import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { getSkyGradient, isDaytime, calculateCelestialPosition, CELESTIAL_STYLES } from '../constants/skyConfig';
import { DURATION, BREATHING, EASING } from '../constants/animationConfig';

interface SkyBackgroundProps {
    orbitHour: number;
    onCelestialClick?: () => void;
    hideCelestial?: boolean; // Hide celestial body during intro transition
}

/**
 * Ambient cloud — soft tint blobs matching Intro atmosphere
 */
const AMBIENT_CLOUD_CONFIG = {
    'top-left': {
        className: 'top-16 left-8 w-36 h-36',
        background: 'oklch(0.90 0.02 55 / 0.28)',
        blur: '70px',
        delay: 0,
    },
    'bottom-right': {
        className: 'bottom-36 right-8 w-44 h-44',
        background: 'oklch(0.86 0.035 20 / 0.22)',
        blur: '90px',
        delay: 1.5,
    },
} as const;

const AmbientCloud: React.FC<{
    position: 'top-left' | 'bottom-right';
}> = ({ position }) => {
    const prefersReducedMotion = useReducedMotion();
    const config = AMBIENT_CLOUD_CONFIG[position];

    return (
        <motion.div
            className={`absolute rounded-full ${config.className}`}
            style={{
                background: config.background,
                filter: `blur(${config.blur})`,
            }}
            animate={
                prefersReducedMotion
                    ? { opacity: 0.4, scale: 1 }
                    : {
                        opacity: [...BREATHING.ambient.opacity],
                        scale: [...BREATHING.ambient.scale],
                        x: [0, 5, 0],
                        y: [0, -3, 0],
                    }
            }
            transition={
                prefersReducedMotion
                    ? undefined
                    : {
                        duration: BREATHING.ambient.duration,
                        repeat: Infinity,
                        ease: EASING.breathing,
                        delay: config.delay,
                    }
            }
            aria-hidden="true"
        />
    );
};

type CelestialKind = 'sun' | 'moon';

/**
 * Celestial body — warm material disc (same language as Intro enter orb)
 * Sun ↔ moon crossfades at the day boundary; position still glides glacially.
 */
const CelestialBody: React.FC<{
    orbitHour: number;
    onClick?: () => void;
    hidden?: boolean;
}> = ({ orbitHour, onClick, hidden = false }) => {
    const prefersReducedMotion = useReducedMotion();
    const daytime = isDaytime(orbitHour);
    const kind: CelestialKind = daytime ? 'sun' : 'moon';
    const position = calculateCelestialPosition(orbitHour);

    const materialTransition = prefersReducedMotion
        ? { duration: DURATION.fast }
        : { duration: DURATION.normal, ease: EASING.breathing };

    const materialInitial = prefersReducedMotion
        ? { opacity: 0 }
        : { opacity: 0, scale: 0.97 };
    const materialAnimate = prefersReducedMotion
        ? { opacity: 1 }
        : { opacity: 1, scale: 1 };
    const materialExit = prefersReducedMotion
        ? { opacity: 0, transition: { duration: DURATION.fast } }
        : {
            opacity: 0,
            scale: 0.97,
            transition: { duration: DURATION.normal, ease: EASING.breathing },
        };

    return (
        <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{
                left: `${position.left}%`,
                top: `max(${position.top}%, calc(env(safe-area-inset-top, 0px) + 12px))`,
                transition: prefersReducedMotion
                    ? undefined
                    : `left ${DURATION.glacial}s ease-in-out, top ${DURATION.glacial}s ease-in-out`,
                pointerEvents: hidden ? 'none' : undefined,
            }}
        >
            <motion.button
                type="button"
                className="relative cursor-pointer min-w-11 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2"
                onClick={onClick}
                disabled={hidden || !onClick}
                tabIndex={hidden ? -1 : 0}
                aria-label="返回开场页"
                whileHover={hidden ? undefined : { scale: 1.06 }}
                whileTap={hidden ? undefined : { scale: 0.96 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            >
                <motion.div
                    className="relative w-14 h-14"
                    animate={
                        prefersReducedMotion
                            ? undefined
                            : {
                                scale: [...BREATHING.celestial.scale],
                                opacity: [...BREATHING.celestial.opacity],
                            }
                    }
                    transition={{
                        duration: BREATHING.celestial.duration,
                        repeat: Infinity,
                        ease: EASING.breathing,
                    }}
                >
                    <AnimatePresence initial={false}>
                        <motion.div
                            key={kind}
                            initial={materialInitial}
                            animate={materialAnimate}
                            exit={materialExit}
                            transition={materialTransition}
                            className="absolute inset-0"
                            aria-hidden="true"
                        >
                            {/* Soft outer veil — atmosphere, not bloom glare */}
                            <motion.div
                                className="absolute -inset-6 rounded-full blur-[28px] pointer-events-none"
                                style={{
                                    background:
                                        kind === 'sun'
                                            ? 'radial-gradient(circle, oklch(0.86 0.05 55 / 0.22) 0%, transparent 70%)'
                                            : 'radial-gradient(circle, oklch(0.82 0.04 296 / 0.18) 0%, transparent 70%)',
                                }}
                                animate={
                                    prefersReducedMotion
                                        ? { opacity: 0.55 }
                                        : {
                                            opacity: [0.45, 0.65, 0.45],
                                            scale: [...BREATHING.glow.scale],
                                        }
                                }
                                transition={{
                                    duration: BREATHING.glow.duration,
                                    repeat: Infinity,
                                    ease: EASING.breathing,
                                }}
                            />

                            {/* Material core */}
                            <div
                                className="relative w-14 h-14 rounded-full"
                                style={{
                                    background: CELESTIAL_STYLES[kind].gradient,
                                    boxShadow: `inset 0 1px 0 oklch(1 0 0 / 0.35), inset 0 -2px 6px oklch(0.45 0.04 40 / 0.08), ${CELESTIAL_STYLES[kind].shadow}`,
                                }}
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </motion.button>
        </div>
    );
};

/**
 * SkyBackground — soft washes continuous with IntroSequence
 */
export const SkyBackground: React.FC<SkyBackgroundProps> = ({ orbitHour, onCelestialClick, hideCelestial = false }) => {
    const gradient = getSkyGradient(orbitHour);

    return (
        <>
            {/* Soft base so transitions never flash pure cream/white */}
            <div
                className="absolute inset-0"
                style={{ background: 'oklch(0.855 0.028 50)' }}
                aria-hidden="true"
            />

            {/* Sky gradient */}
            <div
                className="absolute inset-0 transition-[background] duration-[3000ms] ease-out"
                style={{ background: gradient }}
                aria-hidden="true"
            />

            {/* Soft vignette — same rest-the-eyes treatment as Intro */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 70% 60% at 50% 42%, transparent 35%, oklch(0.55 0.03 70 / 0.14) 100%)',
                }}
                aria-hidden="true"
            />

            {/* Ambient clouds */}
            <AmbientCloud position="top-left" />
            <AmbientCloud position="bottom-right" />

            {/* Sun or Moon */}
            <motion.div
                initial={{ opacity: hideCelestial ? 0 : 1 }}
                animate={{ opacity: hideCelestial ? 0 : 1 }}
                transition={{
                    duration: hideCelestial ? 0 : 1.2,
                    ease: [0.22, 0.68, 0.35, 1.0],
                    delay: hideCelestial ? 0 : 0.3,
                }}
            >
                <CelestialBody
                    orbitHour={orbitHour}
                    onClick={onCelestialClick}
                    hidden={hideCelestial}
                />
            </motion.div>
        </>
    );
};
