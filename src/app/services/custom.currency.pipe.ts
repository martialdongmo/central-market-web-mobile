import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform {

  transform(value: number | string, currencySymbol: string = 'FCFA', locale: string = 'fr-FR'): string {
    if (value == null || value === '') return '';

    const amount = typeof value === 'string' ? parseFloat(value) : value;

    // Formatage du nombre avec séparateurs de milliers
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

    return `${formattedAmount} ${currencySymbol}`;
  }

}
