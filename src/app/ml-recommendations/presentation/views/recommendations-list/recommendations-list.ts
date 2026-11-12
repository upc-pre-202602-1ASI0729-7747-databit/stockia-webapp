import {Component, inject, OnInit} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {MlRecommendationsStore} from '../../../application/ml-recommendations.store';
import {Recommendation} from '../../../domain/model/recommendation.entity';
import {NotificationService} from '../../../../shared/application/notification.service';

/**
 * Automatic recommendations (Menu Recommendation Engine, Administrator): purchase suggestions and menu
 * adjustments from the latest demand forecast.
 * @author DataBit
 */
@Component({
  selector: 'app-recommendations-list',
  imports: [MatTableModule, MatButtonModule, MatProgressBarModule, TranslatePipe],
  templateUrl: './recommendations-list.html',
  styles: `td.mat-mdc-cell, th.mat-mdc-header-cell { padding: 8px 12px; } .applied td { opacity: 0.65; }`
})
export class RecommendationsList implements OnInit {
  protected readonly store = inject(MlRecommendationsStore);
  private readonly notifications = inject(NotificationService);
  protected readonly columns = ['type', 'recommendation', 'impact', 'actions'];

  ngOnInit(): void {
    this.store.loadRecommendations().catch(error => this.notifications.error(error, 'errors.load'));
  }

  protected async apply(recommendation: Recommendation): Promise<void> {
    try {
      await this.store.applyRecommendation(recommendation);
      this.notifications.success('recommendations.applied-toast');
    } catch (error) {
      this.notifications.error(error);
    }
  }
}
