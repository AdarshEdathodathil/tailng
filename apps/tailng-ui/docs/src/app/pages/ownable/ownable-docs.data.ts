export type OwnableDocsCategoryId =
  | 'getting-started'
  | 'layout'
  | 'overlay'
  | 'feedback'
  | 'form'
  | 'utility'
  | 'navigation'
  | 'tooling'
  | 'release';

export type OwnableDocsItem = Readonly<{
  id: string;
  slug: string;
  title: string;
  description: string;
}>;

export type OwnableDocsGroup = Readonly<{
  id: OwnableDocsCategoryId;
  title: string;
  subtitle: string;
  items: readonly OwnableDocsItem[];
}>;

export type OwnableDocsRouteData = Readonly<{
  groupId: OwnableDocsCategoryId;
  groupTitle: string;
  groupSubtitle: string;
  item: OwnableDocsItem;
}>;

export const OWNABLE_GETTING_STARTED_GROUP: OwnableDocsGroup = {
  id: 'getting-started',
  title: 'Getting Started',
  subtitle: 'Ownable model, workflow, and first local install',
  items: [
    {
      id: 'overview',
      slug: 'overview',
      title: 'Overview',
      description: 'What ownable means in TailNG and when local source ownership is the right fit.',
    },
    {
      id: 'quick-start',
      slug: 'quick-start',
      title: 'Quick Start',
      description: 'List the surface, add a component, and edit the generated files locally.',
    },
  ],
};

export const OWNABLE_TOOLING_GROUP: OwnableDocsGroup = {
  id: 'tooling',
  title: 'Tooling',
  subtitle: 'CLI and registry contracts',
  items: [
    {
      id: 'cli',
      slug: 'cli',
      title: 'CLI',
      description: 'Commands, options, aliases, and user-facing behavior of the `tailng` CLI.',
    },
    {
      id: 'registry',
      slug: 'registry',
      title: 'Registry',
      description:
        'The registry contract that defines generated files, install metadata, and names.',
    },
  ],
};

export const OWNABLE_FORM_GROUP: OwnableDocsGroup = {
  id: 'form',
  title: 'Form',
  subtitle: 'Installable form components',
  items: [
    {
      id: 'input',
      slug: 'input',
      title: 'Input',
      description:
        'Ownable input install with local wrapper source, import metadata, and generated file structure.',
    },
    {
      id: 'textarea',
      slug: 'textarea',
      title: 'Textarea',
      description:
        'Ownable textarea install with local wrapper source, import metadata, and generated file structure.',
    },
    {
      id: 'label',
      slug: 'label',
      title: 'Label',
      description:
        'Ownable label install with local wrapper source, semantic defaults, and generated file structure.',
    },
    {
      id: 'checkbox',
      slug: 'checkbox',
      title: 'Checkbox',
      description:
        'Ownable checkbox install with local wrapper source, form integration, and generated file structure.',
    },
    {
      id: 'toggle',
      slug: 'toggle',
      title: 'Toggle',
      description:
        'Ownable toggle install with local wrapper source, icon-slot ownership, and generated file structure.',
    },
    {
      id: 'switch',
      slug: 'switch',
      title: 'Switch',
      description:
        'Ownable switch install with local wrapper source, form integration, and generated file structure.',
    },
    {
      id: 'radio',
      slug: 'radio',
      title: 'Radio',
      description:
        'Ownable radio install with local wrapper source, group semantics, and generated file structure.',
    },
    {
      id: 'button-toggle',
      slug: 'button-toggle',
      title: 'Button Toggle',
      description:
        'Ownable button-toggle install with local group and item wrappers, toolbar semantics, and generated file structure.',
    },
    {
      id: 'autocomplete',
      slug: 'autocomplete',
      title: 'Autocomplete',
      description:
        'Ownable autocomplete install with local wrapper source, option mapping defaults, and generated file structure.',
    },
    {
      id: 'chips',
      slug: 'chips',
      title: 'Chips',
      description:
        'Ownable chips install with local wrapper source, removable token markup, and generated file structure.',
    },
    {
      id: 'input-otp',
      slug: 'input-otp',
      title: 'Input OTP',
      description:
        'Ownable input-otp install with local wrapper source, verification-flow defaults, and generated file structure.',
    },
  ],
};

