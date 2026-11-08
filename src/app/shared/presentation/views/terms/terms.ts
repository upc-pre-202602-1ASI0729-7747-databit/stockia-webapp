import {Component, inject} from '@angular/core';
import {Location} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {FooterContent} from '../../components/footer-content/footer-content';
import {LanguageSwitcher} from '../../components/language-switcher/language-switcher';

/**
 * Terms of service (public; linked from the footer and the sign-up form).
 * @author DataBit
 */
@Component({
  selector: 'app-terms',
  imports: [MatButtonModule, MatCardModule, MatIconModule, TranslatePipe, FooterContent, LanguageSwitcher],
  template: `
    <main class="terms" id="main-content">
      <div class="top">
        <button mat-button type="button" (click)="back()"><mat-icon>arrow_back</mat-icon>{{ 'common.back' | translate }}</button>
        <app-language-switcher/>
      </div>
      <mat-card appearance="outlined">
        <mat-card-content>
          <h1>{{ 'terms.title' | translate }}</h1>
          <p class="muted">{{ 'terms.updated' | translate }}</p>
          <p>{{ 'terms.intro' | translate }}</p>
          @for (section of sections; track section) {
            <h2>{{ 'terms.sections.' + section + '.title' | translate }}</h2>
            <p>{{ 'terms.sections.' + section + '.body' | translate }}</p>
          }
        </mat-card-content>
      </mat-card>
    </main>
    <app-footer-content/>`,
  styles: `.terms { max-width: 820px; margin: 0 auto; padding: 24px 16px; }
    .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    h1 { color: #14301f; } h2 { font-size: 1.1rem; color: #1f4631; margin-top: 20px; }`
})
export class Terms {
  protected readonly sections = ['service', 'accounts', 'data', 'payments', 'predictions', 'ethics', 'availability', 'contact'];

  private readonly location = inject(Location);

  protected back(): void {
    this.location.back();
  }
}
