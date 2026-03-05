# Open-Deutsch
An open-source interactive website for beginners German studying.

## Database Reference
See [DATABASE_REFERENCE.md](file:///Users/leolong/Documents/trae_projects/Open-Deutsch/DATABASE_REFERENCE.md) for GPS-Homepage schema context, Open-Deutsch usage, and future constraints.

## GitHub Pages Deployment (Manual gh-pages)
Custom domain: opendeutsch.geeksproductionstudio.com

1. Install deps and build

```bash
npm install
npm run build
```

2. Deploy to gh-pages branch

```bash
npm run deploy
```

3. Ensure DNS points to GitHub Pages
- Add a CNAME record: `opendeutsch.geeksproductionstudio.com` → `<your-github-username>.github.io`

The `public/CNAME` file is included so the custom domain is preserved on each deploy.
