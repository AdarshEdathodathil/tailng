import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

class TngTestResizeObserver implements ResizeObserver {
  public disconnect(): void {
    // ResizeObserver cleanup is intentionally a no-op in jsdom.
  }

  public observe(): void {
    // Layout changes are driven explicitly by tests in the shared environment.
  }

  public unobserve(): void {
    // Individual targets do not need tracking in this test double.
  }
}

globalThis.ResizeObserver ??= TngTestResizeObserver;

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
