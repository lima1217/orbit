/**
 * City Poetry - 城市诗意描述系统 v5
 * 
 * 乔布斯方案：简化到一种格式，只用两行
 * 
 * 第一行：你的身体时钟，此刻与{城市}同步（固定格式，不变）
 * 第二行：那里是{时间}，{极简画面}（10个版本，对应10个时段）
 */

/**
 * 10个时段的通用描述
 * 混搭自佩索阿、辛波斯卡、博尔赫斯、加缪的风格
 */
const TIME_OF_DAY_SCENES: Record<string, string> = {
    dawn: "光正在编织今天的故事",
    morning: "有人正在打第一个哈欠",
    forenoon: "待办事项清单正在假装自己很重要",
    midday: "有人在想：中午吃什么，顺便想了一下人生",
    afternoon: "咖啡的效力正在撤退",
    dusk: "太阳正在练习谢幕",
    evening: "月亮和星星正在分享同一片寂静",
    night: "失眠的人正在和宇宙对话",
    lateNight: "有人在黑暗中等待，不知道在等什么",
    preDawn: "只有猫和诗人还醒着"
};

/**
 * 获取当前时段
 */
function getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 9) return 'morning';
    if (hour >= 9 && hour < 12) return 'forenoon';
    if (hour >= 12 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 19) return 'dusk';
    if (hour >= 19 && hour < 22) return 'evening';
    if (hour >= 22 || hour < 1) return 'night';
    if (hour >= 1 && hour < 3) return 'lateNight';
    return 'preDawn';
}

/**
 * 格式化小时为可读时间
 */
function formatHourToTime(hour: number): string {
    const h = Math.floor(hour);
    if (h >= 5 && h < 7) return "黎明";
    if (h >= 7 && h < 9) return "清晨";
    if (h >= 9 && h < 12) return "上午";
    if (h >= 12 && h < 14) return "正午";
    if (h >= 14 && h < 17) return "午后";
    if (h >= 17 && h < 19) return "傍晚";
    if (h >= 19 && h < 22) return "夜晚";
    if (h >= 22 || h < 1) return "深夜";
    if (h >= 1 && h < 3) return "凌晨";
    return "黎明前";
}

/**
 * 获取第一行：同步事实
 * "你的身体时钟，与{城市}同步"
 */
export function getSyncStatement(cityNameCN: string): string {
    return `你的身体时钟，与${cityNameCN}同步`;
}

/**
 * 获取第二行：极简画面
 * 短句加前缀 "此刻是{时间}，{画面}"
 * 长句直接显示（避免手机端换行）
 */
export function getSceneDescription(localHour: number): string {
    const timeLabel = formatHourToTime(localHour);
    const timeOfDay = getTimeOfDay(localHour);
    const scene = TIME_OF_DAY_SCENES[timeOfDay];

    // 长句不加前缀，避免手机端显示过长
    const longScenes = ['forenoon', 'midday', 'lateNight'];
    if (longScenes.includes(timeOfDay)) {
        return scene;
    }

    return `此刻是${timeLabel}，${scene}`;
}

/**
 * 获取完整的两行诗意描述
 */
export function getFullPoetry(cityNameCN: string, cityName: string, localHour: number): string {
    const line1 = getSyncStatement(cityNameCN);
    const line2 = getSceneDescription(localHour);
    return `${line1}\n${line2}`;
}

/**
 * 兼容旧接口
 */
export function getCityPoetry(cityName: string, localHour: number): string {
    return getSceneDescription(localHour);
}
