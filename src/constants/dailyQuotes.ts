/**
 * Daily Quotes — Intro「今日封面」与分享卡片上的引用
 * Curated quotes about time, existence, and presence
 * Note: No periods at end - intentional for contemplative feel
 */

/** 引用只留句子本身，不署出处 */
export interface DailyQuote {
    text: string;
}

/**
 * 🌟 核心 Slogan — 首次访问时必须显示（之后进入每日轮换）
 * 这句话定义了逆旅的灵魂
 */
export const CORE_SLOGAN: DailyQuote = {
    text: "每个失眠的人都是流亡者\n被放逐到错误的时区",
};

/**
 * 引用池（备用，当前不展示）
 * text 里的 \n 是手工断行：Intro 轨道内宽度有限，每行 ≤ 14 字
 */
export const DAILY_QUOTES: DailyQuote[] = [
    CORE_SLOGAN,
    { text: "人生如逆旅\n我亦是行人" },
    { text: "我不知道有多少个灵魂\n藏在我身上\n我每时每刻都在变化" },
    { text: "我是我与我之间的距离" },
    { text: "时间是构成我的实质\n时间是一条河，携我而去\n但我就是那条河" },
    { text: "我不知道别人怎样\n但我是由巧合构成的" },
    { text: "时间是一种错觉\n虽然是一种顽固的错觉" },
    { text: "唯一的时间感觉\n来自于内心的变化" },
    { text: "过去、现在与未来的区分\n只是一种顽固的幻觉" },
    { text: "时间是存在的视域" },
    { text: "人栖居在时间中" },
    { text: "真正地活着\n是向着死亡而存在" },
    { text: "每一个不眠之夜\n都是一次小型的启示" },
    { text: "日日是好日" },
    { text: "饥来吃饭，困来即眠" },
    { text: "我们活在此刻\n但这个此刻正在远去" },
];

/**
 * 今日引用 — 始终是核心 Slogan
 * Less is more：一句足够有力的话，胜过每天换一句（上面的引用池保留备用，不参与展示）
 */
export function getDailyQuote(): DailyQuote {
    return CORE_SLOGAN;
}
