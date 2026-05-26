# Health Manager

Full-stack personal health manager with account registration, login, and server-side health data persistence.

## Run Locally

Start the API server:

```bash
npm run dev:api
```

In another terminal, start the Vite app:

```bash
npm run dev
```

Open the Vite URL shown in the terminal. API requests are proxied to `http://localhost:4173`.

## Production Build

```bash
npm run build
npm run start
```

The production server serves both the built React app and the API at `http://localhost:4173`.

## Accounts And Data

- Users can register with name, email, and password.
- A demo account is seeded automatically: `demo@healthos.test` / `password123`.
- Passwords are hashed with Node's built-in `scrypt`.
- Auth uses signed bearer tokens stored in the browser.
- Health data is stored on the server in `data/db.json`.
- `data/*.json` is ignored by git so real user records are not committed.

For deployment, set a strong `AUTH_SECRET` environment variable so existing tokens remain secure and stable across restarts.
