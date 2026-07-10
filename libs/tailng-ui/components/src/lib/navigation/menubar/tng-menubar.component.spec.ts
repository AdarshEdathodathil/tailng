import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TngMenuGroupLabel, TngMenubarItem, TngMenuItem, TngMenuSeparator } from '@tailng-ui/primitives';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TngMenubarComponent } from './tng-menubar.component';
import { TngMenuComponent } from '../menu/tng-menu.component';

@Component({
  imports: [TngMenubarComponent, TngMenubarItem],
  template: `
    <tng-menubar ariaLabel="Workspace actions" data-testid="menubar">
      <button type="button" tngMenubarItem>File</button>
      <button type="button" tngMenubarItem>Edit</button>
    </tng-menubar>
  `,
})
class HostComponent {}

function keydown(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });

  el.dispatchEvent(event);
  return event;
}

function flushMicrotask(): Promise<void> {
  return Promise.resolve();
}

/**
 * `TngMenuComponent` hides with `data-positioning-state="pending"` until fixed placement; submenus may
 * need an extra rAF when the overlay rect is still 0×0. Loop until no pending menus, then flush focus.
 */
async function flushMenubarOverlayLayout(): Promise<void> {
  const maxPasses = 16;
  for (let i = 0; i < maxPasses; i += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await flushMicrotask();
    if (!document.querySelector('[data-positioning-state="pending"]')) {
      break;
    }
  }
  await flushMicrotask();
}

function mockElementRect(
  element: HTMLElement,
  rect: Readonly<{ height: number; left: number; top: number; width: number }>,
): void {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
}

function mockWrapperCascadeRects(options: Readonly<{
  file: HTMLElement;
  fileMenu: HTMLElement;
  importTrigger: HTMLElement;
  importMenu: HTMLElement;
  gitTrigger?: HTMLElement;
  gitMenu?: HTMLElement;
}>): void {
  mockElementRect(options.file, { left: 24, top: 20, width: 72, height: 34 });
  mockElementRect(options.fileMenu, { left: 0, top: 0, width: 192, height: 132 });
  mockElementRect(options.importTrigger, { left: 32, top: 48, width: 160, height: 32 });
  mockElementRect(options.importMenu, { left: 0, top: 0, width: 184, height: 104 });

  if (options.gitTrigger !== undefined) {
    mockElementRect(options.gitTrigger, { left: 212, top: 72, width: 156, height: 32 });
  }

  if (options.gitMenu !== undefined) {
    mockElementRect(options.gitMenu, { left: 0, top: 0, width: 176, height: 92 });
  }
}

function expectMenuPanelRenderable(menu: HTMLElement): void {
  expect(menu.getAttribute('data-state')).toBe('open');
  expect(menu.hasAttribute('hidden')).toBe(false);
  expect(menu.getAttribute('data-positioning-state')).toBeNull();
  expect(menu.parentElement).toBe(document.body);
  expect(menu.style.position).toBe('fixed');
  expect(menu.style.left).not.toBe('');
  expect(menu.style.top).not.toBe('');
}

@Component({
  imports: [TngMenubarComponent, TngMenubarItem, TngMenuComponent, TngMenuItem],
  template: `
    <tng-menubar ariaLabel="Wrapper commands" data-testid="menubar">
      <div class="shell">
        <tng-menu #fileMenu="tngMenu" ariaLabel="File menu" data-testid="file-menu">
          <button
            type="button"
            tngMenuItem
            [tngMenuItemSubmenu]="importMenu"
            data-testid="item-import"
          >
            Import from...
          </button>

          <tng-menu #importMenu="tngMenu" ariaLabel="Import menu" data-testid="import-menu">
            <button type="button" tngMenuItem data-testid="import-csv">CSV</button>
            <button
              type="button"
              tngMenuItem
              [tngMenuItemSubmenu]="gitMenu"
              data-testid="import-git"
            >
              Git repository
            </button>
          </tng-menu>

          <tng-menu #gitMenu="tngMenu" ariaLabel="Git menu" data-testid="git-menu">
            <button type="button" tngMenuItem data-testid="git-github">GitHub</button>
            <button type="button" tngMenuItem data-testid="git-gitlab">GitLab</button>
          </tng-menu>
        </tng-menu>

        <button type="button" tngMenubarItem [tngMenubarMenu]="fileMenu" data-testid="item-file">File</button>
      </div>

      <button type="button" tngMenubarItem data-testid="item-help">Help</button>
    </tng-menubar>
  `,
})
class CascadedWrapperHostComponent {}

