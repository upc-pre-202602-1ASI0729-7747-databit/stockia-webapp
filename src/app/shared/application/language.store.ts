import { computed, inject, Service, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Languages of the web application: English (default) and Spanish. */
export type AppLanguage = 'en' | 'es';

const LANGUAGE_STORAGE_KEY = 'stockia.language';

/**
 * Current language of the user interface. It is remembered in the browser and sent to the API in
 * Accept-Language, so the API answers its messages in the same language.
 * @author DataBit
 */
@Service()
export class LanguageStore {
  private readonly translate = inject(TranslateService);
  private readonly languageSignal = signal<AppLanguage>('en');
  readonly language = this.languageSignal.asReadonly();
  readonly languages: AppLanguage[] = ['en', 'es'];
  readonly locale = computed(() => (this.languageSignal() === 'es' ? 'es-419' : 'en-US'));

  constructor() {
    let saved: string | null;
    try {
      saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch {
      saved = null;
    }
    this.use(saved === 'es' ? 'es' : 'en');
  }

  use(language: AppLanguage): void {
    this.languageSignal.set(language);
    this.translate.use(language);
    document.documentElement.lang = language === 'es' ? 'es-419' : 'en';
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      /* storage blocked: the choice lasts until the tab is closed */
    }
  }

  /** Translates a key right away (for snack bars and dialogs). */
  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}
