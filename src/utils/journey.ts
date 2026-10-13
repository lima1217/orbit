/**
 * 逆旅行程 — 每日起床记录（仅存本地）
 *
 * 「一天」以起床时刻为起点：距上次起床满 CHECK_IN_AFTER_HOURS 小时，
 * 就认为进入了新的一天，下次打开时轻轻问一句今天几点醒。
 */

import type { TimezoneInfo } from '../types/timezone';

export interface JourneyEntry {
    /** 起床那天的本地日期 YYYY-MM-DD */
    date: string;
    hour: number;
    minute: number;
    offset: number;
    city: string;
    cityCN: string;
}

const JOURNEY_KEY = 'orbit_journey';
const LAST_WAKE_KEY = 'orbit_last_wake';
/** 上次确认起床时间的时刻（ISO） */
const LAST_CHECKIN_KEY = 'orbit_last_checkin';
const MAX_ENTRIES = 90;
const CHECK_IN_AFTER_HOURS = 20;

const pad = (n: number) => n.toString().padStart(2, '0');

export function localDateKey(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 最近一次（≤ now）出现的 hh:mm —— 若该时刻今天还没到，就是昨天 */
export function wakeMomentFor(hour: number, minute: number, now: Date = new Date()): Date {
    const d = new Date(now);
    d.setHours(hour, minute, 0, 0);
    if (d.getTime() > now.getTime()) d.setDate(d.getDate() - 1);
    return d;
}

export function readJourney(): JourneyEntry[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(JOURNEY_KEY) ?? '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/** 记下一次起床：更新「上次起床」并按日期写入行程（同一天覆盖） */
export function recordWake(hour: number, minute: number, tz: TimezoneInfo, now: Date = new Date()): void {
    const moment = wakeMomentFor(hour, minute, now);
    localStorage.setItem(LAST_WAKE_KEY, moment.toISOString());
    localStorage.setItem(LAST_CHECKIN_KEY, now.toISOString());

    const entry: JourneyEntry = {
        date: localDateKey(moment),
        hour,
        minute,
        offset: tz.offset,
        city: tz.city,
        cityCN: tz.cityCN,
    };
    const rest = readJourney().filter((e) => e.date !== entry.date);
    const next = [...rest, entry].sort((a, b) => a.date.localeCompare(b.date)).slice(-MAX_ENTRIES);
    localStorage.setItem(JOURNEY_KEY, JSON.stringify(next));
}

/**
 * 是否该做今日校准：从未记录过，或距「上次起床」与「上次确认」中较晚的那个已满 20 小时。
 * 只看起床时刻的话，填了一个比现在还晚的起床时间（被算成昨天）会让每次打开都要重新校准。
 */
export function needsDailyCheckIn(now: Date = new Date()): boolean {
    const wake = Date.parse(localStorage.getItem(LAST_WAKE_KEY) ?? '');
    if (!Number.isFinite(wake)) return true;
    const checkin = Date.parse(localStorage.getItem(LAST_CHECKIN_KEY) ?? '');
    const last = Number.isFinite(checkin) ? Math.max(wake, checkin) : wake;
    return now.getTime() - last >= CHECK_IN_AFTER_HOURS * 3_600_000;
}
