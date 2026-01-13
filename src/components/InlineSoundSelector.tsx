import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AMBIENT_SOUNDS, AmbientSound } from '../constants/ambientSounds';

interface InlineSoundSelectorProps {
    selectedIds: string[];
    onToggleSound: (soundId: string) => void;
}

/**
 * 🎵 InlineSoundSelector - 内嵌式音效选择器（方案 B 优化版）
 * 
 * 设计原则：
 * - 无黑色钩子，选中用柔和光晕表示
 * - 无圆形容器，emoji 自由呈现
 * - 无"收起"按钮，点击空白处自动收起
 * - 收起时只显示前4个emoji，无"+N"数字
 */
export const InlineSoundSelector: React.FC<InlineSoundSelectorProps> = ({
    selectedIds,
    onToggleSound,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 点击外部区域时收起
    useEffect(() => {
        if (!isExpanded) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        // 延迟添加监听，避免点击展开时立即触发收起
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isExpanded]);

    // 获取选中的 emoji icons（最多显示4个）
    const selectedIcons = AMBIENT_SOUNDS
        .filter(s => selectedIds.includes(s.id))
        .map(s => s.icon)
        .slice(0, 4);

    return (
        <div ref={containerRef} className="flex flex-col items-center">
            {/* 收起状态 - 简洁的 emoji 展示 */}
            <AnimatePresence mode="wait">
                {!isExpanded && (
                    <motion.button
                        key="collapsed"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsExpanded(true)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full 
                                   bg-white/20 backdrop-blur-sm hover:bg-white/35 
                                   transition-colors cursor-pointer"
                    >
                        {selectedIcons.length > 0 ? (
                            selectedIcons.map((icon, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="text-lg"
                                >
                                    {icon}
                                </motion.span>
                            ))
                        ) : (
                            <span className="text-lg opacity-50">
                                🎵
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* 展开状态 - 纯净的 emoji 网格 */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.95, height: 0 }}
                        animate={{ opacity: 1, scale: 1, height: 'auto' }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                    >
                        {/* 音效网格 - 无容器背景 */}
                        <div className="grid grid-cols-4 gap-x-4 gap-y-3 max-w-xs mx-auto py-2">
                            {AMBIENT_SOUNDS.map((sound, index) => (
                                <SoundButton
                                    key={sound.id}
                                    sound={sound}
                                    isSelected={selectedIds.includes(sound.id)}
                                    onClick={() => onToggleSound(sound.id)}
                                    delay={index * 0.02}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * 单个音效按钮 - 极简设计
 * 选中状态：柔和光晕边框
 * 未选中状态：纯 emoji
 */
interface SoundButtonProps {
    sound: AmbientSound;
    isSelected: boolean;
    onClick: () => void;
    delay?: number;
}

const SoundButton: React.FC<SoundButtonProps> = ({
    sound,
    isSelected,
    onClick,
    delay = 0
}) => {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={onClick}
            className="relative flex items-center justify-center w-12 h-12 cursor-pointer transition-all duration-200"
            title={sound.name}
        >
            {/* 选中时的柔和光晕 */}
            {isSelected && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 rounded-xl bg-white/60 backdrop-blur-sm"
                    style={{
                        boxShadow: '0 0 12px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.05)'
                    }}
                />
            )}

            {/* Emoji 本身 */}
            <span
                className={`relative z-10 text-2xl transition-transform duration-150 ${isSelected ? 'scale-105' : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
            >
                {sound.icon}
            </span>
        </motion.button>
    );
};

export default InlineSoundSelector;
