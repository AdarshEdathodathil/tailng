import { expect, it } from 'vitest';
import {
  createModalIsolationManager,
  getGlobalModalIsolationManager,
} from './modal-isolation';
import type {
  TngModalIsolationDocument,
  TngModalIsolationElement,
} from './modal-isolation.types';

class FakeElement implements TngModalIsolationElement {
  private readonly attributes = new Map<'aria-hidden' | 'inert', string>();
  public readonly children: TngModalIsolationElement[] = [];

  public addChild(child: Readonly<FakeElement>): void {
    this.children.push(child);
  }

  public contains(element: TngModalIsolationElement): boolean {
    for (const child of this.children) {
      if (child === element || child.contains?.(element) === true) {
        return true;
      }
    }

    return false;
  }

  public getAttribute(name: 'aria-hidden' | 'inert'): string | null {
    return this.attributes.get(name) ?? null;
  }

  public removeAttribute(name: 'aria-hidden' | 'inert'): void {
    this.attributes.delete(name);
  }

  public setAttribute(name: 'aria-hidden' | 'inert', value: string): void {
    this.attributes.set(name, value);
  }
}

function createDocument(
  children: readonly Readonly<FakeElement>[],
): TngModalIsolationDocument {
  return {
    body: {
      children,
    },
  };
}

it('isolates siblings when modal is active', () => {
  const appRoot = new FakeElement();
  const modalRoot = new FakeElement();
  const manager = createModalIsolationManager({
    documentRef: createDocument([appRoot, modalRoot]),
  });

  manager.activate('modal-1', modalRoot);

  expect(appRoot.getAttribute('aria-hidden')).toBe('true');
  expect(appRoot.getAttribute('inert')).toBe('');
  expect(modalRoot.getAttribute('aria-hidden')).toBeNull();
});

it('restores attributes after modal deactivation', () => {
  const appRoot = new FakeElement();
  appRoot.setAttribute('aria-hidden', 'false');
  const modalRoot = new FakeElement();
  const manager = createModalIsolationManager({
    documentRef: createDocument([appRoot, modalRoot]),
  });

  manager.activate('modal-1', modalRoot);
  manager.deactivate('modal-1');

  expect(appRoot.getAttribute('aria-hidden')).toBe('false');
  expect(appRoot.getAttribute('inert')).toBeNull();
});

it('supports nested modal activation order', () => {
  const appRoot = new FakeElement();
  const firstModal = new FakeElement();
  const secondModal = new FakeElement();
  const manager = createModalIsolationManager({
    documentRef: createDocument([appRoot, firstModal, secondModal]),
  });

  manager.activate('modal-1', firstModal);
  manager.activate('modal-2', secondModal);
  expect(manager.getActiveModalIds()).toEqual(['modal-1', 'modal-2']);

  manager.deactivate('modal-2');
  expect(manager.getActiveModalIds()).toEqual(['modal-1']);
  expect(appRoot.getAttribute('aria-hidden')).toBe('true');
  expect(secondModal.getAttribute('aria-hidden')).toBe('true');
});

it('isolates sibling branches when modal is nested inside an app root', () => {
  const appRoot = new FakeElement();
  const appContent = new FakeElement();
  const appHeader = new FakeElement();
  const modalRoot = new FakeElement();
  const externalRoot = new FakeElement();
  appRoot.addChild(appContent);
  appRoot.addChild(appHeader);
  appHeader.addChild(modalRoot);
  const manager = createModalIsolationManager({
    documentRef: createDocument([appRoot, externalRoot]),
  });

  manager.activate('modal-1', modalRoot);

  expect(appRoot.getAttribute('aria-hidden')).toBeNull();
  expect(appHeader.getAttribute('aria-hidden')).toBeNull();
  expect(modalRoot.getAttribute('aria-hidden')).toBeNull();
  expect(appContent.getAttribute('aria-hidden')).toBe('true');
  expect(appContent.getAttribute('inert')).toBe('');
  expect(externalRoot.getAttribute('aria-hidden')).toBe('true');
  expect(externalRoot.getAttribute('inert')).toBe('');
});

it('restores parent modal isolation when nested top modal closes', () => {
  const appRoot = new FakeElement();
  const appContent = new FakeElement();
  const parentModal = new FakeElement();
  const parentContent = new FakeElement();
  const childModal = new FakeElement();
  appRoot.addChild(appContent);
  appRoot.addChild(parentModal);
  parentModal.addChild(parentContent);
  parentModal.addChild(childModal);
  const manager = createModalIsolationManager({
    documentRef: createDocument([appRoot]),
  });

  manager.activate('modal-1', parentModal);
  manager.activate('modal-2', childModal);

  expect(appRoot.getAttribute('aria-hidden')).toBeNull();
  expect(parentModal.getAttribute('aria-hidden')).toBeNull();
  expect(appContent.getAttribute('aria-hidden')).toBe('true');
  expect(parentContent.getAttribute('aria-hidden')).toBe('true');

  manager.deactivate('modal-2');

  expect(manager.getActiveModalIds()).toEqual(['modal-1']);
  expect(appContent.getAttribute('aria-hidden')).toBe('true');
  expect(parentContent.getAttribute('aria-hidden')).toBeNull();
  expect(childModal.getAttribute('aria-hidden')).toBeNull();
});

it('clear removes active modal tracking and restores state', () => {
  const appRoot = new FakeElement();
  const modalRoot = new FakeElement();
  const manager = createModalIsolationManager({
    documentRef: createDocument([appRoot, modalRoot]),
  });

  manager.activate('modal-1', modalRoot);
  manager.clear();

  expect(manager.getActiveModalIds()).toEqual([]);
  expect(appRoot.getAttribute('aria-hidden')).toBeNull();
});

it('shares global modal isolation managers per document', () => {
  const appRoot = new FakeElement();
  const modalRoot = new FakeElement();
  const documentRef = createDocument([appRoot, modalRoot]);
  const first = getGlobalModalIsolationManager({ documentRef });
  const second = getGlobalModalIsolationManager({ documentRef });

  expect(first).toBe(second);

  first.activate('modal-1', modalRoot);
  second.deactivate('modal-1');

  expect(appRoot.getAttribute('aria-hidden')).toBeNull();
});
