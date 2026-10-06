import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../iam/application/auth.service';
import { UserRole } from '../../../iam/domain/role.enum';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  auth = inject(AuthService);
  UserRole = UserRole;

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/app/dashboard', icon: '📊' },
    { label: 'Inventario', path: '/app/inventory', icon: '📦' },
    { label: 'Recetas', path: '/app/recipes', icon: '🍽️' },
    { label: 'Historial de ventas', path: '/app/sales', icon: '🧾' },
    { label: 'Predicción de demanda', path: '/app/forecast', icon: '🤖' },
    { label: 'Alertas', path: '/app/alerts', icon: '🔔' },
    { label: 'Recomendaciones', path: '/app/recommendations', icon: '💡' },
    { label: 'Roles y permisos', path: '/app/roles', icon: '👥', adminOnly: true },
    { label: 'Planes', path: '/app/subscription', icon: '💳' },
  ];

  logout() {
    this.auth.logout();
  }
}
