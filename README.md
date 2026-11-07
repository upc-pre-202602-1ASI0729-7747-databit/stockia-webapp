# StockIA Web Application

Frontend of **StockIA** (DataBit, UPC — Open Source course): smart inventory, recipes, sales, alerts, demand forecast
with Machine Learning and recommendations for restaurants. Built with **Angular 22**, **Angular Material** and
**ngx-translate** (English `en-US` by default, Latin American Spanish `es-419`), organized by bounded context and connected to the
**StockIA Platform** RESTful API (Spring Boot): https://github.com/Jesusho22/stockia-platform-os

## Structure

```
src/app/
├── shared/                    base entity/assembler/endpoint/API, ApiError, DecimalQuantity, language store,
│                              notifications, interceptor (Accept-Language), layout, footer (Terms), pipes, validators
├── iam/                       sign-in, password recovery, team & roles, account settings, session, guards, JWT interceptor
├── restaurant-registration/   restaurant sign-up and restaurant data
├── subscription-payments/     plan catalog, subscription and simulated Stripe / PayPal checkout
├── stock-management/          supply lots (exact quantities with up to 32 decimals), stock allocation preview
├── recipes-management/        recipes, sale of a dish (422 CannotSell explained) and sales history
├── notifications-messaging/   automatic and manual alerts, delivery retries and acknowledgement
├── ml-recommendations/        demand forecast (ONNX model of the API) and recommendations
└── analytics-dashboard/       KPIs and weekly savings
```

Every bounded context has the same layers:

| Layer | Content |
|---|---|
| `domain/model` | Entities with private fields and getters (`*.entity.ts`), commands and value types |
| `infrastructure` | `*-response.ts` (API resources), `*-assembler.ts` (resource ⇄ entity), `*-api-endpoint.ts` (extends `BaseApiEndpoint`) and the `*-api.ts` facade (extends `BaseApi`) |
| `application` | `*.store.ts`: state with signals and the use cases the views call (no view uses `HttpClient`) |
| `presentation` | `views` (routed) and `components` (embedded), Angular Material + ngx-translate |
| `*.routes.ts` | Lazy routes of the context |

## Routes

Public: `/auth/sign-in`, `/auth/sign-up` (the landing page buttons), `/auth/forgot-password`, `/auth/reset-password`,
`/terms`. Application (session required): `/app/dashboard`, `/app/inventory`, `/app/recipes`, `/app/sales`,
`/app/forecast`, `/app/alerts`, `/app/recommendations` (Administrator), `/app/roles` (Administrator),
`/app/settings`, `/app/settings/account` (`/app/profile`), `/app/settings/help`, `/app/settings/plans`
(Administrator, `/app/plans`).

## Run

Requirements: Node.js 22.22.3+ or 24.15+, and the StockIA Platform API running on `http://localhost:8181`.

```bash
npm install
npm start            # http://localhost:4200 (environment.development.ts → http://localhost:8181/api/v1)
npm run build        # production build in dist/stockia-webapp/browser (environment.ts)
```

Demo accounts (password `stockia123`): `admin@databitecorp.com` (Administrator) and `empleado@databitecorp.com`
(Employee).

The production API URL is `platformProviderApiBaseUrl` in `src/environments/environment.ts`; change it to the URL of
your deployment of the API before deploying to Vercel (`vercel.json` already rewrites every path to `index.html`).

## Accessibility and i18n

Skip link, landmarks (`banner`, `navigation`, `main`, `contentinfo`), labelled icon buttons, `aria-current` in the
menu, live regions for results and errors, status shown with text and color. Texts are in `public/i18n/en.json` and
`public/i18n/es.json`; the selected language is also sent to the API in `Accept-Language`, so API messages, alerts,
recommendations and plan features arrive in the same language.

## End-to-end test

`e2e/e2e.mjs` (Playwright) runs in GitHub Actions against the real API with demo data: guards and roles, sign-in
attempts, inventory with 32 decimals, sale blocked by an expired supply, sale and void, ML forecast, recommendations,
alerts delivery, Spanish, team, plans, sign-up and password recovery.
