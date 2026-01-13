import React, { useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AMBIENT_SOUNDS,
    AmbientSound,
    getSavedSoundMix,
    saveSoundMix
} from '../constants/ambientSounds';

// localStorage key
const SOUND_ENABLED_KEY = 'orbit_sound_enabled';

export function getSoundEnabled(): boolean {
    const saved = localStorage.getItem(SOUND_ENABLED_KEY);
    return saved !== 'false';
}

export function saveSoundEnabled(enabled: boolean): void {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
}

interface SoundSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    soundEnabled: boolean;
    onToggleSound: (enabled: boolean) => void;
}

/**
 * 🎵 SoundSelector - 环境音效选择器（支持混音）
 */
export const SoundSelector: React.FC<SoundSelectorProps> = ({
    isOpen,
    onClose,
    soundEnabled,
    onToggleSound,
}) => {
    // 选中的音效 IDs
    const [selectedIds, setSelectedIds] = useState<string[]>(() => {
        const saved = getSavedSoundMix();
        return saved.length > 0 ? saved : ['ocean'];
    });

    // 音频播放器引用
    const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

    // 切换音效选择（允许全部取消 = 静音）
    const toggleSound = useCallback((soundId: string) => {
        setSelectedIds(prev => {
            const newIds = prev.includes(soundId)
                ? prev.filter(id => id !== soundId)
                : [...prev, soundId];

            saveSoundMix(newIds);

            // 同步更新 soundEnabled 状态
            const hasSound = newIds.length > 0;
            if (hasSound !== soundEnabled) {
                saveSoundEnabled(hasSound);
                onToggleSound(hasSound);
            }

            return newIds;
        });
    }, [soundEnabled, onToggleSound]);

    // 管理音频播放
    useEffect(() => {
        // 停止所有未选中的音频
        audioRefs.current.forEach((audio, id) => {
            if (!selectedIds.includes(id)) {
                audio.pause();
                audio.currentTime = 0;
            }
        });

        // 如果没有选中任何音效，直接返回
        if (selectedIds.length === 0) return;

        // 播放选中的音效
        selectedIds.forEach(id => {
            const sound = AMBIENT_SOUNDS.find(s => s.id === id);
            if (!sound) return;

            let audio = audioRefs.current.get(id);
            if (!audio) {
                audio = new Audio(sound.src);
                audio.loop = true;
                audioRefs.current.set(id, audio);
            }

            audio.volume = 1.0 / Math.max(1, selectedIds.length);  // 调高音量
            audio.play().catch(console.warn);
        });
    }, [selectedIds]);

    // 调整音量
    useEffect(() => {
        if (selectedIds.length === 0) return;
        const volume = 1.0 / selectedIds.length;  // 调高音量
        audioRefs.current.forEach((audio, id) => {
            if (selectedIds.includes(id)) {
                audio.volume = volume;
            }
        });
    }, [selectedIds]);

    // 清理
    useEffect(() => {
        return () => {
            audioRefs.current.forEach(audio => {
                audio.pause();
                audio.src = '';
            });
            audioRefs.current.clear();
        };
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 背景遮罩 - 与 WakeUpSheet 一致 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[200]"
                    />

                    {/* Sheet - 融入天空的渐变设计 */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 32, stiffness: 350 }}
                        className="fixed bottom-0 left-0 right-0 z-[201] rounded-t-3xl overflow-hidden"
                        style={{
                            background: 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 40%, rgba(255,255,255,0.75) 70%, rgba(255,255,255,0.4) 100%)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* 顶部边缘光晕 */}
                        <div
                            className="absolute inset-x-0 top-0 h-px"
                            style={{
                                background: 'linear-gradient(to right, transparent, rgba(252,211,77,0.3), rgba(255,182,193,0.3), transparent)'
                            }}
                        />

                        {/* 拖拽手柄 */}
                        <div className="flex justify-center pt-4 pb-6">
                            <motion.div
                                className="w-10 h-1 rounded-full bg-gray-300/70"
                                whileHover={{ scale: 1.1 }}
                            />
                        </div>

                        {/* 音效选项网格 */}
                        <motion.div
                            className="px-6 pb-10"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
                                {AMBIENT_SOUNDS.map(sound => (
                                    <SoundOption
                                        key={sound.id}
                                        sound={sound}
                                        isSelected={selectedIds.includes(sound.id)}
                                        onClick={() => toggleSound(sound.id)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

/**
 * 单个音效选项
 */
interface SoundOptionProps {
    sound: AmbientSound;
    isSelected: boolean;
    onClick: () => void;
}

const SoundOption: React.FC<SoundOptionProps> = ({ sound, isSelected, onClick }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`
                flex items-center justify-center aspect-square rounded-2xl cursor-pointer
                transition-all duration-200 relative
                ${isSelected
                    ? 'bg-white/80 shadow-sm ring-2 ring-gray-800/20'
                    : 'bg-gray-50/50 hover:bg-white/60'
                }
            `}
            title={sound.name}
        >
            <span className="text-2xl">{sound.icon}</span>
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center"
                >
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>
            )}
        </motion.button>
    );
};

/**
 * 🎵 音符图标按钮
 */
interface MusicButtonProps {
    onClick: (e?: React.MouseEvent) => void;
    hasSound: boolean;
}

export const MusicButton: React.FC<MusicButtonProps> = ({ onClick, hasSound }) => {
    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 0.8 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={onClick}
            className="absolute top-8 right-8 w-9 h-9 flex items-center justify-center cursor-pointer z-50"
            aria-label="选择环境音"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={hasSound ? 'text-gray-500/80' : 'text-gray-400/60'}
            >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
            </svg>
        </motion.button>
    );
};

export default SoundSelector;
