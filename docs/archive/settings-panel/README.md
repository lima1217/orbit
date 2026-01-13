# Settings Panel - Archived

**Archived Date**: 2026-01-13

## Why was this removed?

Based on Steve Jobs' design principle: **Every extra layer of interface is extra cognitive load.**

The settings panel was redundant because:
1. **Wake-up time** - Already accessible from main screen's bottom button
2. **Body timezone** - Already displayed on main screen
3. **No unique functionality** - Just a "confirmation view" of existing data

### The new flow:
- Click celestial body → Directly open wake-up time picker
- No intermediate "settings" layer
- More direct, less friction

## Files in this archive

- `SettingsPanel.tsx` - The full settings panel component

## How to restore

1. Copy `SettingsPanel.tsx` back to `src/components/`
2. Import and use in `TimeZoneHome.tsx`
3. Add state management for `isSettingsOpen`
4. Wire up celestial body click to open settings

## Lesson Learned

> "先做减法，需要时再加回来。"

If the product grows and genuinely needs settings, restore this.
But start minimal - every screen should earn its existence.
