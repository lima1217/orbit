# Animation plans

Plans produced by `improve-animations` for Orbit Intro enter + handoff. Executors should implement one plan at a time with zero reliance on chat context.

| # | Title | Severity | Status | Depends on |
| --- | --- | --- | --- | --- |
| 001 | [Strengthen Intro enter-button press feedback](./001-intro-enter-press-feedback.md) | HIGH | DONE | — |
| 002 | [Retune Intro → home dissolve transition](./002-intro-home-dissolve.md) | HIGH | DONE | 001 preferred first |

## Recommended order

1. **001** — make the halo press readable and stop dissolve from cancelling it.
2. **002** — shorten and re-curve the Intro↔home crossfade; replace `scale: 1.15` with soft recede + 2px blur mask; mirror on App wrapper.

## Notes

- Commit stamp when written: `b4524b1`.
- Scope is Intro enter + reveal/returning only; do not expand into sky breathing or WakeUpSheet.
- To execute: run each plan with any agent (`improve-animations execute <plan>` or paste the plan file). Do not improvise values — copy the numbers in the plan.
