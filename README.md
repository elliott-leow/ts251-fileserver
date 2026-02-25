# NAS File Viewer

A glassmorphism file viewer for QNAP NAS, served through Cloudflare Tunnel.

## Features

- iOS 26-inspired liquid glass UI
- Animated text morphing with torph
- File browsing with preview (images, video, audio, PDF, code)
- Download files or entire folders as ZIP
- Password-protected access
- Smooth animations throughout

## Quick Start (Local Dev)

```bash
npm install
cp .env.example .env  # Edit with your settings
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FILE_SERVER_PASSWORD` | Login password | `admin` |
| `FILE_ROOT` | Directory to serve | `/share/Public` |
| `JWT_SECRET` | Secret for signing auth tokens | `fallback-dev-secret` |
| `PORT` | Server port | `3000` |
| `TUNNEL_TOKEN` | Cloudflare Tunnel token (Docker only) | - |

## Deploy to QNAP NAS

### Prerequisites

- QNAP TS-251+ (or similar) with Container Station installed
- Docker and Docker Compose available via SSH
- A domain with Cloudflare DNS (for tunnel)

### Steps

1. **SSH into your NAS:**
   ```bash
   ssh admin@<nas-ip>
   ```

2. **Clone or copy the project:**
   ```bash
   cd /share/Public
   git clone <your-repo-url> fileserver
   cd fileserver
   ```

3. **Create `.env` file:**
   ```bash
   cat > .env << 'EOF'
   FILE_SERVER_PASSWORD=your-strong-password
   JWT_SECRET=$(openssl rand -hex 32)
   TUNNEL_TOKEN=your-cloudflare-tunnel-token
   EOF
   ```

4. **Set up Cloudflare Tunnel:**
   - Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com)
   - Navigate to Networks > Tunnels
   - Create a new tunnel, choose "Cloudflared" connector
   - Copy the tunnel token
   - Add a public hostname (e.g., `files.yourdomain.com`)
   - Set service to `http://fileserver:3000`
   - Paste the token in your `.env` as `TUNNEL_TOKEN`

5. **Edit `docker-compose.yml` volume mount:**
   Change `/share/Public:/data:ro` to point to the directory you want to serve.

6. **Start the services:**
   ```bash
   docker compose up -d
   ```

7. **Access your files at** `https://files.yourdomain.com`

### Updating

```bash
cd /share/Public/fileserver
git pull
docker compose up -d --build
```

## Tech Stack

- SvelteKit (Node adapter)
- torph (animated text morphing)
- archiver (ZIP streaming)
- Cloudflare Tunnel (secure public access)
