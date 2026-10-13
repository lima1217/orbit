import React from 'react';
import { getSkyPalette, calculateCelestialPosition } from '../constants/skyConfig';

interface SkyBackgroundProps {
    /** 天空所对应的当地小时（0–24） */
    orbitHour: number;
}

/** 固定的星点：位置 %、大小 px、不透明度 */
const STARS: Array<[number, number, number, number]> = [
    [12, 9, 2, 0.9], [27, 18, 1.5, 0.6], [44, 7, 2, 0.8], [63, 14, 1.5, 0.5],
    [81, 8, 2, 0.9], [90, 22, 1.5, 0.6], [8, 30, 1.5, 0.5], [36, 27, 1.5, 0.7],
    [72, 31, 2, 0.6], [55, 24, 1.5, 0.5], [19, 42, 1.5, 0.4], [86, 40, 1.5, 0.5],
];

/** 纸纹：feTurbulence 噪点，静态平铺 */
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0 0.25  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'
)}")`;

/**
 * SkyBackground — 全局常驻的天空。
 * 所有页面共用同一片天，切换页面时只有内容在变，世界是连续的。
 */
export const SkyBackground: React.FC<SkyBackgroundProps> = ({ orbitHour }) => {
    const palette = getSkyPalette(orbitHour);
    const celestial = calculateCelestialPosition(orbitHour);

    return (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            {/* Base wash */}
            <div
                className="absolute inset-0 transition-[background] duration-[1200ms] ease-out"
                style={{
                    background: `linear-gradient(180deg, ${palette.top} 0%, ${palette.bottom} 100%)`,
                }}
            />

            {/* Celestial halo — 一团柔光，沿天穹弧线移动 */}
            <div
                className="absolute inset-0 transition-[background] duration-[1200ms] ease-out"
                style={{
                    background: `radial-gradient(circle at ${celestial.left}% ${celestial.top}%, ${palette.glow} 0%, ${palette.glowSoft} 55%)`,
                }}
            />

            {/* Horizon mist — 底部留白，托住控件 */}
            <div
                className="absolute inset-x-0 bottom-0 h-1/3"
                style={{
                    background: 'linear-gradient(to top, oklch(0.99 0.008 75 / 0.45), transparent)',
                }}
            />

            {/* Stars — 只在夜里浮现；静止，不闪烁 */}
            <div
                className="absolute inset-0 transition-opacity duration-[2000ms]"
                style={{ opacity: palette.night * 0.7 }}
            >
                {STARS.map(([x, y, size, alpha]) => (
                    <span
                        key={`${x}-${y}`}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            width: size,
                            height: size,
                            opacity: alpha,
                            boxShadow: '0 0 6px oklch(1 0 0 / 0.6)',
                        }}
                    />
                ))}
            </div>

            {/* Paper grain — 极淡的纸纹，消除渐变色带，让背景像纸而不是屏幕 */}
            <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply"
                style={{ backgroundImage: GRAIN, backgroundSize: '160px 160px', opacity: 0.05 }}
            />
        </div>
    );
};
