# Cartika Sabrina Khairunisa — Portfolio (React)

A React + Vite rebuild of the Nocturne-styled developer portfolio, ready to publish on GitHub Pages.

## Run locally
```
npm install
npm run dev
```

## Publish on Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Vite — leave the defaults (build command `vite build`, output directory `dist`) and click Deploy.
4. Every push to the main branch redeploys automatically; PRs get their own preview URL.

## Notes
- Swap `public/assets/portrait.jpg` for your own photo (same filename), or update the `src` in `App.jsx`.
- Project photos are drop-in `<div className="photo-slot">` placeholders — replace the placeholder text with an `<img>` once you have real screenshots.
- All styling lives in `src/index.css` as plain CSS custom properties — no build-time CSS framework required.
