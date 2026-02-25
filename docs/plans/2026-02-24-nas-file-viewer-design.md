# NAS File Viewer - Design Document

## Overview

A glassmorphism file viewer for a QNAP TS-251+ NAS (8GB RAM, Intel Celeron J1900). Served publicly through a Cloudflare tunnel with password authentication. Uses torph for animated text morphing throughout the UI. Prioritizes smooth animations and an iOS 26 "liquid glass" aesthetic.

## Stack

- **Framework**: SvelteKit (full-stack, single process)
- **Text animation**: torph/svelte (TextMorph component)
- **Styling**: Plain CSS (backdrop-filter, animations, transitions)
- **Auth**: Password gate via env var, bcrypt hash, JWT cookie
- **Zip**: archiver package for folder downloads
- **Runtime**: Node.js on the NAS

## Architecture

```
[Browser] -> [Cloudflare Tunnel] -> [SvelteKit on NAS :3000]
                                        |-- /api/files/* (directory listing, metadata)
                                        |-- /api/download/* (file serving)
                                        |-- /api/download-zip/* (folder zip download)
                                        |-- /api/auth (login/logout)
                                        |-- /* (SvelteKit pages)
```

## Auth

- Single shared password set via `FILE_SERVER_PASSWORD` env var
- Hashed with bcrypt on first comparison
- Login returns a signed JWT in an HTTP-only cookie
- All `/api/*` and page routes check the cookie (server hooks)
- Login page: centered glass card, animated gradient background, torph title

## File Browsing

- `FILE_ROOT` env var configures the served directory (default: `/share/Public`)
- Server routes read the filesystem, return JSON (name, size, modified, type, isDirectory)
- Path traversal protection (resolve + startsWith check)
- Breadcrumb navigation with torph morphing the current path segment
- Grid/list view toggle
- Click folders to navigate, click files to preview or download
- Download button on files, "Download as ZIP" button on folders

## Zip Download

- Server-side streaming zip using the `archiver` package
- Recursively adds folder contents
- Streams directly to the response (no temp files)
- Content-Disposition header for proper filename

## Animations

| Element              | Animation                                      |
|----------------------|------------------------------------------------|
| Page title/breadcrumbs | Torph text morphing on navigation            |
| File list items      | Staggered fade + slide-up on directory change  |
| File/folder cards    | Scale + opacity hover with spring easing       |
| Panel backgrounds    | CSS backdrop-filter blur + animated gradient   |
| Navigation           | SvelteKit page transitions (crossfade + slide) |
| Loading states       | Skeleton shimmer with glass effect             |
| Login page           | Floating orbs animated gradient background     |
| Breadcrumb segments  | Slide + morph as path changes                  |
| Context menus        | Scale from origin with spring physics          |
| Toasts               | Slide-in + blur entrance                       |

## Visual Style (iOS 26 Liquid Glass)

- **Background**: animated gradient mesh (soft purples, blues, pinks)
- **Panels**: `rgba(255,255,255,0.12)`, `backdrop-filter: blur(40px) saturate(180%)`, 1px white border at ~15% opacity
- **Cards**: layered glass with varying blur for depth
- **Typography**: Inter font, torph on all dynamic text
- **Shadows**: soft, diffused, colored
- **Corners**: 16-20px border-radius

## File Preview

- **Images**: lightbox with glass overlay
- **Video**: HTML5 player with glass controls
- **Audio**: minimal player with glass UI
- **Text/code**: syntax-highlighted in glass panel
- **PDF**: embedded viewer
- **Other**: download prompt with file info card

## Pages

1. **Login** - glass card, animated orb background, torph title
2. **Browser** - breadcrumbs + file grid/list, glass panels
3. **Preview** - glass overlay modal for inline preview

## Environment Variables

```
FILE_SERVER_PASSWORD=<password>
FILE_ROOT=/share/Public
PORT=3000
JWT_SECRET=<random-secret>
```

## Cloudflare Tunnel

- Install cloudflared on the NAS
- `cloudflared tunnel create nas-files`
- Point tunnel to `http://localhost:3000`
- Tunnel handles HTTPS
