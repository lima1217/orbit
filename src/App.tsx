import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { IntroSequence, INTRO_DISSOLVE_DURATION_S } from './components/IntroSequence';
import { TimeZoneHome } from './components/TimeZoneHome';
import { WakeUpSheet } from './components/WakeUpSheet';
import { EASING } from './constants/animationConfig';
import {
  calculateLivingTimezone,
  getTimezoneByOffset,
  TimezoneInfo,
  STANDARD_WAKEUP_HOUR
} from './constants/timezones';

const INTRO_DISSOLVE_MS = INTRO_DISSOLVE_DURATION_S * 1000;

// Check for demo mode via URL params
const urlParams = new URLSearchParams(window.location.search);
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
  const prefersReducedMotion = useReducedMotion();

  // Check if user has set wake-up time before (for first visit detection)
  const [isFirstVisit] = useState(() => {
    if (forceFirstVisit) return true;
    return localStorage.getItem(STORAGE_KEY_WAKEUP) === null;
  });

  // Returning users go directly to timezone, new users see intro
  const [phase, setPhase] = useState<AppPhase>(() => {
    if (forceFirstVisit) return 'intro';
    // If user has saved wake-up time, skip intro and go directly to main page
    return localStorage.getItem(STORAGE_KEY_WAKEUP) !== null ? 'timezone' : 'intro';
  });

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
    setPhase('reveal');

    setTimeout(() => {
      setPhase('timezone');
      // 首次用户：世界浮现后立刻校准起床时间（不自动写入默认值）
      if (isFirstVisit) {
        setIsSheetOpen(true);
      }
    }, INTRO_DISSOLVE_MS);
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

  // 首次校准：确认前不允许关掉 Sheet
  const handleSheetClose = useCallback(() => {
    if (isFirstVisit && localStorage.getItem(STORAGE_KEY_WAKEUP) === null) {
      return;
    }
    setIsSheetOpen(false);
  }, [isFirstVisit]);

  // Handle return to intro - 完全是 reveal 的逆向
  const handleReturnToIntro = useCallback(() => {
    setPhase('returning');

    setTimeout(() => {
      setPhase('intro');
    }, INTRO_DISSOLVE_MS);
  }, []);

  return (
    <>
      {/* Background UI is inert while the sheet is open (focus + AT isolation) */}
      <div
        className="relative min-h-screen overflow-hidden"
        inert={isSheetOpen}
      >
        {/* TimeZoneHome - 在 timezone/reveal/returning 阶段显示 */}
        <AnimatePresence>
          {(phase === 'timezone' || phase === 'reveal' || phase === 'returning') && (
            <motion.div
              key="timezone-wrapper"
              initial={
                prefersReducedMotion
                  ? { opacity: phase === 'returning' ? 1 : 0 }
                  : phase === 'returning'
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.97 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: phase === 'returning' ? 0 : 1 }
                  : phase === 'returning'
                    ? { opacity: 0, scale: 0.97 }
                    : { opacity: 1, scale: 1 }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97 }
              }
              transition={{
                duration: prefersReducedMotion ? 0 : INTRO_DISSOLVE_DURATION_S,
                ease: EASING.out,
              }}
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
              isPrimary={phase === 'intro'}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Wake-up Sheet — sibling of inert shell so dialog stays interactive */}
      <WakeUpSheet
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
        onSelect={handleWakeUpChange}
        initialHour={wakeUpHour}
        initialMinute={wakeUpMinute}
        required={isFirstVisit && localStorage.getItem(STORAGE_KEY_WAKEUP) === null}
      />
    </>
  );
}

export default App;
