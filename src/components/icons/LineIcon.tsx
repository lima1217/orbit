import type { ReactNode } from 'react';

interface LineIconProps {
    size?: number;
    className?: string;
    children: ReactNode;
}

/**
 * Orbit 线性图标的统一外壳 — 所有图标都经由它渲染：
 * 24 网格 · 1.5 描边 · 圆端圆角 · currentColor（颜色由外层文字色决定）
 * 只有极小的点（眼睛、星）用实心。
 */
export function LineIcon({ size = 24, className, children }: LineIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

interface UiIconProps {
    size?: number;
    className?: string;
}

/** 日出：地平线上的半个太阳 + 三道光，下方一条短地面线 */
export function SunriseIcon(props: UiIconProps) {
    return (
        <LineIcon {...props}>
            <path d="M3 17.5h18" />
            <path d="M7 17.5a5 5 0 0 1 10 0" />
            <path d="M12 5v2.5" />
            <path d="M5.6 9.1l1.6 1.6" />
            <path d="M18.4 9.1l-1.6 1.6" />
            <path d="M8 21h8" />
        </LineIcon>
    );
}

/** 静音：扬声器 + 叉 */
export function MutedIcon(props: UiIconProps) {
    return (
        <LineIcon {...props}>
            <path d="M3.5 9.5h3.5L11.5 5.5v13L7 14.5H3.5Z" />
            <path d="M15.5 9.5l5 5" />
            <path d="M20.5 9.5l-5 5" />
        </LineIcon>
    );
}

/** 播放：圆角三角 */
export function PlayIcon(props: UiIconProps) {
    return (
        <LineIcon {...props}>
            <path d="M8 5.5v13l10.5-6.5Z" />
        </LineIcon>
    );
}

/** 分享：托盘 + 向上箭头 */
export function ShareIcon(props: UiIconProps) {
    return (
        <LineIcon {...props}>
            <path d="M12 3.5v11" />
            <path d="M8 7.5l4-4 4 4" />
            <path d="M8 11H6.5A1.5 1.5 0 0 0 5 12.5v6A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H16" />
        </LineIcon>
    );
}

/** 行程：起点 — 一段折返的路 — 终点 */
export function RouteIcon(props: UiIconProps) {
    return (
        <LineIcon {...props}>
            <circle cx="6" cy="18" r="2" />
            <path d="M8 18h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8" />
            <circle cx="18" cy="6" r="2" />
        </LineIcon>
    );
}
