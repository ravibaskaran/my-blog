# Update Maintenance

This repo has three update paths:

1. Renovate opens dependency pull requests.
2. GitHub Actions validates the web build and Sanity Studio build.
3. The AstroPaper upstream monitor opens an issue when the source theme changes.

## Dependency Updates

Renovate is configured in `renovate.json`.

- Patch updates can automerge after CI passes.
- Major updates require approval from the Renovate dependency dashboard.
- Astro, Sanity, Tailwind, Vite, and GitHub Actions updates are grouped for easier review.
- Lockfile maintenance runs weekly.

If Renovate does not open pull requests, install or enable the Renovate GitHub app for this repository.

## CI Checks

The main CI workflow is `.github/workflows/ci.yml`.

It runs on pull requests, pushes to `main`, manual dispatches, and reusable workflow calls. It checks:

- Root Astro build with Node `22.16.0` and npm `10.9.2`, matching Cloudflare Pages.
- Formatting with `npm run format:check`.
- Sanity Studio build with pnpm `10.11.1`.

## AstroPaper Upstream Review

The monitor workflow is `.github/workflows/astropaper-upstream-monitor.yml`.

It checks the `satnaing/astro-paper` `main` branch quarterly. When upstream has changed since `.github/astropaper-upstream-baseline`, it opens one GitHub issue with a compare link and review checklist.

Do not blindly merge AstroPaper upstream into this repo. This blog now has custom branding, Sanity integration, and deployment behavior. Review upstream changes and port only the parts that still apply.

After completing an upstream review:

1. Run `npm run format:check`.
2. Run `npm run build`.
3. Build Sanity Studio from `sanity-studio`.
4. Update `.github/astropaper-upstream-baseline` to the reviewed upstream SHA.
5. Commit the changes.
