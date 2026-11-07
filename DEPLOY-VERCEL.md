# Deploy to Vercel — StockIA Web Application

The web application is a static Angular build that calls the StockIA Platform RESTful API.

1. Deploy the API first (for example on Render or Railway with a MySQL database, profile `prod`) and copy its URL.
2. Put that URL in `platformProviderApiBaseUrl` of `src/environments/environment.ts` (for example
   `https://stockia-platform-os.onrender.com/api/v1`) and add the Vercel domain to the API variable
   `STOCKIA_CORS_ALLOWED_ORIGINS` (`https://*.vercel.app` is allowed by default). Set `STOCKIA_WEB_APP_URL` of the API
   to the Vercel URL so the password recovery links open the deployed application.
3. In Vercel: **Add New → Project**, choose the repository, set **Root Directory** to `webapp`.
   `vercel.json` already defines the build command (`npm run build`), the output directory
   (`dist/stockia-webapp/browser`) and the rewrite of every path to `index.html`, so `/app/inventory` can be reloaded.
4. Deploy. Use Node.js 22.22.3+ or 24 in the project settings (Angular 22 requirement).
