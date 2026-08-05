import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _language$ = new BehaviorSubject<'fr' | 'en'>('fr');
  readonly language$ = this._language$.asObservable();

  get currentLanguage(): 'fr' | 'en' {
    return this._language$.getValue();
  }

  setLanguage(lang: 'fr' | 'en'): void {
    this._language$.next(lang);
  }
}