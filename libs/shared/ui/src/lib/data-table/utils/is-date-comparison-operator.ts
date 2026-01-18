import { DataTableDateComparisonOperator } from '../types';

export function isDateComparisonOperator(
  value: unknown
): value is DataTableDateComparisonOperator {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const validOperators = ['$gte', '$lte', '$gt', '$lt'];
  const entries = Object.entries(value as Record<string, unknown>);

  if (!entries.length) {
    return false;
  }

  const hasAtLeastOneOperator = entries.some(([key]) => validOperators.includes(key));
  if (!hasAtLeastOneOperator) {
    return false;
  }

  return entries.every(
    ([key, val]) =>
      validOperators.includes(key) && (typeof val === 'string' || val === undefined)
  );
}