export const OWNABLE_LAYOUT_GROUP: OwnableDocsGroup = {
  id: 'layout',
  title: 'Layout',
  subtitle: 'Installable layout wrappers with local source ownership',
  items: [
    {
      id: 'card',
      slug: 'card',
      title: 'Card',
      description:
        'Ownable card install with local wrapper source, content shell markup, and generated file structure.',
    },
    {
      id: 'separator',
      slug: 'separator',
      title: 'Separator',
      description:
        'Ownable separator install with local wrapper source, divider styling, and generated file structure.',
    },
    {
      id: 'collapsible',
      slug: 'collapsible',
      title: 'Collapsible',
      description:
        'Ownable collapsible install with local wrapper source, disclosure markup, and generated file structure.',
    },
    {
      id: 'accordion',
      slug: 'accordion',
      title: 'Accordion',
      description:
        'Ownable accordion install with local wrapper source, section markup, and generated file structure.',
    },
    {
      id: 'stepper',
      slug: 'stepper',
      title: 'Stepper',
      description:
        'Ownable stepper install with local wrapper source, progress markup, and generated file structure.',
    },
    {
      id: 'table',
      slug: 'table',
      title: 'Table',
      description:
        'Ownable table install with local column rendering, data-state markup, and generated file structure.',
    },
  ],
};

export const OWNABLE_OVERLAY_GROUP: OwnableDocsGroup = {
  id: 'overlay',
  title: 'Overlay',
  subtitle: 'Installable overlay wrappers with local source ownership',
  items: [
    {
      id: 'dialog',
      slug: 'dialog',
      title: 'Dialog',
      description:
        'Ownable dialog install with local wrapper source, modal behavior helpers, and generated file structure.',
    },
    {
      id: 'popover',
      slug: 'popover',
      title: 'Popover',
      description:
        'Ownable popover install with local wrapper source, anchored panel behavior, and generated file structure.',
    },
    {
      id: 'tooltip',
      slug: 'tooltip',
      title: 'Tooltip',
      description:
        'Ownable tooltip install with local wrapper source, helper-text defaults, and generated file structure.',
    },
  ],
};

export const OWNABLE_FEEDBACK_GROUP: OwnableDocsGroup = {
  id: 'feedback',
  title: 'Feedback',
  subtitle: 'Installable feedback wrappers with local source ownership',
  items: [
    {
      id: 'toast',
      slug: 'toast',
      title: 'Toast',
      description:
        'Ownable toast install with local queue UI, notification styling, and generated file structure.',
    },
    {
      id: 'empty',
      slug: 'empty',
      title: 'Empty',
      description:
        'Ownable empty install with local wrapper source, no-data copy patterns, and generated file structure.',
    },
    {
      id: 'progress-bar',
      slug: 'progress-bar',
      title: 'Progress Bar',
      description:
        'Ownable progress-bar install with local wrapper source, track styling, and generated file structure.',
    },
    {
      id: 'progress-spinner',
      slug: 'progress-spinner',
      title: 'Progress Spinner',
      description:
        'Ownable progress-spinner install with local wrapper source, circular motion defaults, and generated file structure.',
    },
    {
      id: 'skeleton',
      slug: 'skeleton',
      title: 'Skeleton',
      description:
        'Ownable skeleton install with local wrapper source, shimmer defaults, and generated file structure.',
    },
  ],
};

export const OWNABLE_NAVIGATION_GROUP: OwnableDocsGroup = {
  id: 'navigation',
  title: 'Navigation',
  subtitle: 'Installable navigation components',
  items: [
    {
      id: 'menubar',
      slug: 'menubar',
      title: 'Menubar',
      description:
        'Ownable menubar install with local wrapper source, command-strip markup, and generated file structure.',
    },
    {
      id: 'context-menu',
      slug: 'context-menu',
      title: 'Context Menu',
      description:
        'Ownable context-menu install with local wrapper source, trigger semantics, and generated file structure.',
    },
    {
      id: 'breadcrumb',
      slug: 'breadcrumb',
      title: 'Breadcrumb',
      description:
        'Ownable breadcrumb install with local wrapper source, collapsed trail defaults, and generated file structure.',
    },
    {
      id: 'tabs',
      slug: 'tabs',
      title: 'Tabs',
      description:
        'Ownable tabs install with local wrapper source, tablist markup, and generated file structure.',
    },
    {
      id: 'tree',
      slug: 'tree',
      title: 'Tree',
      description:
        'Ownable tree install with local wrapper source, hierarchical row presentation, and generated file structure.',
    },
    {
      id: 'pagination',
      slug: 'pagination',
      title: 'Pagination',
      description:
        'Ownable pagination install with local control markup, page-size options, and generated file structure.',
    },
  ],
};

