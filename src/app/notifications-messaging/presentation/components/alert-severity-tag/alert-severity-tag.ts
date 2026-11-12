import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertSeverity } from '../../../domain/model/alert.entity';

/**
 * Severity of an alert as a colored tag with its text.
 * @author DataBit
 */
@Component({
  selector: 'app-alert-severity-tag',
  imports: [TranslatePipe],
  template: `<span [class]="'tag ' + css()">{{
    'alerts.severity.' + severity() | translate
  }}</span>`,
})
export class AlertSeverityTag {
  readonly severity = input.required<AlertSeverity>();
  protected readonly css = computed(
    () => ({ INFO: 'tag-info', WARNING: 'tag-warning', CRITICAL: 'tag-danger' })[this.severity()],
  );
}
