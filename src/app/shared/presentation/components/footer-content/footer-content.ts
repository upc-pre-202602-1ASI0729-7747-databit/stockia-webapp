import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

/**
 * Footer of every view: team, data source and the Terms of service link.
 * @author DataBit
 */
@Component({
  selector: 'app-footer-content',
  imports: [RouterLink, TranslatePipe],
  template: `
    <footer class="footer" role="contentinfo">
      <span>{{ 'footer.rights' | translate: {year: year} }} · {{ 'footer.made-by' | translate: {team: 'DataBit'} }}</span>
      <span class="source">{{ 'footer.data-source' | translate }}</span>
      <a routerLink="/terms">{{ 'footer.terms' | translate }}</a>
    </footer>`,
  styles: `.footer { display: flex; flex-wrap: wrap; gap: 8px 16px; justify-content: center; padding: 16px; font-size: 0.85rem;
    color: #55635c; border-top: 1px solid #e1e8e3; }
    .footer a { color: #1f4631; font-weight: 500; }`
})
export class FooterContent {
  protected readonly year = new Date().getFullYear();
}
