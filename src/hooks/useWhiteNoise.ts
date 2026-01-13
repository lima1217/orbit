import { useRef, useCallback, useEffect } from 'react';

interface WhiteNoiseOptions {
    /** 初始音量 (0-1)，默认 0.15 */
    volume?: number;
    /** 淡入时长 (ms)，默认 1000 */
    fadeInDuration?: number;
    /** 淡出时长 (ms)，默认 800 */
    fadeOutDuration?: number;
    /** 音色类型：'white' | 'pink' | 'brown'，默认 'pink' */
    noiseType?: 'white' | 'pink' | 'brown';
}

/**
 * 🎵 useWhiteNoise - 程序化白噪音生成器
 * 
 * 使用 Web Audio API 生成舒适的白噪音/粉噪音
 * 适合冥想、专注和放松场景
 */
export function useWhiteNoise(options: WhiteNoiseOptions = {}) {
    const {
        volume = 0.15,
        fadeInDuration = 1000,
        fadeOutDuration = 800,
        noiseType = 'pink',
    } = options;

    const audioContextRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const isPlayingRef = useRef(false);

    /**
     * 生成噪音缓冲区
     */
    const createNoiseBuffer = useCallback((audioContext: AudioContext): AudioBuffer => {
        const bufferSize = audioContext.sampleRate * 5; // 5秒循环
        const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);

            if (noiseType === 'white') {
                // 白噪音：纯随机
                for (let i = 0; i < bufferSize; i++) {
                    channelData[i] = Math.random() * 2 - 1;
                }
            } else if (noiseType === 'pink') {
                // 粉噪音：更柔和，低频更丰富
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    channelData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                    b6 = white * 0.115926;
                }
            } else if (noiseType === 'brown') {
                // 棕噪音：最柔和，像海浪或风声
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    lastOut = (lastOut + (0.02 * white)) / 1.02;
                    channelData[i] = lastOut * 3.5;
                }
            }
        }

        return buffer;
    }, [noiseType]);

    /**
     * 开始播放白噪音
     */
    const play = useCallback(async () => {
        // 如果已经在播放，只需确保 AudioContext 处于运行状态
        if (isPlayingRef.current && audioContextRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            return;
        }

        try {
            // 创建或恢复 AudioContext
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const audioContext = audioContextRef.current;

            // 确保 AudioContext 处于运行状态
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // 检查是否成功恢复
            if (audioContext.state !== 'running') {
                console.warn('AudioContext is not running, waiting for user interaction');
                return;
            }

            // 创建噪音源
            const noiseBuffer = createNoiseBuffer(audioContext);
            const noiseNode = audioContext.createBufferSource();
            noiseNode.buffer = noiseBuffer;
            noiseNode.loop = true;

            // 创建增益节点用于音量控制和淡入淡出
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);

            // 连接节点
            noiseNode.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // 开始播放
            noiseNode.start();
            isPlayingRef.current = true;

            // 淡入效果
            gainNode.gain.linearRampToValueAtTime(
                volume,
                audioContext.currentTime + fadeInDuration / 1000
            );

            noiseNodeRef.current = noiseNode;
            gainNodeRef.current = gainNode;

            console.log('🎵 White noise started playing');
        } catch (error) {
            console.warn('White noise playback failed:', error);
        }
    }, [volume, fadeInDuration, createNoiseBuffer]);

    /**
     * 淡出并停止白噪音
     */
    const fadeOut = useCallback(() => {
        if (!isPlayingRef.current || !audioContextRef.current || !gainNodeRef.current) return;

        const audioContext = audioContextRef.current;
        const gainNode = gainNodeRef.current;
        const noiseNode = noiseNodeRef.current;

        // 淡出效果
        gainNode.gain.linearRampToValueAtTime(
            0,
            audioContext.currentTime + fadeOutDuration / 1000
        );

        // 淡出结束后停止播放
        setTimeout(() => {
            if (noiseNode) {
                try {
                    noiseNode.stop();
                } catch (e) {
                    // 忽略已停止的节点
                }
            }
            isPlayingRef.current = false;
            noiseNodeRef.current = null;
            gainNodeRef.current = null;
        }, fadeOutDuration);
    }, [fadeOutDuration]);

    /**
     * 立即停止（无淡出）
     */
    const stop = useCallback(() => {
        if (noiseNodeRef.current) {
            try {
                noiseNodeRef.current.stop();
            } catch (e) {
                // 忽略
            }
        }
        isPlayingRef.current = false;
        noiseNodeRef.current = null;
        gainNodeRef.current = null;
    }, []);

    /**
     * 组件卸载时清理
     */
    useEffect(() => {
        return () => {
            stop();
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, [stop]);

    return {
        play,
        fadeOut,
        stop,
        isPlaying: isPlayingRef.current,
    };
}

export default useWhiteNoise;
