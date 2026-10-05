import { Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/** Entry of the sidebar navigation. */
export interface NavigationOption {
  /** Route the option navigates to. */
  link: string;
  /** Text shown to the user. */
  label: string;
  /** Material icon name shown next to the label. */
  icon: string;
}

/**
 * Application shell: fixed sidebar with the main navigation and a content
 * area hosting the routed views.
 */
@Component({
  imports: [MatIcon, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {
  /** Navigation options rendered in the sidebar. */
  protected readonly options: NavigationOption[] = [
    { link: '/home', label: 'Inicio', icon: 'home' },
    { link: '/subscription', label: 'Planes y suscripción', icon: 'credit_card' },
    // Each team member adds the navigation option of their bounded context here, e.g.:
    // { link: '/inventory', label: 'Inventario', icon: 'inventory_2' },
  ];

  /** Whether the sidebar is open on small screens. */
  protected readonly sidebarOpen = signal(false);

  /** Opens the sidebar when closed and closes it when open. */
  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  /** Closes the sidebar, e.g. after navigating on small screens. */
  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
