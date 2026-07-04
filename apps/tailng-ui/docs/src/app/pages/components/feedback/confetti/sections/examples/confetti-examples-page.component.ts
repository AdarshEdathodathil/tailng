import { Component, signal } from '@angular/core';
import { TngConfetti, type TngConfettiOrigin } from '@tailng-ui/components';
@Component({
  selector: 'app-confetti-examples-page',
  imports: [TngConfetti],
  templateUrl: './confetti-examples-page.component.html',
  styleUrl: '../../confetti-docs.css',
})
export class ConfettiExamplesPageComponent {
  protected readonly active = signal(false);
  protected readonly origin = signal<TngConfettiOrigin>('bottom');
  protected readonly fullscreen = signal(true);
  protected readonly colors = signal<string[] | null>(null);
  protected launch(origin: TngConfettiOrigin, fullscreen = true, colors: string[] | null = null): void {
    this.active.set(false);
    this.origin.set(origin);
    this.fullscreen.set(fullscreen);
    this.colors.set(colors);
    queueMicrotask(() => this.active.set(true));
  }
  protected complete(): void {
    this.active.set(false);
  }
}
