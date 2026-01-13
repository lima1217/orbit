import React from 'react';
import { useSoulTime } from '../contexts/TimeContext';

export const OrbitSystem: React.FC = () => {
    const { orbitTime } = useSoulTime();

    // Calculate rotation degrees (0 to 1.0 -> 0 to 360)
    // -90 to start at noon/top or midnight/bottom? 
    // Let's say 0 progress (Dawn) is at bottom (270deg) or left? 
    // Standard clock: 0 is top. 
    // Let's align 0 progress (start of day) to Bottom (Midnight/Dawn transition).
    const rotations = orbitTime.cycleProgress * 360;

    return (
        <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            {/* Orbit Track - Soft pastel ring */}
            <div className="absolute w-[80%] h-[80%] rounded-full border-2 border-blush-rose/30 shadow-[0_0_60px_rgba(232,160,180,0.15)]" />

            {/* Core Self (Center) - Golden Soul */}
            <div className={`
                relative z-10 w-28 h-28 rounded-full 
                bg-gradient-to-br from-soul-gold via-soul-warm to-soul-gold
                shadow-[0_0_80px_rgba(252,211,77,0.4)] 
                flex items-center justify-center
                animate-float
                border-4 border-white/60
            `}>
                <div className="absolute inset-2 rounded-full bg-white/30 backdrop-blur-sm" />
                <span className="absolute text-sm font-bold tracking-[0.3em] text-white drop-shadow-md">
                    SELF
                </span>
            </div>

            {/* Orbiting Planet Container */}
            <div
                className="absolute w-full h-full"
                style={{
                    transform: `rotate(${rotations}deg)`,
                    transition: 'transform 0.1s linear' // Smooth ticking
                }}
            >
                {/* The Planet */}
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className={`
                        relative group cursor-pointer
                        w-14 h-14 rounded-full 
                        bg-gradient-to-br from-sky-aqua via-sky-blue to-lavender-soft
                        border-2 border-white/60
                        shadow-[0_0_40px_rgba(168,230,207,0.5)]
                        hover:scale-110 hover:shadow-[0_0_60px_rgba(135,206,235,0.6)]
                        transition-all duration-300
                    `}>
                        {/* Inner glow */}
                        <div className="absolute inset-1 rounded-full bg-white/40" />
                        {/* Phase Label Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="bg-white/80 backdrop-blur-sm px-3 py-1 text-xs rounded-full text-sky-deep shadow-lg">
                                {orbitTime.phase}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Time Display (Floating) */}
            <div className="absolute -bottom-16 flex flex-col items-center gap-2">
                <h2 className="text-5xl font-light text-gray-700 tracking-tight">
                    {orbitTime.orbitTimeString}
                </h2>
                <span className="text-overline text-blush-deep">
                    {orbitTime.label}
                </span>
            </div>
        </div>
    );
};
