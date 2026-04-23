
# AquaSense Frontend

This frontend is the React/Vite user interface for the AquaSense project. It includes the main landing page, login page, dashboard, language support, and a simple routing structure.

## What this frontend contains

- `src/app/App.tsx` - application root. It wraps the app with `LanguageProvider` and renders the `RouterProvider`.
- `src/app/routes.ts` - client routing for the main pages.
- `src/app/components/LandingPage.tsx` - landing page with hero content, features, benefits, and navigation to login.
- `src/app/components/LoginPage.tsx` - login page with form state and a mock login flow that navigates to the dashboard.
- `src/app/components/Dashboard.tsx` - main dashboard page with charts, real-time-style data, plant selection, pump controls, and backend integration.
- `src/app/components/AIPage.tsx` - AI decision page showing irrigation predictions, confidence scores, sensor comparisons, and historical trends.
- `src/app/components/HistoryPage.tsx` - data history page with filterable table, multi-line trends chart, export to CSV, and pagination.
- `src/app/components/SettingsPage.tsx` - settings page for configuring plant-specific moisture/temperature thresholds and system intervals.
- `src/app/components/NavBar.tsx` - sticky navigation bar for switching between Dashboard, AI, History, and Settings pages.
- `src/app/contexts/LanguageContext.tsx` - language context provider used by pages for translated text.
- `assets/` - contains static assets such as `logo.png` used throughout the UI.
- `src/app/components/ui/` - shared UI utilities and components used across the app.

## Pages and routing

The app currently has six main pages:

- `/` → `LandingPage`
- `/login` → `LoginPage`
- `/dashboard` → `Dashboard`
- `/ai` → `AIPage`
- `/history` → `HistoryPage`
- `/settings` → `SettingsPage`

Routing is defined in `src/app/routes.ts` using React Router. Navigation between authenticated pages is handled by `NavBar.tsx`.

## Backend integration

The dashboard connects to the backend API at these endpoints:

- `http://localhost:8000/readings/latest`
- `http://localhost:8000/get-plant`
- `http://localhost:8000/set-plant`
- `http://localhost:8000/pump-control`

These endpoints are used to fetch sensor readings, plant type, and to send pump control commands.

## Tech stack

- Vite + React
- React Router
- Tailwind CSS
- Radix UI / shadcn-style components
- `lucide-react` icons
- `recharts` for charts
- `react-hook-form` and other UI helpers

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Visit the app in your browser (typically `http://localhost:5173`).

## Notes

- Login is currently mocked; it only checks that email and password are present and then navigates to the dashboard.
- The dashboard uses mock chart data for graphs and also fetches live values from the backend when available.
- `LanguageSwitcher` is available on pages so users can change language text via `LanguageContext`.
  