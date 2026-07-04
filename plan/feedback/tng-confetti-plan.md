# TailNG Component Plan: `tng-confetti`

## 1. Component Summary

` tng-confetti ` is a visual celebration component that renders a lightweight paper-confetti burst, usually after a successful action.

Examples:

- Invoice created
- Payment received
- GST reconciliation completed
- Form submitted successfully
- Onboarding completed
- Task finished

Recommended package location:

```txt
@tailng-ui/components/confetti
```

Do **not** start with a headless primitive. Confetti is mostly a visual effect, not a focus/keyboard/selection primitive. If the animation engine becomes reusable later, move the lower-level logic into CDK.

Possible future extraction:

```txt
@tailng-ui/cdk/effects
```

or:

```txt
@tailng-ui/cdk/motion
```

---

## 2. Naming Decision

Recommended public component name:

```html
<tng-confetti></tng-confetti>
```

Reason:

- “Confetti” is widely understood by developers.
- It clearly describes the celebration effect.
- It is better than terms like “paper bomb” or “explosion,” which may sound aggressive or unclear.

Alternative future wrapper:

```html
<tng-celebration></tng-celebration>
```

But for the first version, keep it simple:

```txt
tng-confetti
```

---

## 3. Design Goal

The component should provide a beautiful but lightweight celebration animation without blocking user interaction.

Primary goal:

> Render a paper-confetti burst from the bottom of the page after a successful user action.

The component should:

- Be controlled through an `active` input
- Support bottom-origin burst initially
- Render as a non-interactive overlay
- Auto-stop after a configurable duration
- Emit a completion event
- Respect reduced-motion settings
- Avoid unnecessary DOM work when inactive
- Avoid external animation dependencies in v1

---

## 4. Headless vs Component Decision

### Recommended: Styled component only

Create:

```txt
@tailng-ui/components/confetti
```

Do not create:

```txt
@tailng-ui/primitives/confetti
```

### Reason

A headless primitive is useful for components that need:

- ARIA behavior
- Keyboard handling
- Focus management
- Selection state
- Complex interaction contracts
- Developer-controlled markup

Examples:

- Listbox
- Menu
- Dialog
- Combobox
- Tooltip
- Tabs

Confetti does not need those things. It is a visual effect. So a styled component with CSS variables and inputs is enough.

### Future reusable layer

If multiple visual effects are added later, extract shared logic into:

```txt
@tailng-ui/cdk/effects
```

Possible future utilities:

```ts
TngConfettiController
TngCelebrationService
TngParticleEngine
```

But avoid over-engineering v1.

---

## 5. Suggested Public API

### Basic usage

```html
<tng-confetti [active]="saved()"></tng-confetti>
```

### Bottom burst usage

```html
<tng-confetti
  [active]="showCelebration()"
  origin="bottom"
  variant="paper"
  [duration]="3000"
  [pieces]="160"
  (completed)="showCelebration.set(false)"
></tng-confetti>
```

### Suggested inputs

```ts
active = input(false);
origin = input<TngConfettiOrigin>('bottom');
variant = input<TngConfettiVariant>('paper');
duration = input(3000);
pieces = input(120);
fullscreen = input(true);
reducedMotion = input<boolean | 'auto'>('auto');
colors = input<string[] | null>(null);
zIndex = input<number | null>(null);
```

### Suggested output

```ts
completed = output<void>();
```

### Types

```ts
export type TngConfettiOrigin =
  | 'top'
  | 'bottom'
  | 'center'
  | 'left'
  | 'right'
  | 'bottom-left'
  | 'bottom-right';

export type TngConfettiVariant =
  | 'paper'
  | 'sparkles'
  | 'stars'
  | 'mixed';
```

### V1 supported values

For v1, implement only:

```ts
origin: 'bottom' | 'center';
variant: 'paper';
```

Keep the type narrow in v1 if you want to avoid unsupported API promises:

```ts
export type TngConfettiOrigin = 'bottom' | 'center';
export type TngConfettiVariant = 'paper';
```

Then expand later.

---

## 6. Recommended Defaults

```ts
active: false
origin: 'bottom'
variant: 'paper'
duration: 3000
pieces: 120
fullscreen: true
reducedMotion: 'auto'
colors: null
zIndex: null
```

Default behavior:

- When `active` becomes `true`, launch one animation.
- When animation ends, emit `completed`.
- The consumer can set `active` back to `false` from the `completed` event.
- The component should not block clicks or focus.
- If reduced motion is enabled, either skip the animation or render a very subtle short fade.

