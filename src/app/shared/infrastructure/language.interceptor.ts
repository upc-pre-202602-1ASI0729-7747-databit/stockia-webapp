import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Sends the language of the user interface to the API (Accept-Language), so problem details,
 * alerts, recommendations and plan features come back in the same language.
 *
 * @remarks
 * The language is read from the lang attribute of the document (set by LanguageStore) instead of
 * injecting the store: the translation loader also uses HttpClient while TranslateService is being
 * created, and injecting the store here would be a circular dependency.
 * @author DataBit
 */
export const languageInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.platformProviderApiBaseUrl)) return next(request);
  const language = document.documentElement.lang.startsWith('es') ? 'es-419' : 'en-US';
  return next(request.clone({ headers: request.headers.set('Accept-Language', language) }));
};
