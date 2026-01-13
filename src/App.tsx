import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroSequence } from './components/IntroSequence';
import { TimeZoneHome } from './components/TimeZoneHome';
import { WakeUpSheet } from './components/WakeUpSheet';
import { PickerComparisonDemo } from './components/PickerComparisonDemo';
import {
  calculateLivingTimezone,
  getTimezoneByOffset,
  TimezoneInfo,
  STANDARD_WAKEUP_HOUR
} from './constants/timezones';

// Check for demo mode via URL params
const urlParams = new URLSearchParams(window.location.search);
const isCompareDemo = urlParams.get('demo') === 'compare';
const forceFirstVisit = urlParams.get('first') === 'true';

// Application phases (intro → reveal → timezone)
type AppPhase = 'intro' | 'reveal' | 'timezone';

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
  // ?first=true 参数可以强制模拟首次访问
  const [isFirstVisit] = useState(() => {
    if (forceFirstVisit) return true;
    return localStorage.getItem(STORAGE_KEY_WAKEUP) === null;
  });

  // Always start with intro - every time the app opens
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
    // Save default timezone if first time
    if (isFirstVisit) {
      localStorage.setItem(STORAGE_KEY_WAKEUP, `${DEFAULT_WAKEUP_HOUR}:${DEFAULT_WAKEUP_MINUTE}`);
    }

    // 切换到 reveal，让 TimeZoneHome 在底层开始渲染
    // 光晕会在 2.5 秒内消散，世界在其下方浮现
    setPhase('reveal');

    // 等待光晕完全消散后切换到 timezone
    setTimeout(() => {
      setPhase('timezone');
    }, 1000); // 与 IntroSequence 的消散时间一致
  }, [isFirstVisit]);

  // Handle wake-up time change from sheet
  const handleWakeUpChange = useCallback((hour: number, minute: number) => {
    setWakeUpHour(hour);
    setWakeUpMinute(minute);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_WAKEUP, `${hour}:${minute}`);
  }, []);

  // Handle change timezone request (opens the sheet)
  const handleChangeTimezone = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  // Demo mode: Show comparison
  if (isCompareDemo) {
    return <PickerComparisonDemo />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* TimeZoneHome 始终在底层（当phase不是intro时显示） */}
      <AnimatePresence>
        {(phase === 'timezone' || phase === 'reveal') && (
          <TimeZoneHome
            key="timezone"
            wakeUpTime={wakeUpTime}
            timezone={timezone}
            onChangeTimezone={handleChangeTimezone}
            isTransitioningFromIntro={phase === 'reveal'}
          />
        )}
      </AnimatePresence>

      {/* IntroSequence 在顶层 - 每次打开 App 都显示 */}
      <AnimatePresence>
        {(phase === 'intro' || phase === 'reveal') && (
          <IntroSequence
            key="intro"
            onComplete={handleIntroComplete}
            targetOrbitHour={getCurrentOrbitHour(timezone.offset)}
          />
        )}
      </AnimatePresence>

      {/* Wake-up Sheet (modal, renders on top) */}
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
