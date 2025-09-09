# Dictionary API Backend (Production Setup)

This backend is configured for deployment on a hosting service like Render.

## Environment Variables

To run this application, you will need to set the following environment variables in your hosting provider's dashboard:

| Variable       | Description                                                        | Example Value (Render)             |
| -------------- | ------------------------------------------------------------------ | ---------------------------------- |
| `REDIS_URL`    | The connection string for your Redis instance, provided by Render. | `redis://red-....`                 |
| `FRONTEND_URL` | The full URL of your deployed frontend application (from Vercel).  | `https://your-app-name.vercel.app` |

## Render Configuration

When deploying to Render, use the following settings:

- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

Remember to create a **Persistent Disk** and mount it at `/var/data` to store your `qaamuus.db` file.