---

## 7. CSS Variable Contract

Expose styling through CSS variables instead of requiring Tailwind.

Suggested variables:

```css
:root {
  --tng-confetti-z-index: 9999;
  --tng-confetti-piece-size: 8px;
  --tng-confetti-duration: 3000ms;
  --tng-confetti-opacity: 1;
  --tng-confetti-origin-x: 50%;
  --tng-confetti-origin-y: 100%;
}
```

Optional color variables:

```css
:root {
  --tng-confetti-color-1: #ef4444;
  --tng-confetti-color-2: #f59e0b;
  --tng-confetti-color-3: #22c55e;
  --tng-confetti-color-4: #3b82f6;
  --tng-confetti-color-5: #a855f7;
}
```

Component overlay style:

```css
:host {
  pointer-events: none;
}

.tng-confetti-overlay {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: var(--tng-confetti-z-index, 9999);
}
```

---

## 8. Rendering Strategy

### V1 recommendation: DOM + CSS animation

Use plain DOM elements for confetti pieces.

Why:

- Simple to implement
- Easy to test
- No canvas complexity
- Enough for 100–200 particles
- Works well for occasional celebration effects

Each piece can be a small absolutely positioned element:

```html
<span class="tng-confetti-piece"></span>
```

Each particle should get generated properties:

- x start
- y start
- x travel
- y travel
- rotation
- delay
- duration
- size
- color
- shape

Use CSS custom properties per piece:

```html
<span
  class="tng-confetti-piece"
  style="--x: 20px; --y: -400px; --r: 540deg; --delay: 80ms;"
></span>
```

### Future option: canvas renderer

If performance becomes an issue, add:

```ts
renderer = input<'dom' | 'canvas'>('dom');
```

Do not add this in v1 unless necessary.

---

## 9. Animation Behavior

### Bottom origin

Particles should start near the bottom center of the viewport:

```txt
x = viewportWidth / 2
y = viewportHeight
```

Then move upward and outward:

```txt
xTravel = random(-viewportWidth * 0.45, viewportWidth * 0.45)
yTravel = random(-viewportHeight * 0.65, -viewportHeight * 0.25)
```

After the burst, particles should fall down and fade out.

Suggested animation phases:

1. Burst upward
2. Spread outward
3. Fall down
4. Fade out

---

## 10. Accessibility

Confetti should be decorative by default.

Rules:

- Do not announce confetti to screen readers.
- Do not trap focus.
- Do not block clicks.
- Do not add keyboard handlers.
- Use `aria-hidden="true"` on the overlay.
- Respect `prefers-reduced-motion`.

Overlay example:

```html
<div class="tng-confetti-overlay" aria-hidden="true"></div>
```

If the parent action needs a success announcement, that should be done separately using a toast, alert, or live region.

Do not make confetti itself responsible for announcing success.

---

## 11. Reduced Motion Behavior

When reduced motion is enabled:

- Do not run the full confetti animation.
- Emit `completed` quickly.
- Optionally render no particles.

Recommended behavior:

```txt
reducedMotion = 'auto'
```

When set to `auto`, use:

```ts
window.matchMedia('(prefers-reduced-motion: reduce)')
```

Behavior matrix:

| reducedMotion input | User prefers reduced motion | Behavior |
|---|---:|---|
| `true` | any | Skip animation |
| `false` | any | Run animation |
| `'auto'` | true | Skip animation |
| `'auto'` | false | Run animation |

---

## 12. Angular Implementation Notes

Use signal-first APIs.

Suggested structure:

```txt
libs/components/confetti/
  src/
    confetti.component.ts
    confetti.types.ts
    confetti-piece.model.ts
    confetti.utils.ts
    index.ts
```

Possible component skeleton:

```ts
@Component({
  selector: 'tng-confetti',
  standalone: true,
  templateUrl: './confetti.component.html',
  styleUrl: './confetti.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tng-confetti',
  },
})
export class TngConfetti {
  active = input(false);
  origin = input<TngConfettiOrigin>('bottom');
  variant = input<TngConfettiVariant>('paper');
  duration = input(3000);
  pieces = input(120);
  fullscreen = input(true);
  reducedMotion = input<boolean | 'auto'>('auto');
  colors = input<string[] | null>(null);
  zIndex = input<number | null>(null);

  completed = output<void>();
}
```

---

## 13. Triggering Rules

### Start animation

Start the animation when:

```txt
active changes from false to true
```

