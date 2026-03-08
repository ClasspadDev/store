# Classpad Store

> Web-based frontend and CMS for Casio Classpad II apps.

## Run locally (with Bun)

- Install [Bun](https://bun.sh) (fast JavaScript runtime).
- Install dependencies: `bun install`
- Start development server: `bun run dev`
- Open `http://localhost:5173/store/`

## Use the local CMS (Easy way)

- Start the local dev server (`bun run dev`).
- Open `http://localhost:5173/store/admin/index.html` in your browser.
- Use the visual editor (Sveltia CMS) to easily add or edit apps without writing code.

## Add your app (Manual way)

- **Hollyhock apps** (`.hh3`) go in the `apps/` folder.
- **Python apps** (`.py`) go in the `python/` folder.
- Create a new `.yml` file (e.g., `apps/my-app.yml`).
- Add the required metadata:

```yaml
id: 99
slug: my-app
name: "My App Name"
author: "Your Name"
description: "A short one-liner description."
image: "https://classpaddev.github.io/store/images/my-app/cover.png"
downloadUrl: "https://github.com/..."
detailsUrl: "https://github.com/..."
format: ".hh3" # Use .py for python apps
tags:
  - Utility
```

- Save the file. The app will automatically appear on the store!

## Build for Production

- Run `bun run build`.
- The static HTML/CSS/JS files will be generated inside the `build/` folder, ready to be hosted anywhere.
