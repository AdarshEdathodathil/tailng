import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { fSuppressDevWarnings } from '@foblex/flow';
import { afterEach } from 'vitest';
import 'zone.js';
import 'zone.js/testing';

fSuppressDevWarnings(true);

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

afterEach(() => {
  getTestBed().resetTestingModule();
});
