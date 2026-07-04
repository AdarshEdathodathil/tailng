import { Component, signal } from '@angular/core';
import { TngConfetti } from '@tailng-ui/components';
@Component({
  selector: 'app-confetti-overview-page',
  imports: [TngConfetti],
  templateUrl: './confetti-overview-page.component.html',
  styleUrl: '../../confetti-docs.css',
})
export class ConfettiOverviewPageComponent {
  protected readonly active = signal(false);
  protected launch(): void {
    this.active.set(false);
    queueMicrotask(() => this.active.set(true));
  }
  protected complete(): void {
    this.active.set(false);
  }
}
