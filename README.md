# ⭐ StoreRater - Full-Stack Store Rating & Merchant Platform

StoreRater is a production-ready, full-stack web application designed for transparent store reviews and merchant management. It implements Role-Based Access Control (RBAC) across three distinct user roles: **System Administrator**, **Normal Shopper**, and **Store Owner**, backed by an Express/Node.js REST API, PostgreSQL on Supabase, and a responsive React (Vite) frontend.

---

## 🚀 How to Start the Application

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` package manager

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm start
```
* The backend API server starts at: **`http://localhost:5000`**
* Environment variables are pre-configured in `backend/.env` with Supabase credentials and JWT secrets. An environment template is provided at `backend/.env.example`.

### 2. Start the Frontend Client
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
* The Vite development server launches at: **`http://localhost:5173`**

---

## 🔑 Demo Accounts & Credentials

All test accounts across all roles use the standardized password: **`Password@123`**

| Role | Email Address | Password | Persona & Focus Area |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@roxiler.com` | `Password@123` | Platform oversight, user directory, store directory, audit trail |
| **Store Owner** | `gurvinder.singh@hardwaredepot.in` | `Password@123` | *Bajrang Hardware & Asian Paints Depot* • Verified GSTIN `07AAAFB5566G1Z8` |
| **Store Owner** | `rajesh.store@example.com` | `Password@123` | *Sharma Supermarket & General Store* • Live store owner dashboard |
| **Normal Shopper** | `ananya.cs.nair@gmail.com` | `Password@123` | Browse unrated stores, submit ratings & feedback, "My Reviews" section |
| **Normal Shopper** | `rohitashva.kulkarni@gmail.com` | `Password@123` | Store catalog search, filter by location, rating modifications |

---

## 👥 Role Features & Workflows

### 1. 🛡️ System Administrator
- **Dashboard Counters**: Live metrics on total registered users, stores, and ratings submitted.
- **User & Store Directory**: Real-time search, multi-column sorting (Name, Email, Role, Created Date), and full-row click navigation.
- **Onboarding Controls**: Add new users or registered stores with role-specific form validations.
- **Full Audit Inspection**: Direct access to user activity breakdowns and merchant ratings.

### 2. 👤 Normal Shopper
- **Smart Store Feed**: Browse registered stores that haven't been rated yet; newly registered stores display a `New Store` status badge.
- **Authentic 1–5 Star Ratings**: Submit star ratings along with optional qualitative feedback.
- **Dedicated "My Reviews" Section**: Once rated, stores move to the user's personal review hub where ratings can be edited or deleted anytime.
- **Search & Discovery**: Filter stores dynamically by commercial name or physical address.

### 3. 🏪 Store Owner
- **Live Business Dashboard**: Real-time average rating score (out of 5.0), total review count, and full list of customer feedback.
- **Verified GSTIN Identification**: Mandatory 15-character Goods and Services Tax Identification Number validation (e.g. `07AAAFB5566G1Z8`) attached to the store profile.
- **"My Account" Portal**: Inspect personal identity and registered commercial store details (Store Name, GSTIN, Store Email, Physical Location, and Member Since date) with self-service update capability.

---

## 🔒 Form Validations & Security Rules

- **Full Name**: 20 to 60 characters.
- **Address**: 20 to 400 characters (both residential and store locations).
- **Password Complexity**: 8 to 16 characters with at least one uppercase letter (`A-Z`) and one special character (`!@#$%^&*...`).
- **Email Validation**: Case-insensitive RFC format matching with periods/dots fully preserved.
- **GSTIN Number**: Standard 15-character alphanumeric tax format strictly enforced for Store Owner registrations.
- **Password Security**: Passwords hashed with `bcryptjs` using 12 salt rounds.
- **JWT Protection**: Tokens issued with short expiration and verified by server-side route middleware.

---

## 📂 Project Architecture

```
Roxiler/
├── backend/
│   ├── config/supabase.js          # Supabase client connection
│   ├── controllers/                # Auth, user, store, rating & dashboard controllers
│   ├── database/                   # Schema migrations & seed scripts
│   ├── middleware/                 # JWT auth guards & express-validator rules
│   ├── routes/                     # REST API route endpoints
│   ├── .env.example                # Sample environment template
│   └── server.js                   # Express server entry point
│
└── frontend/
    ├── src/
    │   ├── api/axios.js            # Axios client with auth interceptors
    │   ├── components/             # Navbar, BrandLogo, RatingStars, PasswordModal, Icons
    │   ├── context/AuthContext.jsx # Global user authentication state
    │   ├── pages/
    │   │   ├── Login.jsx           # User sign-in
    │   │   ├── Signup.jsx          # User & store owner registration
    │   │   ├── MyAccount.jsx       # Personal profile & commercial GSTIN management
    │   │   ├── admin/              # Admin dashboard, user/store management, detail pages
    │   │   ├── user/               # Shopper store feed & My Reviews page
    │   │   └── store-owner/        # Store owner dashboard & audit breakdown
    │   ├── index.css               # Design system & responsive styles
    │   └── App.jsx                 # Application route definitions
    ├── index.html
    └── package.json
```
