/**
 * 🔓 Audio Unlock Manager
 * 
 * 浏览器需要用户交互才能播放音频。
 * 这个模块在用户首次交互时解锁 AudioContext，
 * 之后的音频播放就不会被阻止。
 */

let audioContext: AudioContext | null = null;
let isUnlocked = false;

/**
 * 尝试解锁音频上下文
 * 必须在用户交互（点击、触摸）的事件处理函数中调用
 */
export function unlockAudio(): void {
    if (isUnlocked) return;

    try {
        // 创建或恢复 AudioContext
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // 播放一个极短的静音音频来解锁
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);

        isUnlocked = true;
        console.log('🔓 Audio context unlocked');
    } catch (e) {
        console.warn('Failed to unlock audio:', e);
    }
}

/**
 * 检查音频是否已解锁
 */
export function isAudioUnlocked(): boolean {
    return isUnlocked;
}

/**
 * 获取 AudioContext（如果已创建）
 */
export function getAudioContext(): AudioContext | null {
    return audioContext;
}
