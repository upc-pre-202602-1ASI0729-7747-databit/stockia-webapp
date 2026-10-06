import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IamApiService } from '../../infrastructure/iam-api.service';
import { AuthService } from '../../application/auth.service';
import { User } from '../../domain/user.entity';
import { UserRole, ROLE_LABEL } from '../../domain/role.enum';

// Presentación del Bounded Context IAM — gestión de equipo: asignar roles
// (US23), invitar nuevos integrantes y darlos de baja (US33).
@Component({
    selector: 'app-roles-list',
    imports: [ReactiveFormsModule],
    templateUrl: './roles-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './roles-list.component.css'
})
export class RolesListComponent implements OnInit {
  private api = inject(IamApiService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  roleLabel = ROLE_LABEL;
  roles = Object.values(UserRole);
  showInviteForm = signal(false);
  errorMessage = signal<string | null>(null);

  readonly adminCount = computed(() => this.users().filter((u) => u.role === UserRole.ADMIN).length);

  inviteForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: [UserRole.EMPLOYEE, Validators.required],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getAll().subscribe((users) => this.users.set(users.map((u) => User.fromJson(u))));
  }

  isCurrentUser(user: User): boolean {
    return user.id === this.auth.currentUser()?.id;
  }

  /** Un ADMIN no puede quitarse a sí mismo el rol si es el único administrador (evita bloquear la cuenta). */
  canChangeRole(user: User): boolean {
    if (user.role === UserRole.ADMIN && this.adminCount() <= 1) return false;
    return true;
  }

  changeRole(user: User, role: string) {
    if (!this.canChangeRole(user)) {
      this.errorMessage.set('Debe quedar al menos un Administrador en el equipo.');
      return;
    }
    this.errorMessage.set(null);
    this.api.updateRole(user, role as UserRole).subscribe(() => this.load());
  }

  openInvite() {
    this.errorMessage.set(null);
    this.inviteForm.reset({ fullName: '', email: '', role: UserRole.EMPLOYEE });
    this.showInviteForm.set(true);
  }

  sendInvite() {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    const raw = this.inviteForm.getRawValue();
    const restaurantName = this.auth.currentUser()?.restaurantName ?? '';
    // Contraseña temporal — en un backend real esto dispararía un correo de invitación
    // con un enlace para que la persona defina su propia contraseña.
    this.api.register({ ...raw, restaurantName, password: 'stockia123' }).subscribe({
      next: () => {
        this.showInviteForm.set(false);
        this.load();
      },
      error: () => this.errorMessage.set('No se pudo invitar al integrante.'),
    });
  }

  remove(user: User) {
    if (this.isCurrentUser(user)) {
      this.errorMessage.set('No puedes eliminar tu propia cuenta desde aquí.');
      return;
    }
    if (user.role === UserRole.ADMIN && this.adminCount() <= 1) {
      this.errorMessage.set('Debe quedar al menos un Administrador en el equipo.');
      return;
    }
    if (confirm(`¿Quitar a ${user.fullName} del equipo?`)) {
      this.errorMessage.set(null);
      this.api.delete(user.id).subscribe(() => this.load());
    }
  }
}
