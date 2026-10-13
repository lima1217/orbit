import React, { useEffect, useRef, useState } from 'react';

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
export const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

interface WheelColumnProps {
    items: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    label: string;
}

/**
 * 单列滚轮：离中心越远越小越淡，停下后吸附。
 * 视觉状态跟随实时 scrollTop，选中值在滚动中就同步给父级（用于实时预览城市）。
 */
const WheelColumn: React.FC<WheelColumnProps> = ({ items, selectedIndex, onSelect, label }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(selectedIndex * ITEM_H);
    const userScrolling = useRef(false);
    const idleTimer = useRef<number | undefined>(undefined);
    const frame = useRef(0);

    // 外部改值（键盘 / 点击 / 初始）→ 滚到对应位置
    useEffect(() => {
        const el = ref.current;
        if (!el || userScrolling.current) return;
        const target = selectedIndex * ITEM_H;
        if (Math.abs(el.scrollTop - target) > 1) {
            el.scrollTo({ top: target, behavior: el.scrollTop === 0 && target > 0 ? 'auto' : 'smooth' });
        }
    }, [selectedIndex]);

    useEffect(() => () => {
        cancelAnimationFrame(frame.current);
        clearTimeout(idleTimer.current);
    }, []);

    const handleScroll = () => {
        const el = ref.current;
        if (!el) return;
        userScrolling.current = true;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
            setScrollTop(el.scrollTop);
            const idx = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_H)));
            if (idx !== selectedIndex) onSelect(idx);
        });
        clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => {
            userScrolling.current = false;
        }, 160);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const map: Record<string, number> = {
            ArrowUp: selectedIndex - 1,
            ArrowDown: selectedIndex + 1,
            PageUp: selectedIndex - 3,
            PageDown: selectedIndex + 3,
            Home: 0,
            End: items.length - 1,
        };
        if (!(e.key in map)) return;
        e.preventDefault();
        const next = Math.min(items.length - 1, Math.max(0, map[e.key]));
        if (next !== selectedIndex) onSelect(next);
    };

    return (
        <div
            role="spinbutton"
            tabIndex={0}
            aria-label={label}
            aria-valuenow={Number.parseInt(items[selectedIndex], 10)}
            aria-valuemin={Number.parseInt(items[0], 10)}
            aria-valuemax={Number.parseInt(items[items.length - 1], 10)}
            aria-valuetext={items[selectedIndex]}
            onKeyDown={handleKeyDown}
            className="relative w-20 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary/40"
            style={{ height: ITEM_H * VISIBLE }}
        >
            <div
                ref={ref}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory overscroll-contain"
                style={{
                    paddingBlock: PAD,
                    maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
                }}
                aria-hidden="true"
            >
                {items.map((item, index) => {
                    const d = Math.abs(index * ITEM_H - scrollTop) / ITEM_H;
                    const near = Math.max(0, 1 - d);
                    return (
                        <button
                            key={item}
                            type="button"
                            tabIndex={-1}
                            onClick={() => onSelect(index)}
                            className="snap-center w-full flex items-center justify-center cursor-pointer font-sans tabular-nums leading-none text-ink-primary"
                            style={{
                                height: ITEM_H,
                                fontSize: 20 + near * 12,
                                fontWeight: near > 0.5 ? 300 : 400,
                                opacity: Math.max(0.18, 1 - d * 0.38),
                            }}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

interface TimeWheelProps {
    hourIndex: number;
    minuteIndex: number;
    onHourChange: (index: number) => void;
    onMinuteChange: (index: number) => void;
}

/** 起床时间选择：时 : 分，中间一条柔光选区 */
export const TimeWheel: React.FC<TimeWheelProps> = ({ hourIndex, minuteIndex, onHourChange, onMinuteChange }) => (
    <div className="relative flex items-center justify-center" role="group" aria-label="起床时间">
        {/* Selection band */}
        <div
            className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-2xl pointer-events-none"
            style={{
                height: ITEM_H + 8,
                background: 'oklch(1 0 0 / 0.5)',
                boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.8), 0 0 0 1px oklch(0.40 0.02 70 / 0.06), 0 8px 24px -12px oklch(0.35 0.03 260 / 0.25)',
            }}
            aria-hidden="true"
        />
        <WheelColumn items={HOUR_OPTIONS} selectedIndex={hourIndex} onSelect={onHourChange} label="小时" />
        <span className="relative font-sans font-extralight text-[2rem] leading-none text-ink-muted pb-1" aria-hidden="true">:</span>
        <WheelColumn items={MINUTE_OPTIONS} selectedIndex={minuteIndex} onSelect={onMinuteChange} label="分钟" />
    </div>
);
