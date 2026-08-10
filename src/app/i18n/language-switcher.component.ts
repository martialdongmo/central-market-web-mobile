import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppLanguage, LanguageService } from './language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="language-switcher"
      role="group"
      aria-label="Choose language"
    >
      <span class="language-label">Language</span>
      <div class="language-options">
        <button
          type="button"
          title="French"
          [class.active]="(languageService.language$ | async) === 'fr'"
          [attr.aria-pressed]="(languageService.language$ | async) === 'fr'"
          (click)="selectLanguage('fr')"
        >
          FR
        </button>
        <button
          type="button"
          title="English"
          [class.active]="(languageService.language$ | async) === 'en'"
          [attr.aria-pressed]="(languageService.language$ | async) === 'en'"
          (click)="selectLanguage('en')"
        >
          EN
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        flex-shrink: 0;
      }

      .language-switcher {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }

      .language-label {
        color: var(--text3, #64748b);
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.08em;
        line-height: 1;
        text-transform: uppercase;
      }

      .language-options {
        display: inline-flex;
        padding: 2px;
        border: 1px solid var(--border-light, #e2e8f0);
        border-radius: 10px;
        background: var(--bg3, #f1f5f9);
      }

      button {
        min-width: 32px;
        min-height: 28px;
        padding: 0 7px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: var(--text2, #475569);
        cursor: pointer;
        font-family: inherit;
        font-size: 10px;
        font-weight: 800;
        transition:
          color 0.15s ease,
          background 0.15s ease,
          box-shadow 0.15s ease;
        -webkit-tap-highlight-color: transparent;
      }

      button.active {
        background: var(--navy, #1e3a8a);
        color: #fff;
        box-shadow: 0 2px 7px rgb(15 23 42 / 18%);
      }

      button:focus-visible {
        outline: 2px solid var(--primary, #2563eb);
        outline-offset: 2px;
      }

      button:active {
        transform: scale(0.96);
      }

      @media (max-width: 360px) {
        .language-label {
          display: none;
        }

        button {
          min-width: 29px;
          padding: 0 5px;
        }
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  readonly languageService = inject(LanguageService);

  selectLanguage(language: AppLanguage): void {
    void this.languageService.setLanguage(language);
  }
}