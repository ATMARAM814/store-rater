# ⭐ StoreRater - FullStack Store Rating Platform

A full-stack web application built for the **FullStack Intern Coding Challenge**. It allows users to register, browse registered stores, submit and update ratings (1-5 stars), while providing tailored dashboards for **System Administrators**, **Normal Users**, and **Store Owners**.

---

## 🛠 Tech Stack

- **Backend**: Express.js, Node.js, JWT, bcryptjs, express-validator
- **Database**: PostgreSQL hosted on Supabase (accessed via `@supabase/supabase-js`)
- **Frontend**: React.js (Vite), React Router v6, Axios, Vanilla CSS design system
- **Authentication**: Role-based Access Control (RBAC) with Bearer JWT tokens

---

## 👥 User Roles & Features

### 1. 🛡️ System Administrator
- **Dashboard**: Real-time summary cards displaying:
  - Total number of registered users
  - Total number of stores
  - Total number of submitted ratings
- **User Management**:
  - Add new users (Admin, Normal User, Store Owner) with full validation
  - View list of all users with Name, Email, Address, and Role
  - Filter users by Name, Email, Address, and Role
  - Sort table by Name, Email, Address, Role, or Date
  - View individual user profile detail (including assigned store and average rating if Store Owner)
- **Store Management**:
  - Add new stores with optional Store Owner assignment
  - View list of all stores with Name, Email, Address, and Average Rating
  - Filter stores by Name, Email, and Address
  - Sort table columns ascending/descending

### 2. 👤 Normal User
- **Authentication**:
  - Sign up with validation (Name 20-60 chars, Password rules, Address <= 400 chars)
  - Sign in with email and password
  - Change password after logging in
- **Store Browsing & Ratings**:
  - View all registered stores
  - Real-time search by Store Name and Address
  - View overall store rating and total rating count
  - View personal submitted rating
  - Submit ratings (1 to 5 stars)
  - Modify existing rating at any time

### 3. 🏪 Store Owner
- **Authentication**:
  - Log in with email and password
  - Change password after logging in
- **Store Dashboard**:
  - View assigned store details
  - View overall average rating (out of 5.0) and total rating count
  - View list of all users who submitted ratings (User Name, Email, Rating given, Date)

---

## 🔒 Form Validations Enforced (Frontend & Backend)

- **Name**: Min 20 characters, Max 60 characters.
- **Address**: Max 400 characters, required.
- **Password**: 8-16 characters, must include at least 1 uppercase letter and 1 special character (`!@#$%^&*...`).
- **Email**: Standard RFC email format validation and normalization.
- **Rating**: Integer between 1 and 5.

---

## 🚀 Getting Started

### 1. Database Setup (Supabase)
1. Open your Supabase SQL Editor:
   `https://supabase.com/dashboard/project/cjfifmagowtbnyjiuyuu/sql/new`
2. Copy and paste the contents of `backend/database/migration.sql` into the SQL Editor and click **Run**.
3. Run the seeder script in the backend to create the default Admin:
   ```bash
   cd backend
   node database/migrate.js
   ```

#### Default Admin Credentials
- **Email**: `admin@roxiler.com`
- **Password**: `Admin@1234`

---

### 2. Running the Backend

```bash
cd backend
npm install
npm start
```
The API server will run at: `http://localhost:5000`

---

### 3. Running the Frontend

```bash
cd frontend
npm install
npm run dev
```
The client application will run at: `http://localhost:5173`

---

## 📂 Project Structure

```
Roxiler/
├── backend/
│   ├── config/
│   │   └── supabase.js         # Supabase client setup
│   ├── controllers/
│   │   ├── auth.controller.js      # Signup, login, change password
│   │   ├── user.controller.js      # User CRUD & filters (Admin)
│   │   ├── store.controller.js     # Store CRUD, search, ratings
│   │   ├── rating.controller.js    # Rating submit/modify & rater list
│   │   └── dashboard.controller.js # Admin stats & Store owner stats
│   ├── database/
│   │   ├── migration.sql       # PostgreSQL DDL & schema definition
│   │   └── migrate.js          # DB test & admin seeder script
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & role authorization
│   │   └── validate.js         # express-validator rules
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── store.routes.js
│   │   ├── rating.routes.js
│   │   └── dashboard.routes.js
│   ├── .env                    # Environment variables
│   └── server.js               # Express entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance with JWT interceptor
    │   ├── components/
    │   │   ├── Navbar.jsx          # Header with role links & password modal
    │   │   ├── ProtectedRoute.jsx  # Role-based route guard
    │   │   ├── RatingStars.jsx     # Interactive 5-star rating component
    │   │   └── PasswordModal.jsx   # Change password dialog
    │   ├── context/
    │   │   └── AuthContext.jsx # Global user auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── ManageUsers.jsx
    │   │   │   ├── ManageStores.jsx
    │   │   │   ├── AddUser.jsx
    │   │   │   ├── AddStore.jsx
    │   │   │   └── UserDetail.jsx
    │   │   ├── user/
    │   │   │   └── UserDashboard.jsx
    │   │   └── store-owner/
    │   │       └── StoreOwnerDashboard.jsx
    │   ├── App.jsx             # React Router routing
    │   ├── index.css           # Premium dark theme & CSS design system
    │   └── main.jsx
    └── package.json
```