### Do not restart animation when

- `active` remains true
- unrelated inputs change during a running animation

### Restart animation when

Possible v1 behavior:

- If `active` becomes false and then true again, launch again.

Possible future imperative API:

```ts
launch(): void
stop(): void
```

Avoid adding imperative API in v1 unless required.

---

## 14. Edge Cases

Handle these safely:

1. `pieces` is 0
2. `pieces` is negative
3. `duration` is 0
4. `duration` is negative
5. `colors` is empty
6. Component is destroyed before animation completes
7. `active` is toggled rapidly
8. Browser has reduced motion enabled
9. Server-side rendering or hydration environment
10. Multiple `tng-confetti` components exist on the same page

Recommended guards:

```txt
pieces = clamp(pieces, 0, 300)
duration = max(duration, 0)
```

Suggested maximum for DOM renderer:

```txt
300 particles
```

---

## 15. Public Documentation Example

### Basic success celebration

```html
<button type="button" (click)="save()">Save</button>

<tng-confetti
  [active]="saved()"
  (completed)="saved.set(false)"
></tng-confetti>
```

### Payment received example

```html
<tng-confetti
  [active]="paymentReceived()"
  origin="bottom"
  [pieces]="180"
  [duration]="3200"
  (completed)="paymentReceived.set(false)"
></tng-confetti>
```

### Reduced motion override

```html
<tng-confetti
  [active]="done()"
  [reducedMotion]="true"
  (completed)="done.set(false)"
></tng-confetti>
```

---

# Test Plan

## 16. Unit Test Goals

Use Angular TestBed + Vitest.

Test areas:

1. Component creation
2. Default input values
3. Rendering behavior
4. Active state behavior
5. Completion event
6. Reduced motion handling
7. Particle generation
8. Input validation
9. Cleanup behavior
10. Accessibility attributes

---

## 17. Suggested Test Files

```txt
libs/components/confetti/src/confetti.component.spec.ts
libs/components/confetti/src/confetti.utils.spec.ts
```

---

## 18. Component Test Cases

### 18.1 Should create the component

Expectation:

- Component instance is created successfully.

```ts
it('should create', () => {
  expect(component).toBeTruthy();
});
```

---

### 18.2 Should not render particles when inactive

Setup:

```html
<tng-confetti [active]="false"></tng-confetti>
```

Expected:

- No confetti pieces are rendered.
- Overlay is not rendered or is empty.

Assertions:

```ts
expect(queryPieces().length).toBe(0);
```

---

### 18.3 Should render particles when active becomes true

Setup:

```html
<tng-confetti [active]="active"></tng-confetti>
```

Steps:

1. Set `active = false`
2. Detect changes
3. Set `active = true`
4. Detect changes

Expected:

- Particles are generated.
- Particle count equals default `pieces` value.

Assertions:

```ts
expect(queryPieces().length).toBe(120);
```

---

### 18.4 Should respect custom pieces count

Setup:

```html
<tng-confetti [active]="true" [pieces]="25"></tng-confetti>
```

Expected:

```ts
expect(queryPieces().length).toBe(25);
```

---

### 18.5 Should clamp excessive pieces count

Setup:

```html
<tng-confetti [active]="true" [pieces]="1000"></tng-confetti>
```

Expected:

- Particle count should not exceed the internal maximum.

Recommended max:

```txt
300
```

Assertion:

```ts
expect(queryPieces().length).toBeLessThanOrEqual(300);
```

---

### 18.6 Should handle zero pieces safely

Setup:

```html
<tng-confetti [active]="true" [pieces]="0"></tng-confetti>
```

Expected:

- No particles are rendered.
- No error is thrown.
- `completed` still emits.

---

### 18.7 Should handle negative pieces safely

Setup:

```html
<tng-confetti [active]="true" [pieces]="-10"></tng-confetti>
```

Expected:

- Treat as 0.
- No error is thrown.

---

### 18.8 Should emit completed after duration

Setup:

```html
<tng-confetti
  [active]="true"
  [duration]="1000"
  (completed)="onCompleted()"
></tng-confetti>
```

Expected:

- `completed` is emitted after duration.

With fake timers:

```ts
vi.useFakeTimers();

expect(onCompleted).not.toHaveBeenCalled();
vi.advanceTimersByTime(1000);
expect(onCompleted).toHaveBeenCalledTimes(1);
```

---

### 18.9 Should not emit completed multiple times for one launch

Setup:

```html
<tng-confetti [active]="true" [duration]="1000"></tng-confetti>
```

