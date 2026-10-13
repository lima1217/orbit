import React, { useId, useMemo } from 'react';
import { BottomSheet } from './BottomSheet';
import { readJourney, localDateKey } from '../utils/journey';
import { formatUtc } from './WakeUpPicker';

interface JourneySheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const SHOW_DAYS = 14;
const pad = (n: number) => n.toString().padStart(2, '0');

function describeDate(key: string, todayKey: string, yesterdayKey: string) {
    const [y, m, d] = key.split('-').map(Number);
    const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
    const label = key === todayKey ? '今天' : key === yesterdayKey ? '昨天' : `${m}月${d}日`;
    return { label, weekday };
}

/**
 * 逆旅行程 — 你这些天住过的城市。
 * 只陈述，不评判：没有分数、没有「规律 / 不规律」，像护照上的一枚枚章。
 */
export const JourneySheet: React.FC<JourneySheetProps> = ({ isOpen, onClose }) => {
    const titleId = useId();

    // 每次打开时读取（行程只在校准时写入）
    const entries = useMemo(
        () => (isOpen ? readJourney().slice(-SHOW_DAYS).reverse() : []),
        [isOpen]
    );

    const now = new Date();
    const todayKey = localDateKey(now);
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const yesterdayKey = localDateKey(y);

    const weekCities = new Set(entries.slice(0, 7).map((e) => e.cityCN));
    const summary =
        entries.length <= 1
            ? '旅程从今天开始'
            : `最近 ${Math.min(entries.length, 7)} 天，你住过 ${weekCities.size} 座城市`;

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} labelledBy={titleId}>
            <div className="text-center">
                <h2 id={titleId} className="text-quote text-ink-primary text-[1.375rem] leading-snug">
                    逆旅行程
                </h2>
                <p className="text-caption text-ink-muted mt-1.5">{summary}</p>
            </div>

            <ol className="relative mt-7 mx-auto max-w-[20rem]">
                {/* 一条细线把每天串起来，像轨道上的一段路 */}
                {entries.length > 1 && (
                    <span
                        className="absolute left-[calc(5.25rem+4.5px)] top-3 bottom-3 w-px bg-ink-primary/10"
                        aria-hidden="true"
                    />
                )}
                {entries.map((e) => {
                    const { label, weekday } = describeDate(e.date, todayKey, yesterdayKey);
                    const isToday = e.date === todayKey;
                    return (
                        <li key={e.date} className="relative flex items-center gap-5 py-3">
                            <div className="w-16 shrink-0 text-right">
                                <p className={`text-caption ${isToday ? 'text-ink-primary' : 'text-ink-secondary'}`}>{label}</p>
                                <p className="text-caption-small text-ink-muted">{weekday}</p>
                            </div>
                            <span
                                className={`relative z-10 w-2.5 h-2.5 rounded-full shrink-0 ${
                                    isToday
                                        ? 'bg-[oklch(0.82_0.11_60)] shadow-[0_0_0_4px_oklch(0.95_0.05_70/0.6)]'
                                        : 'bg-white ring-1 ring-ink-primary/20'
                                }`}
                                aria-hidden="true"
                            />
                            <div className="min-w-0">
                                <p className="text-quote text-ink-primary text-lg leading-tight truncate">{e.cityCN}</p>
                                <p className="text-caption-small text-ink-muted mt-0.5 truncate">
                                    <span className="font-serif italic text-[0.8125rem]" translate="no">{e.city}</span>
                                    {' · '}醒于 <span className="tabular-nums">{pad(e.hour)}:{pad(e.minute)}</span>
                                    {' · '}{formatUtc(e.offset)}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>

            <p className="text-quote text-ink-muted text-[0.9375rem] text-center mt-6">人生如逆旅，我亦是行人</p>
        </BottomSheet>
    );
};
