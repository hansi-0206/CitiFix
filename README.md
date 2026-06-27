# CitiFix – AI-Powered Community Issue Detection & Resolution Platform

CitiFix is a MERN-stack (MongoDB, Express.js, React, Node.js) web application designed to empower local citizens to report, track, and support civic issues. Integrating Leaflet OpenStreetMap, Cloudinary, and Google Gemini AI, the platform auto-categorizes complaints, calculates priority indexes, identifies duplicate reports in proximity, and rewards users via a reputation points system.

---

## 📁 Repository Structure

```text
CitiFix/
├── frontend/             # React + Vite Client (Leaflet, Tailwind, Axios)
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js    # Axios client & MERN API calls
│   │   └── context/
│   │       └── AppContext.jsx # Global MERN session & state synchronizer
│   └── package.json
├── backend/              # Node.js + Express.js Server
│   ├── config/           # Database & Cloudinary keys setup
│   ├── controllers/      # Route actions (Auth, Issues, Duplicates)
│   ├── middleware/       # JWT verifier & Multer uploader
│   ├── models/           # Mongoose schemas (User, Issue)
│   ├── routes/           # Routing middleware maps
│   ├── services/         # Gemini AI photo base64 analysis
│   ├── server.js         # Entrypoint
│   └── package.json
├── package.json          # Root Concurrently Runner
└── README.md             # This document
```

---

## 🛠️ Environment Variables Configuration

Create a `.env` file in the `backend/` directory using the following keys:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/citifix?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_signing_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Setup & Launch Instructions

### Local Execution (Concurrently)

1. **Install Root and Workspace Dependencies**:
   From the project root folder:
   ```bash
   npm run install-all
   ```
2. **Launch Both Servers in Dev Mode**:
   From the project root folder:
   ```bash
   npm run dev
   ```
   This will concurrently boot:
   - Backend Express API Server on [http://localhost:5000](http://localhost:5000)
   - Frontend React client on [http://localhost:5173](http://localhost:5173)

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)

#### 1. Register User
- **Endpoint**: `POST /api/auth/register`
- **Body**: `{ "name": "John Doe", "email": "john@citifix.org", "password": "securepassword" }`
- **Response**: Registers user, awards 10 points (Civic Contributor), returns signed JWT.

#### 2. Login User
- **Endpoint**: `POST /api/auth/login`
- **Body**: `{ "email": "john@citifix.org", "password": "securepassword" }`
- **Response**: Returns validated user details + signed JWT token.

#### 3. User Profile
- **Endpoint**: `GET /api/auth/profile`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response**: Returns authenticated profile fields.

---

### Issues & Mapping (`/api/issues`)

#### 1. Create Civic Ticket
- **Endpoint**: `POST /api/issues`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**: `Multipart/form-data` containing:
  - `image`: File buffer
  - `description`: Text details of the incident
  - `category`: Base category
  - `latitude` & `longitude`: Geolocation coords
  - `address`: Street name
  - `bypassDuplicateCheck`: `"true"` | `"false"`
- **Response**: Auto-detects duplicates, runs Gemini AI classification on details, uploads to Cloudinary, awards +20 points, and returns the issue.

#### 2. Check for Proximity Duplicates
- **Endpoint**: `POST /api/issues/check-duplicate`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**: `{ "latitude": 12.9718, "longitude": 77.5948, "category": "Road Damage" }`
- **Response**: Returns duplicate matches within 100 meters.

#### 3. List Issues
- **Endpoint**: `GET /api/issues`
- **Params**: `category`, `severity`, `status`, `search`
- **Response**: Array of matches populated with reporter info.

#### 4. Get Incident by ID
- **Endpoint**: `GET /api/issues/:id`
- **Response**: Complete database fields for the matching document ID.

#### 5. Update Status Timeline
- **Endpoint**: `PATCH /api/issues/:id/status`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**: `{ "status": "In Progress" | "Resolved" }`
- **Response**: Updates ticket. Resolving awards +30 points to original reporter.

#### 6. Upvote Ticket
- **Endpoint**: `POST /api/issues/:id/upvote`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response**: Enforces one vote per account. Awards +5 points to original reporter.

#### 7. Nearby Geospatial Queries
- **Endpoint**: `GET /api/issues/nearby`
- **Params**: `lat`, `lng`, `radius` (in meters)
- **Response**: Returns issues sorted by distance, powering the Nearby Issues widgets.

---

## ☁️ Deployment Guidelines

### 1. MongoDB Atlas Setup
- Create a Cluster on Atlas.
- In **Network Access**, allow IP `0.0.0.0/0` (or configure specific static server IPs).
- Create a database user, retrieve the connection URL string, and set it in MONGODB_URI.

### 2. Cloudinary Setup
- Sign up for a Cloudinary account.
- Copy your Cloud Name, API Key, and API Secret from the Console Dashboard and paste them into your environment variables.

### 3. Vercel (Frontend Deployment)
- Create a Vercel project linked to `/frontend`.
- Vercel automatically detects the Vite config.
- Set environment variables: `VITE_API_URL` to your Render API server URL.

### 4. Render (Backend Deployment)
- Create a Web Service on Render linked to your repository.
- Set root directory to `backend/` and start command to `node server.js`.
- Add all variables listed in the backend `.env` file under **Environment**.
