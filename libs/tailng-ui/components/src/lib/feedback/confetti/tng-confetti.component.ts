import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import type {
  TngConfettiOrigin,
  TngConfettiPiece,
  TngConfettiReducedMotion,
  TngConfettiVariant,
} from './tng-confetti.types';
import {
  generateTngConfettiPieces,
  normalizeTngConfettiDuration,
  normalizeTngConfettiPieces,
  resolveTngConfettiColors,
} from './tng-confetti.utils';

@Component({
  selector: 'tng-confetti',
  templateUrl: './tng-confetti.component.html',
  styleUrl: './tng-confetti.component.css',
  host: {
    class: 'tng-confetti',
  },
})
export class TngConfettiComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private completionTimer: ReturnType<typeof setTimeout> | null = null;
  private previousActive = false;

  public readonly active = input<boolean, boolean | string>(false, { transform: booleanAttribute });
  public readonly origin = input<TngConfettiOrigin>('bottom');
  public readonly variant = input<TngConfettiVariant>('paper');
  public readonly duration = input<number, number | string>(3000, {
    transform: (value) => normalizeTngConfettiDuration(Number(value)),
  });
  public readonly pieces = input<number, number | string>(120, {
    transform: (value) => normalizeTngConfettiPieces(Number(value)),
  });
  public readonly fullscreen = input<boolean, boolean | string>(true, {
    transform: booleanAttribute,
  });
  public readonly reducedMotion = input<TngConfettiReducedMotion>('auto');
  public readonly colors = input<string[] | null>(null);
  public readonly zIndex = input<number | null>(null);
  public readonly completed = output<void>();

  protected readonly renderedPieces = signal<readonly TngConfettiPiece[]>([]);
  protected readonly running = signal(false);
  protected readonly launchFullscreen = signal(true);
  protected readonly launchOrigin = signal<TngConfettiOrigin>('bottom');
  protected readonly launchDuration = signal(0);
  protected readonly launchZIndex = signal<number | null>(null);

  public constructor() {
    effect(() => {
      const active = this.active();
      untracked(() => {
        if (active && !this.previousActive) this.launch();
        if (!active && this.previousActive) this.cancel();
        this.previousActive = active;
      });
    });
    this.destroyRef.onDestroy(() => this.cancel());
  }

  private launch(): void {
    const view = this.documentRef.defaultView;
    if (view === null) return;
    this.cancel();
    const duration = this.duration();
    const reduced =
      this.reducedMotion() === true ||
      (this.reducedMotion() === 'auto' &&
        view.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.launchFullscreen.set(this.fullscreen());
    this.launchOrigin.set(this.origin());
    this.launchDuration.set(duration);
    this.launchZIndex.set(this.zIndex());
    this.renderedPieces.set(
      reduced
        ? []
        : generateTngConfettiPieces({
            count: this.pieces(),
            duration,
            origin: this.origin(),
            colors: resolveTngConfettiColors(this.colors()),
          }),
    );
    this.running.set(!reduced);
    this.completionTimer = setTimeout(
      () => {
        this.completionTimer = null;
        this.renderedPieces.set([]);
        this.running.set(false);
        this.completed.emit();
      },
      reduced ? 0 : duration,
    );
  }

  private cancel(): void {
    if (this.completionTimer !== null) clearTimeout(this.completionTimer);
    this.completionTimer = null;
    this.renderedPieces.set([]);
    this.running.set(false);
  }
}

export { TngConfettiComponent as TngConfetti };
