/**
 * Development environment: the StockIA Platform RESTful API running locally (mvn spring-boot:run).
 */
export const environment = {
  production: false,
  platformProviderApiBaseUrl: 'http://localhost:8181/api/v1',
  platformProviderAuthenticationEndpointPath: '/authentication',
  platformProviderUsersEndpointPath: '/users',
  platformProviderRestaurantRegistrationsEndpointPath: '/restaurant-registrations',
  platformProviderRestaurantsEndpointPath: '/restaurants',
  platformProviderPlansEndpointPath: '/plans',
  platformProviderSubscriptionsEndpointPath: '/subscriptions',
  platformProviderInventoryItemsEndpointPath: '/inventory-items',
  platformProviderRecipesEndpointPath: '/recipes',
  platformProviderSalesEndpointPath: '/sales',
  platformProviderAlertsEndpointPath: '/alerts',
  platformProviderDemandForecastsEndpointPath: '/demand-forecasts',
  platformProviderRecommendationsEndpointPath: '/recommendations',
  platformProviderDashboardEndpointPath: '/dashboard'
};
