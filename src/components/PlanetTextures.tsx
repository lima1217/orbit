import React from 'react';

/**
 * Global SVG Filters for Planet Textures
 * Included once at the top level or within the Selector
 */
export const PlanetTextures = () => (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
            {/* 
        Paper Grain / Stipple Effect 
        High frequency noise + high contrast
      */}
            <filter id="paper-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
                <feComponentTransfer in="grayNoise" result="contrastedNoise">
                    <feFuncA type="linear" slope="0.8" intercept="0" />
                </feComponentTransfer>
                <feBlend in="SourceGraphic" in2="contrastedNoise" mode="multiply" />
            </filter>

            {/* 
        Atmospheric / Cloud Turbulence
        Lower frequency, smoother
      */}
            <filter id="atmosphere-swirl">
                <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" seed="5" result="turbulence" />
                <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="20" xChannelSelector="R" yChannelSelector="G" />
                <feComposite operator="in" in2="SourceGraphic" />
            </filter>

            {/* 
         Ridge/Canyon effect for Mars-like planets
      */}
            <filter id="canyons">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="2" />
                <feDisplacementMap in="SourceGraphic" scale="10" />
            </filter>
        </defs>
    </svg>
);