export const OWNABLE_UTILITY_GROUP: OwnableDocsGroup = {
  id: 'utility',
  title: 'Utility',
  subtitle: 'Installable utility wrappers with local source ownership',
  items: [
    {
      id: 'codeblock',
      slug: 'codeblock',
      title: 'Codeblock',
      description:
        'Ownable codeblock install with local wrapper source, highlighting hooks, and generated file structure.',
    },
    {
      id: 'copybutton',
      slug: 'copybutton',
      title: 'CopyButton',
      description:
        'Ownable copy button install with local wrapper source, clipboard feedback states, and generated file structure.',
    },
    {
      id: 'button',
      slug: 'button',
      title: 'Button',
      description:
        'Ownable button install with local wrapper source, action semantics, and generated file structure.',
    },
    {
      id: 'avatar',
      slug: 'avatar',
      title: 'Avatar',
      description:
        'Ownable avatar install with local wrapper source, fallback initials, and generated file structure.',
    },
    {
      id: 'badge',
      slug: 'badge',
      title: 'Badge',
      description:
        'Ownable badge install with local directive source, generated bubble styling, and generated file structure.',
    },
    {
      id: 'tag',
      slug: 'tag',
      title: 'Tag',
      description:
        'Ownable tag install with local wrapper source, removable chip behavior, and generated file structure.',
    },
  ],
};

export const OWNABLE_RELEASE_GROUP: OwnableDocsGroup = {
  id: 'release',
  title: 'Release',
  subtitle: 'Publishing and workflow structure for the ownable surface',
  items: [
    {
      id: 'workflow',
      slug: 'workflow',
      title: 'Release Workflow',
      description:
        'How registry and CLI releases are validated, packed, smoke-tested, and published.',
    },
  ],
};

function withAlphabetizedItems(group: OwnableDocsGroup): OwnableDocsGroup {
  return {
    ...group,
    items: [...group.items].sort((left, right) => left.title.localeCompare(right.title)),
  };
}

export const OWNABLE_DOCS_GROUPS: readonly OwnableDocsGroup[] = Object.freeze([
  OWNABLE_GETTING_STARTED_GROUP,
  withAlphabetizedItems(OWNABLE_FORM_GROUP),
  withAlphabetizedItems(OWNABLE_LAYOUT_GROUP),
  withAlphabetizedItems(OWNABLE_NAVIGATION_GROUP),
  withAlphabetizedItems(OWNABLE_OVERLAY_GROUP),
  withAlphabetizedItems(OWNABLE_FEEDBACK_GROUP),
  withAlphabetizedItems(OWNABLE_UTILITY_GROUP),
  OWNABLE_TOOLING_GROUP,
  OWNABLE_RELEASE_GROUP,
]);

const defaultGroup = OWNABLE_GETTING_STARTED_GROUP;
const defaultItem = defaultGroup.items[0];
if (defaultItem === undefined) {
  throw new Error('Ownable docs default item is missing.');
}

export const DEFAULT_OWNABLE_DOCS_SEGMENT = `${defaultGroup.id}/${defaultItem.slug}`;

export function buildOwnableDocHref(groupId: OwnableDocsCategoryId, itemSlug: string): string {
  return `/ownable/${groupId}/${itemSlug}`;
}

export function toOwnableDocsRouteData(
  group: OwnableDocsGroup,
  item: OwnableDocsItem,
): OwnableDocsRouteData {
  return {
    groupId: group.id,
    groupTitle: group.title,
    groupSubtitle: group.subtitle,
    item,
  };
}
