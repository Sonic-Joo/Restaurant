# Restaurant API

A production-ready REST API for a restaurant ordering system built with Node.js, Express.js, and MongoDB.

---

## Tech Stack

| Technology                | Usage                     |
| ------------------------- | ------------------------- |
| **Node.js + Express.js**  | Backend Framework         |
| **MongoDB + Mongoose**    | Database                  |
| **JWT + bcrypt**          | Authentication & Security |
| **Cloudinary + Multer**   | Image Upload              |
| **NodeMailer**            | Email Service             |
| **Helmet + Rate Limiter** | Security Middleware       |

---

## Project Structure

```
restaurant-api/
├── controllers/
│   ├── auth.controller.js
│   ├── users.controller.js
│   ├── menu.controller.js
│   └── order.controller.js
├── models/
│   ├── user.js
│   ├── menu.js
│   └── order.js
├── routes/
│   ├── auth.route.js
│   ├── users.route.js
│   ├── menu.route.js
│   └── order.route.js
├── middlewares/
│   ├── verifyToken.js
│   ├── photoUpload.js
│   ├── ratelimiter.js
│   ├── generateToken.js
│   └── error.js
├── utils/
│   ├── cloudinary.js
│   └── verifyEmail.js
├── DB/
│   └── connectedDB.js
├── web/
│   └── index.html
├── .env
├── .gitignore
├── package.json
└── main.js
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET_KEY=your_jwt_secret
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password

CLIENT_URL=http://localhost:8000
```

---

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Sonic-Joo/restaurant-api.git

# Navigate to project directory
cd restaurant-api

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

---

## User Roles

| Role         | Permissions                                               |
| ------------ | --------------------------------------------------------- |
| **user**     | Browse menu, place orders, view own orders, cancel orders |
| **chef**     | Manage menu items, update order status                    |
| **delivery** | View ready orders                                         |
| **admin**    | Full access to everything                                 |

---

## API Endpoints

### Auth `/api/auth`

| Method | Endpoint                 | Description               | Access |
| ------ | ------------------------ | ------------------------- | ------ |
| POST   | `/register`              | Register new user         | Public |
| POST   | `/login`                 | Login & get token         | Public |
| GET    | `/verify/:token`         | Verify email              | Public |
| POST   | `/forgot-password`       | Send reset password email | Public |
| POST   | `/reset-password/:token` | Reset password            | Public |

### Users `/api/user`

| Method | Endpoint           | Description      | Access          |
| ------ | ------------------ | ---------------- | --------------- |
| GET    | `/`                | Get all users    | Admin           |
| GET    | `/:id`             | Get user by ID   | Private         |
| PUT    | `/change-password` | Change password  | Private         |
| PUT    | `/:id`             | Update user      | Same user       |
| PUT    | `/:id/role`        | Change user role | Admin           |
| DELETE | `/:id`             | Delete user      | Same user/Admin |

### Menu `/api/menu`

| Method | Endpoint     | Description                    | Access     |
| ------ | ------------ | ------------------------------ | ---------- |
| GET    | `/`          | Get all menu items (paginated) | Public     |
| GET    | `/search`    | Search & filter menu           | Public     |
| GET    | `/:id`       | Get item by ID                 | Public     |
| POST   | `/`          | Create menu item + images      | Chef/Admin |
| PUT    | `/:id`       | Update menu item               | Chef/Admin |
| PUT    | `/:id/image` | Update item images             | Chef/Admin |
| DELETE | `/:id`       | Delete menu item               | Chef/Admin |

### Orders `/api/order`

| Method | Endpoint      | Description                   | Access              |
| ------ | ------------- | ----------------------------- | ------------------- |
| POST   | `/`           | Place new order               | User                |
| GET    | `/`           | Get all orders (with filters) | Admin/Chef/Delivery |
| GET    | `/myorder`    | Get my orders                 | User                |
| PUT    | `/:id`        | Update order status           | Chef/Admin          |
| PUT    | `/:id/cancel` | Cancel order                  | User                |

---

## Search & Filter

### Menu Search Example

```
GET /api/menu/search?search=pizza
GET /api/menu/search?category=grills
GET /api/menu/search?search=pizza&category=grills
GET /api/menu/search?page=1&limit=5
```

### Available Categories

- `grills`
- `drinks`
- `desserts`
- `sandwiches`

### Orders Filter

```
GET /api/order?status=pending
GET /api/order?status=ready
```

---

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Email Verification** - Verify before login
- **Rate Limiting** - Prevent brute force attacks
- **Helmet** - HTTP security headers
- **Role-based Access Control** - 4 user roles

---

## 📧 Email Features

- Email verification on register
- Password reset via email
- 10-minute expiry on reset tokens

---

## Image Upload

- Multiple images per menu item (max 5)
- Stored on Cloudinary
- Auto-delete from Cloudinary on item deletion
- 5MB max file size per image

---

## License

MIT License - feel free to use this project for learning purposes.

---

Made with => Yousef Shohber
