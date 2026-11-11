import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {User} from '../../../domain/model/user.entity';
import {USER_ROLES, UserRole} from '../../../domain/model/user-role';
import {NotificationService} from '../../../../shared/application/notification.service';
import {LanguageStore} from '../../../../shared/application/language.store';
import {ErrorMessagePipe} from '../../../../shared/presentation/pipes/error-message.pipe';
import {AppValidators} from '../../../../shared/presentation/validators';
import {ConfirmDialog} from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';

/**
 * Roles &amp; permissions (Administrator): invite members, change their role, unlock accounts locked by
 * wrong passwords and remove members. The team always keeps at least one Administrator.
 * @author DataBit
 */
@Component({
  selector: 'app-team-roles',
  imports: [ReactiveFormsModule, MatTableModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatTooltipModule, TranslatePipe, ErrorMessagePipe],
  templateUrl: './team-roles.html',
  styles: `.invite { display: grid; gap: 0 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); align-items: start; }
    .name { display: flex; flex-direction: column; } .role-select { width: 170px; }
    td.mat-mdc-cell, th.mat-mdc-header-cell { padding: 8px 12px; }`
})
export class TeamRoles implements OnInit {
  protected readonly iamStore = inject(IamStore);
  private readonly notifications = inject(NotificationService);
  private readonly language = inject(LanguageStore);
  private readonly dialog = inject(MatDialog);
  protected readonly roles = USER_ROLES;
  protected readonly columns = ['name', 'role', 'status', 'actions'];
  protected readonly inviting = signal(false);
  protected readonly showInvite = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, AppValidators.email]],
    role: ['EMPLOYEE' as UserRole, Validators.required]
  });

  ngOnInit(): void {
    this.iamStore.loadUsers();
  }

  protected isSelf(user: User): boolean {
    return user.id === this.iamStore.currentUser()?.id;
  }

  protected async invite(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.inviting()) return;
    this.inviting.set(true);
    try {
      const {fullName, email, role} = this.form.getRawValue();
      const user = await this.iamStore.inviteMember(fullName, email, role);
      this.notifications.success('team.invited', {name: user.fullName});
      this.form.reset({fullName: '', email: '', role: 'EMPLOYEE'});
      this.showInvite.set(false);
    } catch (error) {
      this.notifications.error(error, 'team.invite-error');
    } finally {
      this.inviting.set(false);
    }
  }

  protected async changeRole(user: User, role: UserRole): Promise<void> {
    try {
      const updated = await this.iamStore.changeRole(user, role);
      this.notifications.success('team.role-changed', {name: updated.fullName, role: this.language.instant(`iam.roles.${role}`)});
    } catch (error) {
      this.notifications.error(error);
      this.iamStore.loadUsers();
    }
  }

  protected async unlock(user: User): Promise<void> {
    try {
      await this.iamStore.unlock(user);
      this.notifications.success('team.unlocked', {name: user.fullName});
    } catch (error) {
      this.notifications.error(error);
    }
  }

  protected remove(user: User): void {
    this.dialog.open(ConfirmDialog, {data: {title: 'team.remove-title', message: 'team.remove-confirm', params: {name: user.fullName}}})
      .afterClosed().subscribe(async accepted => {
        if (!accepted) return;
        try {
          await this.iamStore.removeMember(user);
          this.notifications.success('team.removed', {name: user.fullName});
        } catch (error) {
          this.notifications.error(error, 'errors.delete');
        }
      });
  }
}
