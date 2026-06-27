# eCart — Multi-Vendor E-Commerce Platform

Welcome to **eCart** — a MERN stack multi-vendor e-commerce marketplace inside a single workspace. This repository features role-based access controls for **Customers**, **Sellers**, and **Platform Admins**.

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
