# Production release setup

The GitHub workflow deploys only after lint, unit tests, the Chromium E2E smoke test, and a production build pass on `main`.

Set these GitHub Actions **Variables** before the first deployment: `FIREBASE_PROJECT_ID`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, and optionally `VITE_MONITORING_ENDPOINT`. These are browser-visible configuration values; do not place server secrets in them.

Set `FIREBASE_SERVICE_ACCOUNT_DAYSPARK` as a GitHub Actions **Secret** containing the Firebase service-account JSON. The deploy job is skipped until `FIREBASE_PROJECT_ID` is configured.

Firebase Auth domain authorization requires Firebase-console privileges and cannot be performed from the web client. Before deployment, add `YOUR_PROJECT_ID.web.app`, `YOUR_PROJECT_ID.firebaseapp.com`, and the final custom production domain under **Firebase Console → Authentication → Settings → Authorized domains**.

`firebase.json` rewrites all non-asset routes to `/index.html`, enabling SPA deep links on Firebase Hosting.
