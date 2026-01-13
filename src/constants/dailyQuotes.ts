/**
 * Daily Quotes for Orbit Intro
 * Curated quotes about time, existence, and presence
 * Note: No periods at end - intentional for contemplative feel
 */

export interface DailyQuote {
    text: string;
    author: string;
}

/**
 * 🌟 核心 Slogan - 首次访问时必须显示
 * 这句话定义了 Orbit 的灵魂
 */
export const CORE_SLOGAN: DailyQuote = {
    text: "每个失眠的人都是流亡者——被放逐到错误的时区",
    author: "Orbit"
};

export const DAILY_QUOTES: DailyQuote[] = [
    CORE_SLOGAN,  // 也加入轮换池
    {
        text: "我不知道有多少个灵魂藏在我身上，我每时每刻都在变化",
        author: "佩索阿"
    },
    {
        text: "我是我与我之间的距离",
        author: "佩索阿"
    },
    {
        text: "时间是构成我的实质，时间是一条河，携我而去，但我就是那条河",
        author: "博尔赫斯"
    },
    {
        text: "我不知道别人怎样，但我是由巧合构成的",
        author: "辛波斯卡"
    },
    {
        text: "时间是一种错觉，虽然是一种顽固的错觉",
        author: "爱因斯坦"
    },
    {
        text: "唯一的时间感觉来自于内心的变化",
        author: "爱因斯坦"
    },
    {
        text: "过去、现在与未来的区分只是一种顽固的幻觉",
        author: "爱因斯坦"
    },
    {
        text: "时间是存在的视域",
        author: "海德格尔"
    },
    {
        text: "人栖居在时间中",
        author: "海德格尔"
    },
    {
        text: "真正地活着，是向着死亡而存在",
        author: "海德格尔"
    },
    {
        text: "每一个不眠之夜都是一次小型的启示",
        author: "齐奥朗"
    },
    {
        text: "日日是好日",
        author: "云门禅师"
    },
    {
        text: "饥来吃饭，困来即眠",
        author: "禅宗"
    },
    {
        text: "我们活在此刻，但这个此刻正在远去",
        author: "辛波斯卡"
    }
];

const FIRST_VISIT_KEY = 'orbit_has_seen_slogan';

/**
 * Get today's quote based on date
 * - First visit: Always show the core slogan
 * - URL param ?first=true: Force show core slogan (for testing)
 * - Subsequent visits: Random daily quote
 */
export function getDailyQuote(): DailyQuote {
    // 检查 URL 参数是否强制首次访问
    const urlParams = new URLSearchParams(window.location.search);
    const forceFirst = urlParams.get('first') === 'true';

    if (forceFirst) {
        return CORE_SLOGAN;
    }

    // 检测是否是首次访问
    const hasSeenSlogan = localStorage.getItem(FIRST_VISIT_KEY);

    if (!hasSeenSlogan) {
        // 首次访问：显示核心 Slogan，并标记已显示
        localStorage.setItem(FIRST_VISIT_KEY, 'true');
        return CORE_SLOGAN;
    }

    // 后续访问：基于日期的轮换（跳过索引0的 CORE_SLOGAN，让它更稀有）
    const today = new Date();
    const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    // 从索引1开始轮换，这样核心 Slogan 只在首次访问时必现
    const quotesWithoutCore = DAILY_QUOTES.slice(1);
    const index = dayOfYear % quotesWithoutCore.length;
    return quotesWithoutCore[index];
}