Steps:

1. Trigger animation
2. Advance timer past duration multiple times

Expected:

```ts
expect(onCompleted).toHaveBeenCalledTimes(1);
```

---

### 18.10 Should launch again after active toggles false then true

Steps:

1. `active = true`
2. Complete animation
3. `active = false`
4. `active = true`

Expected:

- New particles are generated.
- `completed` can emit again.

---

### 18.11 Should not relaunch while active remains true

Steps:

1. `active = true`
2. Detect changes repeatedly
3. Keep `active = true`

Expected:

- Only one animation launch occurs.

---

### 18.12 Should clean timer on destroy

Setup:

- Start animation with long duration.
- Destroy fixture before timer completes.

Expected:

- No error.
- No completion emit after destroy.
- Timer is cleared.

---

### 18.13 Should set `aria-hidden="true"` on overlay

Expected:

```ts
expect(overlay.getAttribute('aria-hidden')).toBe('true');
```

---

### 18.14 Should not block pointer events

Expected:

```ts
expect(getComputedStyle(overlay).pointerEvents).toBe('none');
```

If computed styles are unreliable in jsdom, assert class or inline style contract instead.

---

### 18.15 Should apply fullscreen overlay by default

Expected:

- Overlay uses fixed positioning.
- Overlay covers viewport.

CSS-level assertion can be done through class snapshots or style contract tests.

---

### 18.16 Should apply custom z-index through input

Setup:

```html
<tng-confetti [active]="true" [zIndex]="5000"></tng-confetti>
```

Expected:

- Host or overlay sets CSS variable:

```css
--tng-confetti-z-index: 5000
```

---

### 18.17 Should use custom colors

Setup:

```html
<tng-confetti
  [active]="true"
  [colors]="['#111111', '#222222']"
></tng-confetti>
```

Expected:

- Generated particles use only supplied colors.

---

### 18.18 Should fallback to default colors when colors is null

Setup:

```html
<tng-confetti [active]="true" [colors]="null"></tng-confetti>
```

Expected:

- Particles use default color palette.

---

### 18.19 Should fallback to default colors when colors is empty

Setup:

```html
<tng-confetti [active]="true" [colors]="[]"></tng-confetti>
```

Expected:

- Particles use default color palette.

---

### 18.20 Should support reducedMotion=true

Setup:

```html
<tng-confetti
  [active]="true"
  [reducedMotion]="true"
></tng-confetti>
```

Expected:

- No full animation is rendered.
- `completed` emits quickly.
- Particle count is 0 or minimal, depending on chosen behavior.

Recommended v1 behavior:

```txt
0 particles
```

---

### 18.21 Should support reducedMotion=false

Setup:

```html
<tng-confetti
  [active]="true"
  [reducedMotion]="false"
></tng-confetti>
```

Expected:

- Animation runs even if system reduced motion is enabled.

---

### 18.22 Should support reducedMotion='auto'

Mock:

```ts
window.matchMedia('(prefers-reduced-motion: reduce)')
```

Expected:

- If media query matches, skip animation.
- If media query does not match, run animation.

---

## 19. Utility Test Cases

### 19.1 Should clamp piece count

Function:

```ts
clampPieceCount(value: number): number
```

Cases:

| Input | Expected |
|---:|---:|
| -1 | 0 |
| 0 | 0 |
| 1 | 1 |
| 120 | 120 |
| 999 | 300 |

---

### 19.2 Should normalize duration

Function:

```ts
normalizeDuration(value: number): number
```

Cases:

| Input | Expected |
|---:|---:|
| -100 | 0 |
| 0 | 0 |
| 1000 | 1000 |

---

### 19.3 Should fallback to default colors

Function:

```ts
resolveConfettiColors(colors: string[] | null): string[]
```

Cases:

| Input | Expected |
|---|---|
| `null` | default palette |
| `[]` | default palette |
| `['#111']` | `['#111']` |

---

### 19.4 Should generate requested number of particles

Function:

```ts
generateConfettiPieces(options): TngConfettiPiece[]
```

Expected:

- Count matches requested safe piece count.
- Each piece has required properties.

Required properties:

```ts
id
x
y
xTravel
yTravel
rotation
delay
duration
color
size
shape
```

---

### 19.5 Should generate unique particle ids

Expected:

```ts
new Set(pieces.map(piece => piece.id)).size === pieces.length
```

---

### 19.6 Should generate bottom-origin particles

Setup:

