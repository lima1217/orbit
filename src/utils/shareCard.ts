/**
 * 分享卡片 — 把「此刻我住在哪」画成一张 3:4 图片（Canvas，无依赖）
 * 视觉与主页一致：同一片天空、同一条轨道、同一套字体。
 */

import type { TimezoneInfo } from '../types/timezone';
import type { DailyQuote } from '../constants/dailyQuotes';
import { getSkyColors, calculateCelestialPosition, isDaytime, type Oklch } from '../constants/skyConfig';
import { formatOrbitTime } from '../constants/timezones';
import { getDayPhase } from '../constants/cityPoetry';
import { oklchToRgba as rgba } from './color';

const W = 1080;
const H = 1440;
const SITE = 'orbit.aiwayfarer.net';

const INK: Oklch = [0.28, 0.018, 70];
const INK_SECONDARY: Oklch = [0.4, 0.016, 70];
const INK_MUTED: Oklch = [0.5, 0.014, 70];

const FONT_QUOTE = '"LXGW WenKai", "PingFang SC", serif';
const FONT_SANS = 'Inter, "PingFang SC", sans-serif';
const FONT_SERIF = '"Instrument Serif", "Times New Roman", serif';

interface ShareCardInput {
    timezone: TimezoneInfo;
    orbitHour: number;
    quote: DailyQuote;
}

/** 轨道角度：正午在顶、顺时针；换算到 Canvas（0 在 +x 轴） */
const canvasAngle = (hour: number) => ((hour - 12) / 24) * Math.PI * 2 - Math.PI / 2;

function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
}

function formatUtc(offset: number): string {
    const sign = offset >= 0 ? '+' : '−';
    const abs = Math.abs(offset);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    return `UTC${sign}${h}${m ? `:${m.toString().padStart(2, '0')}` : ''}`;
}

async function loadFonts(input: ShareCardInput, phaseLabel: string) {
    const cjk = `${input.timezone.cityCN}${input.quote.text}逆旅此刻我住在你的身体时区${phaseLabel}`;
    await Promise.all([
        document.fonts.load(`100px ${FONT_QUOTE}`, cjk),
        document.fonts.load(`200 150px ${FONT_SANS}`, '0123456789:'),
        document.fonts.load(`500 26px ${FONT_SANS}`, `UTC+−0123456789${SITE}`),
        document.fonts.load(`italic 40px ${FONT_SERIF}`, input.timezone.city),
    ]).catch(() => undefined);
}

