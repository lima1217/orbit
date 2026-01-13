/**
 * 🎵 useAmbientPlayer - 环境音效播放器 Hook
 * 
 * 这个 hook 是对全局音频管理器的 React 封装
 * 音频的实际播放由 globalAudio.ts 管理
 */

import { useState, useCallback, useEffect } from 'react';
import {
    getSavedSoundMix,
    saveSoundMix,
    AMBIENT_SOUNDS
} from '../constants/ambientSounds';
import {
    isGlobalAudioPlaying,
    addSound,
    removeSound,
    getPlayingSoundIds
} from '../utils/globalAudio';

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
    /** 是否是首次进入（用于显示引导动画） */
    isFirstTime: boolean;
}

export function useAmbientPlayer(): UseAmbientPlayerReturn {
    // 检测 URL 参数是否要重置首次访问状态
    const [isFirstTime] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('reset') === 'true') {
            // 清除所有 Orbit 相关的 localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('orbit_')) {
                    localStorage.removeItem(key);
                }
            });
            // 清除 URL 参数，避免刷新后重复清除
            window.history.replaceState({}, '', window.location.pathname);
            return true;
        }
        return localStorage.getItem(FIRST_PLAY_KEY) !== 'true';
    });

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

    return {
        selectedIds,
        toggleSound,
        hasSound: selectedIds.length > 0 || isGlobalAudioPlaying(),
        isFirstTime,
    };
}

export default useAmbientPlayer;

