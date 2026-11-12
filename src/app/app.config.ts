import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding, withInMemoryScrolling} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {routes} from './app.routes';
import {iamInterceptor} from './iam/infrastructure/iam.interceptor';
import {languageInterceptor} from './shared/infrastructure/language.interceptor';

/**
 * Application-level providers: router, HTTP client with the bearer token and Accept-Language
 * interceptors, and i18n with ngx-translate (English by default, Spanish available).
 * @author DataBit
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideHttpClient(withInterceptors([languageInterceptor, iamInterceptor])),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({scrollPositionRestoration: 'top'})),
    provideTranslateService({
      loader: provideTranslateHttpLoader({prefix: './i18n/', suffix: '.json'}),
      fallbackLang: 'en',
      lang: 'en'
    })
  ]
};
