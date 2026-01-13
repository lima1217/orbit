import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLANETS, Planet } from '../constants/planets';
import { PlanetTextures } from './PlanetTextures';

interface CalibrationPageProps {
    onComplete: (selectedPlanet: Planet, customPeriod?: number) => void;
}

export const CalibrationPage: React.FC<CalibrationPageProps> = ({ onComplete }) => {
    const [selectedPlanetId, setSelectedPlanetId] = useState<string>('earth');
    const [customPeriod, setCustomPeriod] = useState<number>(30);
    const [isExiting, setIsExiting] = useState(false);

    // Parallax state
    const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedPlanet = PLANETS.find(p => p.id === selectedPlanetId) || PLANETS.find(p => p.id === 'earth')!;

    // Handle parallax mouse/touch movement
    const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        let clientX: number, clientY: number;
        if ('touches' in e) {
            clientX = e.touches[0].clientX - rect.left;
            clientY = e.touches[0].clientY - rect.top;
        } else {
            clientX = e.clientX - rect.left;
            clientY = e.clientY - rect.top;
        }

        // Calculate offset from center (-1 to 1)
        const offsetX = (clientX - centerX) / centerX;
        const offsetY = (clientY - centerY) / centerY;

        setParallaxOffset({ x: offsetX, y: offsetY });
    }, []);

    const handleMouseLeave = useCallback(() => {
        // Smoothly return to center
        setParallaxOffset({ x: 0, y: 0 });
    }, []);

    const handleConfirm = () => {
        setIsExiting(true);
        setTimeout(() => {
            onComplete(selectedPlanet, selectedPlanetId === 'custom' ? customPeriod : undefined);
        }, 1000);
    };

    // Depth-based styles
    const getDepthStyles = (depth: 'far' | 'mid' | 'near') => {
        switch (depth) {
            case 'far':
                return { blur: 1, opacity: 0.75, parallaxMultiplier: 0.015 };
            case 'mid':
                return { blur: 0, opacity: 0.9, parallaxMultiplier: 0.03 };
            case 'near':
                return { blur: 0, opacity: 1, parallaxMultiplier: 0.05 };
        }
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 0.8 }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-dawn-cream via-sky-mint/30 to-blush-soft/30"
        >
            <PlanetTextures />

            {/* Ambient Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-soul-gold/15 blur-[120px] animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-lavender-soft/30 blur-[120px] animate-pulse-slow pointer-events-none" />
            <div className="absolute top-[30%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blush-soft/25 blur-[100px] pointer-events-none" />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="absolute top-12 text-center z-20"
            >
                <h2 className="text-headline text-gray-700/80 uppercase tracking-widest">
                    Calibrate Your Orbit
                </h2>
                <p className="mt-3 text-caption text-gray-500/80 tracking-wide max-w-md mx-auto px-4">
                    Choose a rhythm that resonates with your soul's natural tempo
                </p>
            </motion.div>

            {/* Planet Field - Floating Layout */}
            <div className="relative w-full h-[55vh] mt-16">
                {PLANETS.map((planet, index) => {
                    const isSelected = planet.id === selectedPlanetId;
                    const depthStyles = getDepthStyles(planet.depth);

                    // Calculate parallax offset based on depth
                    const parallaxX = parallaxOffset.x * depthStyles.parallaxMultiplier * 100;
                    const parallaxY = parallaxOffset.y * depthStyles.parallaxMultiplier * 100;

                    // Base size in pixels
                    const baseSize = 64;
                    const actualSize = baseSize * planet.size;

                    const hasRing = ['neptune', 'eris', 'custom'].includes(planet.id);

                    return (
                        <motion.button
                            key={planet.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: isSelected ? 1 : (isExiting && !isSelected ? 0 : depthStyles.opacity),
                                scale: isExiting && isSelected ? 2 : (isSelected ? 1.15 : 1),
                                x: isExiting && isSelected ? `calc(50vw - ${planet.position.x}% - ${actualSize / 2}px)` : parallaxX,
                                y: isExiting && isSelected ? `calc(50vh - ${planet.position.y}% - ${actualSize / 2}px)` : parallaxY,
                                filter: `blur(${depthStyles.blur}px)`
                            }}
                            transition={{
                                duration: isExiting ? 0.8 : 0.3,
                                ease: 'easeOut'
                            }}
                            onClick={() => setSelectedPlanetId(planet.id)}
                            className="absolute cursor-pointer group"
                            style={{
                                left: `${planet.position.x}%`,
                                top: `${planet.position.y}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: isSelected ? 50 : (planet.depth === 'near' ? 30 : planet.depth === 'mid' ? 20 : 10),
                            }}
                        >
                            {/* Floating animation wrapper */}
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{
                                    duration: 3.5 + index * 0.7,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            >
                                {/* Planet Body */}
                                <div
                                    className="relative flex items-center justify-center"
                                    style={{ width: actualSize, height: actualSize }}
                                >
                                    {/* Selection ring */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 1.3, opacity: 0 }}
                                                className="absolute inset-[-10px] rounded-full border-2 border-soul-gold/70"
                                                style={{
                                                    boxShadow: '0 0 25px rgba(252, 211, 77, 0.4), 0 0 50px rgba(252, 211, 77, 0.2)'
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Planet orb */}
                                    <div
                                        className="w-full h-full rounded-full relative overflow-hidden transition-shadow duration-300"
                                        style={{
                                            background: planet.color,
                                            boxShadow: isSelected
                                                ? `0 0 35px ${planet.color}80, 0 0 70px ${planet.color}40`
                                                : `0 0 20px ${planet.color}50`,
                                        }}
                                    >
                                        {/* 3D lighting effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-black/25" />
                                        <div
                                            className="absolute rounded-full bg-white/50 blur-sm"
                                            style={{
                                                width: actualSize * 0.2,
                                                height: actualSize * 0.2,
                                                top: actualSize * 0.12,
                                                left: actualSize * 0.18
                                            }}
                                        />
                                    </div>

                                    {/* Rings for certain planets */}
                                    {hasRing && (
                                        <>
                                            {/* Back ring */}
                                            <div
                                                className="absolute rounded-full pointer-events-none"
                                                style={{
                                                    width: actualSize * 1.5,
                                                    height: actualSize * 0.5,
                                                    border: `3px solid ${planet.color}`,
                                                    borderTopColor: 'rgba(255,255,255,0.15)',
                                                    transform: 'rotate(-18deg)',
                                                    zIndex: -1,
                                                    opacity: 0.6,
                                                }}
                                            />
                                            {/* Front ring */}
                                            <div
                                                className="absolute rounded-full pointer-events-none"
                                                style={{
                                                    width: actualSize * 1.5,
                                                    height: actualSize * 0.5,
                                                    border: `3px solid ${planet.color}`,
                                                    borderTopColor: 'transparent',
                                                    borderLeftColor: 'transparent',
                                                    borderRightColor: 'transparent',
                                                    transform: 'rotate(-18deg)',
                                                    zIndex: 5,
                                                    opacity: 0.85,
                                                }}
                                            />
                                        </>
                                    )}
                                </div>

                                {/* Planet Label */}
                                <motion.div
                                    className="mt-2 text-center whitespace-nowrap"
                                    animate={{ opacity: isSelected ? 1 : 0.7 }}
                                >
                                    <span
                                        className="font-medium text-sm transition-colors duration-300"
                                        style={{ color: isSelected ? planet.color : 'rgba(100,100,100,0.8)' }}
                                    >
                                        {planet.name}
                                    </span>
                                    <span className="block text-[10px] text-gray-400">
                                        {planet.period}h
                                    </span>
                                </motion.div>
                            </motion.div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Selected Planet Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? 50 : 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute bottom-28 w-[90%] max-w-md"
            >
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_40px_rgba(200,180,190,0.25)] border border-white/60">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedPlanetId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <div
                                    className="w-5 h-5 rounded-full"
                                    style={{
                                        background: selectedPlanet.color,
                                        boxShadow: `0 0 15px ${selectedPlanet.color}60`
                                    }}
                                />
                                <h3 className="text-title text-gray-700">
                                    {selectedPlanet.name}
                                </h3>
                                <span className="text-sm text-gray-400 font-mono">
                                    {selectedPlanet.period}h
                                </span>
                            </div>
                            <p className="text-caption text-gray-500">
                                {selectedPlanet.description}
                            </p>

                            {/* Custom Period Slider */}
                            {selectedPlanetId === 'custom' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 pt-4 border-t border-gray-200/50"
                                >
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                        <span>Your Orbit Duration</span>
                                        <span className="font-mono font-bold text-soul-gold">{customPeriod}h</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="8"
                                        max="40"
                                        step="0.5"
                                        value={customPeriod}
                                        onChange={(e) => setCustomPeriod(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gradient-to-r from-blush-soft via-lavender-soft to-sky-blue rounded-full appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                        <span>8h (Ultra Fast)</span>
                                        <span>40h (Deep Slow)</span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Confirm Button */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? 30 : 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                onClick={handleConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="absolute bottom-8 px-10 py-3.5 rounded-full font-medium tracking-wider text-white
                    bg-gradient-to-r from-soul-gold via-blush-rose to-lavender-deep
                    shadow-[0_4px_20px_rgba(252,211,77,0.3)]
                    hover:shadow-[0_6px_30px_rgba(252,211,77,0.4)]
                    transition-shadow duration-300"
            >
                Begin My Orbit
            </motion.button>
        </motion.div>
    );
};

export default CalibrationPage;
