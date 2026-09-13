# Lenspect

**AI-Powered Legal Metrology Compliance Inspection, Evidence Verification & Enforcement Platform**

Lenspect is an end-to-end digital enforcement system built for the Department of Consumer Affairs / Legal Metrology Organization (India). It equips field inspectors and supervisory officers with AI-assisted tools to inspect packaged commodities, detect statutory violations, generate legally admissible evidence, and issue show-cause notices — backed by a live compliance analytics dashboard.

---

## Table of Contents

1. [Overview](#overview)
2. [Regulatory Compliance](#regulatory-compliance)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Data Models](#data-models)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [Analytics](#analytics)
9. [Project Structure](#project-structure)
10. [Roadmap](#roadmap)

---

## Overview

Lenspect automates the inspection lifecycle for packaged commodities:

1. A field inspector captures label photographs via the mobile app.
2. The Vision Service extracts label data using OCR and computer vision, then validates it against statutory rules.
3. Each inspection is cryptographically certified as tamper-evident electronic evidence (Section 63, BSA 2023).
4. Supervisors review flagged inspections, visualize violation hotspots, and issue show-cause notices directly from the dashboard.

---

## Regulatory Compliance

Lenspect enforces declarations mandated under the **Legal Metrology Act, 2009**, the **Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules)**, and electronic evidence provisions under the **Bharatiya Sakshya Adhiniyam, 2023 (BSA)**.

| Provision | Requirement |
|---|---|
| Rule 6(1)(a) | Manufacturer / Packer / Importer name & complete address |
| Rule 6(1)(b) | Generic or common commodity name |
| Rule 6(1)(c) | Net quantity with standard metric units |
| Rule 6(1)(d) | Month and year of manufacture, packing, or import |
| Rule 6(1)(e) | Maximum Retail Price (MRP) inclusive of all taxes |
| Rule 6(11) | E-commerce digital declarations and mandatory QR codes |
| Rule 9 | Principal display panel font size, numeral height, and prominent placement |
| Section 36 | Penalties for altered/tampered price stickers and dual labeling |
| Section 63 (BSA) | Cryptographic electronic evidence certification (SHA-256 image hashes, NTP timestamps, tamper-evident audit trail) |

---

## Architecture

```
┌────────────────────────────────┐       ┌────────────────────────────────┐
│   Field Mobile App (Expo)      │       │ Supervisor Dashboard (Vite)   │
│   Port: 8081                   │       │ Port: 5173                     │
│   exp://<LAN_IP>:8081          │       │ http://localhost:5173          │
└───────────────┬────────────────┘       └───────────────┬────────────────┘
                │                                        │
                ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    LMPC Backend Server (Node.js/Express)                │
│                    Port: 3000 | http://localhost:3000                   │
│  - JWT & RBAC Auth (Admin & Inspector)                                  │
│  - PDFKit Multi-Page Show-Cause Notice Generator                        │
│  - Cloudinary Media & Raw PDF Storage                                   │
│  - Redis BullMQ Asynchronous Inspection Queues                          │
│  - MongoDB Atlas (LENSPECT DB) ODM                                      │
└──────────────────┬──────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Vision Service (Python FastAPI)                      │
│                    Port: 8000 | http://127.0.0.1:8000                   │
│  - Tesseract OCR + PyTorch computer vision label parsing                │
│  - Gemini / Ollama / RegEx statutory rule verification                  │
│  - Section 63 BSA evidence hash generator                               │
└─────────────────────────────────────────────────────────────────────────┘
```

The mobile app and dashboard both talk to a single Node.js/Express backend, which owns authentication, data persistence, notice generation, and job queueing. Compute-heavy AI work (OCR, label parsing, rule verification, evidence hashing) is delegated to a dedicated Python FastAPI vision service.

---

## Tech Stack

| Component | Stack | Port | Responsibility |
|---|---|---|---|
| **LMPC Backend** | Node.js, Express (ESM), Mongoose, Redis (BullMQ), Cloudinary, PDFKit | `3000` | Core API, auth, notices, analytics, job queues |
| **Vision Service** | Python 3.11+, FastAPI, Uvicorn, Tesseract OCR, PyTorch | `8000` | OCR, label parsing, rule validation, evidence hashing |
| **Supervisor Dashboard** | React 18, Vite, React-Leaflet, Axios, Lucide Icons | `5173` | Surveillance, analytics, notice issuance |
| **Field Mobile App** | React Native, Expo SDK, React Navigation, Axios | `8081` | On-site inspection capture and upload |

**Database:** MongoDB Atlas (`LENSPECT` database)

---

## Data Models

### `User`
| Field | Description |
|---|---|
| `username`, `email`, `fullName` | Identity fields |
| `role` | `ADMIN` (supervisor) or `INSPECTOR` (field officer) |
| `password` | bcrypt-hashed |
| `refreshToken` | Session refresh token |

### `Inspection`
| Field | Description |
|---|---|
| `inspector` | Reference to `User` |
| `imageUrl`, `cloudinaryPublicId`, `multiImages` | Captured panel images |
| `location` | GeoJSON Point `[longitude, latitude]` with `pincode`, `region`, `city` (2dsphere indexed) |
| `complianceStatus` | `COMPLIANT` \| `NON_COMPLIANT` \| `NEEDS_REVIEW` |
| `violations` | Array of `{ rule, description }` |
| `extractedData` | `{ mrp_val, unit_symbol, net_quantity, mfg_date, country_origin, manufacturer_name, commodity_name }` |
| `bsaCertificate` | Section 63 BSA certificate: `{ sha256Hash, imageHashes, networkTimestamp, gps, aiResultSnapshot }` |

### `Notice`
| Field | Description |
|---|---|
| `noticeNumber` | Unique notice identifier |
| `inspection`, `issuedBy` | References to `Inspection` and `User` |
| `pdfUrl` | Cloudinary raw PDF resource |
| `violations` | Snapshot of violations at time of issuance |
| `status` | `DRAFT` \| `ISSUED` \| `CANCELLED` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas cluster
- Redis instance
- Cloudinary account
- Tesseract OCR installed locally

### 1. Vision Service

```bash
cd Lenspect/vision_service
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> On Windows, ensure Tesseract is on `PATH` and `TESSDATA_PREFIX` points to its `tessdata` directory.

### 2. Backend API

```bash
cd Lenspect/lmpc-backend
npm install
npm start
```

### 3. Supervisor Dashboard

```bash
cd Lenspect/legal-metrology-dashboard
npm install
npm run dev
# http://localhost:5173
```

### 4. Field Mobile App

```bash
cd Lenspect/lenspect-mobile
npm install
npx expo start --go
# exp://<LAN_IP>:8081
```

> The mobile app must reach the backend over the same LAN; point its API base URL at your machine's LAN IP rather than `localhost`.

---

## Environment Variables

### `lmpc-backend/.env`

```
PORT=3000
MONGODB_URI=<mongodb-atlas-connection-string>
CORS_ORIGIN=*
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
REDIS_HOST=<redis-host>
REDIS_PORT=<redis-port>
REDIS_PASSWORD=<redis-password>
FASTAPI_SERVICE_URL=http://127.0.0.1:8000
```

### `legal-metrology-dashboard/.env`

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Vision Service (shell environment, Windows)

```
PATH=%PATH%;C:\Program Files\Tesseract-OCR
TESSDATA_PREFIX=C:\Program Files\Tesseract-OCR\tessdata
```

---

## Analytics

The supervisor dashboard surfaces live compliance metrics computed directly from the `Inspection` collection:

- **Compliance breakdown** — compliant / non-compliant / under-review counts and overall compliance rate
- **Violation frequency** — ranked statutory rule violations across all inspections
- **Compliance trend** — rolling trend of inspection outcomes over time
- **Violation hotspots** — geographic clustering of non-compliant inspections on an interactive map

All analytics are derived from real inspection records; no synthetic or placeholder data is used in production views.

---

## Project Structure

```
Lenspect/
├── lmpc-backend/                    # Node.js/Express API (port 3000)
│   ├── src/
│   │   ├── models/                  # user.model.js, inspection.model.js, notice.model.js
│   │   ├── controllers/             # analytics, notices, inspections, auth
│   │   ├── services/                # pdfGenerator.service.js, ...
│   │   ├── app.js                   # Express app & middleware
│   │   └── server.js                # Entry point
│   └── .env
├── vision_service/                  # Python FastAPI (port 8000)
│   ├── main.py
│   └── ...                          # OCR, CV, and rule-verification modules
├── legal-metrology-dashboard/       # React/Vite supervisor portal (port 5173)
│   ├── src/
│   │   ├── pages/
│   │   └── components/
│   └── .env
└── lenspect-mobile/                 # React Native/Expo field app (port 8081)
    └── ...
```

---

## Roadmap

- Harden CORS policy for production deployment
- Containerize the Vision Service to remove OS-specific Tesseract dependencies
- Add independent verification tooling for BSA evidence certificates
- Expand rule coverage for e-commerce declarations under Rule 6(11)

---
## License

Proprietary — developed for the Department of Consumer Affairs / Legal Metrology Organization (India). Not licensed for external distribution.
