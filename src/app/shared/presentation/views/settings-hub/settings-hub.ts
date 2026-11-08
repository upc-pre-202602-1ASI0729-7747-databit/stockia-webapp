import {Component, computed, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatRippleModule} from '@angular/material/core';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';

/**
 * Settings menu: account settings, help, upgrade plan (Administrator) and sign out.
 * @author DataBit
 */
@Component({
  selector: 'app-settings-hub',
  imports: [RouterLink, MatCardModule, MatIconModule, MatRippleModule, TranslatePipe],
  template: `
    <section class="page">
      <header class="page-header"><div><h1>{{ 'nav.settings' | translate }}</h1><p>{{ 'settings.hub.description' | translate }}</p></div></header>
      <div class="card-grid">
        @for (option of options(); track option.key) {
          <a class="option" matRipple [routerLink]="option.link">
            <mat-icon aria-hidden="true">{{ option.icon }}</mat-icon>
            <strong>{{ 'nav.' + option.key | translate }}</strong>
            <span class="muted">{{ 'settings.hub.' + option.key | translate }}</span>
          </a>
        }
        <button type="button" class="option" matRipple (click)="signOut()">
          <mat-icon aria-hidden="true">logout</mat-icon>
          <strong>{{ 'nav.sign-out' | translate }}</strong>
          <span class="muted">{{ 'settings.hub.sign-out' | translate }}</span>
        </button>
      </div>
    </section>`,
  styles: `.option { display: flex; flex-direction: column; gap: 6px; padding: 20px; border-radius: 12px; border: 1px solid #e1e8e3;
    background: white; text-decoration: none; color: inherit; text-align: left; font: inherit; cursor: pointer; }
    .option mat-icon { color: #b84a1a; } .option:hover, .option:focus-visible { border-color: #1f4631; }`
})
export class SettingsHub {
  private readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);
  protected readonly options = computed(() => [
    {key: 'settings-account', link: '/app/settings/account', icon: 'manage_accounts'},
    {key: 'settings-help', link: '/app/settings/help', icon: 'help'},
    ...(this.iamStore.isAdmin() ? [{key: 'settings-plans', link: '/app/settings/plans', icon: 'workspace_premium'}] : [])
  ]);

  protected signOut(): void {
    this.iamStore.signOut();
    this.router.navigate(['/auth/sign-in']).then();
  }
}
