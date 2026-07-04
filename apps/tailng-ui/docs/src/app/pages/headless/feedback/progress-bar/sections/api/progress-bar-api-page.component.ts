import { Component } from '@angular/core';
import { TngCodeBlockComponent } from '@tailng-ui/components';

@Component({
  selector: 'app-headless-progress-bar-api-page',
  imports: [TngCodeBlockComponent],
  templateUrl: './progress-bar-api-page.component.html',
  styleUrl: './progress-bar-api-page.component.css',
})
export class HeadlessProgressBarApiPageComponent {
  protected readonly rootCode = [
    '<div tngProgressBar aria-label="Upload progress" [min]="0" [max]="100" [value]="68" #progress="tngProgressBar" class="progress-track">',
    '  <span tngProgressBarIndicator [style.width.%]="progress.percent()" class="progress-indicator"></span>',
    '</div>',
    '',
  ].join('\n');

  protected readonly indicatorCode = [
    '<div tngProgressBar [indeterminate]="true" aria-label="Preparing release" class="progress-track">',
    '  <span tngProgressBarIndicator class="progress-indicator progress-indicator--indeterminate"></span>',
    '</div>',
    '',
  ].join('\n');
}
