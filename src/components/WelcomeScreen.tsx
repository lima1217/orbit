import React, { useState, useEffect } from 'react';

interface WelcomeScreenProps {
    onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Fade in effect
        setIsVisible(true);
    }, []);

    return (
        <div
            onClick={onEnter}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(11, 14, 40, 0.4)', // Slight tint over the starry background
                backdropFilter: 'blur(2px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2rem',
                cursor: 'pointer',
                zIndex: 50,
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 1.5s ease-in-out'
            }}
        >
            <h1 style={{
                fontSize: '5rem',
                fontWeight: 400,
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                letterSpacing: '0.1em',
                marginBottom: '4rem',
                color: 'var(--color-star-gold)',
                textShadow: '0 0 30px rgba(242, 201, 76, 0.4)',
                animation: 'float 6s ease-in-out infinite'
            }}>
                Orbit
            </h1>

            <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                lineHeight: '2.0',
                color: 'var(--color-text-main)',
                letterSpacing: '0.05em',
                maxWidth: '800px',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
                <p style={{
                    marginBottom: '1rem',
                    opacity: 0,
                    animation: 'fadeIn 1s ease-out forwards 0.5s'
                }}>
                    * 献给所有异乡者，不仅是地理上的，更是时间上的异乡者
                </p>
                <p style={{
                    opacity: 0,
                    animation: 'fadeIn 1s ease-out forwards 1.5s'
                }}>
                    在此，时间顺从于你的脉搏，而非格林威治的指针
                </p>
            </div>

            <div style={{
                marginTop: '5rem',
                fontSize: '0.8rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--accent-purple)',
                opacity: 0.7,
                animation: 'pulse 3s infinite'
            }}>
                Click to Enter
            </div>

            <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
      `}</style>
        </div>
    );
}
