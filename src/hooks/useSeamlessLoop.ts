import { useRef, useCallback, useEffect, useState } from 'react';

interface UseSeamlessLoopOptions {
    /** 音频文件路径 */
    src: string;
    /** 音量 (0-1)，默认 0.3 */
    volume?: number;
    /** 交叉淡入淡出时长 (ms)，默认 1500 */
    crossfadeDuration?: number;
    /** 淡入时长 (ms)，默认 2000 */
    fadeInDuration?: number;
    /** 淡出时长 (ms)，默认 1500 */
    fadeOutDuration?: number;
}

/**
 * 🎵 useSeamlessLoop - 无缝循环音频播放器
 * 
 * 使用双缓冲技术实现真正无缝的音频循环
 * 在音频即将结束时，提前启动第二个音频并交叉淡入淡出
 * 
 * Jobs 会说：
 * "音效应该像呼吸一样自然，永不中断。
 *  用户不应该感知到技术的存在。"
 */
export function useSeamlessLoop(options: UseSeamlessLoopOptions) {
    const {
        src,
        volume = 0.3,
        crossfadeDuration = 1500,
        fadeInDuration = 2000,
        fadeOutDuration = 1500,
    } = options;

    // 双缓冲音频元素
    const audioARef = useRef<HTMLAudioElement | null>(null);
    const audioBRef = useRef<HTMLAudioElement | null>(null);

    // 当前活跃的音频 (0 = A, 1 = B)
    const activeAudioRef = useRef<0 | 1>(0);

    // 状态
    const [isPlaying, setIsPlaying] = useState(false);
    const isPlayingRef = useRef(false);

    // 定时器引用
    const fadeIntervalRef = useRef<number | null>(null);
    const checkIntervalRef = useRef<number | null>(null);
    const crossfadeTimeoutRef = useRef<number | null>(null);

    /**
     * 清除所有定时器
     */
    const clearAllTimers = useCallback(() => {
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
        }
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
        if (crossfadeTimeoutRef.current) {
            clearTimeout(crossfadeTimeoutRef.current);
            crossfadeTimeoutRef.current = null;
        }
    }, []);

    /**
     * 获取当前和下一个音频元素
     */
    const getAudioElements = useCallback(() => {
        const active = activeAudioRef.current;
        return {
            current: active === 0 ? audioARef.current : audioBRef.current,
            next: active === 0 ? audioBRef.current : audioARef.current,
        };
    }, []);

    /**
     * 创建音频元素
     */
    const createAudio = useCallback(() => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = 0;
        return audio;
    }, [src]);

    /**
     * 初始化双缓冲音频
     */
    const initAudios = useCallback(() => {
        if (!audioARef.current) {
            audioARef.current = createAudio();
        }
        if (!audioBRef.current) {
            audioBRef.current = createAudio();
        }
    }, [createAudio]);

    /**
     * 执行交叉淡入淡出
     */
    const performCrossfade = useCallback(() => {
        if (!isPlayingRef.current) return;

        const { current: currentAudio, next: nextAudio } = getAudioElements();
        if (!currentAudio || !nextAudio) return;

        // 重置下一个音频到开头
        nextAudio.currentTime = 0;
        nextAudio.volume = 0;

        // 开始播放下一个音频
        nextAudio.play().catch(console.warn);

        // 交叉淡入淡出
        const steps = crossfadeDuration / 20;
        let step = 0;
        const startVolume = currentAudio.volume;

        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
        }

        fadeIntervalRef.current = window.setInterval(() => {
            step++;
            const progress = step / steps;

            // 当前音频淡出
            currentAudio.volume = Math.max(0, startVolume * (1 - progress));

            // 下一个音频淡入
            nextAudio.volume = Math.min(volume, volume * progress);

            if (step >= steps) {
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current);
                    fadeIntervalRef.current = null;
                }

                // 停止当前音频
                currentAudio.pause();
                currentAudio.currentTime = 0;

                // 切换活跃音频
                activeAudioRef.current = activeAudioRef.current === 0 ? 1 : 0;

                // 安排下一次交叉淡入淡出
                scheduleNextCrossfade();
            }
        }, 20);
    }, [crossfadeDuration, volume, getAudioElements]);

    /**
     * 安排下一次交叉淡入淡出
     */
    const scheduleNextCrossfade = useCallback(() => {
        const { current: currentAudio } = getAudioElements();
        if (!currentAudio || !isPlayingRef.current) return;

        // 计算何时开始交叉淡入淡出
        const checkCrossfadeTime = () => {
            if (!currentAudio || !isPlayingRef.current) return;

            const remainingTime = (currentAudio.duration - currentAudio.currentTime) * 1000;

            // 在音频结束前 crossfadeDuration 毫秒开始交叉淡入淡出
            if (remainingTime <= crossfadeDuration + 100) {
                if (checkIntervalRef.current) {
                    clearInterval(checkIntervalRef.current);
                    checkIntervalRef.current = null;
                }
                performCrossfade();
            }
        };

        // 每 100ms 检查一次
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
        }
        checkIntervalRef.current = window.setInterval(checkCrossfadeTime, 100);
    }, [crossfadeDuration, getAudioElements, performCrossfade]);

    /**
     * 开始播放
     */
    const play = useCallback(async () => {
        if (isPlayingRef.current) return;

        initAudios();

        const audioA = audioARef.current;
        if (!audioA) return;

        try {
            audioA.currentTime = 0;
            audioA.volume = 0;
            activeAudioRef.current = 0;

            await audioA.play();
            isPlayingRef.current = true;
            setIsPlaying(true);

            console.log('🎵 Seamless loop started');

            // 淡入
            const steps = fadeInDuration / 20;
            let step = 0;

            fadeIntervalRef.current = window.setInterval(() => {
                step++;
                audioA.volume = Math.min(volume, volume * (step / steps));

                if (step >= steps) {
                    if (fadeIntervalRef.current) {
                        clearInterval(fadeIntervalRef.current);
                        fadeIntervalRef.current = null;
                    }
                    // 开始监控循环
                    scheduleNextCrossfade();
                }
            }, 20);

        } catch (error) {
            console.warn('Seamless loop playback failed:', error);
            isPlayingRef.current = false;
            setIsPlaying(false);
        }
    }, [initAudios, fadeInDuration, volume, scheduleNextCrossfade]);

    /**
     * 停止播放（带淡出）
     */
    const stop = useCallback(() => {
        if (!isPlayingRef.current) return;

        clearAllTimers();

        const { current: currentAudio } = getAudioElements();
        if (!currentAudio) {
            isPlayingRef.current = false;
            setIsPlaying(false);
            return;
        }

        const startVolume = currentAudio.volume;
        const steps = fadeOutDuration / 20;
        let step = 0;

        fadeIntervalRef.current = window.setInterval(() => {
            step++;
            currentAudio.volume = Math.max(0, startVolume * (1 - step / steps));

            if (step >= steps) {
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current);
                    fadeIntervalRef.current = null;
                }
                currentAudio.pause();
                currentAudio.currentTime = 0;
                isPlayingRef.current = false;
                setIsPlaying(false);
                console.log('🎵 Seamless loop stopped');
            }
        }, 20);
    }, [clearAllTimers, fadeOutDuration, getAudioElements]);

    /**
     * 设置音量
     */
    const setVolume = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        const { current: currentAudio } = getAudioElements();
        if (currentAudio && isPlayingRef.current) {
            currentAudio.volume = clampedVolume;
        }
    }, [getAudioElements]);

    /**
     * 组件卸载时清理
     */
    useEffect(() => {
        return () => {
            clearAllTimers();
            if (audioARef.current) {
                audioARef.current.pause();
                audioARef.current = null;
            }
            if (audioBRef.current) {
                audioBRef.current.pause();
                audioBRef.current = null;
            }
            isPlayingRef.current = false;
        };
    }, [clearAllTimers]);

    return {
        play,
        stop,
        setVolume,
        isPlaying,
    };
}

export default useSeamlessLoop;
