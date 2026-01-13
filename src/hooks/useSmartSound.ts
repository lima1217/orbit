import { useRef, useCallback, useEffect, useState } from 'react';
import {
    getOrbitSoundConfig,
    OrbitSoundConfig,
    isSmartSoundEnabled,
    getSmartSoundVolume,
    setSmartSoundEnabled as saveSmartSoundEnabled,
    setSmartSoundVolume as saveSmartSoundVolume,
} from '../constants/orbitSounds';

interface UseSmartSoundOptions {
    /** 当前 Orbit 小时 (0-24) */
    orbitHour: number;
    /** 是否在过渡动画中（暂停播放） */
    isTransitioning?: boolean;
}

interface UseSmartSoundReturn {
    /** 当前时段配置 */
    currentConfig: OrbitSoundConfig;
    /** 是否启用智能音效 */
    isEnabled: boolean;
    /** 当前音量 (0-1) */
    volume: number;
    /** 开关智能音效 */
    setEnabled: (enabled: boolean) => void;
    /** 设置音量 */
    setVolume: (volume: number) => void;
    /** 是否正在播放 */
    isPlaying: boolean;
}

/**
 * 🎵 useSmartSound - 智能环境音效 Hook
 * 
 * 根据 Orbit 时段自动播放对应的环境音效
 * 使用双缓冲无缝循环技术，消除循环断裂感
 */
