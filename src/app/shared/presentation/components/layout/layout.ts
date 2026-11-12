import {Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {BreakpointObserver} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {FooterContent} from '../footer-content/footer-content';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {IamStore} from '../../../../iam/application/iam.store';

/** An option of the side menu; adminOnly options are hidden for Employees (same flag as the guard). */
interface NavigationOption {
  link: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

/**
 * Application shell: toolbar (language, user menu), side navigation of the bounded contexts and
 * footer. On small screens the menu becomes a drawer.
 * @author DataBit
 */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, MatListModule,
    MatMenuModule, MatTooltipModule, TranslatePipe, FooterContent, LanguageSwitcher],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  protected readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);
  protected readonly isHandset = toSignal(inject(BreakpointObserver).observe('(max-width: 899px)').pipe(map(state => state.matches)),
    {initialValue: false});
  protected readonly menuOpened = signal(true);
  private readonly options: NavigationOption[] = [
    {link: '/app/dashboard', label: 'nav.dashboard', icon: 'dashboard'},
    {link: '/app/inventory', label: 'nav.inventory', icon: 'inventory_2'},
    {link: '/app/recipes', label: 'nav.recipes', icon: 'restaurant_menu'},
    {link: '/app/sales', label: 'nav.sales', icon: 'receipt_long'},
    {link: '/app/forecast', label: 'nav.forecast', icon: 'insights'},
    {link: '/app/alerts', label: 'nav.alerts', icon: 'notifications'},
    {link: '/app/recommendations', label: 'nav.recommendations', icon: 'tips_and_updates', adminOnly: true},
    {link: '/app/roles', label: 'nav.roles', icon: 'group', adminOnly: true},
    {link: '/app/settings', label: 'nav.settings', icon: 'settings'}
  ];
  protected readonly visibleOptions = computed(() => this.options.filter(option => !option.adminOnly || this.iamStore.isAdmin()));

  protected toggleMenu(): void {
    this.menuOpened.update(opened => !opened);
  }

  protected closeOnHandset(): void {
    if (this.isHandset()) this.menuOpened.set(false);
  }

  protected signOut(): void {
    this.iamStore.signOut();
    this.router.navigate(['/auth/sign-in']).then();
  }
}
