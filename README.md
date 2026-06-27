# eCart — Production-Grade Multi-Vendor E-Commerce Platform

Welcome to **eCart** — a production-ready, MERN stack multi-vendor e-commerce marketplace inside a single workspace. This repository features role-based access controls for **Customers**, **Sellers**, and **Platform Admins**.

---

## 🚀 Quick Start (Local Run)

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or a remote connection string)

---

### Step 1: Install Backend & Seed Database
1. Navigate to the `/backend` folder.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Seed the database with categories, default admin accounts, sellers, products, variants, and coupon campaigns:
   ```bash
   npm run seed
   ```
4. Launch the Express server in development mode:
   ```bash
   npm run dev
   ```
   *The backend will run on [http://localhost:5000](http://localhost:5000).*

---

### Step 2: Install & Start Frontend
1. Open a new terminal and navigate to the `/frontend` folder.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
   *The frontend client will open on [http://localhost:5173](http://localhost:5173).*

---

## 🔑 Test Credentials (Seeded Accounts)

You can instantly log in and test all system roles using the pre-seeded credentials below:

### 1. Platform Super Admin
- **Email:** `admin@ecart.com`
- **Password:** `admin123`
- **Role Permissions:** Platform-wide analytics, seller KYC verification approvals (adjusting commissions), customer suspensions toggles, coupon campaign launches, and security audit log reviews.

### 2. Verified Sellers
- **Seller 1 (Laptops/Phones):** `seller1@ecart.com` (Password: `seller123`)
- **Seller 2 (Gaming/Audio):** `seller2@ecart.com` (Password: `seller123`)
- **Role Permissions:** Performance metrics, catalog CRUD management (adding size/color variants), sub-order shipping updates (adding tracking carriers), and KYC profile edits.

### 3. Customer User
- **Email:** `customer1@ecart.com`
- **Password:** `customer123`
- **Role Permissions:** Browse products, apply coupons, select/add delivery addresses, buy items via Wallet credits (starts with **$35,000.00**!) or COD, track shipments, and submit verified reviews.

### ⚡ Seeded Promotional Coupons
- `WELCOME10`: 10% discount on order subtotals over $50.
- `ECART50`: $50.00 flat discount on order subtotals over $200.

---

## 🛠️ Tech Stack & Directory Structure

### Backend
- **Core:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Sessions:** JSON Web Tokens (cookie credentials verification)

### Frontend
- **Core:** React.js (Vite compiler)
- **Routing:** React Router v6
- **Styling:** Custom Vanilla CSS Design System (with hover micro-animations and dark-mode glassmorphism)
- **Icons:** Lucide-React

---

## 🐳 Docker Deployment

For production deployments containing full containers orchestration (MongoDB, Redis, Elasticsearch):
```bash
docker-compose up -d
```
