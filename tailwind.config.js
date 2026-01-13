/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // 「晨曦星海」色系 - Monument Valley Blue-Pink Palette
                dawn: {
                    cream: '#FDF8F3',  // 晨曦奶油 - 背景基底
                    blush: '#FFE4E1',  // 晨曦粉霞 - 柔和粉色背景
                },
                sky: {
                    mint: '#E0F4F1',   // 天际薄荷 - 明亮薄荷绿
                    aqua: '#A8E6CF',   // 天际水色 - 清透青绿
                    blue: '#87CEEB',   // 天际蓝 - 主天空蓝
                    deep: '#5BA4C9',   // 天际深蓝 - 渐变深处
                },
                blush: {
                    soft: '#FFB6C1',   // 樱瓣粉 - 柔和樱花粉
                    rose: '#E8A0B4',   // 玫瑰粉 - 中等粉色
                    deep: '#C48B9F',   // 深玫瑰 - 深粉点缀
                },
                lavender: {
                    soft: '#DCD0FF',   // 柔紫 - 薰衣草淡紫
                    deep: '#A78BFA',   // 深紫 - 紫色点缀
                },
                soul: {
                    gold: '#FCD34D',   // 灵魂金 - 太阳/高亮
                    warm: '#FBBF24',   // 暖金 - 点缀
                },
                // Dream 色系 - 用于 IntroSequence 光晕效果
                dream: {
                    cream: '#FDF8F3',  // 梦境奶油白
                    pink: '#FFB6C1',   // 梦境樱花粉
                    sky: '#87CEEB',    // 梦境天空蓝
                    purple: '#DCD0FF', // 梦境薰衣草
                    gold: '#FCD34D',   // 梦境灵魂金
                    text: '#4A5568',   // 梦境文字色
                },
                orbit: {
                    400: '#2DD4BF',    // Orbit Teal (保留)
                    500: '#14B8A6',
                },
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                    300: 'rgba(255, 255, 255, 0.3)',
                },
            },
            fontFamily: {
                // 统一字体：Inter - 现代 UI 标杆
                // 中文回退：PingFang SC (macOS) → Hiragino Sans GB → Microsoft YaHei (Windows)
                sans: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 20s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}
