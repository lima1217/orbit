import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroSequence } from './components/IntroSequence';
import { TimeZoneHome } from './components/TimeZoneHome';
import { WakeUpSheet } from './components/WakeUpSheet';
import { PickerComparisonDemo } from './components/PickerComparisonDemo';
import { SoundLayoutPrototype } from './components/SoundLayoutPrototype';
import {
  calculateLivingTimezone,
  getTimezoneByOffset,
  TimezoneInfo,
  STANDARD_WAKEUP_HOUR
} from './constants/timezones';

// Check for demo mode via URL params
const urlParams = new URLSearchParams(window.location.search);
const isCompareDemo = urlParams.get('demo') === 'compare';
const isPrototypeSound = urlParams.get('prototype') === 'sound';
const forceFirstVisit = urlParams.get('first') === 'true';

// Application phases
// intro: 显示光环
// reveal: 光环消散，世界浮现（第一页→第二页）
// timezone: 主界面
// returning: 世界消散，光环浮现（第二页→第一页，完全是 reveal 的逆向）
type AppPhase = 'intro' | 'reveal' | 'timezone' | 'returning';

// Local storage keys
const STORAGE_KEY_WAKEUP = 'orbit_wakeup_time';

// Smart default: assume 7:00 AM wake-up
const DEFAULT_WAKEUP_HOUR = STANDARD_WAKEUP_HOUR;
const DEFAULT_WAKEUP_MINUTE = 0;

/**
 * Calculate timezone info from wake-up hour
 */
function getTimezoneFromWakeUp(hour: number): TimezoneInfo {
  const localOffset = -new Date().getTimezoneOffset() / 60;
  const livingOffset = calculateLivingTimezone(hour, localOffset);
  return getTimezoneByOffset(livingOffset);
}

/**
 * Create a Date object for wake-up time today
 */
function createWakeUpDate(hour: number, minute: number): Date {
  const today = new Date();
  today.setHours(hour, minute, 0, 0);
  return today;
}

/**
 * Calculate the current orbit hour based on timezone offset
 */
function getCurrentOrbitHour(timezoneOffset: number): number {
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  let localHour = utcHours + timezoneOffset;
  if (localHour < 0) localHour += 24;
  if (localHour >= 24) localHour -= 24;
  return localHour;
}

function App() {
  // Check if user has set wake-up time before (for first visit hint)
  const [isFirstVisit] = useState(() => {
    if (forceFirstVisit) return true;
    return localStorage.getItem(STORAGE_KEY_WAKEUP) === null;
  });

  // Always start with intro
  const [phase, setPhase] = useState<AppPhase>('intro');

  // Initialize wake-up time (from storage or smart default)
  const [wakeUpHour, setWakeUpHour] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WAKEUP);
    if (saved) {
      const [h] = saved.split(':').map(Number);
      return h;
    }
    return DEFAULT_WAKEUP_HOUR;
  });

  const [wakeUpMinute, setWakeUpMinute] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WAKEUP);
    if (saved) {
      const [, m] = saved.split(':').map(Number);
      return m;
    }
    return DEFAULT_WAKEUP_MINUTE;
  });

  // Derived state
  const wakeUpTime = createWakeUpDate(wakeUpHour, wakeUpMinute);
  const timezone = getTimezoneFromWakeUp(wakeUpHour);

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Handle intro completion - seamless transition via reveal phase
  const handleIntroComplete = useCallback(() => {
    if (isFirstVisit) {
      localStorage.setItem(STORAGE_KEY_WAKEUP, `${DEFAULT_WAKEUP_HOUR}:${DEFAULT_WAKEUP_MINUTE}`);
    }

    setPhase('reveal');

    setTimeout(() => {
      setPhase('timezone');
    }, 1000);
  }, [isFirstVisit]);

  // Handle wake-up time change from sheet
  const handleWakeUpChange = useCallback((hour: number, minute: number) => {
    setWakeUpHour(hour);
    setWakeUpMinute(minute);
    localStorage.setItem(STORAGE_KEY_WAKEUP, `${hour}:${minute}`);
  }, []);

  // Handle change timezone request
  const handleChangeTimezone = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  // Handle return to intro - 完全是 reveal 的逆向
  const handleReturnToIntro = useCallback(() => {
    setPhase('returning');

    // 1.2秒后完成过渡
    setTimeout(() => {
      setPhase('intro');
    }, 1200);
  }, []);

  // Demo mode
  if (isCompareDemo) {
    return <PickerComparisonDemo />;
  }

  if (isPrototypeSound) {
    return <SoundLayoutPrototype />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* TimeZoneHome - 在 timezone/reveal/returning 阶段显示 */}
      <AnimatePresence>
        {(phase === 'timezone' || phase === 'reveal' || phase === 'returning') && (
          <motion.div
            key="timezone-wrapper"
            initial={{ opacity: phase === 'returning' ? 1 : 0 }}
            animate={{ opacity: phase === 'returning' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 0.68, 0.35, 1.0] }}
            className="absolute inset-0"
          >
            <TimeZoneHome
              wakeUpTime={wakeUpTime}
              timezone={timezone}
              onChangeTimezone={handleChangeTimezone}
              onReturnToIntro={handleReturnToIntro}
              isTransitioningFromIntro={phase === 'reveal'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* IntroSequence - 在 intro/reveal/returning 阶段显示 */}
      <AnimatePresence>
        {(phase === 'intro' || phase === 'reveal' || phase === 'returning') && (
          <IntroSequence
            key="intro"
            onComplete={handleIntroComplete}
            targetOrbitHour={getCurrentOrbitHour(timezone.offset)}
            isReturning={phase === 'returning'}
          />
        )}
      </AnimatePresence>

      {/* Wake-up Sheet */}
      <AnimatePresence>
        {isSheetOpen && (
          <WakeUpSheet
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            onSelect={handleWakeUpChange}
            initialHour={wakeUpHour}
            initialMinute={wakeUpMinute}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
