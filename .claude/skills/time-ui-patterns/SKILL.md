# Time-Based UI Patterns

This skill provides specialized patterns for building time-aware, timezone-based user interfaces inspired by the Orbit project.

## Overview

When building applications that deal with time, timezones, and temporal visualizations, use these patterns for accurate and user-friendly experiences.

---

## Timezone Calculations

### Living Timezone Concept

```typescript
/**
 * Calculate "living timezone" based on user's wake-up time
 * Maps wake-up hour to a city in that timezone
 */
interface LivingTimezone {
  city: string;
  offset: number;
  wakeUpHour: number;
}

function calculateLivingTimezone(wakeUpTime: Date): LivingTimezone {
  const hour = wakeUpTime.getHours();
  const localNow = new Date();
  const localHour = localNow.getHours();
  
  // Calculate how many hours we need to shift to make wake-up = 7am
  const offsetHours = 7 - hour;
  const targetOffset = (localNow.getTimezoneOffset() / 60) + offsetHours;
  
  // Map to representative cities
  const cityMap: Record<number, string> = {
    '-11': 'Midway',
    '-10': 'Honolulu',
    '-9': 'Anchorage',
    '-8': 'Los Angeles',
    '-7': 'Denver',
    '-6': 'Chicago',
    '-5': 'New York',
    '-4': 'Santiago',
    '-3': 'Buenos Aires',
    '-2': 'South Georgia',
    '-1': 'Azores',
    '0': 'London',
    '1': 'Paris',
    '2': 'Cairo',
    '3': 'Moscow',
    '4': 'Dubai',
    '5': 'Karachi',
    '6': 'Dhaka',
    '7': 'Bangkok',
    '8': 'Beijing',
    '9': 'Tokyo',
    '10': 'Sydney',
    '11': 'Noumea',
    '12': 'Auckland'
  };
  
  const normalizedOffset = Math.round(targetOffset);
  const city = cityMap[normalizedOffset] || 'UTC';
  
  return {
    city,
    offset: normalizedOffset,
    wakeUpHour: hour
  };
}
```

---

## Time Event Scheduling

### Celestial Events (Sunrise/Sunset)

```typescript
import SunCalc from 'suncalc';

interface CelestialEvent {
  type: 'sunrise' | 'sunset';
  time: Date;
  hoursUntil: number;
}

function getCelestialEvents(
  latitude: number,
  longitude: number,
  referenceTime: Date = new Date()
): CelestialEvent[] {
  const times = SunCalc.getTimes(referenceTime, latitude, longitude);
  const now = referenceTime.getTime();
  
  const sunrise = times.sunrise.getTime();
  const sunset = times.sunset.getTime();
  
  return [
    {
      type: 'sunrise',
      time: times.sunrise,
      hoursUntil: (sunrise - now) / (1000 * 60 * 60)
    },
    {
      type: 'sunset',
      time: times.sunset,
      hoursUntil: (sunset - now) / (1000 * 60 * 60)
    }
  ];
}
```

---

## Time Display Patterns

### Relative Time Display

```typescript
function formatRelativeTime(targetTime: Date, now: Date = new Date()): string {
  const diffMs = targetTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 0) {
    return `${Math.abs(diffHours).toFixed(1)} hours ago`;
  }
  
  if (diffHours < 1) {
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    return `in ${minutes} minutes`;
  }
  
  if (diffHours < 24) {
    return `in ${diffHours.toFixed(1)} hours`;
  }
  
  const days = Math.floor(diffHours / 24);
  const hours = Math.floor(diffHours % 24);
  return `in ${days}d ${hours}h`;
}
```

### Orbit Hour System (24-hour visual representation)

```typescript
interface OrbitEvent {
  label: string;
  orbitHour: number; // 0-23
  color: string;
}

/**
 * Convert standard time to orbit hour based on wake-up time
 */
function toOrbitHour(time: Date, wakeUpTime: Date): number {
  const eventHour = time.getHours();
  const wakeHour = wakeUpTime.getHours();
  
  // Orbit hour 0 = wake-up time
  let orbitHour = eventHour - wakeHour;
  if (orbitHour < 0) orbitHour += 24;
  
  return orbitHour;
}

/**
 * Calculate position on circular orbit (0-360 degrees)
 */
function orbitHourToDegrees(orbitHour: number): number {
  return (orbitHour / 24) * 360;
}
```

---

## Time Picker UI Pattern

### Minimalist Time Selection

```typescript
import { useState } from 'react';

interface TimePickerProps {
  initialTime?: Date;
  onTimeSelect: (time: Date) => void;
  label: string;
}

export const TimePicker = ({ initialTime, onTimeSelect, label }: TimePickerProps) => {
  const [hours, setHours] = useState(initialTime?.getHours() || 7);
  const [minutes, setMinutes] = useState(initialTime?.getMinutes() || 0);
  
  const handleConfirm = () => {
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);
    onTimeSelect(selectedTime);
  };
  
  return (
    <div className="time-picker">
      <h2>{label}</h2>
      <div className="time-input">
        <input
          type="number"
          min="0"
          max="23"
          value={hours}
          onChange={(e) => setHours(parseInt(e.target.value))}
        />
        :
        <input
          type="number"
          min="0"
          max="59"
          value={minutes}
          onChange={(e) => setMinutes(parseInt(e.target.value))}
        />
      </div>
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
};
```

---

## Design Principles for Time UIs

1. **Non-Judgmental**: Avoid implying "right" or "wrong" times
2. **Personal Rhythm**: Center time around user's personal schedule, not clock time
3. **Visual Clarity**: Use color, position, and animation to show temporal relationships
4. **Relative > Absolute**: Show "in 3 hours" rather than "10:00 AM" when contextual

---

## Common Use Cases

- Implementing custom timezone logic ("living timezones")
- Calculating time differences and relative displays
- Visualizing daily schedules on circular/orbit layouts
- Building time pickers that align with user's rhythm
- Managing sunrise/sunset and other celestial events
- Converting between different time representations
