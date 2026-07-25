/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // 「晨曦星海」色系 — Monument Valley × Healing Cosmos
                // Decorative hues stay soft; ink / *-ink are for text & controls.
                // / <alpha-value> enables Tailwind opacity modifiers (bg-*/40 etc.)
                dawn: {
                    cream: 'oklch(0.982 0.009 67.7 / <alpha-value>)',
                    blush: 'oklch(0.940 0.030 25.3 / <alpha-value>)',
                },
                sky: {
                    mint: 'oklch(0.952 0.021 186.0 / <alpha-value>)',
                    aqua: 'oklch(0.877 0.071 169.7 / <alpha-value>)',
                    blue: 'oklch(0.815 0.082 225.8 / <alpha-value>)',
                    deep: 'oklch(0.686 0.091 232.3 / <alpha-value>)',
                    ink: 'oklch(0.420 0.060 232 / <alpha-value>)',
                },
                blush: {
                    soft: 'oklch(0.847 0.086 9.1 / <alpha-value>)',
                    rose: 'oklch(0.781 0.089 1.2 / <alpha-value>)',
                    deep: 'oklch(0.699 0.074 356.4 / <alpha-value>)',
                    ink: 'oklch(0.420 0.060 356 / <alpha-value>)',
                },
                lavender: {
                    soft: 'oklch(0.882 0.065 296.7 / <alpha-value>)',
                    deep: 'oklch(0.709 0.159 293.5 / <alpha-value>)',
                    ink: 'oklch(0.420 0.090 294 / <alpha-value>)',
                },
                soul: {
                    gold: 'oklch(0.879 0.153 91.6 / <alpha-value>)',
                    warm: 'oklch(0.837 0.164 84.4 / <alpha-value>)',
                    ink: 'oklch(0.480 0.100 85 / <alpha-value>)',
                },
                // 语义墨色 — 与 dawn-cream 同色相的暖中性，替代 cool gray
                ink: {
                    primary: 'oklch(0.280 0.018 70 / <alpha-value>)',
                    secondary: 'oklch(0.400 0.016 70 / <alpha-value>)',
                    muted: 'oklch(0.500 0.014 70 / <alpha-value>)',
                    faint: 'oklch(0.620 0.012 70 / <alpha-value>)',
                    disabled: 'oklch(0.720 0.010 70 / <alpha-value>)',
                    inverse: 'oklch(0.982 0.009 67.7 / <alpha-value>)',
                },
                // 主操作面：一屏一个实心强调
                action: {
                    DEFAULT: 'oklch(0.320 0.025 70 / <alpha-value>)',
                    hover: 'oklch(0.280 0.025 70 / <alpha-value>)',
                    fg: 'oklch(0.982 0.009 67.7 / <alpha-value>)',
                },
                // Dream 别名 → 同一套 token（IntroSequence 兼容）
                dream: {
                    cream: 'oklch(0.982 0.009 67.7 / <alpha-value>)',
                    pink: 'oklch(0.847 0.086 9.1 / <alpha-value>)',
                    sky: 'oklch(0.815 0.082 225.8 / <alpha-value>)',
                    purple: 'oklch(0.882 0.065 296.7 / <alpha-value>)',
                    gold: 'oklch(0.879 0.153 91.6 / <alpha-value>)',
                    text: 'oklch(0.400 0.016 70 / <alpha-value>)',
                },
                orbit: {
                    400: '#2DD4BF',
                    500: '#14B8A6',
                },
                glass: {
                    100: 'oklch(1 0 0 / 0.1)',
                    200: 'oklch(1 0 0 / 0.2)',
                    300: 'oklch(1 0 0 / 0.3)',
                },
            },
            fontFamily: {
                sans: [
                    'Inter',
                    'PingFang SC',
                    'Hiragino Sans GB',
                    'Microsoft YaHei',
                    'Noto Sans SC',
                    'Noto Sans CJK SC',
                    'sans-serif',
                ],
                quote: [
                    'LXGW WenKai',
                    'PingFang SC',
                    'Hiragino Sans GB',
                    'Microsoft YaHei',
                    'Noto Sans SC',
                    'Noto Sans CJK SC',
                    'serif',
                ],
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
