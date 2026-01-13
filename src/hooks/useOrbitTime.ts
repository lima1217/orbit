import { useContext } from 'react';
import { TimeContext } from '../contexts/TimeContext';

export const useOrbitTime = () => {
    const context = useContext(TimeContext);
    if (!context) {
        throw new Error('useOrbitTime must be used within a TimeProvider');
    }
    return context;
};
