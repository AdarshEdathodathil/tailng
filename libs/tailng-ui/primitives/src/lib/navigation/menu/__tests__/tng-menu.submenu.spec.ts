import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { TngMenu, TngMenuItem, TngMenuTrigger } from '../tng-menu';

function keydown(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });

  el.dispatchEvent(event);
  return event;
}

function click(el: HTMLElement): MouseEvent {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  });

  el.dispatchEvent(event);
  return event;
}

function pointerdown(el: HTMLElement): PointerEvent {
  const event = new PointerEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    button: 0,
  });

  el.dispatchEvent(event);
  return event;
}

function pointerenter(el: HTMLElement, pointerType = 'mouse'): PointerEvent {
  const event = new PointerEvent('pointerenter', {
    bubbles: true,
    cancelable: true,
    pointerType,
  });

  el.dispatchEvent(event);
  return event;
}

@Component({
  imports: [TngMenu, TngMenuItem, TngMenuTrigger],
  template: `
    <button type="button" [tngMenuTrigger]="menu" data-testid="trigger">Open</button>

    <div tngMenu #menu="tngMenu" data-testid="menu">
      <button tngMenuItem data-testid="item-a">Item A</button>
      <button
        tngMenuItem
        [tngMenuItemSubmenu]="submenu"
        data-testid="item-more"
      >
        More
      </button>
      <button tngMenuItem data-testid="item-z">Item Z</button>
    </div>

    <div tngMenu #submenu="tngMenu" data-testid="submenu">
      <button tngMenuItem data-testid="sub-item-a">Sub A</button>
      <button tngMenuItem data-testid="sub-item-b">Sub B</button>
    </div>
  `,
})
class MenuSubmenuHostComponent {}

@Component({
  imports: [TngMenu, TngMenuItem, TngMenuTrigger],
  template: `
    <button type="button" [tngMenuTrigger]="menu" data-testid="trigger">Open</button>

    <div tngMenu #menu="tngMenu" data-testid="menu">
      <button tngMenuItem data-testid="item-a">Item A</button>
      <button
        tngMenuItem
        [tngMenuItemSubmenu]="submenu"
        data-testid="item-more"
      >
        More
      </button>
    </div>

    <div tngMenu #submenu="tngMenu" data-testid="submenu">
      <button
        tngMenuItem
        [tngMenuItemSubmenu]="submenuLevel2"
        data-testid="sub-item-more"
      >
        More tools
      </button>
      <button tngMenuItem data-testid="sub-item-z">Sub Z</button>
    </div>

    <div tngMenu #submenuLevel2="tngMenu" data-testid="submenu-level-2">
      <button tngMenuItem data-testid="sub2-item-a">Sub2 A</button>
      <button tngMenuItem data-testid="sub2-item-b">Sub2 B</button>
    </div>
  `,
})
class MenuDeepSubmenuHostComponent {}

@Component({
  imports: [TngMenu, TngMenuItem, TngMenuTrigger],
  template: `
    <button type="button" [tngMenuTrigger]="menu" data-testid="trigger">Open</button>

    <div tngMenu #menu="tngMenu" data-testid="menu">
      <button tngMenuItem data-testid="item-a">Item A</button>
      <button
        tngMenuItem
        [tngMenuItemSubmenu]="submenu"
        data-testid="item-more"
      >
        More
      </button>
      <button tngMenuItem data-testid="item-z">Item Z</button>

      <div tngMenu #submenu="tngMenu" data-testid="submenu">
        <button
          tngMenuItem
          [tngMenuItemSubmenu]="submenuLevel2"
          data-testid="sub-item-more"
        >
          More tools
        </button>
        <button tngMenuItem data-testid="sub-item-z">Sub Z</button>
      </div>

      <div tngMenu #submenuLevel2="tngMenu" data-testid="submenu-level-2">
        <button tngMenuItem data-testid="sub2-item-a">Sub2 A</button>
        <button tngMenuItem data-testid="sub2-item-b">Sub2 B</button>
      </div>
    </div>
  `,
})
class MenuNestedDeepSubmenuHostComponent {}