@Component({
  imports: [
    TngMenubarComponent,
    TngMenubarItem,
    TngMenuComponent,
    TngMenuItem,
    TngMenuGroupLabel,
    TngMenuSeparator,
  ],
  template: `
    <tng-menubar ariaLabel="Wrapper cascaded commands">
      <div class="menubar-item-shell">
        <tng-menu #fileMenu="tngMenu" ariaLabel="Wrapper cascaded file menu" data-testid="file-menu">
          <div tngMenuGroupLabel>File</div>
          <button type="button" tngMenuItem data-testid="file-create">Create project</button>
          <button
            type="button"
            tngMenuItem
            [tngMenuItemSubmenu]="importMenu"
            data-testid="file-import"
          >
            Import from...
          </button>
          <div tngMenuSeparator></div>
          <button type="button" tngMenuItem data-testid="file-archive">Archive project</button>

          <tng-menu #importMenu="tngMenu" ariaLabel="Wrapper import source menu" data-testid="import-menu">
            <button type="button" tngMenuItem data-testid="import-csv">CSV file</button>
            <button
              type="button"
              tngMenuItem
              [tngMenuItemSubmenu]="gitMenu"
              data-testid="import-git"
            >
              Git repository
            </button>
          </tng-menu>

          <tng-menu #gitMenu="tngMenu" ariaLabel="Wrapper git provider menu" data-testid="git-menu">
            <button type="button" tngMenuItem data-testid="git-github">GitHub</button>
            <button type="button" tngMenuItem data-testid="git-gitlab">GitLab</button>
          </tng-menu>
        </tng-menu>

        <button type="button" tngMenubarItem [tngMenubarMenu]="fileMenu" data-testid="item-file">File</button>
      </div>

      <button type="button" tngMenubarItem data-testid="item-help">Help</button>
    </tng-menubar>
  `,
})
class CascadedWrapperDemoLikeHostComponent {}

