import React, { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { BottomSheet } from './BottomSheet';
import { renderShareCard } from '../utils/shareCard';
import { localDateKey } from '../utils/journey';
import type { TimezoneInfo } from '../types/timezone';
import type { DailyQuote } from '../constants/dailyQuotes';

interface ShareSheetProps {
    isOpen: boolean;
    onClose: () => void;
    timezone: TimezoneInfo;
    orbitHour: number;
    quote: DailyQuote;
}

type CardState = { status: 'idle' | 'rendering' | 'error' } | { status: 'ready'; blob: Blob; url: string };

/** 分享此刻：预览卡片 → 系统分享（移动端）或保存图片 */
export const ShareSheet: React.FC<ShareSheetProps> = ({ isOpen, onClose, timezone, orbitHour, quote }) => {
    const titleId = useId();
    const [card, setCard] = useState<CardState>({ status: 'idle' });

    // 打开时按「此刻」生成一次；关闭时释放
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        let url = '';
        setCard({ status: 'rendering' });
        renderShareCard({ timezone, orbitHour, quote })
            .then((blob) => {
                if (cancelled) return;
                url = URL.createObjectURL(blob);
                setCard({ status: 'ready', blob, url });
            })
            .catch(() => !cancelled && setCard({ status: 'error' }));
        return () => {
            cancelled = true;
            if (url) URL.revokeObjectURL(url);
        };
        // 只在打开时取一次快照，避免每秒重绘
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const fileName = `逆旅-${timezone.cityCN}-${localDateKey(new Date())}.png`;
    const file = card.status === 'ready' ? new File([card.blob], fileName, { type: 'image/png' }) : null;
    const canShareFile = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

    const share = async () => {
        if (!file) return;
        try {
            await navigator.share({ files: [file], title: '逆旅', text: `此刻我住在${timezone.cityCN}` });
        } catch {
            // 用户取消分享：什么也不做
        }
    };

    const save = () => {
        if (card.status !== 'ready') return;
        const a = document.createElement('a');
        a.href = card.url;
        a.download = fileName;
        a.click();
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} labelledBy={titleId}>
            <h2 id={titleId} className="text-quote text-ink-primary text-[1.375rem] leading-snug text-center">
                分享此刻
            </h2>

            <div className="mt-5 mx-auto w-[min(62vw,15rem,38dvh)] aspect-[3/4] rounded-2xl overflow-hidden bg-white/40 shadow-[0_0_0_1px_oklch(0.4_0.02_70/0.08),0_16px_40px_-16px_oklch(0.35_0.03_260/0.35)] grid place-items-center">
                {card.status === 'ready' ? (
                    <motion.img
                        src={card.url}
                        alt={`分享卡片：此刻我住在${timezone.cityCN}`}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    />
                ) : (
                    <p className="text-caption text-ink-muted" role="status">
                        {card.status === 'error' ? '生成失败，请稍后再试' : '正在生成…'}
                    </p>
                )}
            </div>

            <div className="mt-6 flex justify-center gap-3">
                {canShareFile && (
                    <button
                        type="button"
                        onClick={share}
                        className="min-h-12 px-8 rounded-full text-button text-[0.9375rem] bg-action text-action-fg hover:bg-action-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2"
                    >
                        分享
                    </button>
                )}
                <button
                    type="button"
                    onClick={save}
                    disabled={card.status !== 'ready'}
                    className={`min-h-12 px-8 rounded-full text-button text-[0.9375rem] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2 disabled:opacity-50 ${
                        canShareFile ? 'glass-button text-ink-secondary hover:text-ink-primary' : 'bg-action text-action-fg hover:bg-action-hover'
                    }`}
                >
                    保存图片
                </button>
            </div>
        </BottomSheet>
    );
};
