import { useId } from 'react';

interface MokugyoIconProps {
    className?: string;
    size?: number;
}

/**
 * 木鱼 — 寺院里和尚敲的圆木鱼（非真鱼、非鼓）
 * 辨识点：圆身 + 横开口缝
 */
export function MokugyoIcon({ className, size = 24 }: MokugyoIconProps) {
    const woodId = `mokugyo-wood-${useId().replace(/:/g, '')}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* 圆木身 */}
            <circle cx="16" cy="17" r="11" fill={`url(#${woodId})`} />
            {/* 顶部提耳 */}
            <path
                d="M13.5 7.5C13.5 5.5 16 4 16 4s2.5 1.5 2.5 3.5c0 1-1.1 1.8-2.5 1.8s-2.5-.8-2.5-1.8Z"
                fill="#B08950"
            />
            {/* 开口缝（木鱼最关键特征） */}
            <path
                d="M7 16.5c2.8 3.2 15.2 3.2 18 0"
                stroke="#6B4A2A"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <path
                d="M8.5 16.2c2.4 2.2 12.6 2.2 15 0"
                stroke="#E8D4B0"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.7"
            />
            {/* 鱼眼雕饰（点题「鱼」而不像真鱼） */}
            <circle cx="22.5" cy="12.5" r="1.6" fill="#6B4A2A" />
            <circle cx="22.9" cy="12.1" r="0.55" fill="#F5E6C8" />
            <defs>
                <radialGradient
                    id={woodId}
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(12 12) rotate(55) scale(18)"
                >
                    <stop stopColor="#E2C48A" />
                    <stop offset="0.55" stopColor="#C9A06A" />
                    <stop offset="1" stopColor="#A07840" />
                </radialGradient>
            </defs>
        </svg>
    );
}
