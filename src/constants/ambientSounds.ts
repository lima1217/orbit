/**
 * Ambient Sound Configuration
 * 环境音效配置 - 支持混音模式
 */

export interface AmbientSound {
    id: string;
    name: string;
    nameEn: string;
    src: string;
    icon: string;
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
    // 第一排：🧘 🔔 🐟 🌲
    {
        id: 'zen',
        name: '静心',
        nameEn: 'Zen Ambience',
        src: '/audio/intro-ambient.mp3',
        icon: '🧘',
    },
    {
        id: 'singing-bowl',
        name: '颂钵',
        nameEn: 'Singing Bowl',
        src: '/audio/singing-bowl-raw.mp3',
        icon: '🔔',
    },
    {
        id: 'mokugyo',
        name: '木鱼',
        nameEn: 'Mokugyo',
        src: '/audio/mokugyo.mp3',
        icon: '🐟',
    },
    {
        id: 'forest',
        name: '春山',
        nameEn: 'Spring Mountain',
        src: '/audio/spring-mountain.mp3',
        icon: '🌲',
    },
    // 第二排：🎐 🐱 ☔️ 🌙
    {
        id: 'wind-chime',
        name: '风铃',
        nameEn: 'Wind Chime',
        src: '/audio/wind-chime.mp3',
        icon: '🎐',
    },
    {
        id: 'cat',
        name: '猫咪',
        nameEn: 'Cat Meowing',
        src: '/audio/cat-full.mp3',
        icon: '🐱',
    },
    {
        id: 'umbrella',
        name: '雨伞',
        nameEn: 'Rain on Umbrella',
        src: '/audio/umbrella-full.wav',
        icon: '☔️',
    },
    {
        id: 'insects',
        name: '夏夜',
        nameEn: 'Summer Night',
        src: '/audio/summer-night.mp3',
        icon: '🌙',
    },
    // 第三排：💧 🌧 🌊 🔥
    {
        id: 'water-drop',
        name: '水滴',
        nameEn: 'Water Drops',
        src: '/audio/water-drop.mp3',
        icon: '💧',
    },
    {
        id: 'rain',
        name: '落雨',
        nameEn: 'Rainfall',
        src: '/audio/rainfall.mp3',
        icon: '🌧',
    },
    {
        id: 'ocean',
        name: '海岸',
        nameEn: 'Ocean Coast',
        src: '/audio/ocean-coast.mp3',
        icon: '🌊',
    },
    {
        id: 'bonfire',
        name: '篝火',
        nameEn: 'Bonfire',
        src: '/audio/bonfire.mp3',
        icon: '🔥',
    },
];

// 默认音效
export const DEFAULT_SOUND_ID = 'ocean';

// localStorage keys
export const SOUND_PREFERENCE_KEY = 'orbit_ambient_sound';
export const SOUND_MIX_KEY = 'orbit_sound_mix';

/**
 * 获取用户保存的混音配置
 */
export function getSavedSoundMix(): string[] {
    const saved = localStorage.getItem(SOUND_MIX_KEY);
    if (!saved) return [];
    try {
        return JSON.parse(saved);
    } catch {
        return [];
    }
}

/**
 * 保存用户的混音配置
 */
export function saveSoundMix(soundIds: string[]): void {
    localStorage.setItem(SOUND_MIX_KEY, JSON.stringify(soundIds));
}

/**
 * 根据 ID 获取音效配置
 */
export function getSoundById(id: string): AmbientSound | undefined {
    return AMBIENT_SOUNDS.find(s => s.id === id);
}
