import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Recommendation } from '../../../domain/model/recommendation.entity';
import { RecommendationCard } from './recommendation-card';

/**
 * Builds a recommendation for the tests.
 *
 * @param applied - Whether the recommendation is already applied.
 * @returns A purchase suggestion.
 */
function purchaseSuggestion(applied: boolean): Recommendation {
  return new Recommendation({
    id: 1,
    type: 'PURCHASE_SUGGESTION',
    message: 'Reponer Lomo fino antes del fin de semana.',
    expectedImpact: 'Evita quiebre de stock',
    applied,
  });
}

describe('RecommendationCard', () => {
  let fixture: ComponentFixture<RecommendationCard>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommendationCard);
    fixture.componentRef.setInput('recommendation', purchaseSuggestion(false));
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the recommendation with its type', () => {
    expect(element.querySelector('.badge')?.textContent).toContain('Sugerencia de compra');
    expect(element.querySelector('.recommendation-message')?.textContent).toContain('Lomo fino');
    expect(element.querySelector('.recommendation-impact')?.textContent).toContain(
      'Evita quiebre de stock',
    );
  });

  it('should emit when the user applies it', () => {
    let applied = 0;
    fixture.componentInstance.apply.subscribe(() => applied++);

    element.querySelector('button')?.click();

    expect(applied).toBe(1);
  });

  it('should show an applied recommendation without the action', () => {
    fixture.componentRef.setInput('recommendation', purchaseSuggestion(true));
    fixture.detectChanges();

    expect(element.querySelector('button')).toBeNull();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Aplicada');
  });
});
