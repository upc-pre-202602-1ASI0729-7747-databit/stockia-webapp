/**
 * Production environment: the StockIA Platform RESTful API (Spring Boot) deployed for the course.
 * Change platformProviderApiBaseUrl to the URL of your deployment.
 */
export const environment = {
  production: true,
  platformProviderApiBaseUrl: 'https://stockia-platform-os.onrender.com/api/v1',
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
