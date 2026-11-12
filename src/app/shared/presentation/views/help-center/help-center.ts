import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageStore} from '../../../application/language.store';

/**
 * Get help: step-by-step guide of the StockIA flow, what each role can do and searchable FAQ.
 * @author DataBit
 */
@Component({
  selector: 'app-help-center',
  imports: [RouterLink, MatCardModule, MatExpansionModule, MatFormFieldModule, MatInputModule, MatIconModule, TranslatePipe],
  templateUrl: './help-center.html',
  styles: `.steps { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
    .step h3 { margin: 0 0 6px; font-size: 1rem; color: #1f4631; } .tip { font-size: 0.85rem; color: #8a6508; }
    table { border-collapse: collapse; width: 100%; background: white; } th, td { padding: 8px 12px; border-bottom: 1px solid #e1e8e3; text-align: left; }`
})
export class HelpCenter {
  private readonly language = inject(LanguageStore);
  protected readonly steps = ['inventory', 'recipes', 'sell', 'sales', 'alerts', 'forecast', 'recommendations', 'team', 'settings'];
  protected readonly stepLinks: Record<string, string> = {inventory: '/app/inventory', recipes: '/app/recipes', sell: '/app/recipes',
    sales: '/app/sales', alerts: '/app/alerts', forecast: '/app/forecast', recommendations: '/app/recommendations', team: '/app/roles',
    settings: '/app/settings'};
  protected readonly roleRows = [
    {key: 'operation', admin: true, employee: true}, {key: 'recommendations', admin: true, employee: false},
    {key: 'team', admin: true, employee: false}, {key: 'subscription', admin: true, employee: false}];
  private readonly faqKeys = ['no-stock', 'expired', 'freshest', 'dish-price', 'decimals', 'void', 'critical-alert', 'roles', 'password', 'language'];
  protected readonly search = signal('');
  protected readonly faqs = computed(() => {
    this.language.language();
    const term = this.search().trim().toLowerCase();
    return this.faqKeys.filter(key => !term || `${this.language.instant(`help.faq.${key}.q`)} ${this.language.instant(`help.faq.${key}.a`)}`
      .toLowerCase().includes(term));
  });
}
