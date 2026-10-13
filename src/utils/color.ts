import type { Oklch } from '../constants/skyConfig';

const toGamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
const clamp255 = (x: number) => Math.round(Math.min(1, Math.max(0, x)) * 255);

/** OKLCH → CSS rgba()，供 Canvas 使用（Canvas 对 oklch() 字符串的支持参差不齐） */
export function oklchToRgba([L, C, h]: Oklch, alpha = 1): string {
    const hr = (h * Math.PI) / 180;
    const a = C * Math.cos(hr);
    const b = C * Math.sin(hr);

    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

    const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    return `rgba(${clamp255(toGamma(r))}, ${clamp255(toGamma(g))}, ${clamp255(toGamma(bl))}, ${alpha})`;
}
