import { Routes } from '@angular/router';

/** Lazy loader for the plan catalog view. */
const planList = () => import('./views/plan-list/plan-list').then((m) => m.PlanList);

/** Lazy loader for the payment checkout view. */
const paymentCheckout = () =>
  import('./views/payment-checkout/payment-checkout').then((m) => m.PaymentCheckout);

/** Base title shown in the browser tab. */
const baseTitle = 'StockIA';

/** Routes of the Subscription and Payment Management bounded context. */
export const subscriptionRoutes: Routes = [
  { path: 'plans', loadComponent: planList, title: `${baseTitle} - Planes y suscripción` },
  {
    path: 'checkout/:planId',
    loadComponent: paymentCheckout,
    title: `${baseTitle} - Confirmar pago`,
  },
  { path: '', redirectTo: 'plans', pathMatch: 'full' },
];
