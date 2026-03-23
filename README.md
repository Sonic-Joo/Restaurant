# Restaurant API

REST API for a restaurant ordering system, built with Node.js, Express, and MongoDB.

## Features

- JWT auth with access/refresh token flow
- Email verification and password reset
- Google and Facebook OAuth login
- Role-based access control (`user`, `chef`, `delivery`, `admin`)
- Menu CRUD with multi-image Cloudinary upload
- Order lifecycle management by staff roles
- Security middleware (`helmet`, rate limiting, input sanitization)
- Request and audit logging

## Tech Stack

- Node.js, Express
- MongoDB, Mongoose
- JWT, bcrypt
- Multer, Cloudinary
- Nodemailer
- Passport (Google/Facebook OAuth)
- Helmet, express-rate-limit

## Project Structure

```text
2 - Restaurant/
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

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Create `.env`

```env
PORT=8000
MONGODB_URI=your_mongodb_uri

JWT_SECRET_KEY=your_jwt_secret
JWT_EXPIRES_IN=7d

SESSION_SECRET=your_session_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:8000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 3) Run the server

```bash
# Development
npm run dev

# Production-style run (no dedicated npm script yet)
node main.js
```

Server default URL: `http://localhost:8000`

## Authentication Header

Protected routes expect:

```http
Authorization: Bearer <access_token>
```

## API Routes

### Auth `/api/auth`

| Method | Endpoint                 | Description               | Access |
| ------ | ------------------------ | ------------------------- | ------ |
| POST   | `/register`              | Register new user         | Public |
| POST   | `/login`                 | Login user                | Public |
| POST   | `/refresh`               | Refresh access token      | Public |
| GET    | `/verify/:token`         | Verify email              | Public |
| POST   | `/forgot-password`       | Request reset email       | Public |
| POST   | `/reset-password/:token` | Reset password            | Public |
| GET    | `/logout`                | Logout user               | Public |
| GET    | `/google`                | Start Google OAuth        | Public |
| GET    | `/google/callback`       | Google OAuth callback     | Public |
| GET    | `/facebook`              | Start Facebook OAuth      | Public |
| GET    | `/facebook/callback`     | Facebook OAuth callback   | Public |

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

| Method | Endpoint     | Description                    | Access     |
| ------ | ------------ | ------------------------------ | ---------- |
| GET    | `/`          | Get menu items                 | Public     |
| GET    | `/search`    | Search/filter menu             | Public     |
| GET    | `/:id`       | Get menu item by ID            | Public     |
| POST   | `/`          | Create menu item (+images)     | Chef/Admin |
| PUT    | `/:id`       | Update menu item               | Chef/Admin |
| PUT    | `/:id/image` | Update menu item images        | Chef/Admin |
| DELETE | `/:id`       | Delete menu item               | Chef/Admin |

### Orders `/api/order`

| Method | Endpoint      | Description                    | Access              |
| ------ | ------------- | ------------------------------ | ------------------- |
| POST   | `/`           | Create order                   | Authenticated user  |
| GET    | `/`           | Get all orders                 | Staff (admin/chef/delivery) |
| GET    | `/myorder`    | Get current user orders        | Authenticated user  |
| PUT    | `/:id`        | Update order state             | Chef/Admin          |
| PUT    | `/:id/cancel` | Cancel order                   | Authenticated user  |

## Search Examples

```http
GET /api/menu/search?search=pizza
GET /api/menu/search?category=grills
GET /api/menu/search?search=pizza&category=grills
GET /api/menu/search?page=1&limit=5

GET /api/order?status=pending
GET /api/order?status=ready
```

## License

ISC (as defined in `package.json`).
