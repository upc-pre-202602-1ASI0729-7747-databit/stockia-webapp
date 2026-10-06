import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../application/auth.service';

@Component({
    selector: 'app-sign-in',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './sign-in.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['admin@databitecorp.com', [Validators.required, Validators.email]],
    password: ['stockia123', [Validators.required, Validators.minLength(4)]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl('/app/dashboard'),
      error: (err) => {
        this.errorMessage.set(err?.message ?? 'No se pudo iniciar sesión.');
        this.loading.set(false);
      },
    });
  }
}
