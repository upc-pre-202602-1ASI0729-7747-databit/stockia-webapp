import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

/**
 * Shown for any unknown path.
 * @author DataBit
 */
@Component({
  selector: 'app-page-not-found',
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    <main class="not-found">
      <mat-icon class="icon" aria-hidden="true">travel_explore</mat-icon>
      <h1>{{ 'not-found.title' | translate }}</h1>
      <p>{{ 'not-found.description' | translate: {path: path} }}</p>
      <a mat-flat-button routerLink="/app/dashboard">{{ 'not-found.back' | translate }}</a>
    </main>`,
  styles: `.not-found { min-height: 100vh; display: grid; place-content: center; justify-items: center; gap: 8px; text-align: center; padding: 16px; }
    .icon { font-size: 64px; width: 64px; height: 64px; color: #1f4631; }`
})
export class PageNotFound {
  protected readonly path = inject(Router).url;
}
