import { Component, signal } from '@angular/core';
import { TngConfetti, type TngConfettiOrigin } from '@tailng-ui/components';
@Component({
  selector: 'app-confetti-playground-page',
  imports: [TngConfetti],
  templateUrl: './confetti-playground-page.component.html',
  styleUrl: './confetti-playground-page.component.css',
})
export class ConfettiPlaygroundPageComponent {
  protected readonly active = signal(false);
  protected readonly origin = signal<TngConfettiOrigin>('bottom');
  protected readonly fullscreen = signal(true);
  protected readonly reducedMotion = signal<boolean | 'auto'>('auto');
  protected readonly colors = signal<string[] | null>(null);
  protected readonly completions = signal(0);
  protected launch(
    origin: TngConfettiOrigin,
    fullscreen = true,
    reducedMotion: boolean | 'auto' = 'auto',
    colors: string[] | null = null,
  ): void {
    this.active.set(false);
    this.origin.set(origin);
    this.fullscreen.set(fullscreen);
    this.reducedMotion.set(reducedMotion);
    this.colors.set(colors);
    queueMicrotask(() => this.active.set(true));
  }
  protected onCompleted(): void {
    this.active.set(false);
    this.completions.update((value) => value + 1);
  }
}
