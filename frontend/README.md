# PrintEase Frontend

## Environment

Create a `.env` file in this folder when you want the frontend to call a backend running on a different origin.

Example:

```env
VITE_API_URL=http://127.0.0.1:5000
```

If `VITE_API_URL` is not set, the app falls back to same-origin requests through `/api` and `/uploads`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