describe('tng-menubar component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches the primitive menubar directive to host and wires aria-label', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [HostComponent],
    }).createComponent(HostComponent);

    fixture.detectChanges();

    const menubar = fixture.nativeElement.querySelector('[data-testid="menubar"]') as HTMLElement;
    expect(menubar).toBeTruthy();
    expect(menubar.getAttribute('data-slot')).toBe('menubar');
    expect(menubar.getAttribute('role')).toBe('menubar');
    expect(menubar.getAttribute('aria-label')).toBe('Workspace actions');
  });

  it('keeps second-level wrapper submenu open and active when ArrowDown is pressed inside it', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [CascadedWrapperHostComponent],
    }).createComponent(CascadedWrapperHostComponent);

    fixture.detectChanges();

    const file = fixture.nativeElement.querySelector('[data-testid="item-file"]') as HTMLButtonElement;
    const fileMenu = fixture.nativeElement.querySelector('[data-testid="file-menu"]') as HTMLElement;
    const importMenu = fixture.nativeElement.querySelector('[data-testid="import-menu"]') as HTMLElement;
    const gitMenu = fixture.nativeElement.querySelector('[data-testid="git-menu"]') as HTMLElement;
    const importTrigger = fixture.nativeElement.querySelector('[data-testid="item-import"]') as HTMLButtonElement;
    const importCsv = fixture.nativeElement.querySelector('[data-testid="import-csv"]') as HTMLButtonElement;
    const importGitTrigger = fixture.nativeElement.querySelector('[data-testid="import-git"]') as HTMLButtonElement;
    const gitGithub = fixture.nativeElement.querySelector('[data-testid="git-github"]') as HTMLButtonElement;
    const gitGitlab = fixture.nativeElement.querySelector('[data-testid="git-gitlab"]') as HTMLButtonElement;
    mockWrapperCascadeRects({
      file,
      fileMenu,
      importTrigger,
      importMenu,
      gitTrigger: importGitTrigger,
      gitMenu,
    });

    file.click();
    fixture.detectChanges();

    keydown(fileMenu, 'ArrowDown');
    keydown(fileMenu, 'ArrowRight');
    fixture.detectChanges();

    expect(fileMenu.getAttribute('aria-activedescendant')).toBe(importTrigger.id);
    expect(importMenu.getAttribute('aria-activedescendant')).toBe(importCsv.id);

    keydown(importMenu, 'ArrowDown');
    fixture.detectChanges();
    expect(importMenu.getAttribute('aria-activedescendant')).toBe(importGitTrigger.id);

    keydown(importMenu, 'ArrowRight');
    fixture.detectChanges();
    await flushMenubarOverlayLayout();

    expectMenuPanelRenderable(importMenu);
    expect(gitMenu.getAttribute('data-state')).toBe('open');
    expectMenuPanelRenderable(gitMenu);
    expect(gitMenu.getAttribute('aria-activedescendant')).toBe(gitGithub.id);
    expect(document.activeElement).toBe(gitMenu);

    const parentActiveBefore = fileMenu.getAttribute('aria-activedescendant');
    const level1ActiveBefore = importMenu.getAttribute('aria-activedescendant');

    keydown(gitMenu, 'ArrowDown');
    fixture.detectChanges();

    expect(gitMenu.getAttribute('aria-activedescendant')).toBe(gitGitlab.id);
    expect(gitMenu.getAttribute('data-state')).toBe('open');
    expect(fileMenu.getAttribute('aria-activedescendant')).toBe(parentActiveBefore);
    expect(importMenu.getAttribute('aria-activedescendant')).toBe(level1ActiveBefore);
    expect(importMenu.getAttribute('data-state')).toBe('open');
    expect(fileMenu.getAttribute('data-state')).toBe('open');
  });

  it('keeps first submenu level open and active when ArrowDown is pressed inside it', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [CascadedWrapperHostComponent],
    }).createComponent(CascadedWrapperHostComponent);

    fixture.detectChanges();

    const file = fixture.nativeElement.querySelector('[data-testid="item-file"]') as HTMLButtonElement;
    const fileMenu = fixture.nativeElement.querySelector('[data-testid="file-menu"]') as HTMLElement;
    const importMenu = fixture.nativeElement.querySelector('[data-testid="import-menu"]') as HTMLElement;
    const importTrigger = fixture.nativeElement.querySelector('[data-testid="item-import"]') as HTMLButtonElement;
    const importCsv = fixture.nativeElement.querySelector('[data-testid="import-csv"]') as HTMLButtonElement;
    const importGitTrigger = fixture.nativeElement.querySelector('[data-testid="import-git"]') as HTMLButtonElement;
    mockWrapperCascadeRects({
      file,
      fileMenu,
      importTrigger,
      importMenu,
      gitTrigger: importGitTrigger,
    });

    file.click();
    fixture.detectChanges();

    keydown(fileMenu, 'ArrowDown');
    keydown(fileMenu, 'ArrowRight');
    fixture.detectChanges();
    await flushMenubarOverlayLayout();
    fixture.detectChanges();

    expect(fileMenu.getAttribute('aria-activedescendant')).toBe(importTrigger.id);
    expect(importMenu.getAttribute('aria-activedescendant')).toBe(importCsv.id);
    expect(importMenu.getAttribute('data-state')).toBe('open');
    expectMenuPanelRenderable(importMenu);

    const parentActiveBefore = fileMenu.getAttribute('aria-activedescendant');
    keydown(importMenu, 'ArrowDown');
    fixture.detectChanges();

    expect(importMenu.getAttribute('aria-activedescendant')).toBe(importGitTrigger.id);
    expect(importMenu.getAttribute('data-state')).toBe('open');
    expect(fileMenu.getAttribute('aria-activedescendant')).toBe(parentActiveBefore);
    expect(fileMenu.getAttribute('data-state')).toBe('open');
  });

  it('keeps submenu chain open on ArrowDown in level-2 for demo-like wrapper markup', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [CascadedWrapperDemoLikeHostComponent],
    }).createComponent(CascadedWrapperDemoLikeHostComponent);

    fixture.detectChanges();

    const file = fixture.nativeElement.querySelector('[data-testid="item-file"]') as HTMLButtonElement;
    const fileMenu = fixture.nativeElement.querySelector('[data-testid="file-menu"]') as HTMLElement;
    const importMenu = fixture.nativeElement.querySelector('[data-testid="import-menu"]') as HTMLElement;
    const fileImportTrigger = fixture.nativeElement.querySelector('[data-testid="file-import"]') as HTMLButtonElement;
    const importCsv = fixture.nativeElement.querySelector('[data-testid="import-csv"]') as HTMLButtonElement;
    const importGit = fixture.nativeElement.querySelector('[data-testid="import-git"]') as HTMLButtonElement;
    mockWrapperCascadeRects({
      file,
      fileMenu,
      importTrigger: fileImportTrigger,
      importMenu,
      gitTrigger: importGit,
    });

    file.click();
    fixture.detectChanges();

    keydown(fileMenu, 'ArrowDown');
    keydown(fileMenu, 'ArrowDown');
    keydown(fileMenu, 'ArrowRight');
    fixture.detectChanges();
    await flushMenubarOverlayLayout();

    expect(fileMenu.getAttribute('aria-activedescendant')).toBe(fileImportTrigger.id);
    expect(importMenu.getAttribute('aria-activedescendant')).toBe(importCsv.id);
    expect(importMenu.getAttribute('data-state')).toBe('open');
    expectMenuPanelRenderable(importMenu);
    expect(document.activeElement).toBe(importMenu);

    const rootActiveBefore = fileMenu.getAttribute('aria-activedescendant');
    keydown(importMenu, 'ArrowDown');
    fixture.detectChanges();

    expect(importMenu.getAttribute('aria-activedescendant')).toBe(importGit.id);
    expect(importMenu.getAttribute('data-state')).toBe('open');
    expect(fileMenu.getAttribute('aria-activedescendant')).toBe(rootActiveBefore);
    expect(fileMenu.getAttribute('data-state')).toBe('open');
  });

  it('keeps keyboard focus in level-2 submenu after microtasks and handles ArrowDown there', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [CascadedWrapperHostComponent],
    }).createComponent(CascadedWrapperHostComponent);

    fixture.detectChanges();

    const file = fixture.nativeElement.querySelector('[data-testid="item-file"]') as HTMLButtonElement;
    const fileMenu = fixture.nativeElement.querySelector('[data-testid="file-menu"]') as HTMLElement;
    const importMenu = fixture.nativeElement.querySelector('[data-testid="import-menu"]') as HTMLElement;
    const gitMenu = fixture.nativeElement.querySelector('[data-testid="git-menu"]') as HTMLElement;
    const importGitTrigger = fixture.nativeElement.querySelector('[data-testid="import-git"]') as HTMLButtonElement;
    const gitGithub = fixture.nativeElement.querySelector('[data-testid="git-github"]') as HTMLButtonElement;
    const gitGitlab = fixture.nativeElement.querySelector('[data-testid="git-gitlab"]') as HTMLButtonElement;
    mockWrapperCascadeRects({
      file,
      fileMenu,
      importTrigger: fixture.nativeElement.querySelector('[data-testid="item-import"]') as HTMLButtonElement,
      importMenu,
      gitTrigger: importGitTrigger,
      gitMenu,
    });

    file.click();
    fixture.detectChanges();

    keydown(fileMenu, 'ArrowDown');
    keydown(fileMenu, 'ArrowRight');
    fixture.detectChanges();

    keydown(importMenu, 'ArrowDown');
    keydown(importMenu, 'ArrowRight');
    fixture.detectChanges();
    await flushMenubarOverlayLayout();

    expect(importMenu.getAttribute('aria-activedescendant')).toBe(importGitTrigger.id);
    expectMenuPanelRenderable(importMenu);
    expect(gitMenu.getAttribute('aria-activedescendant')).toBe(gitGithub.id);
    expectMenuPanelRenderable(gitMenu);
    expect(document.activeElement).toBe(gitMenu);

    await flushMicrotask();
    fixture.detectChanges();

    expect(document.activeElement).toBe(gitMenu);
    const event = keydown(document.activeElement as HTMLElement, 'ArrowDown');
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(gitMenu.getAttribute('aria-activedescendant')).toBe(gitGitlab.id);
    expect(gitMenu.getAttribute('data-state')).toBe('open');
    expect(importMenu.getAttribute('data-state')).toBe('open');
    expect(fileMenu.getAttribute('data-state')).toBe('open');
  });

  it('restores focus to deepest open submenu when focus slips to a parent open panel', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [CascadedWrapperHostComponent],
    }).createComponent(CascadedWrapperHostComponent);

    fixture.detectChanges();

    const file = fixture.nativeElement.querySelector('[data-testid="item-file"]') as HTMLButtonElement;
    const fileMenu = fixture.nativeElement.querySelector('[data-testid="file-menu"]') as HTMLElement;
    const importMenu = fixture.nativeElement.querySelector('[data-testid="import-menu"]') as HTMLElement;
    const gitMenu = fixture.nativeElement.querySelector('[data-testid="git-menu"]') as HTMLElement;
    const gitGitlab = fixture.nativeElement.querySelector('[data-testid="git-gitlab"]') as HTMLButtonElement;
    mockWrapperCascadeRects({
      file,
      fileMenu,
      importTrigger: fixture.nativeElement.querySelector('[data-testid="item-import"]') as HTMLButtonElement,
      importMenu,
      gitTrigger: fixture.nativeElement.querySelector('[data-testid="import-git"]') as HTMLButtonElement,
      gitMenu,
    });

    file.click();
    fixture.detectChanges();

    keydown(fileMenu, 'ArrowDown');
    keydown(fileMenu, 'ArrowRight');
    fixture.detectChanges();

    keydown(importMenu, 'ArrowDown');
    keydown(importMenu, 'ArrowRight');
    fixture.detectChanges();
    await flushMenubarOverlayLayout();

    expect(gitMenu.getAttribute('data-state')).toBe('open');
    expectMenuPanelRenderable(importMenu);
    expectMenuPanelRenderable(gitMenu);
    expect(document.activeElement).toBe(gitMenu);

    importMenu.focus();
    fixture.detectChanges();
    expect(document.activeElement).toBe(importMenu);

    await flushMicrotask();
    fixture.detectChanges();

    expect(document.activeElement).toBe(gitMenu);
    keydown(document.activeElement as HTMLElement, 'ArrowDown');
    fixture.detectChanges();

    expect(gitMenu.getAttribute('aria-activedescendant')).toBe(gitGitlab.id);
    expect(gitMenu.getAttribute('data-state')).toBe('open');
  });

  it('does not churn focus indefinitely when deepest submenu temporarily cannot own focus', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [CascadedWrapperHostComponent],
    }).createComponent(CascadedWrapperHostComponent);

    fixture.detectChanges();

    const file = fixture.nativeElement.querySelector('[data-testid="item-file"]') as HTMLButtonElement;
    const fileMenu = fixture.nativeElement.querySelector('[data-testid="file-menu"]') as HTMLElement;
    const importMenu = fixture.nativeElement.querySelector('[data-testid="import-menu"]') as HTMLElement;
    const gitMenu = fixture.nativeElement.querySelector('[data-testid="git-menu"]') as HTMLElement;
    mockWrapperCascadeRects({
      file,
      fileMenu,
      importTrigger: fixture.nativeElement.querySelector('[data-testid="item-import"]') as HTMLButtonElement,
      importMenu,
      gitTrigger: fixture.nativeElement.querySelector('[data-testid="import-git"]') as HTMLButtonElement,
      gitMenu,
    });

    file.click();
    fixture.detectChanges();

    keydown(fileMenu, 'ArrowDown');
    keydown(fileMenu, 'ArrowRight');
    fixture.detectChanges();

    keydown(importMenu, 'ArrowDown');
    keydown(importMenu, 'ArrowRight');
    fixture.detectChanges();

    const focusSpy = vi.spyOn(gitMenu, 'focus');

    for (let index = 0; index < 20; index += 1) {
      importMenu.focus();
      fixture.detectChanges();
      await flushMicrotask();
      fixture.detectChanges();
    }

    expect(gitMenu.getAttribute('data-state')).toBe('open');
    expect(focusSpy.mock.calls.length).toBeLessThanOrEqual(8);
  });

  it('closes all overlay levels when a third-level item is selected by click', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [CascadedWrapperHostComponent],
    }).createComponent(CascadedWrapperHostComponent);

    fixture.detectChanges();

    const file = fixture.nativeElement.querySelector('[data-testid="item-file"]') as HTMLButtonElement;
    const fileMenu = fixture.nativeElement.querySelector('[data-testid="file-menu"]') as HTMLElement;
    const importMenu = fixture.nativeElement.querySelector('[data-testid="import-menu"]') as HTMLElement;
    const gitMenu = fixture.nativeElement.querySelector('[data-testid="git-menu"]') as HTMLElement;
    const importTrigger = fixture.nativeElement.querySelector('[data-testid="item-import"]') as HTMLButtonElement;
    const importGitTrigger = fixture.nativeElement.querySelector('[data-testid="import-git"]') as HTMLButtonElement;
    const gitGithub = fixture.nativeElement.querySelector('[data-testid="git-github"]') as HTMLButtonElement;
    mockWrapperCascadeRects({
      file,
      fileMenu,
      importTrigger,
      importMenu,
      gitTrigger: importGitTrigger,
      gitMenu,
    });

    file.click();
    fixture.detectChanges();

    importTrigger.click();
    fixture.detectChanges();
    expect(importMenu.getAttribute('data-state')).toBe('open');
    await flushMenubarOverlayLayout();
    expectMenuPanelRenderable(importMenu);

    importGitTrigger.click();
    fixture.detectChanges();
    expect(gitMenu.getAttribute('data-state')).toBe('open');
    await flushMenubarOverlayLayout();
    expectMenuPanelRenderable(importMenu);
    expectMenuPanelRenderable(gitMenu);

    gitGithub.click();
    fixture.detectChanges();
    await flushMicrotask();
    fixture.detectChanges();

    expect(gitMenu.getAttribute('data-state')).toBe('closed');
    expect(importMenu.getAttribute('data-state')).toBe('closed');
    expect(fileMenu.getAttribute('data-state')).toBe('closed');
    expect(file.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.contains(fileMenu)).toBe(true);
    expect(fileMenu.contains(importMenu)).toBe(true);
    expect(fileMenu.contains(gitMenu)).toBe(true);
  });
});
