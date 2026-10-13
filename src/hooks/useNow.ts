import { useEffect, useState } from 'react';

/** 每 `intervalMs` 刷新一次的当前时间 */
export function useNow(intervalMs = 1000): Date {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return now;
}

/** 某个 UTC 偏移下的当地小时（0–24，含分钟小数） */
export function getHourAtOffset(now: Date, offset: number): number {
    const utc = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    return (((utc + offset) % 24) + 24) % 24;
}
