# Progress Bar

Accessible linear progress primitives and a minimally styled wrapper for determinate and
indeterminate work.

## Scope and decisions

- Build a headless root directive and indicator directive in `@tailng-ui/primitives`.
- Build `<tng-progress-bar>` in `@tailng-ui/components`; it owns only baseline visuals.
- Keep animation and color customization in CSS so the primitive remains styling-agnostic.
- Preserve native numeric inputs (`min`, `max`, `value`) while accepting Angular template strings.
- Treat non-finite input as its documented fallback and clamp `value` into the normalized range.
- Normalize `max < min` to `max = min`; a zero-length range renders as complete (`100%`).
- Require consumers to provide an accessible name through `ariaLabel`, `ariaLabelledby`, or
  surrounding labelled markup. Do not invent a label that may be wrong for the task.
- Keep the packaged and copy-paste registry implementations behaviorally equivalent.

## Public API

### Headless root

```html
<div
  tngProgressBar
  aria-label="Upload progress"
  [min]="0"
  [max]="100"
  [value]="uploadPercent()"
  [indeterminate]="false"
  #progress="tngProgressBar"
>
  <span tngProgressBarIndicator [style.width.%]="progress.percent()"></span>
</div>
```

`TngProgressBar` inputs:

- `min: number` — default `0`
- `max: number` — default `100`
- `value: number` — default `0`
- `indeterminate: boolean` — default `false`
- `ariaValueText: string | null` — optional human-readable value

Readonly state:

- `range(): { min: number; max: number; value: number }` — normalized values
- `percent(): number` — normalized fill percentage in `[0, 100]`

`TngProgressBarIndicator` has no inputs. When nested under the root directive it mirrors the
root's determinate/indeterminate state automatically.

### Styled wrapper

```html
<tng-progress-bar
  ariaLabel="Upload progress"
  [min]="0"
  [max]="100"
  [value]="uploadPercent()"
  [indeterminate]="false"
></tng-progress-bar>
```

The wrapper exposes the root range inputs plus:

- `ariaLabel: string | null` — maps to `aria-label`
- `ariaLabelledby: string | null` — maps to `aria-labelledby`
- `ariaValueText: string | null` — maps to `aria-valuetext`

## DOM and accessibility contract

Root directive:

- `role="progressbar"`
- `data-slot="progress-bar"`
- `data-state="determinate|indeterminate"`
- `data-indeterminate` only in indeterminate mode
- Determinate mode exposes normalized `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- Indeterminate mode omits all three numeric ARIA attributes.
- `aria-valuetext` is forwarded when supplied in either mode.

Indicator directive:

- `data-slot="progress-bar-indicator"`
- `data-state="determinate|indeterminate"` when owned by a root
- `data-indeterminate` only when its owner is indeterminate

The progressbar must have an accessible name. The wrapper forwards both direct-label and
label-reference APIs; headless consumers use standard ARIA attributes on their root element.

## Styling contract

The wrapper exposes these optional CSS variables:

- `--tng-progress-bar-height`
- `--tng-progress-bar-radius`
- `--tng-progress-bar-track`
- `--tng-progress-bar-indicator`
- `--tng-progress-bar-transition-duration`
- `--tng-progress-bar-indeterminate-duration`

The indeterminate animation must stop under `prefers-reduced-motion: reduce`; determinate width
transitions must also be disabled. Theme token references include standalone fallbacks for
copy-paste use.

## Acceptance tests

### Primitives

- [x] Public directives and range helpers are exported.
- [x] Numeric strings, non-finite values, reversed ranges, and out-of-range values normalize.
- [x] `range()` and `percent()` update when runtime inputs change.
- [x] Determinate mode exposes role, slots, state, and normalized numeric ARIA attributes.
- [x] Indeterminate mode removes numeric ARIA attributes and exposes state hooks.
- [x] The indicator automatically mirrors root state.
- [x] Optional `ariaValueText` is forwarded.

### Styled component

- [x] Public wrapper aliases are exported from the feedback and package barrels.
- [x] Determinate width uses the primitive's normalized percentage.
- [x] Indeterminate mode renders a fixed moving segment and removes numeric ARIA values.
- [x] Direct and referenced accessible-name inputs and value text are forwarded.
- [x] CSS variables, semantic-token fallbacks, and reduced-motion behavior are present.

### Distribution and examples

- [x] Plain CSS and Tailwind playground routes demonstrate primitive and wrapper usage.
- [x] Component and headless docs include overview, API, styling, and examples.
- [x] Registry source generates primitive, wrapper, template, stylesheet, and barrel files.
- [x] `tailng add progress-bar` integration coverage verifies generated artifacts.
- [x] Registry output matches the packaged accessibility, state, and styling contracts.

## Verification

- [x] Progress-bar primitive and component unit tests pass.
- [x] Registry and CLI progress-bar tests pass.
- [x] Changed TypeScript sources pass ESLint; docs and registry type checks pass.
- [x] Primitive, component, and registry builds pass.

The repository-wide lint command was also evaluated. It remains red on unrelated existing
autocomplete, forms, package-metadata, and playground violations; no reported violation is in a
progress-bar file.

## Routes

- Playground: `/progress-bar`
- Component docs: `/components/feedback/progress-bar`
- Headless docs: `/headless/feedback/progress-bar`
- Ownable docs: `/ownable/feedback/progress-bar`
