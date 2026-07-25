# 001 — Strengthen Intro enter-button press feedback

- **Status**: DONE
- **Commit**: b4524b1
- **Severity**: HIGH
- **Category**: Physicality & origin / Interruptibility
- **Estimated scope**: 1 file (`src/components/IntroSequence.tsx`), ~30 lines

## Problem

The Intro enter control (large dawn halo) is the primary CTA on first visit, but press feedback is almost imperceptible and is cancelled by dissolve.

1. Press ack is only **100ms**, then `DISSOLVING` starts and the button `scale` is forced back to `1` while the parent content zooms to `1.15` — the press is overwritten before the user can feel it.

```ts
/* src/components/IntroSequence.tsx:23-24 — current */
/** 按压缩放停留，让手指松开前能感知到 0.96 */
const PRESS_ACK_MS = 100;
```

```tsx
/* src/components/IntroSequence.tsx:189-197 — current */
animate={{
    scale:
        prefersReducedMotion || isDissolving
            ? 1
            : isPressed
              ? 0.96
              : 1,
}}
transition={SPRING_SNAP}
```

2. Inner breathing layer stops on press but offers no substitute feedback (no tighter scale / brighter opacity). On a ~20rem circle, a 4% outer scale alone is too weak.

```tsx
/* src/components/IntroSequence.tsx:210-224 — current */
animate={
    prefersReducedMotion || isPressed || isDissolving
        ? { scale: 1, opacity: isDissolving ? 0.88 : 1 }
        : {
              scale: [0.97, 1.03, 0.97],
              opacity: [0.94, 1, 0.94],
          }
}
```

3. Press spring is `duration: 0.3` — longer than the 100–160ms button-press budget, so the squeeze feels mushy rather than snappy.

```ts
/* src/components/IntroSequence.tsx:26 — current */
const SPRING_SNAP = { type: 'spring' as const, duration: 0.3, bounce: 0 };
```

## Target

Exact end state for the press phase (before dissolve — dissolve motion is plan 002):

| Constant / prop | Value |
| --- | --- |
| `PRESS_ACK_MS` | `160` |
| Button pressed `scale` | `0.95` |
| Button spring | `{ type: 'spring', duration: 0.16, bounce: 0.12 }` |
| Inner halo when pressed (not dissolving) | `{ scale: 0.92, opacity: 1 }` |
| Outer veil when pressed | `opacity: 0.95` (from idle `0.70`) via `motion.span` |
| Hint when pressed | keep dimming; use `duration: 0.16`, `ease: [0.23, 1, 0.32, 1]` |
| While `isPressed` through start of dissolve | **do not** force button `scale` back to `1` solely because `isDissolving` is true — keep `0.95` until plan 002’s dissolve bloom takes over, or until `COMPLETE` |

Button animate target:

```tsx
animate={{
    scale: prefersReducedMotion ? 1 : isPressed ? 0.95 : 1,
}}
transition={SPRING_PRESS}
```

where:

```ts
const SPRING_PRESS = { type: 'spring' as const, duration: 0.16, bounce: 0.12 };
```

Keep a separate snap spring for non-press settles if needed, or reuse `SPRING_PRESS` for inner pressed settle.

Inner halo pressed branch:

```tsx
prefersReducedMotion
    ? { scale: 1, opacity: 1 }
    : isPressed && !isDissolving
      ? { scale: 0.92, opacity: 1 }
      : isDissolving
        ? { scale: 1, opacity: 0.88 } // plan 002 may replace dissolve branch
        : { scale: [0.97, 1.03, 0.97], opacity: [0.94, 1, 0.94] }
```

Convert the soft outer veil `<span>` to `motion.span` and animate:

```tsx
animate={{
    opacity: prefersReducedMotion ? 0.7 : isPressed ? 0.95 : 0.7,
}}
transition={SPRING_PRESS}
```

`prefersReducedMotion`: keep `PRESS_ACK_MS` effective delay at `0` (already gated); skip scale/veil motion (opacity-only hint dim is OK).

