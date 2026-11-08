import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {FooterContent} from '../footer-content/footer-content';

/**
 * Two-column frame of the public views (sign-in, sign-up, password recovery): the value proposition
 * on one side and the form (content projection) on the other.
 * @author DataBit
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink, MatIconModule, TranslatePipe, LanguageSwitcher, FooterContent],
  template: `
    <div class="auth">
      <aside class="hero">
        <a class="brand" routerLink="/auth/sign-in"><img src="/favicon.svg" alt="" width="36" height="36"><span>StockIA</span></a>
        <h1>{{ headline() | translate }}</h1>
        <p>{{ description() | translate }}</p>
        <ul>
          @for (highlight of highlights(); track highlight) {
            <li><mat-icon aria-hidden="true">check_circle</mat-icon>{{ highlight | translate }}</li>
          }
        </ul>
      </aside>
      <main class="panel" id="main-content">
        <div class="switcher"><app-language-switcher/></div>
        <div class="form"><ng-content/></div>
      </main>
    </div>
    <app-footer-content/>`,
  styles: `
    .auth { min-height: calc(100vh - 60px); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .hero { background: linear-gradient(160deg, #14301f, #1f4631 60%, #2f6b48); color: white; padding: 48px; display: flex; flex-direction: column; gap: 16px; }
    .brand { display: inline-flex; gap: 10px; align-items: center; color: white; text-decoration: none; font-size: 1.4rem; font-weight: 700; }
    .hero h1 { font-size: 2rem; line-height: 1.25; margin: 24px 0 0; } .hero p { opacity: 0.9; max-width: 480px; }
    .hero ul { list-style: none; padding: 0; display: grid; gap: 12px; } .hero li { display: flex; gap: 8px; align-items: center; }
    .hero mat-icon { color: #f0a074; }
    .panel { padding: 32px 24px; display: flex; flex-direction: column; align-items: center; }
    .switcher { align-self: flex-end; } .form { width: 100%; max-width: 420px; margin-top: 24px; }
    @media (max-width: 899px) { .auth { grid-template-columns: 1fr; } .hero { padding: 24px; } .hero ul { display: none; } }`

})
export class AuthLayout {
  readonly headline = input.required<string>();
  readonly description = input.required<string>();
  readonly highlights = input<string[]>([]);
}