export async function renderShareCard(input: ShareCardInput): Promise<Blob> {
    const { timezone, orbitHour, quote } = input;
    const phase = getDayPhase(orbitHour, timezone.cityCN);
    await loadFonts(input, phase.label);

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // ---- Sky ----
    const sky = getSkyColors(orbitHour);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, rgba(sky.top));
    bg.addColorStop(1, rgba(sky.bottom));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const cel = calculateCelestialPosition(orbitHour);
    const gx = (cel.left / 100) * W;
    const gy = (cel.top / 100) * H;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 900);
    glow.addColorStop(0, rgba(sky.glow, 0.38));
    glow.addColorStop(1, rgba(sky.glow, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // ---- Identity ----
    ctx.fillStyle = rgba(INK_MUTED);
    ctx.font = `500 26px ${FONT_SANS}`;
    setSpacing(ctx, 8);
    ctx.fillText('此刻我住在', W / 2, 170);

    ctx.fillStyle = rgba(INK);
    let citySize = 104;
    ctx.font = `${citySize}px ${FONT_QUOTE}`;
    setSpacing(ctx, 6);
    while (ctx.measureText(timezone.cityCN).width > 900 && citySize > 56) {
        citySize -= 4;
        ctx.font = `${citySize}px ${FONT_QUOTE}`;
    }
    ctx.fillText(timezone.cityCN, W / 2, 272);

    // 拉丁名（衬线斜体）+ UTC，作为一行整体居中
    setSpacing(ctx, 0);
    ctx.font = `italic 42px ${FONT_SERIF}`;
    const latinW = ctx.measureText(timezone.city).width;
    ctx.font = `400 26px ${FONT_SANS}`;
    const utc = formatUtc(timezone.offset);
    const utcW = ctx.measureText(utc).width;
    const gap = 18;
    const startX = W / 2 - (latinW + gap + utcW) / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = rgba(INK_MUTED);
    ctx.font = `italic 42px ${FONT_SERIF}`;
    ctx.fillText(timezone.city, startX, 352);
    ctx.font = `400 26px ${FONT_SANS}`;
    ctx.fillText(utc, startX + latinW + gap, 354);
    ctx.textAlign = 'center';

    // ---- Orbit ----
    const cx = W / 2;
    const cy = 770;
    const r = 300;

    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath();
    ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rgba(INK, 0.14);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // 夜半圈
    ctx.strokeStyle = rgba([0.7, 0.06, 290], 0.22);
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, canvasAngle(18), canvasAngle(30));
    ctx.stroke();

    // 刻度
    for (let h = 0; h < 24; h++) {
        const major = h % 6 === 0;
        const a = canvasAngle(h);
        const r1 = r - 16;
        const r2 = r - (major ? 32 : 22);
        ctx.strokeStyle = rgba(INK, major ? 0.32 : 0.14);
        ctx.lineWidth = major ? 2.5 : 2;
        ctx.beginPath();
        ctx.moveTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a));
        ctx.lineTo(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a));
        ctx.stroke();
    }
    ctx.fillStyle = rgba(INK_SECONDARY, 0.55);
    ctx.font = `400 22px ${FONT_SANS}`;
    setSpacing(ctx, 2);
    for (const [h, t] of [[6, '06'], [12, '12'], [18, '18'], [0, '00']] as const) {
        const a = canvasAngle(h);
        ctx.fillText(t, cx + (r - 60) * Math.cos(a), cy + (r - 60) * Math.sin(a));
    }

    // 醒来轨迹
    let end = orbitHour;
    if (end < 6) end += 24;
    const trail = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    trail.addColorStop(0, rgba([0.82, 0.12, 65]));
    trail.addColorStop(0.55, rgba([0.74, 0.12, 25]));
    trail.addColorStop(1, rgba([0.66, 0.12, 300]));
    ctx.strokeStyle = trail;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, canvasAngle(6), canvasAngle(Math.max(end, 6.01)));
    ctx.stroke();

    // 起床点
    const wa = canvasAngle(6);
    ctx.fillStyle = rgba([0.99, 0.01, 80]);
    ctx.strokeStyle = rgba([0.8, 0.12, 65]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(wa), cy + r * Math.sin(wa), 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 此刻的光点
    const ma = canvasAngle(orbitHour);
    const mx = cx + r * Math.cos(ma);
    const my = cy + r * Math.sin(ma);
    const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 64);
    halo.addColorStop(0, 'rgba(255,255,255,0.9)');
    halo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(mx, my, 64, 0, Math.PI * 2);
    ctx.fill();

    const day = isDaytime(orbitHour);
    const body = ctx.createRadialGradient(mx - 8, my - 10, 2, mx, my, 26);
    const stops: Oklch[] = day
        ? [[0.99, 0.03, 90], [0.9, 0.11, 70], [0.82, 0.11, 40]]
        : [[1, 0, 0], [0.93, 0.03, 285], [0.84, 0.05, 290]];
    body.addColorStop(0, rgba(stops[0]));
    body.addColorStop(0.6, rgba(stops[1]));
    body.addColorStop(1, rgba(stops[2]));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(mx, my, 24, 0, Math.PI * 2);
    ctx.fill();

    // 轨道中心
    ctx.fillStyle = rgba(INK_MUTED);
    ctx.font = `500 24px ${FONT_SANS}`;
    setSpacing(ctx, 8);
    ctx.fillText(phase.label, cx, cy - 100);

    ctx.fillStyle = rgba(INK);
    ctx.font = `200 156px ${FONT_SANS}`;
    setSpacing(ctx, -6);
    ctx.fillText(formatOrbitTime(orbitHour), cx, cy);

    ctx.fillStyle = rgba(INK_MUTED);
    ctx.font = `400 24px ${FONT_SANS}`;
    setSpacing(ctx, 4);
    ctx.fillText('身体时间', cx, cy + 96);

    // ---- 今日引用 ----
    const lines = quote.text.split('\n');
    const lh = 58;
    const top = 1170 - ((lines.length - 1) * lh) / 2;
    ctx.fillStyle = rgba(INK_SECONDARY);
    ctx.font = `36px ${FONT_QUOTE}`;
    setSpacing(ctx, 2);
    lines.forEach((line, i) => ctx.fillText(line, W / 2, top + i * lh));

    // ---- Footer ----
    ctx.fillStyle = rgba(INK);
    ctx.font = `42px ${FONT_QUOTE}`;
    setSpacing(ctx, 18);
    ctx.fillText('逆旅', W / 2 + 9, 1330);
    ctx.fillStyle = rgba(INK_MUTED);
    ctx.font = `400 22px ${FONT_SANS}`;
    setSpacing(ctx, 3);
    ctx.fillText(`你的身体时区 · ${SITE}`, W / 2, 1384);

    return new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
    );
}
