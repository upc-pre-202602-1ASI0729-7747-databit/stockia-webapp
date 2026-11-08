import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {ApiError} from '../../shared/infrastructure/api-error';
import {environment} from '../../../environments/environment';
import {DashboardSummary} from '../domain/model/dashboard-summary.entity';
import {WeeklySavings} from '../domain/model/weekly-savings.entity';
import {WeeklySavingsAssembler} from './weekly-savings-assembler';
import {WeeklySavingsResource} from './dashboard-response';

/**
 * Facade of the Analytics &amp; Dashboard API (read only: it composes the other bounded contexts).
 * @author DataBit
 */
@Service()
export class AnalyticsDashboardApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly endpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderDashboardEndpointPath}`;
  private readonly savingsAssembler = new WeeklySavingsAssembler();

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.endpointUrl}/summary`).pipe(catchError(error => throwError(() => ApiError.from(error))));
  }

  getWeeklySavings(): Observable<WeeklySavings> {
    return this.http.get<WeeklySavingsResource>(`${this.endpointUrl}/weekly-savings`).pipe(
      map(resource => this.savingsAssembler.toEntityFromResource(resource)), catchError(error => throwError(() => ApiError.from(error))));
  }
}
