import { useRef, useCallback, useEffect } from 'react';

interface AmbientSoundOptions {
    /** 音频文件路径 (相对于 public 目录) */
    src: string;
    /** 音量 (0-1)，默认 0.3 */
    volume?: number;
    /** 淡入时长 (ms)，默认 2000 */
    fadeInDuration?: number;
    /** 淡出时长 (ms)，默认 1000 */
    fadeOutDuration?: number;
    /** 是否循环播放，默认 true */
    loop?: boolean;
}

/**
 * 🎵 useAmbientSound - 环境音效播放器
 * 
 * 使用双缓冲无缝循环技术
 * 在音频结束前 0.8 秒开始交叉淡入淡出
 */
export function useAmbientSound(options: AmbientSoundOptions) {
    const {
        src,
        volume = 0.3,
        fadeInDuration = 2000,
        fadeOutDuration = 1000,
        loop = true,
    } = options;

    // 双缓冲音频
    const audioARef = useRef<HTMLAudioElement | null>(null);
    const audioBRef = useRef<HTMLAudioElement | null>(null);
    const activeIndexRef = useRef<0 | 1>(0);

    const fadeIntervalRef = useRef<number | null>(null);
    const isPlayingRef = useRef(false);
    const isStoppedRef = useRef(false);
    const targetVolumeRef = useRef(volume);

    /**
     * 清除定时器
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
     * 处理时间更新 - 无缝循环核心
     */
    const handleTimeUpdate = useCallback((currentAudio: HTMLAudioElement, nextAudio: HTMLAudioElement) => {
        if (isStoppedRef.current || !loop) return;

        const remaining = currentAudio.duration - currentAudio.currentTime;
        const crossfadeStart = 0.8; // 在剩余 0.8 秒时开始

        if (remaining <= crossfadeStart && remaining > 0 && nextAudio.paused) {
            nextAudio.currentTime = 0;
            nextAudio.volume = 0;
            nextAudio.play().catch(() => { });
        }

        if (remaining <= crossfadeStart && remaining > 0) {
            const progress = 1 - (remaining / crossfadeStart);
            const targetVolume = targetVolumeRef.current;

            currentAudio.volume = targetVolume * (1 - progress);
            nextAudio.volume = targetVolume * progress;
        }
    }, [loop]);

    /**
     * 处理音频结束
     */
    const handleEnded = useCallback((endedIndex: 0 | 1) => {
        if (isStoppedRef.current) return;
        activeIndexRef.current = endedIndex === 0 ? 1 : 0;

        const audios = getAudios();
        const nextAudio = audios[activeIndexRef.current];
        if (nextAudio) {
            nextAudio.volume = targetVolumeRef.current;
        }
    }, [getAudios]);

    /**
     * 创建音频元素
     */
    const createAudio = useCallback((audioSrc: string, index: 0 | 1): HTMLAudioElement => {
        const audio = new Audio(audioSrc);
        audio.preload = 'auto';
        audio.volume = 0;

        if (!loop) {
            audio.loop = false;
        }

        const otherIndex = index === 0 ? 1 : 0;

        audio.addEventListener('timeupdate', () => {
            const audios = getAudios();
            const otherAudio = audios[otherIndex];
            if (otherAudio && activeIndexRef.current === index && loop) {
                handleTimeUpdate(audio, otherAudio);
            }
        });

        audio.addEventListener('ended', () => {
            if (loop) {
                handleEnded(index);
            } else {
                isPlayingRef.current = false;
            }
        });

        return audio;
    }, [loop, getAudios, handleTimeUpdate, handleEnded]);

    /**
     * 开始播放
     */
    const play = useCallback(async () => {
        if (isPlayingRef.current) return;

        try {
            isStoppedRef.current = false;
            targetVolumeRef.current = volume;

            // 清理旧音频
            [audioARef.current, audioBRef.current].forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.src = '';
                }
            });

            // 创建双缓冲音频
            audioARef.current = createAudio(src, 0);
            audioBRef.current = createAudio(src, 1);

            activeIndexRef.current = 0;

            await audioARef.current.play();
            isPlayingRef.current = true;
            console.log('🎵 Ambient sound started (seamless loop)');

            // 淡入
            const steps = fadeInDuration / 50;
            const volumeStep = volume / steps;
            let currentStep = 0;

            clearFadeInterval();
            fadeIntervalRef.current = window.setInterval(() => {
                currentStep++;
                const newVolume = Math.min(volumeStep * currentStep, volume);
                if (audioARef.current) {
                    audioARef.current.volume = newVolume;
                }

                if (currentStep >= steps) {
                    clearFadeInterval();
                }
            }, 50);

        } catch (error) {
            console.warn('Ambient sound playback failed:', error);
            isPlayingRef.current = false;
        }
    }, [src, volume, fadeInDuration, clearFadeInterval, createAudio]);

    /**
     * 淡出并停止
     */
    const fadeOut = useCallback(() => {
        if (!isPlayingRef.current) return;

        isStoppedRef.current = true;

        const audios = getAudios();
        const activeAudio = audios[activeIndexRef.current];
        if (!activeAudio) {
            isPlayingRef.current = false;
            return;
        }

        const startVolume = activeAudio.volume;
        const steps = fadeOutDuration / 50;
        let currentStep = 0;

        clearFadeInterval();
        fadeIntervalRef.current = window.setInterval(() => {
            currentStep++;
            const newVolume = Math.max(startVolume - (startVolume / steps) * currentStep, 0);
            activeAudio.volume = newVolume;

            if (currentStep >= steps || newVolume <= 0) {
                clearFadeInterval();
                audios.forEach(audio => {
                    if (audio) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                });
                isPlayingRef.current = false;
                console.log('🎵 Ambient sound faded out');
            }
        }, 50);
    }, [fadeOutDuration, clearFadeInterval, getAudios]);

    /**
     * 立即停止
     */
    const stop = useCallback(() => {
        isStoppedRef.current = true;
        clearFadeInterval();
        [audioARef.current, audioBRef.current].forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        isPlayingRef.current = false;
    }, [clearFadeInterval]);

    /**
     * 组件卸载时清理
     */
    useEffect(() => {
        return () => {
            isStoppedRef.current = true;
            stop();
            audioARef.current = null;
            audioBRef.current = null;
        };
    }, [stop]);

    return {
        play,
        fadeOut,
        stop,
        isPlaying: isPlayingRef.current,
    };
}

export default useAmbientSound;