@Component({
  imports: [TngMenu, TngMenuItem, TngMenuTrigger],
  template: `
    <button type="button" [tngMenuTrigger]="menu" data-testid="trigger">Open</button>

    <div tngMenu #menu="tngMenu" data-testid="menu">
      <button
        tngMenuItem
        [tngMenuItemSubmenu]="submenuLevel1"
        data-testid="root-item-more"
      >
        Root more
      </button>

      <div tngMenu #submenuLevel1="tngMenu" data-testid="submenu-level-1">
        <button
          tngMenuItem
          [tngMenuItemSubmenu]="submenuLevel2"
          data-testid="sub1-item-more"
        >
          Sub1 more
        </button>
      </div>

      <div tngMenu #submenuLevel2="tngMenu" data-testid="submenu-level-2">
        <button
          tngMenuItem
          [tngMenuItemSubmenu]="submenuLevel3"
          data-testid="sub2-item-more"
        >
          Sub2 more
        </button>
      </div>

      <div tngMenu #submenuLevel3="tngMenu" data-testid="submenu-level-3">
        <button tngMenuItem data-testid="sub3-item-leaf">Leaf action</button>
      </div>
    </div>
  `,
})
class MenuThirdLevelSubmenuHostComponent {}

describe('tng-menu submenu behavior', () => {
  it('opens a submenu on ArrowRight from the active submenu-trigger item', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuSubmenuHostComponent],
    }).createComponent(MenuSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuTrigger = fixture.nativeElement.querySelector('[data-testid="item-more"]') as HTMLButtonElement;
    const firstSubItem = fixture.nativeElement.querySelector('[data-testid="sub-item-a"]') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowDown');
    fixture.detectChanges();

    expect(menu.getAttribute('aria-activedescendant')).toBe(submenuTrigger.id);

    keydown(menu, 'ArrowRight');
    fixture.detectChanges();

    expect(submenuTrigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(submenuTrigger.getAttribute('aria-controls')).toBe(submenu.id);
    expect(submenuTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(submenu.getAttribute('data-state')).toBe('open');
    expect(submenu.getAttribute('aria-activedescendant')).toBe(firstSubItem.id);
    expect(document.activeElement).toBe(submenu);
  });

  it('opens a submenu on click from a submenu-trigger item without closing the parent menu', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuSubmenuHostComponent],
    }).createComponent(MenuSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuTrigger = fixture.nativeElement.querySelector('[data-testid="item-more"]') as HTMLButtonElement;
    const firstSubItem = fixture.nativeElement.querySelector('[data-testid="sub-item-a"]') as HTMLButtonElement;

    click(trigger);
    fixture.detectChanges();

    click(submenuTrigger);
    fixture.detectChanges();

    expect(menu.getAttribute('data-state')).toBe('open');
    expect(menu.getAttribute('aria-activedescendant')).toBe(submenuTrigger.id);
    expect(submenuTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(submenu.getAttribute('data-state')).toBe('open');
    expect(submenu.getAttribute('aria-activedescendant')).toBe(firstSubItem.id);
    expect(document.activeElement).toBe(submenu);
  });

  it('opens a submenu on pointer hover from a submenu-trigger item', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuSubmenuHostComponent],
    }).createComponent(MenuSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuTrigger = fixture.nativeElement.querySelector('[data-testid="item-more"]') as HTMLButtonElement;
    const firstSubItem = fixture.nativeElement.querySelector('[data-testid="sub-item-a"]') as HTMLButtonElement;

    click(trigger);
    fixture.detectChanges();

    pointerenter(submenuTrigger);
    fixture.detectChanges();

    expect(menu.getAttribute('data-state')).toBe('open');
    expect(menu.getAttribute('aria-activedescendant')).toBe(submenuTrigger.id);
    expect(submenuTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(submenu.getAttribute('data-state')).toBe('open');
    expect(submenu.getAttribute('aria-activedescendant')).toBe(firstSubItem.id);
    expect(document.activeElement).toBe(submenu);
  });

  it('closes an open sibling submenu when pointer hover moves to a normal item', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuSubmenuHostComponent],
    }).createComponent(MenuSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuTrigger = fixture.nativeElement.querySelector('[data-testid="item-more"]') as HTMLButtonElement;
    const itemZ = fixture.nativeElement.querySelector('[data-testid="item-z"]') as HTMLButtonElement;

    click(trigger);
    fixture.detectChanges();

    pointerenter(submenuTrigger);
    fixture.detectChanges();
    expect(submenu.getAttribute('data-state')).toBe('open');

    pointerenter(itemZ);
    fixture.detectChanges();

    expect(menu.getAttribute('aria-activedescendant')).toBe(itemZ.id);
    expect(submenu.getAttribute('data-state')).toBe('closed');
    expect(submenuTrigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('does not open a submenu from a touch pointer hover event', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuSubmenuHostComponent],
    }).createComponent(MenuSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuTrigger = fixture.nativeElement.querySelector('[data-testid="item-more"]') as HTMLButtonElement;

    click(trigger);
    fixture.detectChanges();

    pointerenter(submenuTrigger, 'touch');
    fixture.detectChanges();

    expect(submenuTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(submenu.getAttribute('data-state')).toBe('closed');
  });

  it('closes a submenu on ArrowLeft and returns focus to the parent menu panel', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuSubmenuHostComponent],
    }).createComponent(MenuSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuTrigger = fixture.nativeElement.querySelector('[data-testid="item-more"]') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowRight');
    fixture.detectChanges();

    keydown(submenu, 'ArrowLeft');
    fixture.detectChanges();

    expect(submenu.getAttribute('data-state')).toBe('closed');
    expect(submenuTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(menu.getAttribute('aria-activedescendant')).toBe(submenuTrigger.id);
    expect(document.activeElement).toBe(menu);
  });

  it('closes the submenu on first Escape and the parent menu on second Escape', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuSubmenuHostComponent],
    }).createComponent(MenuSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;

    trigger.click();
    fixture.detectChanges();
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowRight');
    fixture.detectChanges();

    keydown(submenu, 'Escape');
    fixture.detectChanges();

    expect(submenu.getAttribute('data-state')).toBe('closed');
    expect(menu.getAttribute('data-state')).toBe('open');
    expect(document.activeElement).toBe(menu);

    keydown(menu, 'Escape');
    fixture.detectChanges();

    expect(menu.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes the previously open submenu when the parent menu active item moves away from its trigger', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuSubmenuHostComponent],
    }).createComponent(MenuSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuTrigger = fixture.nativeElement.querySelector('[data-testid="item-more"]') as HTMLButtonElement;
    const itemZ = fixture.nativeElement.querySelector('[data-testid="item-z"]') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowRight');
    fixture.detectChanges();

    expect(submenu.getAttribute('data-state')).toBe('open');
    expect(submenuTrigger.getAttribute('aria-expanded')).toBe('true');

    menu.focus();
    keydown(menu, 'ArrowDown');
    fixture.detectChanges();

    expect(menu.getAttribute('aria-activedescendant')).toBe(itemZ.id);
    expect(submenu.getAttribute('data-state')).toBe('closed');
    expect(submenuTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menu);
  });

  it('when second-level submenu is open, ArrowDown/ArrowUp navigate within that submenu without changing parent active items', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuDeepSubmenuHostComponent],
    }).createComponent(MenuDeepSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuLevel2 = fixture.nativeElement.querySelector('[data-testid="submenu-level-2"]') as HTMLElement;
    const submenuTrigger = fixture.nativeElement.querySelector('[data-testid="item-more"]') as HTMLButtonElement;
    const submenuLevel1Trigger = fixture.nativeElement.querySelector(
      '[data-testid="sub-item-more"]',
    ) as HTMLButtonElement;
    const submenuLevel2ItemA = fixture.nativeElement.querySelector(
      '[data-testid="sub2-item-a"]',
    ) as HTMLButtonElement;
    const submenuLevel2ItemB = fixture.nativeElement.querySelector(
      '[data-testid="sub2-item-b"]',
    ) as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowRight');
    fixture.detectChanges();

    expect(menu.getAttribute('aria-activedescendant')).toBe(submenuTrigger.id);
    expect(submenu.getAttribute('aria-activedescendant')).toBe(submenuLevel1Trigger.id);

    keydown(submenu, 'ArrowRight');
    fixture.detectChanges();

    expect(document.activeElement).toBe(submenuLevel2);
    expect(submenuLevel2.getAttribute('aria-activedescendant')).toBe(submenuLevel2ItemA.id);

    const parentActiveBefore = menu.getAttribute('aria-activedescendant');
    const level1ActiveBefore = submenu.getAttribute('aria-activedescendant');

    keydown(submenuLevel2, 'ArrowDown');
    fixture.detectChanges();

    expect(submenuLevel2.getAttribute('aria-activedescendant')).toBe(submenuLevel2ItemB.id);
    expect(menu.getAttribute('aria-activedescendant')).toBe(parentActiveBefore);
    expect(submenu.getAttribute('aria-activedescendant')).toBe(level1ActiveBefore);

    keydown(submenuLevel2, 'ArrowUp');
    fixture.detectChanges();

    expect(submenuLevel2.getAttribute('aria-activedescendant')).toBe(submenuLevel2ItemA.id);
    expect(menu.getAttribute('aria-activedescendant')).toBe(parentActiveBefore);
    expect(submenu.getAttribute('aria-activedescendant')).toBe(level1ActiveBefore);
  });

  it('keeps parent and first-level active descendants stable while second-level submenu wraps with ArrowDown/ArrowUp', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuDeepSubmenuHostComponent],
    }).createComponent(MenuDeepSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuLevel2 = fixture.nativeElement.querySelector('[data-testid="submenu-level-2"]') as HTMLElement;
    const submenuLevel2ItemA = fixture.nativeElement.querySelector(
      '[data-testid="sub2-item-a"]',
    ) as HTMLButtonElement;
    const submenuLevel2ItemB = fixture.nativeElement.querySelector(
      '[data-testid="sub2-item-b"]',
    ) as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowRight');
    keydown(submenu, 'ArrowRight');
    fixture.detectChanges();

    const parentActiveBefore = menu.getAttribute('aria-activedescendant');
    const level1ActiveBefore = submenu.getAttribute('aria-activedescendant');

    keydown(submenuLevel2, 'ArrowDown');
    fixture.detectChanges();
    expect(submenuLevel2.getAttribute('aria-activedescendant')).toBe(submenuLevel2ItemB.id);
    expect(menu.getAttribute('aria-activedescendant')).toBe(parentActiveBefore);
    expect(submenu.getAttribute('aria-activedescendant')).toBe(level1ActiveBefore);

    keydown(submenuLevel2, 'ArrowDown');
    fixture.detectChanges();
    expect(submenuLevel2.getAttribute('aria-activedescendant')).toBe(submenuLevel2ItemA.id);
    expect(menu.getAttribute('aria-activedescendant')).toBe(parentActiveBefore);
    expect(submenu.getAttribute('aria-activedescendant')).toBe(level1ActiveBefore);

    keydown(submenuLevel2, 'ArrowUp');
    fixture.detectChanges();
    expect(submenuLevel2.getAttribute('aria-activedescendant')).toBe(submenuLevel2ItemB.id);
    expect(menu.getAttribute('aria-activedescendant')).toBe(parentActiveBefore);
    expect(submenu.getAttribute('aria-activedescendant')).toBe(level1ActiveBefore);
  });

  it('does not let parent menu handle ArrowDown from second-level submenu when panels are nested in parent DOM', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuNestedDeepSubmenuHostComponent],
    }).createComponent(MenuNestedDeepSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuLevel2 = fixture.nativeElement.querySelector('[data-testid="submenu-level-2"]') as HTMLElement;
    const submenuTrigger = fixture.nativeElement.querySelector('[data-testid="item-more"]') as HTMLButtonElement;
    const submenuLevel2ItemA = fixture.nativeElement.querySelector(
      '[data-testid="sub2-item-a"]',
    ) as HTMLButtonElement;
    const submenuLevel2ItemB = fixture.nativeElement.querySelector(
      '[data-testid="sub2-item-b"]',
    ) as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowRight');
    keydown(submenu, 'ArrowRight');
    fixture.detectChanges();

    expect(submenuLevel2.getAttribute('data-state')).toBe('open');
    expect(submenuLevel2.getAttribute('aria-activedescendant')).toBe(submenuLevel2ItemA.id);

    const parentActiveBefore = menu.getAttribute('aria-activedescendant');

    keydown(submenuLevel2, 'ArrowDown');
    fixture.detectChanges();

    expect(submenuLevel2.getAttribute('aria-activedescendant')).toBe(submenuLevel2ItemB.id);
    expect(submenuLevel2.getAttribute('data-state')).toBe('open');
    expect(menu.getAttribute('aria-activedescendant')).toBe(parentActiveBefore);
    expect(submenuTrigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('opens second-level submenu only after hidden is removed before focusing the panel', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuNestedDeepSubmenuHostComponent],
    }).createComponent(MenuNestedDeepSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuLevel2 = fixture.nativeElement.querySelector('[data-testid="submenu-level-2"]') as HTMLElement;

    const hiddenStatesAtFocus: boolean[] = [];
    const focusSpy = vi.spyOn(submenuLevel2, 'focus').mockImplementation(() => {
      hiddenStatesAtFocus.push(submenuLevel2.hasAttribute('hidden'));
    });

    try {
      trigger.click();
      fixture.detectChanges();

      keydown(menu, 'ArrowDown');
      keydown(menu, 'ArrowDown');
      keydown(menu, 'ArrowRight');
      fixture.detectChanges();

      keydown(submenu, 'ArrowRight');
      fixture.detectChanges();
    } finally {
      focusSpy.mockRestore();
    }

    expect(hiddenStatesAtFocus.length).toBeGreaterThan(0);
    expect(hiddenStatesAtFocus.at(-1)).toBe(false);
  });

  it('selecting an item from second-level submenu closes the entire cascade', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuNestedDeepSubmenuHostComponent],
    }).createComponent(MenuNestedDeepSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenu = fixture.nativeElement.querySelector('[data-testid="submenu"]') as HTMLElement;
    const submenuLevel2 = fixture.nativeElement.querySelector('[data-testid="submenu-level-2"]') as HTMLElement;
    const level2LeafItem = fixture.nativeElement.querySelector('[data-testid="sub2-item-a"]') as HTMLButtonElement;

    click(trigger);
    fixture.detectChanges();

    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowRight');
    keydown(submenu, 'ArrowRight');
    fixture.detectChanges();

    click(level2LeafItem);
    fixture.detectChanges();

    expect(submenuLevel2.getAttribute('data-state')).toBe('closed');
    expect(submenu.getAttribute('data-state')).toBe('closed');
    expect(menu.getAttribute('data-state')).toBe('closed');
  });

  it('selecting an item from third-level submenu closes all menu levels', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuThirdLevelSubmenuHostComponent],
    }).createComponent(MenuThirdLevelSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenuLevel1 = fixture.nativeElement.querySelector('[data-testid="submenu-level-1"]') as HTMLElement;
    const submenuLevel2 = fixture.nativeElement.querySelector('[data-testid="submenu-level-2"]') as HTMLElement;
    const submenuLevel3 = fixture.nativeElement.querySelector('[data-testid="submenu-level-3"]') as HTMLElement;
    const level3LeafItem = fixture.nativeElement.querySelector('[data-testid="sub3-item-leaf"]') as HTMLButtonElement;

    click(trigger);
    fixture.detectChanges();

    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowRight');
    keydown(submenuLevel1, 'ArrowRight');
    keydown(submenuLevel2, 'ArrowRight');
    fixture.detectChanges();

    click(level3LeafItem);
    fixture.detectChanges();

    expect(submenuLevel3.getAttribute('data-state')).toBe('closed');
    expect(submenuLevel2.getAttribute('data-state')).toBe('closed');
    expect(submenuLevel1.getAttribute('data-state')).toBe('closed');
    expect(menu.getAttribute('data-state')).toBe('closed');
  });

  it('selecting a third-level item via pointerdown+click closes all menu levels', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuThirdLevelSubmenuHostComponent],
    }).createComponent(MenuThirdLevelSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenuLevel1 = fixture.nativeElement.querySelector('[data-testid="submenu-level-1"]') as HTMLElement;
    const submenuLevel2 = fixture.nativeElement.querySelector('[data-testid="submenu-level-2"]') as HTMLElement;
    const submenuLevel3 = fixture.nativeElement.querySelector('[data-testid="submenu-level-3"]') as HTMLElement;
    const level3LeafItem = fixture.nativeElement.querySelector('[data-testid="sub3-item-leaf"]') as HTMLButtonElement;

    click(trigger);
    fixture.detectChanges();
    keydown(menu, 'ArrowDown');
    keydown(menu, 'ArrowRight');
    keydown(submenuLevel1, 'ArrowRight');
    keydown(submenuLevel2, 'ArrowRight');
    fixture.detectChanges();

    pointerdown(level3LeafItem);
    click(level3LeafItem);
    fixture.detectChanges();

    expect(submenuLevel3.getAttribute('data-state')).toBe('closed');
    expect(submenuLevel2.getAttribute('data-state')).toBe('closed');
    expect(submenuLevel1.getAttribute('data-state')).toBe('closed');
    expect(menu.getAttribute('data-state')).toBe('closed');
  });

  it('selecting an item from third-level submenu closes all levels when submenu chain was opened by click', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [MenuThirdLevelSubmenuHostComponent],
    }).createComponent(MenuThirdLevelSubmenuHostComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('[data-testid="menu"]') as HTMLElement;
    const submenuLevel1 = fixture.nativeElement.querySelector('[data-testid="submenu-level-1"]') as HTMLElement;
    const submenuLevel2 = fixture.nativeElement.querySelector('[data-testid="submenu-level-2"]') as HTMLElement;
    const submenuLevel3 = fixture.nativeElement.querySelector('[data-testid="submenu-level-3"]') as HTMLElement;
    const rootMore = fixture.nativeElement.querySelector('[data-testid="root-item-more"]') as HTMLButtonElement;
    const level1More = fixture.nativeElement.querySelector('[data-testid="sub1-item-more"]') as HTMLButtonElement;
    const level2More = fixture.nativeElement.querySelector('[data-testid="sub2-item-more"]') as HTMLButtonElement;
    const level3LeafItem = fixture.nativeElement.querySelector('[data-testid="sub3-item-leaf"]') as HTMLButtonElement;

    click(trigger);
    fixture.detectChanges();

    click(rootMore);
    fixture.detectChanges();
    expect(submenuLevel1.getAttribute('data-state')).toBe('open');

    click(level1More);
    fixture.detectChanges();
    expect(submenuLevel2.getAttribute('data-state')).toBe('open');

    click(level2More);
    fixture.detectChanges();
    expect(submenuLevel3.getAttribute('data-state')).toBe('open');

    click(level3LeafItem);
    fixture.detectChanges();

    expect(submenuLevel3.getAttribute('data-state')).toBe('closed');
    expect(submenuLevel2.getAttribute('data-state')).toBe('closed');
    expect(submenuLevel1.getAttribute('data-state')).toBe('closed');
    expect(menu.getAttribute('data-state')).toBe('closed');
  });
});
