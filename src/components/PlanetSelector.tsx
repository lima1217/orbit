import React from 'react';
import { PLANETS, Planet } from '../constants/planets';
import { PlanetTextures } from './PlanetTextures';

interface PlanetSelectorProps {
    selectedPlanetId: string;
    onSelect: (planet: Planet) => void;
    customPeriod?: number;
    onCustomPeriodChange?: (period: number) => void;
}

export const PlanetSelector: React.FC<PlanetSelectorProps> = ({
    selectedPlanetId,
    onSelect,
    customPeriod,
    onCustomPeriodChange
}) => {

    /* 3D Orbit Animation Loop */
    const [rotation, setRotation] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const requestRef = React.useRef<number>();

    React.useEffect(() => {
        const animate = () => {
            if (!isPaused) {
                // Slow rotation: 0.05 degrees per frame
                setRotation(prev => (prev + 0.05) % 360);
            }
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current as number);
    }, [isPaused]);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1000px' // Add perspective
        }}>
            <PlanetTextures />

            {/* Orbit Track (Visual Guide - Optional) */}
            <div style={{
                position: 'absolute',
                width: '640px',
                height: '220px', // Flattened to ellipse
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'rotateX(0deg)', // Already flattened by dimensions
                pointerEvents: 'none'
            }} />

            {PLANETS.map((planet, index) => {
                const isSelected = planet.id === selectedPlanetId;
                const count = PLANETS.length;

                // Calculate angle including current rotation
                const baseAngle = (index * (360 / count)) - 90;
                const currentAngleDeg = (baseAngle + rotation) % 360;
                const currentAngleRad = (currentAngleDeg * Math.PI) / 180;

                // Ellipctical Orbit Dimensions
                const radiusX = 320;
                const radiusY = 110; // Flattened Y for 3D effect

                // Position
                const x = radiusX * Math.cos(currentAngleRad);
                const y = radiusY * Math.sin(currentAngleRad);

                // 3D Depth Logic
                // In screen space, y+ is down.
                // For a "tilted disc" effect:
                // y- (top of screen) = Back = Smaller, Low Z
                // y+ (bottom of screen) = Front = Larger, High Z
                const isFront = y > 0;
                const zScale = isFront ? 1.0 + (y / radiusY) * 0.2 : 1.0 + (y / radiusY) * 0.2;
                // normalize scale: Back (y=-110) -> 0.8, Front (y=110) -> 1.2

                const zIndex = isFront ? 20 : 5; // Sandwich the Sun (z=10)
                const opacity = isFront ? 1 : 0.6;

                const isJupiter = planet.id === 'jupiter';
                const isEarth = planet.id === 'earth';
                const isMars = planet.id === 'mars';
                const hasRing = ['neptune', 'eris', 'custom'].includes(planet.id);

                return (
                    <button
                        key={planet.id}
                        onClick={() => onSelect(planet)}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            // Translate using calculated X/Y, applies scale
                            transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${zScale * (isSelected ? 1.3 : 1)})`,
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: isSelected ? 1 : opacity,
                            pointerEvents: 'auto',
                            zIndex: zIndex + (isSelected ? 100 : 0), // Selected always on top? Or just highlighted
                            transition: 'transform 0.1s linear, opacity 0.5s ease', // Smooth out frame updates? No, frame updates are linear.
                            willChange: 'transform' // Optimize
                        }}
                    >
                        {/* Planet Body */}
                        <div style={{
                            position: 'relative',
                            width: '70px',
                            height: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.5rem'
                        }}>
                            {/* Orb */}
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                overflow: 'hidden', position: 'relative', zIndex: 2,
                                boxShadow: isSelected ? `0 0 30px ${planet.color}80` : `0 0 10px ${planet.color}40`,
                                background: planet.color,
                                transform: 'rotate(-20deg)'
                            }}>
                                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 90%)` }} />

                                {/* Planet Details */}
                                {isJupiter && <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(0deg, transparent, transparent 10%, rgba(100,60,20,0.2) 10%, rgba(100,60,20,0.2) 20%, transparent 20%)` }} />}
                                {isEarth && <><div style={{ position: 'absolute', width: '60%', height: '40%', top: '20%', left: '10%', background: '#4CAF50', borderRadius: '40%', filter: 'blur(2px)', opacity: 0.8 }} /><div style={{ position: 'absolute', width: '40%', height: '30%', bottom: '20%', right: '15%', background: '#4CAF50', borderRadius: '50%', filter: 'blur(2px)', opacity: 0.6 }} /></>}
                                {isMars && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.2) 100%)', boxShadow: 'inset 10px -10px 20px rgba(0,0,0,0.3)' }} />}
                            </div>

                            {/* Rings */}
                            {hasRing && (
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    width: '160%', height: '60%',
                                    transform: 'translate(-50%, -50%) rotate(-20deg)',
                                    borderRadius: '50%',
                                    border: `6px solid ${planet.color}`,
                                    borderTopColor: 'rgba(255,255,255,0.1)',
                                    zIndex: 1, opacity: 0.8
                                }} />
                            )}
                            {hasRing && (
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    width: '160%', height: '60%',
                                    transform: 'translate(-50%, -50%) rotate(-20deg)',
                                    borderRadius: '50%',
                                    border: `6px solid ${planet.color}`,
                                    borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent',
                                    zIndex: 3, opacity: 0.9, pointerEvents: 'none'
                                }} />
                            )}
                        </div>

                        <div style={{
                            fontWeight: 600, fontSize: '0.85rem',
                            color: isSelected ? planet.color : 'rgba(255,255,255,0.6)',
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        }}>
                            {planet.name} <span style={{ opacity: 0.7, fontSize: '0.75em' }}>{planet.period}h</span>
                        </div>
                    </button>
                );
            })}

            {/* Custom Period Input */}
            {selectedPlanetId === 'custom' && (
                <div style={{
                    position: 'absolute', bottom: '10%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                    padding: '1rem', borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    pointerEvents: 'auto', display: 'flex', gap: '1rem', alignItems: 'center', zIndex: 100
                }}>
                    <span style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>Orbit:</span>
                    <input
                        type="range" min="8" max="40" step="0.5"
                        value={customPeriod || 30}
                        onChange={(e) => onCustomPeriodChange?.(parseFloat(e.target.value))}
                        style={{ accentColor: '#FFD700' }}
                    />
                    <span style={{ fontFamily: 'monospace' }}>{customPeriod}h</span>
                </div>
            )}
        </div>
    );
};
