# TS-251+ File Server

A glassmorphic file server built with SvelteKit for the QNAP TS-251+ NAS. Features smooth text morphing animations (torph), JWT authentication, file previews, and Docker deployment.

## Quick Start

```bash
npm install
cp .env.example .env  # Edit with your values
npm run dev
```

Open `http://localhost:5173` and log in with the password from `.env`.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FILE_SERVER_PASSWORD` | Yes | `admin` | Login password |
| `FILE_ROOT` | Yes | — | Absolute path to the directory to serve |
| `JWT_SECRET` | Yes | — | Secret for signing JWT tokens |
| `PORT` | No | `3000` | Server port (production) |
| `DELETE_PASSWORD` | No | — | Separate password for file deletion. If empty, delete works without extra auth |
| `ORIGIN` | No | — | Production origin URL (e.g. `http://192.168.1.103:3000`) |

## Docker Deployment

```bash
docker build -t fileserver .

docker run -d \
  --name fileserver \
  -p 3000:3000 \
  -e FILE_SERVER_PASSWORD=yourpassword \
  -e JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))") \
  -e DELETE_PASSWORD=yoursecretdeletepass \
  -e FILE_ROOT=/data \
  -e ORIGIN=http://your-nas-ip:3000 \
  -v /path/to/files:/data:ro \
  --restart unless-stopped \
  fileserver
```

Remove `:ro` from the volume mount to enable uploads, folder creation, and deletion.

## API Reference

All API endpoints (except login) require authentication via the `auth_token` cookie.

### Authentication

#### `POST /api/auth/login`

Log in and receive a session cookie.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "yourpassword"}' \
  -c cookies.txt
```

**Response:** `{"success": true}` with `Set-Cookie: auth_token=...`

#### `POST /api/auth/logout`

Clear the session cookie.

```bash
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

### File Listing

#### `GET /api/files/:path`

List directory contents. Hidden files (starting with `.`) are filtered out.

```bash
# List root
curl http://localhost:3000/api/files -b cookies.txt

# List subdirectory
curl http://localhost:3000/api/files/Documents/Photos -b cookies.txt
```

**Response:**
```json
{
  "path": "/Documents/Photos",
  "files": [
    {
      "name": "vacation.jpg",
      "path": "/Documents/Photos/vacation.jpg",
      "isDirectory": false,
      "size": 2048576,
      "modified": "2026-02-20T10:30:00.000Z",
      "extension": ".jpg",
      "type": "image"
    }
  ]
}
```

**File types:** `folder`, `image`, `video`, `audio`, `document`, `code`, `archive`, `pdf`, `text`, `other`

### File Download

#### `GET /api/download/:path`

Download a file. Add `?inline` to serve for preview (sets `Content-Disposition: inline`).

```bash
# Download
curl -OJ http://localhost:3000/api/download/Documents/report.pdf -b cookies.txt

# Preview (inline)
curl http://localhost:3000/api/download/Documents/report.pdf?inline -b cookies.txt
```

### Folder Download

#### `GET /api/download-zip/:path`

Download an entire folder as a ZIP archive. Streamed, no temp files.

```bash
curl -o photos.zip http://localhost:3000/api/download-zip/Documents/Photos -b cookies.txt
```

### Upload Files

#### `POST /api/upload/:path`

Upload files via multipart form data. The `:path` is the target directory.

```bash
# Upload to root
curl -X POST http://localhost:3000/api/upload \
  -F "files=@photo.jpg" \
  -F "files=@document.pdf" \
  -b cookies.txt

# Upload to subdirectory
curl -X POST http://localhost:3000/api/upload/Documents \
  -F "files=@report.docx" \
  -b cookies.txt
```

**Response:** `{"uploaded": ["photo.jpg", "document.pdf"], "count": 2}`

### Create Folder

#### `POST /api/mkdir/:path`

Create a new folder inside the given path.

```bash
curl -X POST http://localhost:3000/api/mkdir/Documents \
  -H "Content-Type: application/json" \
  -d '{"name": "New Folder"}' \
  -b cookies.txt
```

**Response:** `{"success": true, "name": "New Folder"}`

### Delete

#### `GET /api/delete-config`

Check if delete operations require a separate password.

```bash
curl http://localhost:3000/api/delete-config -b cookies.txt
```

**Response:** `{"requiresPassword": true}`

#### `DELETE /api/delete/:path`

Delete a file or folder (recursive). If `DELETE_PASSWORD` is set, you must include it in the request body.

```bash
# Without delete password
curl -X DELETE http://localhost:3000/api/delete/Documents/old-file.txt -b cookies.txt

# With delete password
curl -X DELETE http://localhost:3000/api/delete/Documents/old-file.txt \
  -H "Content-Type: application/json" \
  -d '{"deletePassword": "yoursecretdeletepass"}' \
  -b cookies.txt
```

**Response:** `{"success": true}`

**Error (wrong password):** `{"error": "Invalid delete password", "requiresPassword": true}` (403)

## QNAP TS-251+ Notes

The QNAP Docker wrapper has a bug where `-t` flags don't work. Use the real binary directly:

```bash
DOCKER="/share/CACHEDEV1_DATA/.qpkg/container-station/usr/bin/.libs/docker"

$DOCKER build -t fileserver .
$DOCKER run -d --name fileserver \
  -p 3000:3000 \
  -e FILE_SERVER_PASSWORD=1205 \
  -e JWT_SECRET=your-secret \
  -e DELETE_PASSWORD=your-delete-pass \
  -e FILE_ROOT=/data \
  -e ORIGIN=http://192.168.1.103:3000 \
  -v /share/Public:/data:ro \
  --restart unless-stopped \
  fileserver
```

## Tech Stack

- **SvelteKit** with Svelte 5 runes
- **torph** for text morphing animations
- **JWT** authentication with HTTP-only cookies
- **archiver** for streaming ZIP creation
- **Node adapter** for production builds
- **Docker** multi-stage builds
