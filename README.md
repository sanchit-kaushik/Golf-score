# DIGITAL HEROES

> Play for more than the score. A subscription-based platform combining golf performance tracking, monthly draw-based rewards, and certified charity contributions.

---

## Architecture Overview

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router.
* **Backend**: Node.js, Express.js, TypeScript.
* **Database**: MongoDB Atlas via Mongoose.
* **Authentication**: Strict Email + Password authentication, bcrypt password hashing, and JWT tokens (transmitted via secure HTTP-only cookies and Authorization headers).
* **Payment**: Razorpay (scheduled for Part 12; currently supports Demo Access).

---

## Local Development Ports

* **Frontend**: `http://localhost:5174` (Port 5173 is occupied; Vite is configured to use port 5174 with automatic fallback).
* **Backend API**: `http://localhost:5001` (Port 5000 is occupied; backend runs on port 5001).

---

## Getting Started & Installation

### 1. Install Dependencies

Install root frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd server
npm install
cd ..
```

---

## Environment Configuration

### Client Environment (`.env`)
In the root directory, create a `.env` file (or copy from `.env.example`):
```env
VITE_API_URL=http://localhost:5001
```

### Server Environment (`server/.env`)
In the `server/` directory, create a `.env` file (or copy from `server/.env.example`):
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/digital-heroes?retryWrites=true&w=majority
JWT_SECRET=digital_heroes_jwt_super_secret_key_development_2026
CLIENT_URL=http://localhost:5174
NODE_ENV=development
```

> **Note on MongoDB Credentials**:
> If `MONGODB_URI` is not set, the server logs an informative setup guide on startup. The server features a resilient in-memory repository fallback for immediate local testing without crashing. Once your MongoDB Atlas connection string is added to `server/.env`, it connects directly to Atlas.

---

## Running the Application

### Start Backend Server
```bash
cd server
npm run dev
```
The backend starts at `http://localhost:5001`.

### Start Frontend Client
```bash
npm run dev
```
The client starts at `http://localhost:5174`.

### Production Build
To verify TypeScript compilation and production bundles:
```bash
# Frontend build
npm run build

# Backend build
cd server
npm run build
```

---

## Authentication & Membership API

### `POST /api/auth/register`
* **Access**: Public
* **Payload**: `{ "fullName": "string", "email": "string", "password": "string", "membershipPlan": "monthly" | "yearly" }`
* **Validation**: Full name required, valid email format, minimum 8 characters password, unique email.
* **Behavior**: Hashes password via `bcrypt.hash(password, 12)`, sets `membershipStatus = "none"`, issues JWT, and automatically authenticates user.

### `POST /api/auth/login`
* **Access**: Public
* **Payload**: `{ "email": "string", "password": "string" }`
* **Behavior**: Validates credentials against bcrypt hash, sets HTTP-only cookie, and returns safe user profile without `passwordHash`.

### `GET /api/auth/me`
* **Access**: Protected (`requireAuth`)
* **Behavior**: Verifies JWT cookie or `Bearer` token header, returning the authenticated user document.

### `POST /api/auth/logout`
* **Access**: Public
* **Behavior**: Clears session cookie and invalidates client session.

### `POST /api/membership/demo`
* **Access**: Protected (`requireAuth`)
* **Payload**: `{ "plan": "monthly" | "yearly" }`
* **Behavior**: Updates the authenticated user record in MongoDB to `membershipStatus = "active"`, `membershipMode = "demo"`, and saves the selected plan.

### `GET /api/membership/status`
* **Access**: Protected (`requireAuth`)
* **Behavior**: Returns current subscription and draw eligibility status.

---

## Account Created vs. Membership Active

Digital Heroes maintains a strict separation between account registration and paid membership:
1. **Account Created (`membershipStatus = "none"`, `membershipMode = "none"`)**:
   * User registers or logs in.
   * Accessing `/dashboard` renders the **New / Non-Member Dashboard** displaying an activation CTA and feature preview.
2. **Membership Active (`membershipStatus = "active"`, `membershipMode = "demo" | "real"`)**:
   * Activated upon completing Razorpay verification or clicking **Demo Access** on `/join/payment`.
   * Accessing `/dashboard` renders the **Active Member Dashboard** with golf score tracking, 5-number draw tickets, and charity contributions.
   * When `membershipMode === "demo"`, a distinct `DEMO MEMBERSHIP` badge is displayed in the header.

---

## Demo Membership Testing Flow

1. Navigate to `http://localhost:5174`.
2. Click **JOIN THE CLUB** $\rightarrow$ select **Annual Membership** $\rightarrow$ click **CONTINUE TO ACCOUNT**.
3. Fill in name, email, password $\rightarrow$ click **CREATE ACCOUNT**.
4. You are automatically logged in $\rightarrow$ continue through Charity to **Payment Method**.
5. Click **ENTER DEMO** on the Demo Access card.
6. The backend updates the user's MongoDB record to `membershipStatus = 'active'`, `membershipMode = 'demo'`.
7. Enter the **Active Member Dashboard** $\rightarrow$ verify your profile, draw ticket, and log Stableford scores.
8. Refresh browser $\rightarrow$ session and active demo status remain completely intact.
9. Click Logout $\rightarrow$ protected dashboard redirects to login.
10. Sign back in with your email and password $\rightarrow$ MongoDB restores your active member dashboard with the `DEMO MEMBERSHIP` badge.
