import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * The restaurant (tenant) the team works for.
 * @author DataBit
 */
export class Restaurant implements BaseEntity {
  constructor(
    public id: number,
    public name: string,
    public address: string,
    public phone: string,
    readonly latitude = -12.0464,
    readonly longitude = -77.0428
  ) {}
}
