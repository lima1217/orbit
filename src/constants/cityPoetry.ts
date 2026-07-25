/**
 * City Poetry — 主界面同步句
 *
 * 只保留一行：「你的身体时钟，与{城市}同步」
 * （第二行时段诗意已刻意移除）
 */

/**
 * 获取同步事实
 * "你的身体时钟，与{城市}同步"
 */
export function getSyncStatement(cityNameCN: string): string {
    return `你的身体时钟，与${cityNameCN}同步`;
}
