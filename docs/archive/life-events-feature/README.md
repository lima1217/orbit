# Life Events Feature - Archived

**Archived Date**: 2026-01-13

## Why was this feature removed?

Based on Steve Jobs' design review feedback and user insight:

> "当我看到12:00左右，我自然就知道该吃午饭了"

The "Life Events" feature was designed to help users know when to do daily activities (breakfast, lunch, sleep). However, we realized that the **body timezone concept itself already solves this problem** more elegantly.

When a user sees "12:00" in their body timezone, they naturally understand it's lunchtime — no explicit event reminders needed.

### Jobs' Principle Applied:
> "如果一个功能需要用户思考它是什么，那就不应该存在"

The event time display (e.g., "01:00") was confusing — users couldn't tell if it meant:
- 1 AM clock time?
- 1 hour after waking?
- Orbit time?

## Files in this archive

- `lifeEvents.ts` - Life events data model and storage
- `EventTimePicker.tsx` - Time picker component for events
- `SettingsPanel.tsx.backup` - Settings panel with events section

## How to restore

If you want to bring back this feature:

1. Copy `lifeEvents.ts` back to `src/constants/`
2. Copy `EventTimePicker.tsx` back to `src/components/`
3. Reference `SettingsPanel.tsx.backup` to restore the events section in SettingsPanel
4. Re-add the imports and state management

## Lesson Learned

Sometimes the best features are the ones that make other features unnecessary.
The body timezone IS the solution — not a feature that needs additional features on top.
