import {Component, inject} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {TranslatePipe} from '@ngx-translate/core';
import {AppLanguage, LanguageStore} from '../../../application/language.store';

@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonToggleModule, TranslatePipe],
  template: `
    <mat-button-toggle-group class="switcher" hideSingleSelectionIndicator [value]="language.language()"
                             (change)="use($event.value)" [attr.aria-label]="'language.switcher' | translate">
      @for (code of language.languages; track code) {
        <mat-button-toggle [value]="code" [attr.aria-label]="'language.' + code | translate">{{ code.toUpperCase() }}</mat-button-toggle>
      }
    </mat-button-toggle-group>`,
  styles: `.switcher { --mat-button-toggle-height: 32px; --mat-standard-button-toggle-height: 32px; background: white; }`
})
export class LanguageSwitcher {
  protected readonly language = inject(LanguageStore);

  protected use(code: AppLanguage): void {
    this.language.use(code);
  }
}
