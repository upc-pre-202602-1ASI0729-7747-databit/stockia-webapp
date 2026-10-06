import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, throwError } from 'rxjs';
import { SalesApiService } from '../infrastructure/sales-api.service';
import { Sale, SaleChannel, SaleStatus, SaleLineItem } from '../domain/sale.entity';
import { InventoryService } from '../../product-inventory/application/inventory.service';

// Precio de referencia por plato. El dominio de Pricing aún no está formalizado
// en el Capítulo IV, así que usamos un mapa simple como valor plausible por
// plato mientras no exista un Bounded Context de Pricing dedicado.
const DEFAULT_DISH_PRICE = 25;
const DISH_PRICE_BY_NAME: Record<string, number> = {
  'Pizza Margarita': 28,
  'Lomo Saltado': 32,
  'Ensalada César con Pollo': 22,
};

// Capa de aplicación del Bounded Context Sales / Order Management (US27).
// Implementa el Domain Service SaleRegistrationService descrito en el
// Capítulo IV, 4.6.5: valida stock contra el modelo de lectura de Inventory &
// Recipe Management ANTES de confirmar la venta, y al confirmarla dispara
// RecipeStockDeductionService (hoy expuesto como InventoryService.sellDish).
@Injectable({ providedIn: 'root' })
export class SalesService {
  private api = inject(SalesApiService);
  private inventory = inject(InventoryService);

  readonly sales = signal<Sale[]>([]);
  // Último error de validación de stock al intentar registrar una venta (US20 / invariante de Sale).
  readonly registrationError = signal<string | null>(null);

  readonly totalRevenue = computed(() =>
    this.sales()
      .filter((s) => s.status === SaleStatus.CONFIRMED)
      .reduce((sum, s) => sum + s.total, 0),
  );

  loadSales() {
    return this.api.getAll().pipe(tap((sales) => this.sales.set(sales.map((s) => Sale.fromJson(s)))));
  }

  /**
   * SaleRegistrationService.registerSale (Capítulo IV, 4.6.5).
   *
   * 1) Busca la Recipe del plato a vender.
   * 2) Valida, contra el modelo de lectura de Inventory & Recipe Management, que
   *    CADA insumo de la receta tenga quantity >= quantityRequired. Si algún
   *    insumo no alcanza, falla sin crear la Sale ni descontar nada.
   * 3) Si hay stock suficiente para todos los insumos, crea la Sale (CONFIRMED,
   *    canal POS) con sus SaleLineItem calculadas a partir de la receta.
   * 4) Justo después de persistir la Sale, invoca RecipeStockDeductionService
   *    (InventoryService.sellDish) — esto simula la publicación del evento de
   *    dominio `DishSold` y su consumo por RecipeStockDeductionService: la
   *    Sale es la causa real del descuento de stock, no el botón de la UI.
   */
  registerSale(recipeId: number): Observable<Sale> {
    this.registrationError.set(null);

    const recipe = this.inventory.recipes().find((r) => r.id === recipeId);
    if (!recipe) {
      const message = 'No se encontró la receta a vender.';
      this.registrationError.set(message);
      return throwError(() => new Error(message));
    }

    const missing = recipe.ingredients.filter((line) => {
      const item = this.inventory.items().find((i) => i.id === line.inventoryItemId);
      return !item || item.quantity < line.quantityRequired;
    });

    if (missing.length > 0) {
      const names = missing.map((l) => l.inventoryItemName).join(', ');
      const message = `Stock insuficiente para vender "${recipe.dishName}": faltan insumos (${names}).`;
      this.registrationError.set(message);
      return throwError(() => new Error(message));
    }

    const unitPrice = DISH_PRICE_BY_NAME[recipe.dishName] ?? DEFAULT_DISH_PRICE;
    const lineItems: SaleLineItem[] = [
      { recipeId: recipe.id, dishName: recipe.dishName, unitPrice, quantity: 1 },
    ];

    const sale: Partial<Sale> = {
      saleDate: new Date().toISOString(),
      channel: SaleChannel.POS,
      status: SaleStatus.CONFIRMED,
      lineItems,
    };

    return this.api.create(sale).pipe(
      tap((created) => {
        this.sales.update((list) => [...list, Sale.fromJson(created)]);
        // Capítulo IV: simula la publicación de DishSold y su consumo por
        // RecipeStockDeductionService — se invoca DESDE SalesService.registerSale,
        // no al revés (ya no es la UI la que descuenta el inventario directamente).
        this.inventory.sellDish(recipeId);
      }),
    );
  }

  void(id: number) {
    const sale = this.sales().find((s) => s.id === id);
    if (!sale) return throwError(() => new Error('Venta no encontrada.'));
    // No confiamos en el body de la respuesta del PUT (el fake API no siempre lo devuelve):
    // actualizamos localmente con el estado que acabamos de confirmar que se guardó.
    return this.api.void(sale).pipe(
      tap(() => {
        const voided = new Sale(sale.id, sale.saleDate, sale.channel, SaleStatus.VOIDED, sale.lineItems);
        this.sales.update((list) => list.map((s) => (s.id === voided.id ? voided : s)));
      }),
    );
  }
}
