# Wedding Expense Tracker - Backend API

A comprehensive backend API for managing wedding expenses with role-based access control, budget tracking, and approval workflows.

## 🚀 Features

- **Authentication System**: Mobile number + 4-digit PIN authentication
- **Role-Based Access**: Admin and User roles with different permissions
- **Budget Management**: Set and track total wedding budget
- **Task/Category Management**: Create and manage expense categories with estimates
- **Expense Tracking**: Submit, approve/reject expenses with automatic budget updates
- **Dashboard & Analytics**: Comprehensive reporting and visualization data
- **Over/Under Budget Alerts**: Track actual vs estimated costs

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the following variables:
   ```env
   MONGO_URI=mongodb://localhost:27017/wedding-expense-tracker
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=30d
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── budgetController.js   # Budget management
│   ├── taskController.js     # Task/category management
│   ├── expenseController.js  # Expense management
│   └── dashboardController.js # Dashboard & analytics
├── middleware/
│   └── auth.js               # JWT authentication & authorization
├── models/
│   ├── User.js               # User model
│   ├── Budget.js             # Budget model
│   ├── Task.js               # Task model
│   └── Expense.js            # Expense model
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── budgetRoutes.js       # Budget endpoints
│   ├── taskRoutes.js         # Task endpoints
│   ├── expenseRoutes.js      # Expense endpoints
│   └── dashboardRoutes.js    # Dashboard endpoints
├── .env                      # Environment variables
├── .gitignore
├── package.json
└── server.js                 # Entry point
```

## 🔐 Authentication Flow

1. **Register**: POST `/api/auth/register`
   - Provide mobile number and 4-digit PIN
   - Returns JWT token

2. **Login**: POST `/api/auth/login`
   - Provide mobile number and PIN
   - Returns JWT token

3. **Access Protected Routes**
   - Include token in Authorization header: `Bearer <token>`

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/me` | Private | Get current user |
| GET | `/users` | Admin | Get all users |
| PUT | `/reset-pin/:userId` | Admin | Reset user PIN |
| DELETE | `/users/:userId` | Admin | Delete user |

### Budget (`/api/budget`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Admin | Create/update budget |
| GET | `/` | Private | Get current budget |
| GET | `/summary` | Private | Get budget summary |

### Tasks (`/api/tasks`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Admin | Create task |
| GET | `/` | Private | Get all tasks |
| GET | `/:id` | Private | Get single task |
| PUT | `/:id` | Admin | Update task |
| DELETE | `/:id` | Admin | Delete task |

### Expenses (`/api/expenses`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private | Create expense |
| GET | `/` | Private | Get all expenses |
| GET | `/:id` | Private | Get single expense |
| PUT | `/:id` | Private | Update expense |
| PUT | `/:id/status` | Admin | Approve/reject expense |
| DELETE | `/:id` | Private | Delete expense |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin` | Admin | Get admin dashboard |
| GET | `/user` | Private | Get user dashboard |
| GET | `/expense-breakdown` | Private | Get expense breakdown |
| GET | `/analytics` | Admin | Get analytics data |

## 🔑 Example Requests

### 1. Register Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "1234567890",
    "pin": "1234",
    "role": "admin"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "1234567890",
    "pin": "1234"
  }'
```

### 3. Create Budget (with token)
```bash
curl -X POST http://localhost:5000/api/budget \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "totalBudget": 1000000
  }'
```

### 4. Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Venue",
    "estimatedCost": 200000,
    "description": "Wedding venue booking"
  }'
```

### 5. Submit Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "task": "TASK_ID",
    "description": "Advance payment for venue",
    "amount": 50000,
    "date": "2025-10-01"
  }'
```

## 🎯 Key Features Implementation

### Automatic Budget Updates
- When an expense is approved, the system automatically:
  - Deducts amount from remaining budget
  - Updates task's actual cost
  - Recalculates budget summary

### Over/Under Budget Tracking
- Tasks are automatically flagged as:
  - 🟢 **Under Budget**: Actual < 90% of estimated
  - 🟡 **On Track**: Actual between 90-100% of estimated
  - 🔴 **Over Budget**: Actual > estimated

### Role-Based Permissions
- **Admin**: Full access to all features
- **User**: Can submit expenses and view own data
- Admin-created expenses are auto-approved

### PIN Security
- PINs are hashed using bcrypt
- Never stored in plaintext
- Admin can reset user PINs

## 🧪 Testing

You can test the API using:
- **Postman**: Import the endpoints and test manually
- **curl**: Use the example requests above
- **Frontend**: Connect your React/Vue/Next.js app

## 🔒 Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Set strong MongoDB credentials**
4. **Enable CORS** only for trusted domains
5. **Rate limiting** for API endpoints (future enhancement)
6. **Input validation** already implemented

## 🚧 Future Enhancements

- [ ] OTP-based authentication
- [ ] Receipt image upload with cloud storage
- [ ] Email/SMS notifications
- [ ] Export reports to PDF/Excel
- [ ] Multi-wedding support
- [ ] WhatsApp integration
- [ ] Receipt OCR for auto-filling

## 📝 License

ISC

## 👨‍💻 Author

Wedding Expense Tracker Team

---

For any issues or questions, please create an issue in the repository.
