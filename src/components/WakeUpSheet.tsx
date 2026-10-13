import React, { useId, useCallback } from 'react';
import { BottomSheet } from './BottomSheet';
import { WakeUpPicker } from './WakeUpPicker';

interface WakeUpSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (hour: number, minute: number) => void;
    initialHour: number;
    initialMinute: number;
    onPreviewHour?: (hour: number | null) => void;
}

/** 修改今天的起床时间 */
export const WakeUpSheet: React.FC<WakeUpSheetProps> = ({
    isOpen,
    onClose,
    onSelect,
    initialHour,
    initialMinute,
    onPreviewHour,
}) => {
    const titleId = useId();

    const close = useCallback(() => {
        onPreviewHour?.(null);
        onClose();
    }, [onClose, onPreviewHour]);

    const handleConfirm = (hour: number, minute: number) => {
        onSelect(hour, minute);
        close();
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={close} labelledBy={titleId} initialFocus='[role="spinbutton"]'>
            <WakeUpPicker
                titleId={titleId}
                initialHour={initialHour}
                initialMinute={initialMinute}
                title="今天，你几点醒来？"
                subtitle="每天醒得不一样，也没关系"
                confirmLabel="搬到这里"
                onConfirm={handleConfirm}
                onPreviewHour={onPreviewHour}
            />
        </BottomSheet>
    );
};
