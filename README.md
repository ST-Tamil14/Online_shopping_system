# 🛍️ ShopWave — Full-Stack E-Commerce Platform

A production-ready, industry-level e-commerce application built with **React** (frontend) and **Node.js/Express** (backend).

---

## 📦 Project Structure

```
shopwave/
├── backend/          # Express.js REST API
│   ├── config/       # Database (in-memory) & seeder
│   ├── middleware/   # Auth middleware (JWT)
│   ├── routes/       # API route handlers
│   │   ├── auth.js       # Register, Login, Profile
│   │   ├── products.js   # CRUD + Reviews
│   │   ├── cart.js       # Cart management
│   │   ├── orders.js     # Order placement & tracking
│   │   ├── categories.js # Product categories
│   │   ├── wishlist.js   # Wishlist
│   │   └── admin.js      # Admin dashboard APIs
│   └── server.js     # Express app entry point
│
└── frontend/         # React.js SPA
    └── src/
        ├── components/   # Navbar, Footer, ProductCard
        ├── context/      # Auth, Cart, Wishlist contexts
        ├── pages/        # All page components
        ├── styles/       # Global CSS
        └── utils/        # API service layer (Axios)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install Dependencies

```bash
# Install backend
cd backend && npm install

# Install frontend (new terminal)
cd frontend && npm install
```

### 2. Start Backend

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 3. Start Frontend

```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| Admin    | admin@shopwave.com     | Admin@123456   |
| Customer | (register any account) | (min 6 chars)  |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/auth/register    | Create account    |
| POST   | /api/auth/login       | Login             |
| GET    | /api/auth/me          | Get current user  |
| PUT    | /api/auth/profile     | Update profile    |
| PUT    | /api/auth/password    | Change password   |
| POST   | /api/auth/address     | Add address       |
| DELETE | /api/auth/address/:id | Remove address    |

### Products
| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| GET    | /api/products             | List (with filters) |
| GET    | /api/products/featured    | Featured products   |
| GET    | /api/products/:id         | Product detail      |
| POST   | /api/products             | Create (admin)      |
| PUT    | /api/products/:id         | Update (admin)      |
| DELETE | /api/products/:id         | Delete (admin)      |
| POST   | /api/products/:id/review  | Add review          |

### Cart
| Method | Endpoint              | Description     |
|--------|-----------------------|-----------------|
| GET    | /api/cart             | Get cart        |
| POST   | /api/cart/add         | Add item        |
| PUT    | /api/cart/update      | Update quantity |
| DELETE | /api/cart/remove/:id  | Remove item     |
| DELETE | /api/cart/clear       | Clear cart      |

### Orders
| Method | Endpoint                      | Description          |
|--------|-------------------------------|----------------------|
| GET    | /api/orders                   | My orders            |
| GET    | /api/orders/:id               | Order detail         |
| POST   | /api/orders                   | Place order          |
| PUT    | /api/orders/:id/cancel        | Cancel order         |
| GET    | /api/orders/admin/all         | All orders (admin)   |
| PUT    | /api/orders/admin/:id/status  | Update status (admin)|

### Admin
| Method | Endpoint                     | Description        |
|--------|------------------------------|--------------------|
| GET    | /api/admin/dashboard         | Dashboard stats    |
| GET    | /api/admin/users             | All users          |
| PUT    | /api/admin/users/:id/toggle  | Activate/deactivate|

---

## ✨ Features

### Customer Features
- 🔐 JWT Authentication (Register/Login/Logout)
- 🛍️ Product browsing with filters, search, sort & pagination
- 📦 Product detail with image gallery, specs, and reviews
- 🛒 Shopping cart with real-time totals
- ❤️ Wishlist management
- 💳 Multi-step checkout (Shipping → Payment → Review)
- 📋 Order history with real-time tracking timeline
- 👤 Account management (Profile, Password, Addresses)

### Admin Features
- 📊 Dashboard with revenue charts, order stats
- 📦 Order management with status updates
- 👥 User management (activate/deactivate)
- 🛍️ Product CRUD

### Technical Features
- 🔒 JWT authentication with Bearer tokens
- 🛡️ Helmet.js security headers
- ⚡ Rate limiting (500 req/15 min)
- 🔄 Request/response interceptors
- 📱 Fully responsive mobile design
- 🎨 Custom design system with CSS variables
- ⚡ Skeleton loading states
- 🔔 Toast notifications

---

## 🗄️ Database

This project uses an **in-memory database** for simplicity. Data resets on server restart.

### Switching to MongoDB (Production)

1. Install mongoose: `npm install mongoose`
2. Set `MONGODB_URI` in `backend/.env`
3. Replace `config/db.js` with mongoose models
4. Update route handlers to use async mongoose queries

---

## 🏗️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Axios  |
| Backend   | Node.js, Express.js               |
| Auth      | JWT (jsonwebtoken), bcryptjs      |
| Security  | Helmet, CORS, express-rate-limit  |
| Styling   | Custom CSS (no framework)         |
| Fonts     | Syne (display), DM Sans (body)    |

---

## 📝 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
```

### Frontend
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in backend
2. Build frontend: `cd frontend && npm run build`
3. Serve build folder from backend static files
4. Use a real database (MongoDB Atlas, PostgreSQL)
5. Set strong `JWT_SECRET`
6. Configure real Stripe keys

---

Built with ❤️ — ShopWave E-Commerce Platform
