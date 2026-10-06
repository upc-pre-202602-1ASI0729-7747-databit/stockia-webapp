import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../application/auth.service';

@Component({
    selector: 'app-sign-up',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './sign-up.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: '../sign-in/sign-in.component.css'
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    restaurantName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/app/dashboard'),
      error: () => {
        this.errorMessage.set('No se pudo crear la cuenta. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }
}
