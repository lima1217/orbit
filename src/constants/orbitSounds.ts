/**
 * 智能环境音效配置
 * 根据 Orbit 时段自动调配"情绪鸡尾酒"
 */

export interface OrbitSoundConfig {
    id: string;
    name: string;
    /** Orbit 时间范围 [开始小时, 结束小时) */
    orbitHourRange: [number, number];
    /** 声音文件路径（可以是多个，用于混音） */
    sounds: {
        src: string;
        volume: number;  // 0-1
    }[];
    /** 用于显示的图标 */
    icon: string;
}

/**
 * Orbit 时段音效配置
 * 
 * 基于 David JP Phillips 的"情绪鸡尾酒"概念：
 * - 晨曦：血清素 ↑ （平静清醒）
 * - 日间：专注状态（多巴胺 ↑）
 * - 黄昏：皮质醇 ↓（放松过渡）
 * - 夜晚：催产素 ↑ 内啡肽 ↑（安眠）
 */
export const ORBIT_SOUND_CONFIGS: OrbitSoundConfig[] = [
    {
        id: 'dawn',
        name: '晨曦',
        orbitHourRange: [6, 9],
        sounds: [
            { src: '/audio/spring-mountain.mp3', volume: 0.9 },  // 春の山 完整版
        ],
        icon: '🌅',
    },
    {
        id: 'day',
        name: '日间',
        orbitHourRange: [9, 17],
        sounds: [
            { src: '/audio/intro-ambient.mp3', volume: 0.5 },  // 静心音效
        ],
        icon: '☀️',
    },
    {
        id: 'dusk',
        name: '黄昏',
        orbitHourRange: [17, 20],
        sounds: [
            { src: '/audio/singing-bowl-raw.mp3', volume: 0.85 },
        ],
        icon: '🌇',
    },
    {
        id: 'night',
        name: '夜晚',
        orbitHourRange: [20, 24],
        sounds: [
            { src: '/audio/ocean-coast.mp3', volume: 0.8 },  // 海岸1 完整版
        ],
        icon: '🌙',
    },
    {
        id: 'late-night',
        name: '深夜',
        orbitHourRange: [0, 6],
        sounds: [
            { src: '/audio/seamless/rain.wav', volume: 0.75 },
        ],
        icon: '🌙',
    },
];

/**
 * 根据 Orbit 小时获取当前时段配置
 */
export function getOrbitSoundConfig(orbitHour: number): OrbitSoundConfig {
    // 标准化小时数 (0-24)
    const hour = ((orbitHour % 24) + 24) % 24;

    for (const config of ORBIT_SOUND_CONFIGS) {
        const [start, end] = config.orbitHourRange;
        if (hour >= start && hour < end) {
            return config;
        }
    }

    // 默认返回夜晚配置
    return ORBIT_SOUND_CONFIGS.find(c => c.id === 'night')!;
}

/**
 * 获取 Orbit 时段的中文名称
 */
export function getOrbitPeriodName(orbitHour: number): string {
    return getOrbitSoundConfig(orbitHour).name;
}

// localStorage key
export const SMART_SOUND_ENABLED_KEY = 'orbit_smart_sound_enabled';
export const SMART_SOUND_VOLUME_KEY = 'orbit_smart_sound_volume';

/**
 * 获取智能音效开关状态
 */
export function isSmartSoundEnabled(): boolean {
    const saved = localStorage.getItem(SMART_SOUND_ENABLED_KEY);
    return saved !== 'false'; // 默认开启
}

/**
 * 设置智能音效开关
 */
export function setSmartSoundEnabled(enabled: boolean): void {
    localStorage.setItem(SMART_SOUND_ENABLED_KEY, String(enabled));
}

/**
 * 获取智能音效音量 (0-1)
 */
export function getSmartSoundVolume(): number {
    const saved = localStorage.getItem(SMART_SOUND_VOLUME_KEY);
    return saved ? parseFloat(saved) : 0.6; // 默认 60%
}

/**
 * 设置智能音效音量
 */
export function setSmartSoundVolume(volume: number): void {
    localStorage.setItem(SMART_SOUND_VOLUME_KEY, String(Math.max(0, Math.min(1, volume))));
}
