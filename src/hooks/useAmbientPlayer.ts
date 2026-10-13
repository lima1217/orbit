/**
 * 🎵 useAmbientPlayer - 环境音效播放器 Hook
 * 
 * 这个 hook 是对全局音频管理器的 React 封装
 * 音频的实际播放由 globalAudio.ts 管理
 */

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import {
    getSavedSoundMix,
    saveSoundMix,
    AMBIENT_SOUNDS
} from '../constants/ambientSounds';
import {
    isGlobalAudioPlaying,
    subscribeAudio,
    startGlobalAudio,
    getSleepAt,
    setSleepTimer,
    addSound,
    removeSound,
} from '../utils/globalAudio';
import { unlockAudio } from '../utils/audioUnlock';

// 默认音效（首次进入时）
const DEFAULT_SOUND_ID = 'zen';

// 首次播放标记
const FIRST_PLAY_KEY = 'orbit_first_sound_played';

export interface UseAmbientPlayerReturn {
    /** 当前选中的音效 IDs */
    selectedIds: string[];
    /** 切换音效选择 */
    toggleSound: (soundId: string) => void;
    /** 是否有音效在播放 */
    hasSound: boolean;
    /** 音频是否真的在响（回访用户未经手势时为 false） */
    isPlaying: boolean;
    /** 在用户手势中调用：开始播放已选音效 */
    resume: () => void;
    /** 定时淡出的时刻（epoch ms），未设定为 null */
    sleepAt: number | null;
    setSleepTimer: (minutes: number | null) => void;
    /** 是否是首次进入（用于显示引导动画） */
    isFirstTime: boolean;
}

export function useAmbientPlayer(): UseAmbientPlayerReturn {
    // ?reset=true 的清理在 App 模块加载时完成
    const [isFirstTime] = useState(() => localStorage.getItem(FIRST_PLAY_KEY) !== 'true');

    // 选中的音效 IDs - 从 localStorage 或默认值初始化
    const [selectedIds, setSelectedIds] = useState<string[]>(() => {
        const saved = getSavedSoundMix();
        return saved.length > 0 ? saved : [DEFAULT_SOUND_ID];
    });

    // 标记已经不是首次了
    useEffect(() => {
        if (isFirstTime) {
            // 延迟标记，确保引导动画有机会显示
            const timer = setTimeout(() => {
                localStorage.setItem(FIRST_PLAY_KEY, 'true');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isFirstTime]);

    // 切换音效 - 同时更新 UI 状态和实际音频播放
    const toggleSound = useCallback((soundId: string) => {
        const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
        if (!sound) return;

        setSelectedIds(prev => {
            const isCurrentlySelected = prev.includes(soundId);

            if (isCurrentlySelected) {
                // 移除音效 - 停止播放
                removeSound(soundId);
                const newIds = prev.filter(id => id !== soundId);
                saveSoundMix(newIds);
                return newIds;
            } else {
                // 添加音效 - 开始播放
                addSound(soundId, sound.src);
                const newIds = [...prev, soundId];
                saveSoundMix(newIds);
                return newIds;
            }
        });
    }, []);

    const isPlaying = useSyncExternalStore(subscribeAudio, isGlobalAudioPlaying);
    const sleepAt = useSyncExternalStore(subscribeAudio, getSleepAt);

    const resume = useCallback(() => {
        unlockAudio();
        startGlobalAudio();
    }, []);

    return {
        selectedIds,
        toggleSound,
        isPlaying,
        resume,
        sleepAt,
        setSleepTimer,
        hasSound: selectedIds.length > 0 || isPlaying,
        isFirstTime,
    };
}

export default useAmbientPlayer;

