import React, { useMemo } from 'react';

interface OrbitVisualizerProps {
    progress: number;
    phase: string;
}

/**
 * OrbitVisualizer (Starry Night Edition)
 * A vortex of time rather than a clean clock.
 */
export function OrbitVisualizer({ progress, phase }: OrbitVisualizerProps) {
    const radius = 35;
    const center = 50;

    const angleDeg = progress * 360 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);

    return (
        <div style={{
            position: 'relative',
            width: '320px',
            height: '320px',
            margin: '2rem auto'
        }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                    {/* A harsher noise filter for the 'brush stroke' track */}
                    <filter id="brush-stroke">
                        <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                    </filter>

                    <radialGradient id="sun-gradient">
                        <stop offset="0%" stopColor="var(--color-star-gold)" />
                        <stop offset="60%" stopColor="var(--color-star-warm)" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* 
            The Orbit Track: A thick, uneven swirling path 
            We use multiple paths with slight offsets to simulate multiple brush strokes
        */}
                <g filter="url(#brush-stroke)" opacity="0.6">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="var(--color-mid-blue)"
                        strokeWidth="4"
                        strokeDasharray="10 15"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius - 1}
                        fill="none"
                        stroke="var(--color-light-blue)"
                        strokeWidth="2"
                        strokeDasharray="5 20"
                        strokeDashoffset="7"
                    />
                </g>

                {/* The Center Gravity (The Soul) */}
                <circle
                    cx="50"
                    cy="50"
                    r="12"
                    fill="var(--color-cypress)"
                    filter="url(#brush-stroke)"
                    opacity="0.8"
                />

                {/* The Planet/Sun (Current Time) - A dab of thick yellow paint */}
                <g filter="url(#brush-stroke)">
                    <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill="var(--color-star-gold)"
                        stroke="var(--color-star-warm)"
                        strokeWidth="2"
                    >
                        <animate attributeName="r" values="6;7;6" dur="3s" repeatCount="indefinite" />
                    </circle>
                    {/* A glowing halo around the time */}
                    <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill="url(#sun-gradient)"
                        opacity="0.5"
                    />
                </g>

                {/* Phase Text - Now integrated as a 'sign' or subtle label */}
                <text
                    x="50"
                    y="65"
                    textAnchor="middle"
                    fill="var(--color-text-dim)"
                    fontSize="3"
                    fontFamily="var(--font-sans)"
                    letterSpacing="0.2em"
                    style={{ textTransform: 'uppercase' }}
                >
                    {phase}
                </text>
            </svg>
        </div>
    );
}
