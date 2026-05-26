# Health Manager

Full-stack personal health manager with account registration, login, and server-side health data persistence.

🌐 **Live Demo:** https://civic-connect-lilac.vercel.app  

## Run Locally

Create a `.env` file or export these variables before starting the API:

```bash
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/"
MONGODB_DB="health-manager"
AUTH_SECRET="use-a-long-random-secret"
```

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
- Health data is stored in the MongoDB `users` collection.
- The server requires `MONGODB_URI` and will not fall back to local file storage.

For deployment, use MongoDB Atlas or another remotely hosted MongoDB instance and set a strong `AUTH_SECRET` so existing tokens remain secure and stable across restarts.