```ts
generateConfettiPieces({ origin: 'bottom' })
```

Expected:

- Start y position is near bottom.
- x spread moves left and right.
- y travel is upward initially.

---

### 19.7 Should generate center-origin particles

Setup:

```ts
generateConfettiPieces({ origin: 'center' })
```

Expected:

- Start x position is around center.
- Start y position is around center.

---

## 20. Integration Test Ideas

These can be added later in the docs/playground app.

### 20.1 Save button demo

Scenario:

1. User clicks Save.
2. Success state becomes true.
3. Confetti launches.
4. Animation completes.
5. Success state resets.

Expected:

- Confetti appears once per save.
- Page remains clickable.

---

### 20.2 Multiple confetti components

Scenario:

- Two sections include separate `tng-confetti` instances.

Expected:

- Each component works independently.
- Timers do not interfere.

---

### 20.3 Dialog interaction

Scenario:

- Confetti launches while a dialog is open.

Expected:

- Dialog remains interactive.
- Confetti does not steal focus.
- Confetti does not appear behind the dialog unless intentionally configured by z-index.

---

## 21. Visual Regression Test Ideas

Use only if your project already has screenshot tests.

Scenarios:

1. Inactive state
2. Active state with 20 pieces
3. Bottom origin
4. Center origin
5. Custom colors
6. Reduced motion enabled

Keep visual tests minimal because animations can be flaky.

Recommended strategy:

- Freeze random seed.
- Use reduced particle count.
- Disable animation timing or pause at first frame.

---

## 22. Documentation Checklist

Add docs for:

- Basic usage
- Controlled active state
- Completion event
- Origin
- Duration
- Pieces count
- Colors
- Reduced motion
- Accessibility notes
- Performance notes

---

## 23. Playground Examples

Add examples to TailNG playground/docs:

### Example 1: Basic Confetti

```html
<button tngButton (click)="celebrate()">Celebrate</button>

<tng-confetti
  [active]="celebrating()"
  (completed)="celebrating.set(false)"
></tng-confetti>
```

### Example 2: Payment Received

```html
<button tngButton (click)="markPaymentReceived()">
  Mark payment received
</button>

<tng-confetti
  [active]="paymentReceived()"
  origin="bottom"
  [pieces]="160"
  [duration]="3000"
  (completed)="paymentReceived.set(false)"
></tng-confetti>
```

### Example 3: GST Reconciliation Completed

```html
<button tngButton (click)="completeReconciliation()">
  Complete reconciliation
</button>

<tng-confetti
  [active]="reconciliationCompleted()"
  origin="bottom"
  [pieces]="200"
  [duration]="3500"
  (completed)="reconciliationCompleted.set(false)"
></tng-confetti>
```

---

## 24. Suggested Implementation Order

### Step 1: Create component shell

- Add package folder
- Add standalone component
- Add barrel export
- Add basic docs/playground entry

### Step 2: Add public API

- `active`
- `pieces`
- `duration`
- `origin`
- `completed`

### Step 3: Add particle generation utility

- Generate deterministic particle data structure
- Add utility tests

### Step 4: Add DOM rendering

- Render pieces when active
- Add overlay
- Add CSS animation

### Step 5: Add timer/completion behavior

- Emit `completed`
- Cleanup timer on destroy

### Step 6: Add reduced motion support

- Add `reducedMotion`
- Add `matchMedia` handling
- Add tests

### Step 7: Add customization

- Colors
- z-index
- CSS variables

### Step 8: Add docs and examples

- Basic docs
- Success action demo
- Payment received demo

---

## 25. Recommended V1 Scope

Include in v1:

- `active`
- `origin="bottom"`
- `variant="paper"`
- `duration`
- `pieces`
- `colors`
- `completed`
- reduced motion support
- DOM renderer
- CSS variable styling

Avoid in v1:

- Canvas renderer
- Sound effects
- Global service
- Complex shape system
- Headless primitive
- Imperative launch API
- Physics engine

---

## 26. Final Recommendation

Build `tng-confetti` as a styled TailNG component first.

Keep it simple:

```txt
@tailng-ui/components/confetti
```

Do not add a primitive package for it now.

The component should be controlled, decorative, accessible, lightweight, and configurable through inputs and CSS variables.

Best first version:

```html
<tng-confetti
  [active]="showCelebration()"
  origin="bottom"
  variant="paper"
  [duration]="3000"
  [pieces]="160"
  (completed)="showCelebration.set(false)"
></tng-confetti>
```
