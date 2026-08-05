import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {
  private dictionary = {
    fr: {
      appTitle: 'Market GroupinG'
    },
    en: {
      appTitle: 'GroupinG Market'
    }
  } as const;

  transform(value: string, language: 'fr' | 'en' = 'fr'): string {
    return this.dictionary[language][value as keyof typeof this.dictionary['fr']] ?? value;
  }
}