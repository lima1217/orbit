import { AmbientSound } from '../../constants/ambientSounds';
import { MokugyoIcon } from './MokugyoIcon';

interface SoundIconProps {
    sound: Pick<AmbientSound, 'id' | 'icon'>;
    /** 对齐 emoji 字号：text-lg ≈ 18, text-2xl ≈ 24 */
    size?: number;
    className?: string;
}

/**
 * 音效图标：多数用 emoji，木鱼用自定义 SVG（Unicode 无对应符号）
 */
export function SoundIcon({ sound, size = 24, className }: SoundIconProps) {
    if (sound.id === 'mokugyo') {
        return <MokugyoIcon size={size} className={className} />;
    }

    return (
        <span className={className} aria-hidden="true" style={{ fontSize: size, lineHeight: 1 }}>
            {sound.icon}
        </span>
    );
}
