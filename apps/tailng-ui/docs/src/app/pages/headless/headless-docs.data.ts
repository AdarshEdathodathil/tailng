export type HeadlessDocsCategoryId =
  | 'getting-started'
  | 'layout'
  | 'overlay'
  | 'feedback'
  | 'form'
  | 'utility'
  | 'navigation';

export type HeadlessDocsItem = Readonly<{
  id: string;
  slug: string;
  title: string;
  description: string;
}>;

export type HeadlessDocsGroup = Readonly<{
  id: HeadlessDocsCategoryId;
  title: string;
  subtitle: string;
  items: readonly HeadlessDocsItem[];
}>;

export type HeadlessDocsRouteData = Readonly<{
  groupId: HeadlessDocsCategoryId;
  groupTitle: string;
  groupSubtitle: string;
  item: HeadlessDocsItem;
}>;

export const HEADLESS_GETTING_STARTED_GROUP: HeadlessDocsGroup = {
  id: 'getting-started',
  title: 'Getting Started',
  subtitle: 'Install and bootstrap headless foundations',
  items: [
    {
      id: 'quick-start',
      slug: 'quick-start',
      title: 'Quick Start',
      description: 'Create a first headless-driven page with keyboard-safe interaction defaults.',
    },
    {
      id: 'installation',
      slug: 'installation',
      title: 'Installation',
      description: 'Install headless packages with peer dependencies and recommended layering.',
    },
    {
      id: 'plain-css-setup',
      slug: 'plain-css-setup',
      title: 'Plain CSS Setup',
      description: 'Wire headless patterns with your own CSS contract and semantic token strategy.',
    },
    {
      id: 'tailwind-setup',
      slug: 'tailwind-setup',
      title: 'Tailwind Setup',
      description: 'Compose headless patterns with utility classes and local design conventions.',
    },
  ],
};

export const HEADLESS_FORM_GROUP: HeadlessDocsGroup = {
  id: 'form',
  title: 'Form',
  subtitle: 'Headless input and selection contracts',
  items: [
    {
      id: 'input',
      slug: 'input',
      title: 'Input',
      description: 'Control semantics, group slots, and input behavior contracts for text entry.',
    },
    {
      id: 'input-group',
      slug: 'input-group',
      title: 'Input Group',
      description:
        'Shell primitive for one input control plus optional prefix and suffix content with mirrored state attrs.',
    },
    {
      id: 'textarea',
      slug: 'textarea',
      title: 'Textarea',
      description:
        'Multiline text-entry behavior, resize controls, and grouped textarea composition contracts.',
    },
    {
      id: 'label',
      slug: 'label',
      title: 'Label',
      description:
        'Native label semantics with required and disabled styling hooks for explicit or wrapped controls.',
    },
    {
      id: 'checkbox',
      slug: 'checkbox',
      title: 'Checkbox',
      description: 'Binary and mixed selection state behavior with keyboard and ARIA support.',
    },
    {
      id: 'toggle',
      slug: 'toggle',
      title: 'Toggle',
      description: 'Pressed-state behavior and group semantics for compact toggle interactions.',
    },
    {
      id: 'switch',
      slug: 'switch',
      title: 'Switch',
      description:
        'Two-state switch behavior with button semantics, data-state hooks, and ARIA wiring.',
    },
    {
      id: 'radio',
      slug: 'radio',
      title: 'Radio',
      description:
        'Single-choice native radio behavior with readonly, invalid, and focus-visible hooks.',
    },
    {
      id: 'button-toggle',
      slug: 'button-toggle',
      title: 'Button Toggle',
      description:
        'Single and multiple pressed-button groups with roving focus, selection outputs, and styling hooks.',
    },
    {
      id: 'listbox',
      slug: 'listbox',
      title: 'ListBox',
      description: 'Roving focus, option activation, and selection models for listbox patterns.',
    },
    {
      id: 'autocomplete',
      slug: 'autocomplete',
      title: 'AutoComplete',
      description: 'Single-value query + option filtering with owned trigger/content directives.',
    },
    {
      id: 'multi-autocomplete',
      slug: 'multi-autocomplete',
      title: 'MultiAutocomplete',
      description: 'Chip-based multi-selection query handling and option synchronization.',
    },
    {
      id: 'selectbox',
      slug: 'selectbox',
      title: 'Select',
      description: 'Primitive select trigger/content behavior, keyboard flow, and option roles.',
    },
    {
      id: 'multiselect',
      slug: 'multiselect',
      title: 'MultiSelect',
      description:
        'Multiple selection state handling and interaction contracts in select overlays.',
    },
    {
      id: 'datepicker',
      slug: 'datepicker',
      title: 'Datepicker',
      description:
        'Headless calendar controller with editable input orchestration, overlay ownership, and bounded date navigation.',
    },
    {
      id: 'date-range-picker',
      slug: 'date-range-picker',
      title: 'Date Range Picker',
      description:
        'Headless date range controller with editable input orchestration, overlay ownership, preview state, and bounded range navigation.',
    },
    {
      id: 'chips',
      slug: 'chips',
      title: 'Chips',
      description: 'Token removal, focus order, and input integration behavior for chip lists.',
    },
    {
      id: 'input-otp',
      slug: 'input-otp',
      title: 'Input OTP',
      description:
        'Segmented OTP entry primitives with owned slot markup, paste handling, and reflected state attrs.',
    },
    {
      id: 'fileupload',
      slug: 'fileupload',
      title: 'FileUpload',
      description:
        'Headless drag-and-drop file selection with accept, size, and multiplicity validation plus drag-state hooks.',
    },
  ],
};

