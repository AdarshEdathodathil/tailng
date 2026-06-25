export type TngModalIsolationElement = Readonly<{
  children?: ArrayLike<TngModalIsolationElement>;
  contains?: (element: TngModalIsolationElement) => boolean;
  getAttribute: (name: 'aria-hidden' | 'inert') => string | null;
  removeAttribute: (name: 'aria-hidden' | 'inert') => void;
  setAttribute: (name: 'aria-hidden' | 'inert', value: string) => void;
}>;

export type TngModalIsolationDocument = Readonly<{
  body: Readonly<{
    children: readonly TngModalIsolationElement[];
  }>;
}>;

export type TngModalIsolationManagerOptions = Readonly<{
  documentRef?: TngModalIsolationDocument | null;
}>;

export type TngModalIsolationManager = Readonly<{
  activate: (modalId: string, modalElement: TngModalIsolationElement) => void;
  clear: () => void;
  deactivate: (modalId: string) => void;
  getActiveModalIds: () => readonly string[];
}>;
