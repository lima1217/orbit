# 002 — Retune Intro → home dissolve transition

- **Status**: DONE
- **Commit**: b4524b1
- **Severity**: HIGH
- **Category**: Easing & duration / Cohesion & tokens
- **Estimated scope**: 3 files (`IntroSequence.tsx`, `App.tsx`, `animationConfig.ts`; optional small touch in `TimeZoneHome.tsx`), ~40–60 lines
- **Depends on**: Plan 001 preferred first (press ack timing); can run alone if 001 already landed or is skipped

## Problem

Intro → main (`reveal`) and the reverse (`returning`) feel mushy and “off”: a long ambient curve drives a long double-exposed crossfade, and Intro zooms **in** (`scale → 1.15`) while the home page only fades opacity — the spatial story does not match.

```ts
/* src/components/IntroSequence.tsx:19-21 — current */
/** Intro ↔ 主页交叉淡出时长（秒）；需与 App reveal / returning 定时对齐 */
export const INTRO_DISSOLVE_DURATION_S = 1.2;
const INTRO_DISSOLVE_MS = INTRO_DISSOLVE_DURATION_S * 1000;
```

```tsx
/* src/components/IntroSequence.tsx:97-102, 128-137 — current */
animate={isDissolving ? { opacity: 0 } : { opacity: 1 }}
transition={{
    duration: dissolveDuration,
    ease: EASING.breathing, // [0.22, 0.68, 0.35, 1.0] — ambient, not exit
}}
// …
initial={{ scale: isReturning && !prefersReducedMotion ? 1.15 : 1 }}
animate={
    isDissolving && !prefersReducedMotion
        ? { scale: 1.15 }
        : { scale: 1 }
}
```

```tsx
/* src/App.tsx:155-160 — current */
initial={{ opacity: phase === 'returning' ? 1 : 0 }}
animate={{ opacity: phase === 'returning' ? 0 : 1 }}
exit={{ opacity: 0 }}
transition={{ duration: INTRO_DISSOLVE_DURATION_S, ease: [0.22, 0.68, 0.35, 1.0] }}
```

`TimeZoneHome` deliberately freezes child entrances when `enterFromIntro` is true so only the App wrapper fades — correct for symmetry, but the wrapper has **no** complementary scale/blur, so the handoff reads as a soft double exposure for 1.2s.

Marketing/onboarding may exceed the 300ms UI budget, but **1.2s of unstructured crossfade** is too long for this product’s soft-but-decisive personality.

## Target

### Shared timing & easing

Add to `src/constants/animationConfig.ts`:

```ts
// Inside EASING object — add:
out: [0.23, 1, 0.32, 1], // strong ease-out for UI enter/exit (audit --ease-out)
```

Keep `breathing` for ambient loops only (sky, idle halo) — **do not** use it for page dissolve.

| Token | Value |
| --- | --- |
| `INTRO_DISSOLVE_DURATION_S` | `0.6` |
| Dissolve ease (Intro root, Intro content, App wrapper) | `EASING.out` → `[0.23, 1, 0.32, 1]` |
| Reduced motion | duration `0` (existing pattern) |

App `setTimeout` phases already use `INTRO_DISSOLVE_MS` derived from the export — updating the constant keeps reveal/returning in sync. **Do not** hardcode `1.2` or `0.6` in `App.tsx`.

### Intro content motion (replace Ken Burns zoom-in)

When dissolving (forward enter to home):

- Content wrapper: `{ opacity` handled by root, `scale: 0.97`, `filter: 'blur(2px)' }`  
  Root already animates opacity to `0`; keep opacity on the **root** `motion.div` only. Content wrapper animates **scale + filter** only.

When idle / returned to intro:

- `{ scale: 1, filter: 'blur(0px)' }`

When `isReturning` mounts intro:

- `initial`: `{ scale: 0.97, filter: 'blur(2px)' }` (unless reduced motion → no scale/blur)
- `animate` to idle `{ scale: 1, filter: 'blur(0px)' }` with `duration: INTRO_DISSOLVE_DURATION_S`, `ease: EASING.out`

Dissolve content animate excerpt:

```tsx
animate={
    prefersReducedMotion
        ? { scale: 1, filter: 'blur(0px)' }
        : isDissolving
          ? { scale: 0.97, filter: 'blur(2px)' }
          : { scale: 1, filter: 'blur(0px)' }
}
transition={{ duration: dissolveDuration, ease: EASING.out }}
```

Root dissolve:

```tsx
transition={{ duration: dissolveDuration, ease: EASING.out }}
```

Blur must stay **≤ 2px** during the crossfade (audit: keep transition blur under 20px; 2px is the cohesion “mask double-expose” tool).

### App timezone wrapper (complementary)