export const HEADLESS_LAYOUT_GROUP: HeadlessDocsGroup = {
  id: 'layout',
  title: 'Layout',
  subtitle: 'Headless structural primitives for expandable and container patterns',
  items: [
    {
      id: 'card',
      slug: 'card',
      title: 'Card',
      description:
        'Structural card slots for owner-authored content groupings, media regions, and footer actions.',
    },
    {
      id: 'separator',
      slug: 'separator',
      title: 'Separator',
      description:
        'Minimal divider primitive with orientation and decorative semantics for owner-authored layouts.',
    },
    {
      id: 'collapsible',
      slug: 'collapsible',
      title: 'Collapsible',
      description:
        'Owner-controlled disclosure structure with trigger/content wiring and stable state hooks.',
    },
    {
      id: 'accordion',
      slug: 'accordion',
      title: 'Accordion',
      description:
        'Headless multi-section disclosure behavior with item registration, roving focus, and panel lifecycle control.',
    },
    {
      id: 'stepper',
      slug: 'stepper',
      title: 'Stepper',
      description:
        'Ordered progress primitive with value-driven steps, roving focus, linear mode, and state hooks.',
    },
    {
      id: 'table',
      slug: 'table',
      title: 'Table',
      description:
        'Semantic table primitives for sortable, selectable, scrollable, and stateful data grids.',
    },
  ],
};

export const HEADLESS_OVERLAY_GROUP: HeadlessDocsGroup = {
  id: 'overlay',
  title: 'Overlay',
  subtitle: 'Headless modal and floating layer behavior',
  items: [
    {
      id: 'dialog',
      slug: 'dialog',
      title: 'Dialog',
      description:
        'Modal dialog behavior with backdrop dismissal, focus trapping, and close reason output.',
    },
    {
      id: 'popover',
      slug: 'popover',
      title: 'Popover',
      description:
        'Anchored floating panel behavior with trigger wiring, outside dismissal, and focus handoff.',
    },
    {
      id: 'tooltip',
      slug: 'tooltip',
      title: 'Tooltip',
      description:
        'Hover and focus helper text behavior with managed anchoring, collision-aware positioning, and ARIA wiring.',
    },
  ],
};

export const HEADLESS_FEEDBACK_GROUP: HeadlessDocsGroup = {
  id: 'feedback',
  title: 'Feedback',
  subtitle: 'Headless notification and status communication patterns',
  items: [
    {
      id: 'toast',
      slug: 'toast',
      title: 'Toast',
      description:
        'Viewport and item primitives for stacked notifications with tone semantics and owner-managed lifecycles.',
    },
    {
      id: 'empty',
      slug: 'empty',
      title: 'Empty',
      description:
        'Structural empty-state slots for owner-authored icon, title, description, and action content.',
    },
    {
      id: 'progress-bar',
      slug: 'progress-bar',
      title: 'Progress Bar',
      description:
        'Linear progress primitives with range normalization, aria semantics, and owner-authored track styling.',
    },
    {
      id: 'progress-spinner',
      slug: 'progress-spinner',
      title: 'Progress Spinner',
      description:
        'Circular progress primitive with range normalization, aria semantics, and owner-authored SVG rendering.',
    },
    {
      id: 'skeleton',
      slug: 'skeleton',
      title: 'Skeleton',
      description:
        'Decorative loading primitive with stable slot and state attributes for owner-authored shimmer placeholders.',
    },
  ],
};

