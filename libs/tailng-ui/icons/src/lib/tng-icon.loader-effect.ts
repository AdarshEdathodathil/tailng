import { effect } from '@angular/core';
import type { TngIconResolver } from './icons.core';
import { normalizeIconRef } from './tng-icon.normalizers';

type ReadIconRef = () => string;
type SetSvgSignal = (value: string | null) => void;
type IconLoader = Readonly<Pick<TngIconResolver, 'loadIcon'>>;

export function bindIconSvgEffect(
  readIconRef: ReadIconRef,
  iconLoader: IconLoader,
  setSvgSignal: SetSvgSignal,
): void {
  effect((onCleanup): void => {
    const iconRef = normalizeIconRef(readIconRef());
    if (iconRef === null) {
      setSvgSignal(null);
      return;
    }

    let cancelled = false;
    void iconLoader
      .loadIcon(iconRef)
      .then((resolvedSvg): void => {
        if (!cancelled) {
          setSvgSignal(resolvedSvg ?? null);
        }
      })
      .catch((): void => {
        if (!cancelled) {
          setSvgSignal(null);
        }
      });

    onCleanup((): void => {
      cancelled = true;
    });
  });
}