export function useSmartSound(options: UseSmartSoundOptions): UseSmartSoundReturn {
    const { orbitHour, isTransitioning = false } = options;

    // 状态
    const [isEnabled, setIsEnabledState] = useState(isSmartSoundEnabled);
    const [volume, setVolumeState] = useState(getSmartSoundVolume);
    const [isPlaying, setIsPlaying] = useState(false);

    // 获取当前时段配置
    const currentConfig = getOrbitSoundConfig(orbitHour);

    // 双缓冲音频引用
    const audioARef = useRef<HTMLAudioElement | null>(null);
    const audioBRef = useRef<HTMLAudioElement | null>(null);
    const activeIndexRef = useRef<0 | 1>(0);

    const currentConfigIdRef = useRef<string | null>(null);
    const fadeIntervalRef = useRef<number | null>(null);
    const isStoppedRef = useRef(false);
    const targetVolumeRef = useRef(0);

    /**
     * 清除淡入淡出定时器
     */
    const clearFadeInterval = useCallback(() => {
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
        }
    }, []);

    /**
     * 获取音频数组
     */
    const getAudios = useCallback(() => {
        return [audioARef.current, audioBRef.current];
    }, []);

    /**
     * 淡出并停止所有音效
     */
    const fadeOutAndStop = useCallback(() => {
        isStoppedRef.current = true;
        const audios = getAudios();
        const activeAudio = audios[activeIndexRef.current];

        if (!activeAudio) {
            setIsPlaying(false);
            return;
        }

        const startVolume = activeAudio.volume;
        const steps = 20;
        let step = 0;

        clearFadeInterval();
        fadeIntervalRef.current = window.setInterval(() => {
            step++;
            activeAudio.volume = Math.max(0, startVolume * (1 - step / steps));

            if (step >= steps) {
                clearFadeInterval();
                audios.forEach(audio => {
                    if (audio) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                });
                setIsPlaying(false);
            }
        }, 50);
    }, [clearFadeInterval, getAudios]);

    /**
     * 处理音频时间更新 - 核心无缝循环逻辑
     */
    const handleTimeUpdate = useCallback((currentAudio: HTMLAudioElement, nextAudio: HTMLAudioElement) => {
        if (isStoppedRef.current) return;

        const remaining = currentAudio.duration - currentAudio.currentTime;
        const crossfadeStart = 0.8; // 在剩余 0.8 秒时开始交叉淡入淡出

        if (remaining <= crossfadeStart && remaining > 0 && nextAudio.paused) {
            // 开始播放下一个音频
            nextAudio.currentTime = 0;
            nextAudio.volume = 0;
            nextAudio.play().catch(() => { });
        }

        if (remaining <= crossfadeStart && remaining > 0) {
            // 交叉淡入淡出
            const progress = 1 - (remaining / crossfadeStart);
            const targetVolume = targetVolumeRef.current;

            currentAudio.volume = targetVolume * (1 - progress);
            nextAudio.volume = targetVolume * progress;
        }
    }, []);

    /**
     * 处理音频结束
     */
    const handleEnded = useCallback((endedIndex: 0 | 1) => {
        if (isStoppedRef.current) return;

        // 切换到下一个音频
        activeIndexRef.current = endedIndex === 0 ? 1 : 0;

        const audios = getAudios();
        const nextAudio = audios[activeIndexRef.current];

        if (nextAudio) {
            nextAudio.volume = targetVolumeRef.current;
        }
    }, [getAudios]);

    /**
     * 创建并配置音频元素
     */
    const createAudio = useCallback((src: string, index: 0 | 1): HTMLAudioElement => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = 0;

        // 设置事件监听
        const otherIndex = index === 0 ? 1 : 0;

        audio.addEventListener('timeupdate', () => {
            const audios = getAudios();
            const otherAudio = audios[otherIndex];
            if (otherAudio && activeIndexRef.current === index) {
                handleTimeUpdate(audio, otherAudio);
            }
        });

        audio.addEventListener('ended', () => {
            handleEnded(index);
        });

        return audio;
    }, [getAudios, handleTimeUpdate, handleEnded]);

    /**
     * 播放音效
     */
    const playSound = useCallback(async (config: OrbitSoundConfig, targetVolume: number) => {
        if (config.sounds.length === 0) {
            fadeOutAndStop();
            return;
        }

        const soundConfig = config.sounds[0];
        const finalVolume = soundConfig.volume * targetVolume;
        targetVolumeRef.current = finalVolume;

        try {
            // 如果是同一个配置，只调整音量
            if (currentConfigIdRef.current === config.id) {
                const audios = getAudios();
                const activeAudio = audios[activeIndexRef.current];
                if (activeAudio && !activeAudio.paused) {
                    activeAudio.volume = finalVolume;
                    return;
                }
            }

            // 停止当前音效
            isStoppedRef.current = false;
            clearFadeInterval();

            // 清理旧音频
            [audioARef.current, audioBRef.current].forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.src = '';
                }
            });

            // 创建双缓冲音频
            audioARef.current = createAudio(soundConfig.src, 0);
            audioBRef.current = createAudio(soundConfig.src, 1);

            activeIndexRef.current = 0;
            currentConfigIdRef.current = config.id;

            // 开始播放第一个音频
            await audioARef.current.play();
            setIsPlaying(true);

            // 淡入
            const steps = 30;
            let step = 0;

            fadeIntervalRef.current = window.setInterval(() => {
                step++;
                const newVolume = finalVolume * (step / steps);
                if (audioARef.current) {
                    audioARef.current.volume = Math.min(finalVolume, newVolume);
                }

                if (step >= steps) {
                    clearFadeInterval();
                }
            }, 50);

        } catch (error) {
            console.warn('Smart sound playback failed:', error);
            setIsPlaying(false);
        }
    }, [fadeOutAndStop, clearFadeInterval, getAudios, createAudio]);

    /**
     * 设置启用状态
     */
    const setEnabled = useCallback((enabled: boolean) => {
        setIsEnabledState(enabled);
        saveSmartSoundEnabled(enabled);

        if (!enabled) {
            fadeOutAndStop();
        }
    }, [fadeOutAndStop]);

    /**
     * 设置音量
     */
    const setVolume = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);
        saveSmartSoundVolume(clampedVolume);

        if (currentConfig.sounds.length > 0) {
            const soundConfig = currentConfig.sounds[0];
            const finalVolume = soundConfig.volume * clampedVolume;
            targetVolumeRef.current = finalVolume;

            const audios = getAudios();
            const activeAudio = audios[activeIndexRef.current];
            if (activeAudio && !activeAudio.paused) {
                activeAudio.volume = finalVolume;
            }
        }
    }, [currentConfig, getAudios]);

    /**
     * 监听配置变化和启用状态
     */
    useEffect(() => {
        if (!isEnabled || isTransitioning) {
            fadeOutAndStop();
            return;
        }

        playSound(currentConfig, volume);
    }, [isEnabled, isTransitioning, currentConfig.id, volume, playSound, fadeOutAndStop]);

    /**
     * 组件卸载时清理
     */
    useEffect(() => {
        return () => {
            isStoppedRef.current = true;
            clearFadeInterval();
            [audioARef.current, audioBRef.current].forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.src = '';
                }
            });
        };
    }, [clearFadeInterval]);

    return {
        currentConfig,
        isEnabled,
        volume,
        setEnabled,
        setVolume,
        isPlaying,
    };
}

export default useSmartSound;
