/**
 * Timezone to City Mapping
 * Maps UTC offsets to representative cities for the "living timezone" feature
 */

import { TimezoneInfo } from '../types/timezone';

export type { TimezoneInfo } from '../types/timezone';

/**
 * Standard wake-up time reference (7:00 AM)
 * Used to calculate user's "living timezone" offset
 */
export const STANDARD_WAKEUP_HOUR = 8;

/**
 * Timezone mapping table
 * Each UTC offset maps to a representative city
 */
export const TIMEZONES: TimezoneInfo[] = [
    { offset: -12, city: "Baker Island", cityCN: "贝克岛", country: "US Minor Outlying Islands", countryCN: "美国本土外小岛屿", emoji: "🏝️" },
    { offset: -11, city: "Pago Pago", cityCN: "帕果帕果", country: "American Samoa", countryCN: "美属萨摩亚", emoji: "🇦🇸" },
    { offset: -10, city: "Honolulu", cityCN: "檀香山", country: "Hawaii", countryCN: "夏威夷", emoji: "🌺" },
    { offset: -9, city: "Anchorage", cityCN: "安克雷奇", country: "Alaska", countryCN: "阿拉斯加", emoji: "🇺🇸" },
    { offset: -8, city: "Los Angeles", cityCN: "洛杉矶", country: "California", countryCN: "加利福尼亚", emoji: "🇺🇸" },
    { offset: -7, city: "Denver", cityCN: "丹佛", country: "Colorado", countryCN: "科罗拉多", emoji: "🏔️" },
    { offset: -6, city: "Mexico City", cityCN: "墨西哥城", country: "Mexico", countryCN: "墨西哥", emoji: "🇲🇽" },
    { offset: -5, city: "New York", cityCN: "纽约", country: "USA", countryCN: "美国", emoji: "🗽" },
    { offset: -4, city: "Santiago", cityCN: "圣地亚哥", country: "Chile", countryCN: "智利", emoji: "🇨🇱" },
    { offset: -3, city: "São Paulo", cityCN: "圣保罗", country: "Brazil", countryCN: "巴西", emoji: "🇧🇷" },
    { offset: -2, city: "Fernando de Noronha", cityCN: "费尔南多-迪诺罗尼亚", country: "Brazil", countryCN: "巴西", emoji: "🏖️" },
    { offset: -1, city: "Azores", cityCN: "亚速尔群岛", country: "Portugal", countryCN: "葡萄牙", emoji: "🇵🇹" },
    { offset: 0, city: "London", cityCN: "伦敦", country: "UK", countryCN: "英国", emoji: "🇬🇧" },
    { offset: 1, city: "Paris", cityCN: "巴黎", country: "France", countryCN: "法国", emoji: "🇫🇷" },
    { offset: 2, city: "Cairo", cityCN: "开罗", country: "Egypt", countryCN: "埃及", emoji: "🇪🇬" },
    { offset: 3, city: "Istanbul", cityCN: "伊斯坦布尔", country: "Turkey", countryCN: "土耳其", emoji: "🇹🇷" },
    { offset: 4, city: "Dubai", cityCN: "迪拜", country: "UAE", countryCN: "阿联酋", emoji: "🇦🇪" },
    { offset: 5, city: "Karachi", cityCN: "卡拉奇", country: "Pakistan", countryCN: "巴基斯坦", emoji: "🇵🇰" },
    { offset: 5.5, city: "Mumbai", cityCN: "孟买", country: "India", countryCN: "印度", emoji: "🇮🇳" },
    { offset: 6, city: "Dhaka", cityCN: "达卡", country: "Bangladesh", countryCN: "孟加拉国", emoji: "🇧🇩" },
    { offset: 7, city: "Bangkok", cityCN: "曼谷", country: "Thailand", countryCN: "泰国", emoji: "🇹🇭" },
    { offset: 8, city: "Singapore", cityCN: "新加坡", country: "Singapore", countryCN: "新加坡", emoji: "🇸🇬" },
    { offset: 9, city: "Tokyo", cityCN: "东京", country: "Japan", countryCN: "日本", emoji: "🇯🇵" },
    { offset: 10, city: "Sydney", cityCN: "悉尼", country: "Australia", countryCN: "澳大利亚", emoji: "🇦🇺" },
    { offset: 11, city: "Nouméa", cityCN: "努美阿", country: "New Caledonia", countryCN: "新喀里多尼亚", emoji: "🏝️" },
    { offset: 12, city: "Auckland", cityCN: "奥克兰", country: "New Zealand", countryCN: "新西兰", emoji: "🇳🇿" },
    { offset: 13, city: "Apia", cityCN: "阿皮亚", country: "Samoa", countryCN: "萨摩亚", emoji: "🇼🇸" },
    { offset: 14, city: "Kiritimati", cityCN: "圣诞岛", country: "Kiribati", countryCN: "基里巴斯", emoji: "🏝️" },
];

/**
 * Get timezone info by UTC offset
 * Returns the closest matching timezone if exact match not found
 */
export function getTimezoneByOffset(offset: number): TimezoneInfo {
    // First try exact match
    const exact = TIMEZONES.find(tz => tz.offset === offset);
    if (exact) return exact;

    // Find closest match
    const sorted = [...TIMEZONES].sort(
        (a, b) => Math.abs(a.offset - offset) - Math.abs(b.offset - offset)
    );
    return sorted[0];
}

/**
 * Calculate user's "living timezone" based on wake-up time
 * 
 * @param wakeUpHour - The hour the user woke up (0-23) in their local timezone
 * @param localTimezoneOffset - User's actual timezone offset (e.g., +8 for Beijing)
 * @returns The calculated "living timezone" offset
 * 
 * Example:
 * - User in Beijing (UTC+8) wakes up at 12:00
 * - Standard wake-up is 7:00
 * - Offset difference: 12 - 7 = 5 hours late
 * - Living timezone: 8 - 5 = UTC+3 (Istanbul)
 */
export function calculateLivingTimezone(
    wakeUpHour: number,
    localTimezoneOffset: number = 8 // Default to Beijing time
): number {
    const hourDifference = wakeUpHour - STANDARD_WAKEUP_HOUR;
    let livingOffset = localTimezoneOffset - hourDifference;

    // Normalize to valid range (-12 to +14)
    if (livingOffset < -12) livingOffset += 24;
    if (livingOffset > 14) livingOffset -= 24;

    return livingOffset;
}

/**
 * Format time in Orbit format (HH:MM)
 */
export function formatOrbitTime(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Calculate Orbit time based on wake-up time
 * 
 * @param wakeUpTime - The timestamp when user woke up
 * @param now - Current time (defaults to now)
 * @returns Current Orbit hour (0-24, where 6:00 = sunrise)
 */
export function calculateOrbitTime(
    wakeUpTime: Date,
    now: Date = new Date()
): number {
    const elapsedMs = now.getTime() - wakeUpTime.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    // Wake-up = Orbit 6:00 (sunrise)
    const ORBIT_SUNRISE = 6;
    let orbitHour = ORBIT_SUNRISE + elapsedHours;

    // Wrap around 24 hours
    orbitHour = orbitHour % 24;
    if (orbitHour < 0) orbitHour += 24;

    return orbitHour;
}
