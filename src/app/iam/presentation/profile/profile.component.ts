import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../application/auth.service';
import { ROLE_LABEL } from '../../domain/role.enum';

// Presentación del Bounded Context IAM — editar el propio perfil (US32).
@Component({
    selector: 'app-profile',
    imports: [ReactiveFormsModule],
    templateUrl: './profile.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  roleLabel = ROLE_LABEL;

  saving = signal(false);
  savedOk = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    fullName: [this.auth.currentUser()?.fullName ?? '', [Validators.required, Validators.minLength(3)]],
    restaurantName: [this.auth.currentUser()?.restaurantName ?? '', Validators.required],
    email: [this.auth.currentUser()?.email ?? '', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(4)]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    this.savedOk.set(false);
    const raw = this.form.getRawValue();
    this.auth.updateProfile({ ...raw, password: raw.password || undefined }).subscribe({
      next: () => {
        this.saving.set(false);
        this.savedOk.set(true);
        this.form.patchValue({ password: '' });
        setTimeout(() => this.savedOk.set(false), 2500);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudo guardar el perfil. Intenta nuevamente.');
      },
    });
  }
}
