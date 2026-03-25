# 🍽️ Restaurant API

Production-ready REST API for a restaurant ordering system built with Node.js, Express, and MongoDB.

---

## 🚀 Features

- 🔐 Authentication & Authorization
  - JWT (Access + Refresh Tokens)
  - Refresh Token Rotation + Invalidation
  - Email Verification & Password Reset
  - Google & Facebook OAuth

- 👥 Role-Based Access Control (RBAC)
  - `user`, `chef`, `delivery`, `admin`

- 🍔 Menu Management
  - Full CRUD
  - Image uploads (Cloudinary, up to 5 images)

- 📦 Order System
  - Full lifecycle:
    - `pending` → `ready` → `delivered` / `cancelled`

- ⚡ Performance
  - Redis caching for read-heavy endpoints

- 🛡️ Security
  - Helmet (secure headers)
  - Rate limiting (auth & global)
  - CORS protection
  - XSS & CSRF protection

- 🧾 Logging
  - Request logging (Winston and Morgan)
  - Audit logging

---

## 🧠 Architecture

- Layered structure (Controllers / Models / Routes / Utils)
- Centralized error handling
- Validation layer using Joi
- Scalable and maintainable design

---

## 🛠️ Tech Stack

| Technology          | Usage                    |
| ------------------- | ------------------------ |
| Node.js + Express   | Backend framework        |
| MongoDB + Mongoose  | Database                 |
| JWT                 | Authentication           |
| bcrypt              | Password hashing         |
| Redis               | Caching & token handling |
| Multer + Cloudinary | File uploads             |
| Nodemailer          | Emails                   |
| Passport            | OAuth                    |
| Helmet              | Security headers         |
| express-rate-limit  | Rate limiting            |

---

## 📁 Project Structure

```
Restaurant/
├── controllers/
├── DB/
├── logs/
├── middlewares/
├── models/
├── routes/
├── utils/
├── web/
├── main.js
└── package.json
```

---

## ⚙️ Environment Variables

```env
PORT=8000
NODE_ENV=development
MONGO_URL=

JWT_SECRET_KEY=
JWT_REFRESH_SECRET_KEY=
JWT_EXPIRES_IN=7d

SESSION_SECRET=
CLIENT_URL=

EMAIL_USER=
EMAIL_PASS=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```

---

## ▶️ Getting Started

### Install

```
npm install
```

### Run (Dev)

```
npm run dev
```

### Run (Production)

```
node main.js
```

---

## 🔐 Authentication

All protected routes require:

```http
Authorization: Bearer <access_token>
```

---

## 🔁 Auth Flow

1. User logs in → receives:
   - Access Token (short-lived)
   - Refresh Token (stored in DB)

2. Refresh:
   - Old refresh token is invalidated
   - New access + refresh tokens are issued

3. Security:
   - Token reuse detection supported
   - Server-side token storage

---

## Create `.env`

```env
PORT=8000
NODE_ENV=development
MONGO_URL=your_mongodb_uri

JWT_SECRET_KEY=your_jwt_secret
JWT_REFRESH_SECRET_KEY=your_refresh_jwt_secret
JWT_EXPIRES_IN=7d

SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:8000

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

REDIS_HOST=your_redis_host
REDIS_PORT=14756
REDIS_PASSWORD=your_redis_password
```

## API Routes

### Auth `/api/auth`

| Method | Endpoint                 | Description             | Access |
| ------ | ------------------------ | ----------------------- | ------ |
| POST   | `/register`              | Register new user       | Public |
| POST   | `/login`                 | Login user              | Public |
| POST   | `/refresh`               | Refresh access token    | Public |
| GET    | `/verify/:token`         | Verify email            | Public |
| POST   | `/forgot-password`       | Request reset email     | Public |
| POST   | `/reset-password/:token` | Reset password          | Public |
| GET    | `/google`                | Start Google OAuth      | Public |
| GET    | `/google/callback`       | Google OAuth callback   | Public |
| GET    | `/facebook`              | Start Facebook OAuth    | Public |
| GET    | `/facebook/callback`     | Facebook OAuth callback | Public |
| POST   | `/logout`                | Logout user             | Public |

### Users `/api/user`

| Method | Endpoint           | Description      | Access          |
| ------ | ------------------ | ---------------- | --------------- |
| GET    | `/`                | Get all users    | Admin           |
| GET    | `/:id`             | Get user by ID   | Authenticated   |
| PUT    | `/change-password` | Change password  | Authenticated   |
| PUT    | `/:id`             | Update user      | Same user/Admin |
| PUT    | `/:id/role`        | Change user role | Admin           |
| DELETE | `/:id`             | Delete user      | Same user/Admin |

### Menu `/api/menu`

| Method | Endpoint     | Description                  | Access     |
| ------ | ------------ | ---------------------------- | ---------- |
| GET    | `/`          | Get menu items               | Public     |
| GET    | `/search`    | Search menu (title/category) | Public     |
| GET    | `/:id`       | Get menu item by ID          | Public     |
| POST   | `/`          | Create menu item (+images)   | Chef/Admin |
| PUT    | `/:id`       | Update menu item             | Chef/Admin |
| PUT    | `/:id/image` | Update menu item images      | Chef/Admin |
| DELETE | `/:id`       | Delete menu item             | Chef/Admin |

### Orders `/api/order`

| Method | Endpoint      | Description             | Access                      |
| ------ | ------------- | ----------------------- | --------------------------- |
| POST   | `/`           | Create order            | Authenticated user          |
| GET    | `/`           | Get all orders          | Staff (admin/chef/delivery) |
| GET    | `/myorder`    | Get current user orders | Authenticated user          |
| PUT    | `/:id`        | Update order state      | Chef/Admin                  |
| PUT    | `/:id/cancel` | Cancel order            | Authenticated user          |

## Search Examples

```http
GET /api/menu/search?title=pizza
GET /api/menu/search?category=grills
GET /api/menu/search?title=pizza&category=grills
GET /api/menu/search?page=1&limit=5

PUT /api/order/:id
body: { "status": "ready" }

PUT /api/order/:id/cancel
```

## License

ISC (as defined in `package.json`).
