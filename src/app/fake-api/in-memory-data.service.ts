import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const users = [
      {
        id: 1,
        fullName: 'Carla Gallardo',
        email: 'admin@databitecorp.com',
        password: 'stockia123',
        restaurantName: 'DataBite Corp — Restaurante Demo',
        role: 'ADMIN',
      },
      {
        id: 2,
        fullName: 'Jesus Miranda',
        email: 'empleado@databitecorp.com',
        password: 'stockia123',
        restaurantName: 'DataBite Corp — Restaurante Demo',
        role: 'EMPLOYEE',
      },
    ];

    const inventoryItems = [
      {
        id: 1,
        name: 'Pechuga de pollo',
        unit: 'kg',
        quantity: 18,
        minThreshold: 10,
        storageType: 'REFRIGERATED',
        shelfLifeDays: 4,
        expirationDate: inDays(3),
        unitCost: 14.5,
      },
      {
        id: 2,
        name: 'Harina de trigo',
        unit: 'kg',
        quantity: 32,
        minThreshold: 15,
        storageType: 'AMBIENT',
        shelfLifeDays: 180,
        expirationDate: inDays(120),
        unitCost: 3.2,
      },
      {
        id: 3,
        name: 'Queso mozzarella',
        unit: 'kg',
        quantity: 4,
        minThreshold: 6,
        storageType: 'REFRIGERATED',
        shelfLifeDays: 10,
        expirationDate: inDays(2),
        unitCost: 22.0,
      },
      {
        id: 4,
        name: 'Tomate',
        unit: 'kg',
        quantity: 9,
        minThreshold: 8,
        storageType: 'AMBIENT',
        shelfLifeDays: 6,
        expirationDate: inDays(1),
        unitCost: 4.1,
      },
      {
        id: 5,
        name: 'Lomo fino',
        unit: 'kg',
        quantity: 0,
        minThreshold: 5,
        storageType: 'FROZEN',
        shelfLifeDays: 30,
        expirationDate: inDays(20),
        unitCost: 32.0,
      },
      {
        id: 6,
        name: 'Lechuga',
        unit: 'kg',
        quantity: 6,
        minThreshold: 4,
        storageType: 'REFRIGERATED',
        shelfLifeDays: 5,
        expirationDate: inDays(4),
        unitCost: 3.5,
      },
      {
        id: 7,
        name: 'Papa',
        unit: 'kg',
        quantity: 40,
        minThreshold: 20,
        storageType: 'AMBIENT',
        shelfLifeDays: 45,
        expirationDate: inDays(30),
        unitCost: 2.1,
      },
    ];

    const recipes = [
      {
        id: 1,
        dishName: 'Pizza Margarita',
        active: true,
        ingredients: [
          {
            inventoryItemId: 2,
            inventoryItemName: 'Harina de trigo',
            quantityRequired: 0.3,
            unit: 'kg',
          },
          {
            inventoryItemId: 3,
            inventoryItemName: 'Queso mozzarella',
            quantityRequired: 0.2,
            unit: 'kg',
          },
          { inventoryItemId: 4, inventoryItemName: 'Tomate', quantityRequired: 0.15, unit: 'kg' },
        ],
      },
      {
        id: 2,
        dishName: 'Lomo Saltado',
        active: true,
        ingredients: [
          {
            inventoryItemId: 5,
            inventoryItemName: 'Lomo fino',
            quantityRequired: 0.25,
            unit: 'kg',
          },
          { inventoryItemId: 7, inventoryItemName: 'Papa', quantityRequired: 0.3, unit: 'kg' },
          { inventoryItemId: 4, inventoryItemName: 'Tomate', quantityRequired: 0.1, unit: 'kg' },
        ],
      },
      {
        id: 3,
        dishName: 'Ensalada César con Pollo',
        active: true,
        ingredients: [
          {
            inventoryItemId: 1,
            inventoryItemName: 'Pechuga de pollo',
            quantityRequired: 0.18,
            unit: 'kg',
          },
          { inventoryItemId: 6, inventoryItemName: 'Lechuga', quantityRequired: 0.12, unit: 'kg' },
        ],
      },
    ];

    const demandForecasts = [
      {
        id: 1,
        generatedAt: new Date().toISOString(),
        confidenceScore: 0.82,
        weatherCondition: 'Soleado',
        dataPoints: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dayLabel, idx) => ({
          date: inDays(idx),
          dayLabel,
          dishName: ['Pizza Margarita', 'Lomo Saltado', 'Ensalada César con Pollo'][idx % 3],
          projectedUnits: 25 + idx * 6,
        })),
      },
    ];

    const alerts = [
      {
        id: 1,
        type: 'CRITICAL_STOCK',
        severity: 'CRITICAL',
        message: 'Lomo fino sin stock disponible.',
        createdAt: new Date().toISOString(),
        acknowledged: false,
        channel: 'WHATSAPP',
      },
      {
        id: 2,
        type: 'LOW_STOCK',
        severity: 'WARNING',
        message: 'Queso mozzarella por debajo del mínimo (4kg / 6kg).',
        createdAt: new Date().toISOString(),
        acknowledged: false,
        channel: 'WHATSAPP',
      },
      {
        id: 3,
        type: 'EXPIRING_SOON',
        severity: 'WARNING',
        message: 'Tomate vence en 1 día.',
        createdAt: new Date().toISOString(),
        acknowledged: false,
        channel: 'EMAIL',
      },
      {
        id: 4,
        type: 'IOT_FAULT',
        severity: 'INFO',
        message: 'Sensor de refrigerador #2 reportó una apertura de 6 minutos.',
        createdAt: new Date().toISOString(),
        acknowledged: true,
        channel: 'EMAIL',
      },
    ];

    const recommendations = [
      {
        id: 1,
        type: 'PURCHASE_SUGGESTION',
        message: 'Reponer Lomo fino antes del fin de semana: la demanda proyectada sube 20%.',
        expectedImpact: 'Evita quiebre de stock en Lomo Saltado',
        applied: false,
      },
      {
        id: 2,
        type: 'MENU_ADJUSTMENT',
        message:
          'La Ensalada César con Pollo creció en popularidad; considera destacarla en el menú.',
        expectedImpact: '+12% de margen estimado',
        applied: false,
      },
    ];

    const plans = [
      {
        id: 1,
        name: 'Esencial',
        monthlyPrice: 0,
        features: ['Hasta 50 insumos', 'Registro de ventas básico', '1 usuario'],
        highlighted: false,
      },
      {
        id: 2,
        name: 'Profesional',
        monthlyPrice: 39,
        features: [
          'Insumos ilimitados',
          'Predicción de demanda con IA',
          'Hasta 5 usuarios',
          'Recomendaciones automáticas',
        ],
        highlighted: true,
      },
      {
        id: 3,
        name: 'IoT Completo',
        monthlyPrice: 79,
        features: [
          'Todo lo de Profesional',
          'Sensores IoT',
          'Alertas en tiempo real',
          'Usuarios ilimitados',
        ],
        highlighted: false,
      },
    ];

    const subscriptions = [
      { id: 1, planId: 1, status: 'ACTIVE', renewalDate: inDays(30), paymentMethod: 'STRIPE' },
    ];

    // Para el bounded Context Sales / Order Management
    const sales = [
      {
        id: 1,
        saleDate: inDays(-1),
        channel: 'POS',
        status: 'CONFIRMED',
        lineItems: [{ recipeId: 1, dishName: 'Pizza Margarita', unitPrice: 28, quantity: 1 }],
      },
      {
        id: 2,
        saleDate: inDays(-1),
        channel: 'POS',
        status: 'CONFIRMED',
        lineItems: [
          { recipeId: 3, dishName: 'Ensalada César con Pollo', unitPrice: 22, quantity: 1 },
        ],
      },
      {
        id: 3,
        saleDate: inDays(0),
        channel: 'POS',
        status: 'CONFIRMED',
        lineItems: [{ recipeId: 2, dishName: 'Lomo Saltado', unitPrice: 32, quantity: 1 }],
      },
    ];

    return {
      users,
      inventoryItems,
      recipes,
      demandForecasts,
      alerts,
      recommendations,
      plans,
      subscriptions,
      sales,
    };
  }

  responseInterceptor(res: any, ri: RequestInfo) {
    return res;
  }
}

function inDays(n: number): string {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}
