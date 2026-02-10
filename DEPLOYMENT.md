# Deployment Guide

This guide explains how to deploy the Colloquy of Mobiles demo gallery to Vercel or GitHub Pages.

## Architecture

The deployment uses a **single-site architecture** with a gallery landing page and multiple demo subdirectories:

```
https://your-site.vercel.app/                  → Gallery (index.html)
https://your-site.vercel.app/demo-TS-01-.../  → Demo 01
https://your-site.vercel.app/demo-TS-02-.../  → Demo 02
...
```

All demos are built into a single `dist/` directory and deployed together.

## Prerequisites

1. **Vercel CLI** (for Vercel deployment):
   ```bash
   npm install -g vercel
   ```

2. **Node.js** (v18 or higher)

3. **Git repository** - Ensure your project is in a Git repository

## Building All Demos

The build script compiles all TypeScript demos:

```bash
npm run build:demos
```

This will:
1. Find all `apps/demo-TS-*` directories
2. Run `npm install` and `npm run build` for each
3. Copy gallery landing page to `dist/`
4. Copy all demo builds to `dist/demo-TS-*/`

**Output structure:**
```
dist/
  index.html          (gallery landing page)
  gallery.css         (gallery styles)
  demo-TS-01-transform-hierarchy/
    index.html
    assets/
      main-[hash].js
      ...
  demo-TS-02-sensor-fov/
    ...
  ...
```

## Deployment to Vercel

### Option 1: Automated Deployment (Recommended)

Use the convenience script:

```bash
npm run deploy
```

This runs `build:demos` and then deploys to Vercel production.

### Option 2: Manual Deployment

1. **Build all demos:**
   ```bash
   npm run build:demos
   ```

2. **Login to Vercel** (first time only):
   ```bash
   vercel login
   ```

3. **Deploy to production:**
   ```bash
   vercel deploy --prod
   ```

4. **Or deploy to preview:**
   ```bash
   vercel deploy
   ```

### Vercel Configuration

The `vercel.json` file is pre-configured with:
- Build command: `npm run build:demos`
- Output directory: `dist`
- Security headers
- Clean URLs (no `.html` extensions)

## Deployment to GitHub Pages

GitHub Pages is a free alternative for static hosting.

### Setup (One-time)

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add script to `package.json`:**
   ```json
   "scripts": {
     "deploy:gh": "npm run build:demos && gh-pages -d dist"
   }
   ```

3. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`

### Deploy

```bash
npm run deploy:gh
```

Your site will be available at:
```
https://yourusername.github.io/repository-name/
```

## Adding New Demos

When you create a new demo:

1. **Follow the template structure:**
   ```
   apps/demo-TS-##-name/
     public/
       index.html
       styles.css
       config.json
     src/
       main.ts
     package.json
     vite.config.ts
   ```

2. **Update gallery page** (`apps/public/index.html`):
   - Add new demo card in appropriate tier
   - Set `href="/demo-TS-##-name/"`
   - Change status from "Coming Soon" to "Available"
   - Remove `disabled` class

3. **Rebuild and deploy:**
   ```bash
   npm run deploy
   ```

The build script automatically discovers all `demo-TS-*` directories and builds them.

## Troubleshooting

### Build Failures

If a demo fails to build:

1. **Test locally first:**
   ```bash
   cd apps/demo-TS-##-name
   npm install
   npm run dev
   ```

2. **Check error messages** - build script shows which demo failed

3. **Common issues:**
   - Missing dependencies: Run `npm install` in demo directory
   - TypeScript errors: Check with `npm run type-check`
   - Wrong paths: Verify imports use relative paths from `lib/`

### Vercel Issues

**"Command not found" errors:**
- Ensure `vercel.json` has correct `buildCommand`
- Verify `scripts/build-all-demos.js` is committed

**Demos not loading:**
- Check `vercel.json` routes configuration
- Verify `dist/` contains demo subdirectories after build
- Check browser console for asset loading errors

**Assets not found:**
- Ensure Vite's `base` in `vite.config.ts` is set to `'/'`
- Check that assets are in `dist/demo-TS-*/assets/`

### GitHub Pages Issues

**404 errors:**
- GitHub Pages needs `base: '/repository-name/'` in `vite.config.ts` for non-root domains
- Update gallery links to include repository name prefix

**Site not updating:**
- Check Actions tab for deployment status
- Clear browser cache (GitHub Pages has aggressive caching)

## Performance Optimization

For production deployments:

1. **Enable compression** in Vercel (automatic)

2. **Optimize assets:**
   - Vite automatically minifies JS/CSS
   - Use compressed textures for THREE.js models
   - Lazy load demos (they're separate routes)

3. **Monitor bundle size:**
   ```bash
   npm run build:demos -- --analyze  # If you add vite-plugin-visualizer
   ```

## Cost Considerations

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited static builds
- Perfect for demo gallery

**GitHub Pages:**
- Free for public repositories
- 100 GB bandwidth/month
- No build limits

Both are more than sufficient for a demo gallery.

## CI/CD (Optional)

### Automatic Deployment on Push

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build:demos
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

Store Vercel tokens in repository secrets:
- Settings → Secrets → Actions → New repository secret

## Exhibition Mode

For museum/exhibition installations:

1. **Full-screen mode:** Add `?fullscreen=true` parameter support

2. **Auto-rotate:** Add gallery slideshow feature

3. **Kiosk mode:** Prevent navigation away from site

4. **Touch-friendly:** Test on touchscreen devices

These features can be added to the gallery landing page as needed.

## Support

For issues with:
- **Build script:** Check `scripts/build-all-demos.js`
- **Vercel config:** See `vercel.json`
- **Demo structure:** Refer to `apps/demo-TS-template/`
- **Gallery design:** Edit `apps/public/index.html` and `gallery.css`

## Links

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Production Guide](https://vitejs.dev/guide/build.html)
