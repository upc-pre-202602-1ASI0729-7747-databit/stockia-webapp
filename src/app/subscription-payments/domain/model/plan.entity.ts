import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * A plan of the catalog (Esencial, Profesional, IoT Completo); features come translated by the API.
 * @author DataBit
 */
export class Plan implements BaseEntity {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly monthlyPrice: number,
    readonly features: string[],
    readonly highlighted: boolean
  ) {}

  get isFree(): boolean {
    return this.monthlyPrice === 0;
  }
}
