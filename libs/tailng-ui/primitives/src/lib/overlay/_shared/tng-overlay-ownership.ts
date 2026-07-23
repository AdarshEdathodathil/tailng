/**
 * Overlay ownership protocol for portalled panels owned by a layer host.
 *
 * Layer hosts (popover, drawer, …) expose `data-tng-overlay-layer-id`.
 * Body-portalled panels stamp `data-tng-overlay-owner-id` with that id so
 * outside-click handlers can treat the panel as "inside" the layer.
 */

export const TNG_OVERLAY_LAYER_ID_ATTR = 'data-tng-overlay-layer-id';
export const TNG_OVERLAY_OWNER_ID_ATTR = 'data-tng-overlay-owner-id';

export function resolveOverlayOwnerId(host: HTMLElement): string | null {
  return (
    host.closest<HTMLElement>(`[${TNG_OVERLAY_LAYER_ID_ATTR}]`)?.getAttribute(TNG_OVERLAY_LAYER_ID_ATTR) ?? null
  );
}

function nodeHasOverlayOwner(node: Node | null, ownerId: string): boolean {
  let current: Node | null = node;
  while (current !== null) {
    if (current instanceof Element && current.getAttribute(TNG_OVERLAY_OWNER_ID_ATTR) === ownerId) {
      return true;
    }

    if (current instanceof ShadowRoot) {
      current = current.host;
      continue;
    }

    current = current.parentElement ?? current.parentNode;
  }

  return false;
}

/**
 * Returns true when `target` is (or is inside) a portalled overlay owned by `ownerId`.
 * Also accepts an optional composed path (shadow DOM / capture listeners).
 */
export function isOwnedOverlayTarget(
  target: EventTarget | null | undefined,
  ownerId: string,
  path?: readonly unknown[],
): boolean {
  if (path !== undefined) {
    for (const entry of path) {
      if (entry instanceof Element && entry.getAttribute(TNG_OVERLAY_OWNER_ID_ATTR) === ownerId) {
        return true;
      }
    }
  }

  if (target instanceof Node) {
    return nodeHasOverlayOwner(target, ownerId);
  }

  return false;
}

export function stampOverlayOwnerId(panel: HTMLElement, host: HTMLElement): void {
  const ownerId = resolveOverlayOwnerId(host);
  if (ownerId !== null) {
    panel.setAttribute(TNG_OVERLAY_OWNER_ID_ATTR, ownerId);
  } else {
    panel.removeAttribute(TNG_OVERLAY_OWNER_ID_ATTR);
  }
}

export function clearOverlayOwnerId(panel: HTMLElement): void {
  panel.removeAttribute(TNG_OVERLAY_OWNER_ID_ATTR);
}
