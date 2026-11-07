import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {LanguageStore} from './shared/application/language.store';

/**
 * Root component: the router outlet. The language store is created here so the saved language is
 * applied before the first view renders.
 * @author DataBit
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet/>'
})
export class App {
  protected readonly language = inject(LanguageStore);
}
