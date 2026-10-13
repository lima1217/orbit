import type { ReactNode } from 'react';
import { AmbientSound } from '../../constants/ambientSounds';
import { LineIcon } from './LineIcon';

interface SoundIconProps {
    sound: Pick<AmbientSound, 'id'>;
    size?: number;
    className?: string;
}

/** 环境音图标 — 规格见 LineIcon */
const ICONS: Record<string, ReactNode> = {
    // 静心：打坐的人（双臂垂落，手合于膝上）
    zen: (
        <>
            <circle cx="12" cy="5" r="2" />
            <path d="M12 8.5c-2.6 0-4.1 1.9-4.6 4.7" />
            <path d="M12 8.5c2.6 0 4.1 1.9 4.6 4.7" />
            <path d="M7.4 13.2c1.3 1.2 2.9 1.8 4.6 1.8s3.3-.6 4.6-1.8" />
            <path d="M4 18.5c2.1-1.9 4.8-2.8 8-2.8s5.9.9 8 2.8" />
        </>
    ),
    // 颂钵：碗 + 底座 + 敲棒
    'singing-bowl': (
        <>
            <path d="M3.5 11.5h17c0 4.3-3.8 7.5-8.5 7.5s-8.5-3.2-8.5-7.5Z" />
            <path d="M9.5 21h5" />
            <path d="M15.5 3.5 12 9" />
            <path d="M18.5 6.5c.8.7 1.3 1.6 1.4 2.6" />
        </>
    ),
    // 木鱼：圆身 + 提耳 + 横开口 + 鱼眼
    mokugyo: (
        <>
            <circle cx="12" cy="13.5" r="7.5" />
            <path d="M10.5 6.2c0-1.5 1.5-2.7 1.5-2.7s1.5 1.2 1.5 2.7" />
            <path d="M5.5 13.5c3.2 2.6 9.8 2.6 13 0" />
            <circle cx="16.3" cy="10.3" r="0.9" fill="currentColor" stroke="none" />
        </>
    ),
    // 春山：两座山 + 地平线 + 一缕云
    forest: (
        <>
            <path d="M2.5 19.5 9 9l4.2 6.8" />
            <path d="M10.8 19.5 15.5 12l6 7.5" />
            <path d="M2.5 19.5h19" />
            <path d="M14.5 6.5h4.5a1.5 1.5 0 0 0 0-3" />
        </>
    ),
    // 风铃：日式风铃 — 挂钩 + 钟罩 + 舌 + 短册
    'wind-chime': (
        <>
            <path d="M12 2.5V6" />
            <path d="M6.5 12a5.5 5.5 0 0 1 11 0Z" />
            <path d="M12 12v3" />
            <path d="M10.5 15h3v6l-1.5-1.2-1.5 1.2Z" />
        </>
    ),
    // 猫咪：猫脸
    cat: (
        <>
            <path d="M5 9.5 6 4l4 3h4l4-3 1 5.5" />
            <path d="M5 9.5c-.4 5.6 2.6 9.5 7 9.5s7.4-3.9 7-9.5" />
            <circle cx="9.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
            <circle cx="14.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
            <path d="M11.3 15h1.4l-.7.8Z" />
            <path d="M2.5 13.5h3M18.5 13.5h3M3 16l2.7-.8M21 16l-2.7-.8" />
        </>
    ),
    // 雨伞：伞面 + 波浪边 + 伞柄 + 雨点
    umbrella: (
        <>
            <path d="M3 12a9 9 0 0 1 18 0" />
            <path d="M3 12c1.5-1.3 3-1.3 4.5 0 1.5-1.3 3-1.3 4.5 0 1.5-1.3 3-1.3 4.5 0 1.5-1.3 3-1.3 4.5 0" />
            <path d="M12 12v6.5a2 2 0 0 1-4 0" />
            <path d="M18.5 15.5v1.5M21 18v1.5" />
        </>
    ),
    // 夏夜：弯月 + 星
    insects: (
        <>
            <path d="M18.5 14.5A7.5 7.5 0 1 1 9.5 5.5a6 6 0 0 0 9 9Z" />
            <path d="M17 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6Z" />
        </>
    ),
    // 水滴
    'water-drop': (
        <>
            <path d="M12 3.5c3 3.8 5.5 7 5.5 10a5.5 5.5 0 0 1-11 0c0-3 2.5-6.2 5.5-10Z" />
            <path d="M9.5 14a2.6 2.6 0 0 0 2 2.4" />
        </>
    ),
    // 落雨：云 + 斜雨
    rain: (
        <>
            <path d="M7 15.5a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 9a3.25 3.25 0 0 1 .5 6.5Z" />
            <path d="M8.5 18.5 7.5 20.5M12.5 18.5l-1 2M16.5 18.5l-1 2" />
        </>
    ),
    // 海岸：三道浪
    ocean: (
        <>
            <path d="M2.5 8c2 0 2.5-1.5 4.75-1.5S9.75 8 12 8s2.5-1.5 4.75-1.5S19.5 8 21.5 8" />
            <path d="M2.5 13c2 0 2.5-1.5 4.75-1.5S9.75 13 12 13s2.5-1.5 4.75-1.5S19.5 13 21.5 13" />
            <path d="M2.5 18c2 0 2.5-1.5 4.75-1.5S9.75 18 12 18s2.5-1.5 4.75-1.5S19.5 18 21.5 18" />
        </>
    ),
    // 篝火：火焰 + 交叉柴
    bonfire: (
        <>
            <path d="M12 2.5c.5 3 4.5 4.5 4.5 8.5a4.5 4.5 0 0 1-9 0c0-1.9 1-3.2 2-4 .2 1.4 1 2.3 2 2.5-.5-2.5-.5-5 .5-7Z" />
            <path d="M4.5 21 19.5 17.5M4.5 17.5 19.5 21" />
        </>
    ),
};

export function SoundIcon({ sound, size, className }: SoundIconProps) {
    return (
        <LineIcon size={size} className={className}>
            {ICONS[sound.id]}
        </LineIcon>
    );
}
