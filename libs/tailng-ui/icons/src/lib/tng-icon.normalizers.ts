export function normalizeOptionalString(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function normalizeIconRef(value: string): string | null {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function normalizeIconSize(value: string | number | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value}px` : null;
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length === 0) {
    return null;
  }

  return /^-?\d+(?:\.\d+)?$/.test(normalizedValue) ? `${normalizedValue}px` : normalizedValue;
}