```tsx
<motion.div
  key="timezone-wrapper"
  initial={
    prefersReducedMotion /* App has no useReducedMotion today — add it */
      ? { opacity: phase === 'returning' ? 1 : 0 }
      : phase === 'returning'
        ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
        : { opacity: 0, scale: 0.97, filter: 'blur(2px)' }
  }
  animate={
    prefersReducedMotion
      ? { opacity: phase === 'returning' ? 0 : 1 }
      : phase === 'returning'
        ? { opacity: 0, scale: 0.97, filter: 'blur(2px)' }
        : { opacity: 1, scale: 1, filter: 'blur(0px)' }
  }
  exit={
    prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.97, filter: 'blur(2px)' }
  }
  transition={{ duration: INTRO_DISSOLVE_DURATION_S, ease: EASING.out }}
  className="absolute inset-0"
>
```

Import `EASING` from `./constants/animationConfig` and `useReducedMotion` from `framer-motion` in `App.tsx`.

Replace the hardcoded `ease: [0.22, 0.68, 0.35, 1.0]` — never leave a duplicate ambient bezier on this transition.

### TimeZoneHome

Keep `enterFromIntro` child freezes (no staggered replay). No required markup change if App wrapper owns the complementary scale/blur. **Do not** re-enable per-child entrance delays during reveal.

Optional (only if wrapper scale feels like it double-scales with something inside): leave `TimeZoneHome` untouched.

### Halo button during dissolve (coordination with 001)

Once dissolve starts, allow the enter button to **release** press scale and gently settle to `1` with `SPRING_PRESS` / short ease-out — content-level `0.97` + blur carries the exit story. Do **not** reintroduce parent `scale: 1.15`.

If plan 001 left button at `0.95` while `isPressed` during dissolve: either clear `isPressed` when entering `DISSOLVING`, or set button animate to `scale: 1` when `isDissolving` **after** the 160ms ack (press already felt). Preferred:

```ts
// when setting DISSOLVING in the press timer callback:
setIsPressed(false);
setPhase('DISSOLVING');
```

…so the press spring can release into the dissolve without fighting content scale.

## Repo conventions to follow

- Durations/easings: `src/constants/animationConfig.ts` (`DURATION`, `EASING`).
- Intro↔App timing must stay coupled via exported `INTRO_DISSOLVE_DURATION_S` (comment already documents this).
- Exemplar strong enter ease already nearby: `EASING.enter = [0, 0, 0.2, 1]` used in `TimeZoneHome` / `WakeUpSheet`. New `EASING.out = [0.23, 1, 0.32, 1]` is the stronger audit curve for this page handoff; use it for dissolve only.
- Personality: soft, healing, Monument Valley — **recede + light blur mask**, not a dramatic zoom or dark flash.

## Steps

1. Add `out: [0.23, 1, 0.32, 1]` to `EASING` in `src/constants/animationConfig.ts`.
2. Set `INTRO_DISSOLVE_DURATION_S` to `0.6` in `IntroSequence.tsx`; keep the export and `INTRO_DISSOLVE_MS` derivation.
3. Switch Intro root dissolve `ease` from `EASING.breathing` to `EASING.out`.
4. Replace content wrapper dissolve/return scale `1.15` with the **0.97 + blur(2px)** target above; use `EASING.out` and `dissolveDuration`.
5. In the press → dissolve timer callback, `setIsPressed(false)` before/with `setPhase('DISSOLVING')` so press release and page dissolve do not fight (coordinates with plan 001).
6. In `App.tsx`: import `EASING` + `useReducedMotion`; apply complementary opacity/scale/filter on the timezone wrapper; use `EASING.out` and `INTRO_DISSOLVE_DURATION_S` (no hardcoded bezier).
7. Grep for `1.2` / `breathing` on this dissolve path; leave `SkyBackground.tsx` celestial `1.2` alone unless you confirm it is the same handoff (it is **not** — out of scope).
8. Manually verify `returning` (tap sun/moon on home) is the reverse of reveal and still uses the same duration constant.

## Boundaries

- Do NOT redesign WakeUpSheet, sound picker, or sky breathing loops.
- Do NOT change `EASING.breathing` value itself (other ambient users depend on it); only stop using it for page dissolve.
- Do NOT bump dissolve blur above `2px`.
- Do NOT reintroduce `scale: 1.15` on Intro content.
- Do NOT add new dependencies.
- Do NOT change product copy or layout structure beyond motion props / `useReducedMotion` in App.
- If `INTRO_DISSOLVE_DURATION_S` or the reveal/returning phase machine has been removed since `b4524b1`, STOP and report.

## Verification

- **Mechanical**: `npm run lint` && `npm run build`.
- **Feel check**:
  1. `?first=true` → press halo (after 001: clear press) → world appears in **~0.6s**, not a long mushy 1.2s bath.
  2. At 10% animation speed: Intro content **shrinks slightly** and soft-blurs while home **grows from 0.97** and un-blurs; no moment where both full-sharp UIs sit double-exposed for a long beat.
  3. Confirm no Ken Burns zoom-in (`1.15`) on exit.
  4. Tap celestial to return: reverse of the above; lands on Intro cleanly.
  5. `prefers-reduced-motion`: opacity-only (or instant) handoff; no scale/blur.
  6. First-visit WakeUpSheet still opens after reveal completes (timer still tied to `INTRO_DISSOLVE_MS`).
- **Done when**: Forward and reverse handoffs feel decisive and soft (not floaty), duration is visibly ~0.6s, lint/build pass.
