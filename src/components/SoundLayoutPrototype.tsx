import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AMBIENT_SOUNDS } from '../constants/ambientSounds';

/**
 * 🎨 Sound Layout Prototype
 * 三种音效布局方案的原型对比
 * 
 * 访问 /?prototype=sound 查看此页面
 */

const sounds = AMBIENT_SOUNDS;

type LayoutType = 'A' | 'B' | 'C';

export const SoundLayoutPrototype: React.FC = () => {
    const [activeLayout, setActiveLayout] = useState<LayoutType>('C');
    const [selectedSounds, setSelectedSounds] = useState<string[]>(['ocean']);

    const toggleSound = (id: string) => {
        setSelectedSounds(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 overflow-hidden">
            {/* 模拟天空背景 */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, #87CEEB 0%, #E0F4F1 30%, #FDF8F3 70%, #FFE4E1 100%)'
                }}
            />

            {/* 模拟太阳 */}
            <div
                className="absolute w-24 h-24 rounded-full"
                style={{
                    top: '15%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'radial-gradient(circle, #FCD34D 0%, #F59E0B 100%)',
                    boxShadow: '0 0 60px rgba(252, 211, 77, 0.6), 0 0 120px rgba(252, 211, 77, 0.3)',
                }}
            />

            {/* 方案切换器 */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
                {(['A', 'B', 'C'] as LayoutType[]).map(layout => (
                    <button
                        key={layout}
                        onClick={() => setActiveLayout(layout)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${activeLayout === layout
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        方案 {layout}
                    </button>
                ))}
            </div>

            {/* 方案说明 */}
            <motion.div
                key={activeLayout}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 z-50 text-center"
            >
                <p className="text-xs text-gray-500/80 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {activeLayout === 'A' && '时间右侧小 indicator，点击展开一行'}
                    {activeLayout === 'B' && '时间下方网格，默认收起，点击展开'}
                    {activeLayout === 'C' && '底部固定一行，横向滚动选择'}
                </p>
            </motion.div>

            {/* 主内容区域 */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center h-full px-6">
                {/* 城市名称 */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        🏔️ Denver
                    </h2>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600/90">
                            你的身体时钟，与丹佛同步
                        </p>
                        <p className="text-sm text-gray-500/70">
                            有人在想：中午吃什么，顺便想了一下人生
                        </p>
                    </div>
                </div>

                {/* 方案 A: 时间 + 右侧 indicator */}
                {activeLayout === 'A' && <LayoutA selectedSounds={selectedSounds} toggleSound={toggleSound} />}

                {/* 方案 B: 时间 + 下方网格 */}
                {activeLayout === 'B' && <LayoutB selectedSounds={selectedSounds} toggleSound={toggleSound} />}

                {/* 方案 C: 时间 + 底部固定一行 */}
                {activeLayout === 'C' && <LayoutC selectedSounds={selectedSounds} toggleSound={toggleSound} />}
            </div>

            {/* 底部按钮 - 只在方案 A/B 时显示 */}
            {(activeLayout === 'A' || activeLayout === 'B') && (
                <div className="absolute bottom-10 left-0 right-0 text-center z-50">
                    <button className="text-sm font-light text-gray-500/60">
                        选择起床时间
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * 方案 A: 时间右侧小 indicator，点击展开一行
 */
const LayoutA: React.FC<{
    selectedSounds: string[];
    toggleSound: (id: string) => void;
}> = ({ selectedSounds, toggleSound }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const selectedIcons = sounds
        .filter(s => selectedSounds.includes(s.id))
        .map(s => s.icon)
        .slice(0, 2);

    return (
        <div className="text-center">
            {/* 时间 + indicator */}
            <div className="flex items-center justify-center gap-4">
                <div className="text-8xl font-light text-gray-800 tracking-tight">
                    12:36
                </div>
                <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-colors cursor-pointer"
                >
                    {selectedIcons.length > 0 ? (
                        selectedIcons.map((icon, i) => (
                            <span key={i} className="text-lg">{icon}</span>
                        ))
                    ) : (
                        <span className="text-lg opacity-50">🎵</span>
                    )}
                </motion.button>
            </div>

            {/* 展开的音效行 */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                            {sounds.map(sound => (
                                <motion.button
                                    key={sound.id}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleSound(sound.id)}
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all ${selectedSounds.includes(sound.id)
                                            ? 'bg-white/90 shadow-sm ring-2 ring-gray-800/20'
                                            : 'bg-white/40 hover:bg-white/60'
                                        }`}
                                >
                                    <span className="text-xl">{sound.icon}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * 方案 B: 时间下方网格，默认收起
 */
const LayoutB: React.FC<{
    selectedSounds: string[];
    toggleSound: (id: string) => void;
}> = ({ selectedSounds, toggleSound }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const selectedIcons = sounds
        .filter(s => selectedSounds.includes(s.id))
        .map(s => s.icon);

    return (
        <div className="text-center">
            {/* 时间 */}
            <div className="text-8xl font-light text-gray-800 tracking-tight mb-6">
                12:36
            </div>

            {/* 收起状态：显示已选中的 icons */}
            {!isExpanded && (
                <motion.button
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-colors cursor-pointer mx-auto"
                >
                    {selectedIcons.length > 0 ? (
                        <>
                            {selectedIcons.slice(0, 4).map((icon, i) => (
                                <span key={i} className="text-lg opacity-70">{icon}</span>
                            ))}
                            {selectedIcons.length > 4 && (
                                <span className="text-xs text-gray-500">+{selectedIcons.length - 4}</span>
                            )}
                        </>
                    ) : (
                        <span className="text-sm text-gray-500/60">点击选择音效</span>
                    )}
                </motion.button>
            )}

            {/* 展开状态：完整网格 */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto mb-4">
                            {sounds.map(sound => (
                                <motion.button
                                    key={sound.id}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleSound(sound.id)}
                                    className={`aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-all ${selectedSounds.includes(sound.id)
                                            ? 'bg-white/90 shadow-sm ring-2 ring-gray-800/20'
                                            : 'bg-white/40 hover:bg-white/60'
                                        }`}
                                >
                                    <span className="text-2xl">{sound.icon}</span>
                                </motion.button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-xs text-gray-500/60 hover:text-gray-600 cursor-pointer"
                        >
                            收起
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * 方案 C: 底部固定一行
 */
const LayoutC: React.FC<{
    selectedSounds: string[];
    toggleSound: (id: string) => void;
}> = ({ selectedSounds, toggleSound }) => {
    return (
        <>
            {/* 时间 */}
            <div className="text-center mb-10">
                <div className="text-8xl font-light text-gray-800 tracking-tight">
                    12:36
                </div>
            </div>

            {/* 底部固定区域 */}
            <div className="absolute bottom-0 left-0 right-0 z-50">
                {/* 音效一行 */}
                <div className="px-4 pb-4">
                    <div className="flex justify-center gap-2 overflow-x-auto py-2 scrollbar-hide">
                        {sounds.map(sound => (
                            <motion.button
                                key={sound.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleSound(sound.id)}
                                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all ${selectedSounds.includes(sound.id)
                                        ? 'bg-white/90 shadow-sm ring-2 ring-gray-800/20'
                                        : 'bg-white/30 hover:bg-white/50'
                                    }`}
                            >
                                <span className="text-xl">{sound.icon}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* 起床时间按钮 */}
                <div className="text-center pb-10">
                    <button className="text-sm font-light text-gray-500/60">
                        选择起床时间
                    </button>
                </div>
            </div>
        </>
    );
};

export default SoundLayoutPrototype;
