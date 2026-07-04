import type { RegistryInstallMetadata, RegistryItem, RegistryItemSource } from './registry.types';

const registryInstallMetadata: Readonly<Record<string, RegistryInstallMetadata>> = {
  accordion: {
    importPath: './tailng-ui/accordion',
    importSymbols: ['TngAccordion', 'TngAccordionPrimitive'],
  },
  autocomplete: {
    importPath: './tailng-ui/autocomplete',
    importSymbols: ['TngAutocomplete', 'TngAutocompletePrimitive'],
  },
  avatar: {
    importPath: './tailng-ui/avatar',
    importSymbols: [
      'TngAvatar',
      'TngAvatarPrimitive',
      'TngAvatarImagePrimitive',
      'TngAvatarFallbackPrimitive',
    ],
  },
  badge: {
    importPath: './tailng-ui/badge',
    importSymbols: ['TngBadge', 'TngBadgePrimitive'],
  },
  'bottom-sheet': {
    importPath: './tailng-ui/bottom-sheet',
    importSymbols: ['TngBottomSheet', 'TngBottomSheetPrimitive'],
  },
  breadcrumb: {
    importPath: './tailng-ui/breadcrumb',
    importSymbols: [
      'TngBreadcrumb',
      'TngBreadcrumbPrimitive',
      'TngBreadcrumbListPrimitive',
      'TngBreadcrumbItemPrimitive',
      'TngBreadcrumbLinkPrimitive',
      'TngBreadcrumbSeparatorPrimitive',
    ],
  },
  button: {
    importPath: './tailng-ui/button',
    importSymbols: ['TngButton', 'TngPressPrimitive'],
  },
  'button-toggle': {
    importPath: './tailng-ui/button-toggle',
    importSymbols: [
      'TngButtonToggle',
      'TngButtonToggleGroup',
      'TngButtonTogglePrimitive',
      'TngButtonToggleGroupPrimitive',
    ],
  },
  card: {
    importPath: './tailng-ui/card',
    importSymbols: [
      'TngCard',
      'TngCardHeader',
      'TngCardTitle',
      'TngCardDescription',
      'TngCardContent',
      'TngCardFooter',
      'TngCardPrimitive',
      'TngCardHeaderPrimitive',
      'TngCardTitlePrimitive',
      'TngCardDescriptionPrimitive',
      'TngCardContentPrimitive',
      'TngCardFooterPrimitive',
    ],
  },
  checkbox: {
    importPath: './tailng-ui/checkbox',
    importSymbols: ['TngCheckbox', 'TngCheckboxPrimitive'],
  },
  confetti: {
    importPath: './tailng-ui/confetti',
    importSymbols: ['TngConfetti'],
  },
  chips: {
    importPath: './tailng-ui/chips',
    importSymbols: ['TngChips', 'TngChipsPrimitive'],
  },
  'code-block': {
    importPath: './tailng-ui/code-block',
    importSymbols: [
      'TngCodeHighlightingResolver',
      'TngCodeBlock',
      'TngCodeBlockPrimitive',
      'TngCodeBlockHeaderPrimitive',
      'TngCodeBlockBodyPrimitive',
      'TngCodeBlockGutterPrimitive',
      'TngCodeBlockCodePrimitive',
    ],
  },
  collapsible: {
    importPath: './tailng-ui/collapsible',
    importSymbols: [
      'TngCollapsible',
      'TngCollapsiblePrimitive',
      'TngCollapsibleTriggerPrimitive',
      'TngCollapsibleContentPrimitive',
    ],
  },
  combobox: {
    importPath: './tailng-ui/combobox',
    importSymbols: ['TngCombobox', 'TngComboboxPrimitive'],
  },
  'context-menu': {
    importPath: './tailng-ui/context-menu',
    importSymbols: ['TngContextMenu', 'TngContextMenuPrimitive'],
  },
  copy: {
    importPath: './tailng-ui/copy',
    importSymbols: ['TngCopyButton', 'TngCopyPrimitive'],
  },
  dialog: {
    importPath: './tailng-ui/dialog',
    importSymbols: ['TngDialog'],
  },
  drawer: {
    importPath: './tailng-ui/drawer',
    importSymbols: ['TngDrawer', 'TngDrawerPrimitive'],
  },
  'dropdown-menu': {
    importPath: './tailng-ui/dropdown-menu',
    importSymbols: ['TngDropdownMenu', 'TngDropdownMenuPrimitive'],
  },
  empty: {
    importPath: './tailng-ui/empty',
    importSymbols: [
      'TngEmpty',
      'TngEmptyIcon',
      'TngEmptyTitle',
      'TngEmptyDescription',
      'TngEmptyActions',
      'TngEmptyPrimitive',
      'TngEmptyIconPrimitive',
      'TngEmptyTitlePrimitive',
      'TngEmptyDescriptionPrimitive',
      'TngEmptyActionsPrimitive',
    ],
  },
  grid: {
    importPath: './tailng-ui/grid',
    importSymbols: ['TngGrid', 'TngGridPrimitive'],
  },
  input: {
    importPath: './tailng-ui/input',
    importSymbols: ['TngInput', 'TngInputPrimitive'],
  },
  'input-otp': {
    importPath: './tailng-ui/input-otp',
    importSymbols: ['TngInputOtp', 'TngInputOtpPrimitive'],
  },
  label: {
    importPath: './tailng-ui/label',
    importSymbols: ['TngLabel', 'TngLabelPrimitive'],
  },
  menu: {
    importPath: './tailng-ui/menu',
    importSymbols: ['TngMenu', 'TngMenuTriggerFor', 'TngMenuPrimitive'],
  },
  menubar: {
    importPath: './tailng-ui/menubar',
    importSymbols: ['TngMenubar', 'TngMenubarPrimitive'],
  },
  multiselect: {
    importPath: './tailng-ui/multiselect',
    importSymbols: ['TngMultiselect', 'TngMultiselectPrimitive'],
  },
  'navigation-menu': {
    importPath: './tailng-ui/navigation-menu',
    importSymbols: ['TngNavigationMenu', 'TngNavigationMenuPrimitive'],
  },
  pagination: {
    importPath: './tailng-ui/pagination',
    importSymbols: ['TngPaginator', 'TngPaginationPrimitive'],
  },
  popover: {
    importPath: './tailng-ui/popover',
    importSymbols: ['TngPopover'],
  },
  'progress-bar': {
    importPath: './tailng-ui/progress-bar',
    importSymbols: [
      'TngProgressBar',
      'TngProgressBarPrimitive',
      'TngProgressBarIndicatorPrimitive',
    ],
  },
  'progress-spinner': {
    importPath: './tailng-ui/progress-spinner',
    importSymbols: ['TngProgressSpinner', 'TngProgressSpinnerPrimitive'],
  },
  radio: {
    importPath: './tailng-ui/radio',
    importSymbols: ['TngRadio', 'TngRadioPrimitive'],
  },
  select: {
    importPath: './tailng-ui/select',
    importSymbols: ['TngSelect', 'TngSelectPrimitive'],
  },
  separator: {
    importPath: './tailng-ui/separator',
    importSymbols: ['TngSeparator', 'TngSeparatorPrimitive'],
  },
  skeleton: {
    importPath: './tailng-ui/skeleton',
    importSymbols: ['TngSkeleton', 'TngSkeletonPrimitive'],
  },
  slider: {
    importPath: './tailng-ui/slider',
    importSymbols: ['TngSlider', 'TngSliderPrimitive'],
  },
  stepper: {
    importPath: './tailng-ui/stepper',
    importSymbols: ['TngStepper', 'TngStepperPrimitive'],
  },
  switch: {
    importPath: './tailng-ui/switch',
    importSymbols: ['TngSwitch', 'TngSwitchPrimitive'],
  },
  table: {
    importPath: './tailng-ui/table',
    importSymbols: ['TngTable', 'TngTablePrimitive'],
  },
  tabs: {
    importPath: './tailng-ui/tabs',
    importSymbols: ['TngTabs', 'TngTabsPrimitive'],
  },
  tag: {
    importPath: './tailng-ui/tag',
    importSymbols: ['TngTag', 'TngTagPrimitive'],
  },
  textarea: {
    importPath: './tailng-ui/textarea',
    importSymbols: ['TngTextarea', 'TngTextareaPrimitive'],
  },
  toast: {
    importPath: './tailng-ui/toast',
    importSymbols: ['TngToast', 'TngToastViewportPrimitive', 'TngToastItemPrimitive'],
  },
  toggle: {
    importPath: './tailng-ui/toggle',
    importSymbols: ['TngToggle', 'TngTogglePrimitive'],
  },
  'toggle-group': {
    importPath: './tailng-ui/toggle-group',
    importSymbols: ['TngToggleGroup', 'TngToggleGroupPrimitive'],
  },
  toolbar: {
    importPath: './tailng-ui/toolbar',
    importSymbols: ['TngToolbar', 'TngToolbarPrimitive'],
  },
  tooltip: {
    importPath: './tailng-ui/tooltip',
    importSymbols: ['TngTooltip', 'TngTooltipTrigger', 'TngTooltipContent'],
  },
  tree: {
    importPath: './tailng-ui/tree',
    importSymbols: ['TngTree', 'TngTreePrimitive'],
  },
};

export function getRegistryInstallMetadata(name: string): RegistryInstallMetadata | undefined {
  return registryInstallMetadata[name];
}

export function withRegistryInstallMetadata(item: RegistryItemSource): RegistryItem {
  const install = getRegistryInstallMetadata(item.name);

  if (install === undefined) {
    throw new Error(`Missing install metadata for registry item "${item.name}".`);
  }

  return {
    ...item,
    install,
  };
}
