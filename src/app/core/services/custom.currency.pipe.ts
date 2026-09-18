//  CLIENT APP PIPE
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform {

  // XAF has no minor unit (no decimals). Extend this if more
  // zero-decimal currencies are added later.
  private static readonly ZERO_DECIMAL_CURRENCIES = new Set(['XAF']);

  transform(
    value: number | string,
    currency: string = 'XAF',
    locale: string = 'fr-FR'
  ): string {
    if (value == null || value === '') return '';

    const amount = typeof value === 'string' ? parseFloat(value) : value;
    const isZeroDecimal = CustomCurrencyPipe.ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase());

    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2
    }).format(amount);

    const symbol = this.symbolFor(currency);
    return `${formattedAmount} ${symbol}`;
  }

  private symbolFor(currency: string): string {
    switch (currency?.toUpperCase()) {
      case 'XAF': return 'FCFA';
      case 'EUR': return '€';
      default: return currency; // fallback: show the raw code if unknown
    }
  }
}