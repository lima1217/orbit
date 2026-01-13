import React, { useMemo } from 'react';

export function StarryBackground() {
    // Generate soft floating elements (replacing harsh stars)
    const floatingElements = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: Math.random() * 40 + 20,
            delay: Math.random() * 8,
            duration: Math.random() * 6 + 8,
            opacity: Math.random() * 0.3 + 0.1,
            type: Math.random() > 0.5 ? 'circle' : 'diamond'
        }));
    }, []);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Main Sky Gradient - Monument Valley inspired */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(180deg, 
                        #E0F4F1 0%,      /* sky-mint */
                        #87CEEB 25%,     /* sky-blue */
                        #A8E6CF 45%,     /* sky-aqua */
                        #FFE4E1 70%,     /* dawn-blush */
                        #FFB6C1 85%,     /* blush-soft */
                        #FDF8F3 100%     /* dawn-cream */
                    )`
                }}
            />

            {/* Soft ambient glow - top left */}
            <div
                className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full opacity-40 blur-[100px]"
                style={{ background: '#DCD0FF' }} /* lavender-soft */
            />

            {/* Soft ambient glow - bottom right */}
            <div
                className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full opacity-30 blur-[120px]"
                style={{ background: '#FFB6C1' }} /* blush-soft */
            />

            {/* Center light source (like sun behind clouds) */}
            <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-50 blur-[80px]"
                style={{ background: 'radial-gradient(circle, #FCD34D 0%, transparent 70%)' }} /* soul-gold */
            />

            {/* Floating soft elements */}
            {floatingElements.map((el, i) => (
                <div
                    key={i}
                    className="absolute"
                    style={{
                        left: el.left,
                        top: el.top,
                        width: `${el.size}px`,
                        height: `${el.size}px`,
                        opacity: el.opacity,
                        transform: el.type === 'diamond' ? 'rotate(45deg)' : 'none',
                        borderRadius: el.type === 'circle' ? '50%' : '4px',
                        background: 'rgba(255, 255, 255, 0.6)',
                        filter: 'blur(8px)',
                        animation: `float ${el.duration}s ease-in-out infinite ${el.delay}s`
                    }}
                />
            ))}

            {/* Subtle texture overlay for painterly feel */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}
            />

            <style>{`
                @keyframes float {
                    0%, 100% { 
                        transform: translateY(0) ${Math.random() > 0.5 ? 'rotate(45deg)' : ''}; 
                    }
                    50% { 
                        transform: translateY(-20px) ${Math.random() > 0.5 ? 'rotate(45deg)' : ''}; 
                    }
                }
            `}</style>
        </div>
    );
}

