// Guid Utilities

export function guid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `chain_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}
