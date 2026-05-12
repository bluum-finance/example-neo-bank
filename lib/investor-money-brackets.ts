/**
 * Maps onboarding `<select>` bracket values to Bluum `{ min, max }` money strings.
 * Client-safe; no other imports (reliable in HMR / client bundles).
 */

export type MoneyRange = { min: string; max: string };

export function annualIncomeBracketToRange(bracket: string): MoneyRange {
  switch (bracket) {
    case 'under_25000':
      return { min: '0', max: '24999' };
    case '25000_99999':
      return { min: '25000', max: '99999' };
    case '100000_249999':
      return { min: '100000', max: '249999' };
    case 'over_250000':
      return { min: '250000', max: '999999999' };
    default:
      return { min: '0', max: '0' };
  }
}

export function netWorthBracketToRange(bracket: string): MoneyRange {
  switch (bracket) {
    case 'under_205000':
      return { min: '0', max: '204999' };
    case '205000_499999':
      return { min: '205000', max: '499999' };
    case 'over_500000':
      return { min: '500000', max: '999999999' };
    default:
      return { min: '0', max: '0' };
  }
}

export function liquidNetWorthBracketToRange(bracket: string): MoneyRange {
  switch (bracket) {
    case 'under_50000':
      return { min: '0', max: '49999' };
    case '50000_199999':
      return { min: '50000', max: '199999' };
    case 'over_200000':
      return { min: '200000', max: '999999999' };
    default:
      return { min: '0', max: '0' };
  }
}
