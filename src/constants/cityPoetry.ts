/**
 * City Poetry — 主界面文案
 *
 * 一句同步事实 + 一句随身体时段变化的诗意提示。
 * 时段由映射城市的当地钟点决定，所以它本身就是「此刻该做什么」的回答。
 */

export interface DayPhase {
    /** 轨道中心的小标签 */
    label: string;
    /** 城市在此刻的样子；{city} 为占位 */
    line: string;
}

const PHASES: Array<{ until: number } & DayPhase> = [
    { until: 5, label: '深夜', line: '{city}还在沉睡，你也可以' },
    { until: 7, label: '破晓', line: '{city}的天刚亮，先喝一杯水' },
    { until: 11, label: '上午', line: '{city}的上午，最清醒的几个小时' },
    { until: 14, label: '正午', line: '{city}正午，去吃点好的' },
    { until: 17, label: '午后', line: '{city}的午后，慢一点也没关系' },
    { until: 19, label: '黄昏', line: '{city}的黄昏，抬头看看天' },
    { until: 22, label: '夜晚', line: '{city}入夜了，把屏幕调暗一些' },
    { until: 24, label: '夜深', line: '{city}夜深，身体在等你休息' },
];

export function getDayPhase(orbitHour: number, cityNameCN: string): DayPhase {
    const h = ((orbitHour % 24) + 24) % 24;
    const phase = PHASES.find((p) => h < p.until) ?? PHASES[PHASES.length - 1];
    return { label: phase.label, line: phase.line.replace('{city}', cityNameCN) };
}

/**
 * 获取同步事实
 * "你的身体时钟，与{城市}同步"
 */
export function getSyncStatement(cityNameCN: string): string {
    return `你的身体时钟，与${cityNameCN}同步`;
}