export const HEADLESS_UTILITY_GROUP: HeadlessDocsGroup = {
  id: 'utility',
  title: 'Utility',
  subtitle: 'Reusable action, identity, and clipboard behavior',
  items: [
    {
      id: 'codeblock',
      slug: 'codeblock',
      title: 'Codeblock',
      description:
        'Structural code-block slot directives for owner-authored headers, gutters, and code surfaces.',
    },
    {
      id: 'copybutton',
      slug: 'copybutton',
      title: 'CopyButton',
      description: 'Clipboard action behavior, status signals, and announcer integration hooks.',
    },
    {
      id: 'button',
      slug: 'button',
      title: 'Button',
      description: 'Press normalization, ARIA contracts, and action-state behavior.',
    },
    {
      id: 'avatar',
      slug: 'avatar',
      title: 'Avatar',
      description:
        'Structural avatar slots for owner-authored image and fallback content without built-in sizing logic.',
    },
    {
      id: 'badge',
      slug: 'badge',
      title: 'Badge',
      description:
        'Generated badge bubble behavior with owner-controlled host markup, counts, dot mode, and placement.',
    },
    {
      id: 'tag',
      slug: 'tag',
      title: 'Tag',
      description:
        'Compact tag semantics with owner-authored icon, removable action, and state-reflecting slot hooks.',
    },
  ],
};

export const HEADLESS_NAVIGATION_GROUP: HeadlessDocsGroup = {
  id: 'navigation',
  title: 'Navigation',
  subtitle: 'Headless trails, trees, menus, and command surfaces',
  items: [
    {
      id: 'menubar',
      slug: 'menubar',
      title: 'Menubar',
      description: 'Top-level command bar behavior with focus transfer and owned menu wiring.',
    },
    {
      id: 'menu',
      slug: 'menu',
      title: 'Menu',
      description: 'Menu, submenu, trigger, and item behavior contracts with keyboard support.',
    },
    {
      id: 'context-menu',
      slug: 'context-menu',
      title: 'Context Menu',
      description: 'Context-triggered menu behavior for right-click and keyboard surface actions.',
    },
    {
      id: 'breadcrumb',
      slug: 'breadcrumb',
      title: 'Breadcrumb',
      description:
        'Structural breadcrumb slots for owner-controlled trails, current links, and separators.',
    },
    {
      id: 'tabs',
      slug: 'tabs',
      title: 'Tabs',
      description:
        'Tablist, trigger, and panel behavior with roving focus, selection outputs, and mount control.',
    },
    {
      id: 'tree',
      slug: 'tree',
      title: 'Tree',
      description:
        'Hierarchical treeitem contracts with owned expansion, selection, and typeahead styling.',
    },
    {
      id: 'pagination',
      slug: 'pagination',
      title: 'Pagination',
      description:
        'Page index, size, movement controls, and client or server pagination contracts.',
    },
  ],
};

function withAlphabetizedItems(group: HeadlessDocsGroup): HeadlessDocsGroup {
  return {
    ...group,
    items: [...group.items].sort((left, right) => left.title.localeCompare(right.title)),
  };
}

export const HEADLESS_DOCS_GROUPS: readonly HeadlessDocsGroup[] = Object.freeze([
  HEADLESS_GETTING_STARTED_GROUP,
  withAlphabetizedItems(HEADLESS_FORM_GROUP),
  withAlphabetizedItems(HEADLESS_LAYOUT_GROUP),
  withAlphabetizedItems(HEADLESS_NAVIGATION_GROUP),
  withAlphabetizedItems(HEADLESS_OVERLAY_GROUP),
  withAlphabetizedItems(HEADLESS_FEEDBACK_GROUP),
  withAlphabetizedItems(HEADLESS_UTILITY_GROUP),
]);

const defaultGroup = HEADLESS_GETTING_STARTED_GROUP;
const defaultItem = defaultGroup.items[0];
if (defaultItem === undefined) {
  throw new Error('Headless docs default item is missing.');
}

export const DEFAULT_HEADLESS_DOCS_SEGMENT = `${defaultGroup.id}/${defaultItem.slug}`;

export function buildHeadlessDocHref(groupId: HeadlessDocsCategoryId, itemSlug: string): string {
  return `/headless/${groupId}/${itemSlug}`;
}

export function toHeadlessDocsRouteData(
  group: HeadlessDocsGroup,
  item: HeadlessDocsItem,
): HeadlessDocsRouteData {
  return {
    groupId: group.id,
    groupTitle: group.title,
    groupSubtitle: group.subtitle,
    item,
  };
}
