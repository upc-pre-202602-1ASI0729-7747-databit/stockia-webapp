export interface RecipeIngredientLine {
  inventoryItemId: number;
  inventoryItemName: string;
  quantityRequired: number;
  unit: string;
}

// Entity Recipe, vinculada al Aggregate Root InventoryItem (US20)
export class Recipe {
  constructor(
    public id: number,
    public dishName: string,
    public ingredients: RecipeIngredientLine[],
    public active: boolean = true,
  ) {}

  static fromJson(json: any): Recipe {
    return new Recipe(json.id, json.dishName, json.ingredients ?? [], json.active ?? true);
  }
}
