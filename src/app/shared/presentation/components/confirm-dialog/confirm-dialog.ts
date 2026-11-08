import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';

/** Texts of a confirmation (translation keys and their parameters). */
export interface ConfirmDialogData {
  title: string;
  message: string;
  params?: Record<string, unknown>;
  accept?: string;
}

/**
 * Asks the user to confirm an action that cannot be undone. Closes with true when accepted.
 * @author DataBit
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ data.title | translate: data.params }}</h2>
    <mat-dialog-content>
      <p>{{ data.message | translate: data.params }}</p>
      <p class="muted">{{ 'common.cannot-undo' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button type="button" class="danger" [mat-dialog-close]="true" cdkFocusInitial>
        {{ (data.accept ?? 'common.delete') | translate }}
      </button>
    </mat-dialog-actions>`,
  styles: `.danger { --mat-button-filled-container-color: #b03224; }`
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
