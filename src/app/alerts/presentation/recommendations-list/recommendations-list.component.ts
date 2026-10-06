import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { AlertsService } from '../../application/alerts.service';
import { RECOMMENDATION_TYPE_LABEL } from '../../domain/recommendation.entity';

@Component({
  selector: 'app-recommendations-list',
  standalone: true,
  templateUrl: './recommendations-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './recommendations-list.component.css',
})
export class RecommendationsListComponent implements OnInit {
  alertsSrv = inject(AlertsService);
  typeLabel = RECOMMENDATION_TYPE_LABEL;

  ngOnInit() {
    this.alertsSrv.loadRecommendations().subscribe();
  }

  apply(id: number) {
    this.alertsSrv.markApplied(id).subscribe();
  }
}
