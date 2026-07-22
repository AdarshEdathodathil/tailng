# `@tailng-ui/flow-layout-dagre`

Optional deterministic automatic-layout adapter for `@tailng-ui/flow`, powered by Dagre.

```ts
import { provideTngFlowLayoutEngine } from '@tailng-ui/flow';
import { TNG_FLOW_DAGRE_LAYOUT_ENGINE } from '@tailng-ui/flow-layout-dagre';

bootstrapApplication(AppComponent, {
  providers: [provideTngFlowLayoutEngine(TNG_FLOW_DAGRE_LAYOUT_ENGINE)],
});
```

The adapter receives measured, engine-neutral TailNG graph records and returns node positions only.
It does not mutate the flow definition or own graph state.
