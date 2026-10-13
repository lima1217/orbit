import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IntroSequence } from './components/IntroSequence';
import { Calibration } from './components/Calibration';
import { TimeZoneHome } from './components/TimeZoneHome';
import { WakeUpSheet } from './components/WakeUpSheet';
import { JourneySheet } from './components/JourneySheet';
import { ShareSheet } from './components/ShareSheet';
import { SkyBackground } from './components/SkyBackground';
import { getTimezoneForWakeUp, STANDARD_WAKEUP_HOUR } from './constants/timezones';
import { getDailyQuote } from './constants/dailyQuotes';
import { useNow, getHourAtOffset } from './hooks/useNow';
import { recordWake, needsDailyCheckIn } from './utils/journey';

const STORAGE_KEY_WAKEUP = 'orbit_wakeup_time';

// Debug params: ?reset=true 清空 orbit_*；?first=true 强制首次流程
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('reset') === 'true') {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('orbit_'))
    .forEach((key) => localStorage.removeItem(key));
  window.history.replaceState({}, '', window.location.pathname);
}
const forceFirstVisit = urlParams.get('first') === 'true';

/**
 * intro:     开场轨道 / 今日封面（Slogan）
 * calibrate: 校准起床时间（首次，或每天第一次打开）
 * home:      身体时区主页
 */
type AppPhase = 'intro' | 'calibrate' | 'home';
type OpenSheet = 'none' | 'wakeup' | 'journey' | 'share';

function readSavedWakeUp(): { hour: number; minute: number } | null {
  const saved = localStorage.getItem(STORAGE_KEY_WAKEUP);
  if (!saved) return null;
  const [hour, minute] = saved.split(':').map(Number);
  return Number.isFinite(hour) ? { hour, minute: minute || 0 } : null;
}

function App() {
  const [saved] = useState(readSavedWakeUp);
  /** 第一次来：使用首次校准文案 */
  const [isFirstEver] = useState(forceFirstVisit || saved === null);
  const [needsCalibration, setNeedsCalibration] = useState(() => isFirstEver || needsDailyCheckIn());
  const [phase, setPhase] = useState<AppPhase>(needsCalibration ? 'intro' : 'home');

  const [wakeUpHour, setWakeUpHour] = useState(saved?.hour ?? STANDARD_WAKEUP_HOUR);
  const [wakeUpMinute, setWakeUpMinute] = useState(saved?.minute ?? 0);
  /** 选择器滚动中的起床小时，用于实时预览天空 */
  const [previewHour, setPreviewHour] = useState<number | null>(null);
  const [openSheet, setOpenSheet] = useState<OpenSheet>('none');

  const now = useNow();
  const timezone = getTimezoneForWakeUp(wakeUpHour);
  const orbitHour = getHourAtOffset(now, timezone.offset);
  const skyTimezone = previewHour === null ? timezone : getTimezoneForWakeUp(previewHour);
  const skyHour = getHourAtOffset(now, skyTimezone.offset);
  const quote = getDailyQuote();

  // 页面长时间挂着、隔天再切回来：重新翻开今日封面
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !needsDailyCheckIn()) return;
      setOpenSheet('none');
      setNeedsCalibration(true);
      setPhase('intro');
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const handleEnter = useCallback(() => {
    setPhase(needsCalibration ? 'calibrate' : 'home');
  }, [needsCalibration]);

  const commitWakeUp = useCallback((hour: number, minute: number) => {
    setWakeUpHour(hour);
    setWakeUpMinute(minute);
    setPreviewHour(null);
    localStorage.setItem(STORAGE_KEY_WAKEUP, `${hour}:${minute}`);
    recordWake(hour, minute, getTimezoneForWakeUp(hour));
  }, []);

  const handleCalibrated = useCallback((hour: number, minute: number) => {
    commitWakeUp(hour, minute);
    setNeedsCalibration(false);
    setPhase('home');
  }, [commitWakeUp]);

  const closeSheet = useCallback(() => setOpenSheet('none'), []);

  return (
    <>
      {/* Shell is inert while a sheet is open (focus + AT isolation) */}
      <div className="relative h-dvh overflow-hidden" inert={openSheet !== 'none'}>
        <SkyBackground orbitHour={skyHour} />

        <AnimatePresence>
          {phase === 'intro' && <IntroSequence key="intro" onEnter={handleEnter} quote={quote} />}

          {phase === 'calibrate' && (
            <Calibration
              key="calibrate"
              initialHour={wakeUpHour}
              initialMinute={wakeUpMinute}
              onConfirm={handleCalibrated}
              onPreviewHour={setPreviewHour}
              daily={!isFirstEver}
            />
          )}

          {phase === 'home' && (
            <TimeZoneHome
              key="home"
              timezone={timezone}
              orbitHour={orbitHour}
              now={now}
              wakeUpHour={wakeUpHour}
              wakeUpMinute={wakeUpMinute}
              onChangeWakeUp={() => setOpenSheet('wakeup')}
              onOpenJourney={() => setOpenSheet('journey')}
              onOpenShare={() => setOpenSheet('share')}
              onReturnToIntro={() => setPhase('intro')}
              reveal
            />
          )}
        </AnimatePresence>
      </div>

      {/* Sheets are siblings of the inert shell so they stay interactive */}
      <WakeUpSheet
        isOpen={openSheet === 'wakeup'}
        onClose={closeSheet}
        onSelect={commitWakeUp}
        initialHour={wakeUpHour}
        initialMinute={wakeUpMinute}
        onPreviewHour={setPreviewHour}
      />
      <JourneySheet isOpen={openSheet === 'journey'} onClose={closeSheet} />
      <ShareSheet
        isOpen={openSheet === 'share'}
        onClose={closeSheet}
        timezone={timezone}
        orbitHour={orbitHour}
        quote={quote}
      />
    </>
  );
}

export default App;
