/**
 * 🎵 Global Audio Manager
 * 
 * 管理全局音频播放状态。
 * 在 Intro 页面用户交互时预先启动音频，
 * 确保进入第二页时音频已经在播放。
 */

import { AMBIENT_SOUNDS, getSavedSoundMix } from '../constants/ambientSounds';

// 默认音效
const DEFAULT_SOUND_ID = 'zen';

// 全局音频实例
let globalAudios: Map<string, HTMLAudioElement> = new Map();
let isPlaying = false;

// 基础音量（会根据同时播放的音效数量动态调整）
const BASE_VOLUME = 0.6;

/**
 * 离散敲击型音效 IDs
 * 这些音效有明显的节拍（咚、滴等），需要从头开始播放
 * 不能使用淡入效果，否则第一声会被"截断"
 */
const DISCRETE_SOUNDS = ['mokugyo', 'water-drop', 'singing-bowl'];

/**
 * 检查是否是离散敲击型音效
 */
function isDiscreteSound(soundId: string): boolean {
    return DISCRETE_SOUNDS.includes(soundId);
}

/**
 * 获取要播放的音效 IDs
 */
function getSelectedIds(): string[] {
    const saved = getSavedSoundMix();
    return saved.length > 0 ? saved : [DEFAULT_SOUND_ID];
}

/**
 * 计算每个音效的音量（多个音效时降低单个音量）
 */
function calculateVolume(): number {
    const count = globalAudios.size;
    return BASE_VOLUME / Math.max(1, Math.sqrt(count));
}

/**
 * 调整所有音频的音量
 */
function adjustAllVolumes(): void {
    const targetVolume = calculateVolume();
    globalAudios.forEach(audio => {
        audio.volume = targetVolume;
    });
}

/**
 * 开始播放音效
 * 必须在用户交互事件中调用
 */
export function startGlobalAudio(): void {
    if (isPlaying) return;

    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;

    console.log('🎵 Starting global audio:', selectedIds);

    selectedIds.forEach(id => {
        const sound = AMBIENT_SOUNDS.find(s => s.id === id);
        if (!sound) return;

        let audio = globalAudios.get(id);
        if (!audio) {
            audio = new Audio(sound.src);
            audio.loop = true;
            globalAudios.set(id, audio);
        }

        // 确保从头开始播放
        audio.currentTime = 0;

        if (isDiscreteSound(id)) {
            // 离散敲击型音效：直接设置目标音量，不淡入
            audio.volume = calculateVolume();
            audio.play().then(() => {
                console.log('🎵 Discrete audio started:', id);
            }).catch(err => {
                console.log('🎵 Audio play failed:', err);
            });
        } else {
            // 普通音效：使用淡入效果
            audio.volume = 0;
            audio.play().then(() => {
                console.log('🎵 Audio started:', id);
                fadeInAudio(audio!, calculateVolume(), 1000);
            }).catch(err => {
                console.log('🎵 Audio play failed:', err);
            });
        }
    });

    isPlaying = true;
}

/**
 * 音量淡入
 */
function fadeInAudio(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(volumeStep * currentStep, targetVolume);
        if (currentStep >= steps) {
            clearInterval(interval);
        }
    }, stepDuration);
}

/**
 * 音量淡出
 */
function fadeOutAudio(audio: HTMLAudioElement, duration: number): Promise<void> {
    return new Promise(resolve => {
        const steps = 15;
        const stepDuration = duration / steps;
        const startVolume = audio.volume;
        const volumeStep = startVolume / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(startVolume - volumeStep * currentStep, 0);
            if (currentStep >= steps) {
                clearInterval(interval);
                audio.pause();
                audio.currentTime = 0;
                resolve();
            }
        }, stepDuration);
    });
}

/**
 * 添加音效（用户选择时调用）
 */
export function addSound(soundId: string, src: string): void {
    if (globalAudios.has(soundId)) return;

    console.log('🎵 Adding sound:', soundId);

    const audio = new Audio(src);
    audio.loop = true;

    // 确保从头开始播放
    audio.currentTime = 0;

    globalAudios.set(soundId, audio);

    if (isDiscreteSound(soundId)) {
        // 离散敲击型音效：直接设置目标音量，不淡入
        audio.volume = calculateVolume();
        audio.play().then(() => {
            console.log('🎵 Discrete sound added:', soundId);
            adjustAllVolumes();
        }).catch(err => {
            console.warn('🎵 Failed to add sound:', err);
            globalAudios.delete(soundId);
        });
    } else {
        // 普通音效：使用淡入效果
        audio.volume = 0;
        audio.play().then(() => {
            console.log('🎵 Sound added and playing:', soundId);
            fadeInAudio(audio, calculateVolume(), 500);
            adjustAllVolumes();
        }).catch(err => {
            console.warn('🎵 Failed to add sound:', err);
            globalAudios.delete(soundId);
        });
    }

    isPlaying = true;
}

/**
 * 移除音效（用户取消选择时调用）
 */
export function removeSound(soundId: string): void {
    const audio = globalAudios.get(soundId);
    if (!audio) return;

    console.log('🎵 Removing sound:', soundId);

    fadeOutAudio(audio, 300).then(() => {
        globalAudios.delete(soundId);
        adjustAllVolumes();

        // 如果没有音效在播放了
        if (globalAudios.size === 0) {
            isPlaying = false;
        }
    });
}

/**
 * 获取当前正在播放的音效 IDs
 */
export function getPlayingSoundIds(): string[] {
    return Array.from(globalAudios.keys());
}

/**
 * 停止所有音频
 */
export function stopGlobalAudio(): void {
    globalAudios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    globalAudios.clear();
    isPlaying = false;
}

/**
 * 切换音效（旧 API，保留兼容）
 */
export function toggleGlobalSound(soundId: string): void {
    const selectedIds = getSelectedIds();
    const isSelected = selectedIds.includes(soundId);

    if (isSelected) {
        removeSound(soundId);
    } else {
        const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
        if (sound) {
            addSound(soundId, sound.src);
        }
    }
}

/**
 * 获取当前播放状态
 */
export function getGlobalAudioState(): { isPlaying: boolean; selectedIds: string[] } {
    return {
        isPlaying,
        selectedIds: Array.from(globalAudios.keys())
    };
}

/**
 * 检查是否正在播放
 */
export function isGlobalAudioPlaying(): boolean {
    return isPlaying;
}