## Repo conventions to follow

- Motion library: Framer Motion `motion.*` + `useReducedMotion()` (already in this file).
- Easing tokens live in `src/constants/animationConfig.ts` as `EASING.*` arrays. For this plan, prefer inline spring configs on the button (matches `WakeUpSheet` confirm button and `InlineSoundSelector` springs). If you need a cubic-bezier for the hint, use the strong ease-out from the audit playbook: `[0.23, 1, 0.32, 1]` — optionally add as `EASING.out` in `animationConfig.ts` only if plan 002 will also need it; otherwise inline once on the hint.
- Exemplar press feel elsewhere: `src/index.css` uses `active:scale-[0.96]` with `duration-150 ease-out` on control chips — same intent, slightly stronger on this rare large CTA (`0.95` + inner `0.92`).

## Steps

1. In `src/components/IntroSequence.tsx`, change `PRESS_ACK_MS` from `100` to `160`. Update the comment to say the hold must outlast the press spring so `0.95` is perceptible before dissolve.
2. Replace `SPRING_SNAP` with:
   - `SPRING_PRESS = { type: 'spring' as const, duration: 0.16, bounce: 0.12 }` for press-related transitions.
   - If dissolving/idle branches still need a zero-bounce settle, keep `SPRING_SNAP = { type: 'spring' as const, duration: 0.3, bounce: 0 }` only for those, or use `SPRING_PRESS` everywhere in this file for consistency — prefer **one** spring (`SPRING_PRESS`) for all button/halo press settles in this file.
3. Update the `motion.button` `animate.scale` logic: remove the `isDissolving ? 1` override; use `prefersReducedMotion ? 1 : isPressed ? 0.95 : 1`. Set `transition={SPRING_PRESS}`.
4. Update the inner `motion.span` pressed branch to `{ scale: 0.92, opacity: 1 }` when `isPressed && !isDissolving && !prefersReducedMotion`. Use `SPRING_PRESS` for that settle transition.
5. Convert the outer veil from `span` to `motion.span`; animate `opacity` to `0.95` while pressed, `0.7` otherwise (respect reduced motion → stay `0.7`).
6. Update hint pressed transition duration from `0.15` to `0.16` and ease to `[0.23, 1, 0.32, 1]` (or `EASING.out` if added).
7. Do **not** change `INTRO_DISSOLVE_DURATION_S`, parent content `scale: 1.15`, or App reveal timing — that is plan 002.

## Boundaries

- Do NOT touch `App.tsx`, `TimeZoneHome.tsx`, `SkyBackground.tsx`, or `animationConfig.ts` unless adding a shared `EASING.out` that plan 002 will reuse (optional; not required for this plan alone).
- Do NOT change enter gesture wiring (`onPointerDown` / `onClick` / keyboard).
- Do NOT change copy, layout, colors of the gradient fills (opacity animation only on the veil).
- Do NOT add dependencies.
- If line numbers drifted: match on `PRESS_ACK_MS`, `SPRING_SNAP`, and the `motion.button` enter control — STOP and report if those symbols are gone.

## Verification

- **Mechanical**: `npm run lint` and `npm run build` succeed.
- **Feel check** (`?first=true` or clear `orbit_wakeup_time`):
  1. Pointer-down on the halo: within ~160ms you must see a clear squeeze (outer ~0.95 + inner tighter) and a brighter outer veil **before** the page starts dissolving.
  2. In DevTools Animations panel at **10%** playback: confirm press spring completes (or is clearly underway) before opacity dissolve begins; button must **not** pop back to `scale: 1` the instant dissolve starts.
  3. Keyboard Enter/Space: same press ack, then dissolve.
  4. Toggle `prefers-reduced-motion`: no scale/veil motion; enter still works; dissolve may be instant (existing behavior).
- **Done when**: Press is obviously felt on a real device or trackpad before the crossfade, and lint/build pass.
