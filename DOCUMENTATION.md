# Wedding Expense Tracker - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Authentication & Authorization](#authentication--authorization)
6. [Business Logic](#business-logic)
7. [Deployment Guide](#deployment-guide)
8. [Development Workflow](#development-workflow)

---

## Project Overview

### Purpose
The Wedding Expense Tracker is a family-friendly budgeting tool designed to manage wedding expenses with transparency and accountability. It allows multiple family members to contribute expense entries while maintaining centralized control through admin approval.

### Key Objectives
- Simplify wedding budget management
- Enable collaborative expense tracking
- Provide real-time budget visibility
- Ensure financial accountability through approvals
- Track actual vs estimated costs

### User Roles
1. **Admin**: Full system control (budget setup, task management, expense approval)
2. **User**: Limited access (submit expenses, view own data)

---

## System Architecture

### Technology Stack
```
Backend:
- Node.js (Runtime)
- Express.js (Web Framework)
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- bcryptjs (Password Hashing)

Frontend (Future):
- React/Next.js
- Redux/Context API
- Chart.js
- Tailwind CSS/Material-UI
```

### Architecture Pattern
- **MVC Pattern** (Model-View-Controller)
- RESTful API Design
- Stateless Authentication (JWT)
- Document-based Database (MongoDB)

### Project Structure
```
backend/
├── config/
│   └── db.js                    # Database connection
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── budgetController.js      # Budget operations
│   ├── taskController.js        # Task operations
│   ├── expenseController.js     # Expense operations
│   └── dashboardController.js   # Analytics & reporting
├── middleware/
│   └── auth.js                  # JWT & role verification
├── models/
│   ├── User.js                  # User schema
│   ├── Budget.js                # Budget schema
│   ├── Task.js                  # Task schema
│   └── Expense.js               # Expense schema
├── routes/
│   ├── authRoutes.js            # Auth endpoints
│   ├── budgetRoutes.js          # Budget endpoints
│   ├── taskRoutes.js            # Task endpoints
│   ├── expenseRoutes.js         # Expense endpoints
│   └── dashboardRoutes.js       # Dashboard endpoints
└── server.js                    # Application entry point
```

---

## Database Schema

### User Model
```javascript
{
  mobile: String (unique, required),
  pinHash: String (required),
  role: String (enum: ['admin', 'user'], default: 'user'),
  createdAt: Date
}
```

### Budget Model
```javascript
{
  totalBudget: Number (required),
  amountSpent: Number (default: 0),
  remaining: Number (required),
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### Task Model
```javascript
{
  name: String (required),
  estimatedCost: Number (required),
  description: String,
  status: String (enum: ['Pending', 'Completed'], default: 'Pending'),
  actualCost: Number (default: 0),
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### Expense Model
```javascript
{
  task: ObjectId (ref: Task, required),
  description: String,
  amount: Number (required),
  date: Date (required),
  submittedBy: ObjectId (ref: User, required),
  receiptUrl: String,
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  createdAt: Date
}
```

### Relationships
- User (1) → Budget (1) : One admin creates one budget
- User (1) → Task (Many) : Admin creates multiple tasks
- User (1) → Expense (Many) : Users submit multiple expenses
- Task (1) → Expense (Many) : One task has multiple expenses

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "mobile": "9876543210",
  "pin": "1234",
  "role": "admin"  // optional, defaults to "user"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "mobile": "9876543210",
  "pin": "1234"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "mobile": "9876543210",
    "role": "admin"
  }
}
```

### Budget Endpoints

#### Create/Update Budget (Admin Only)
```http
POST /budget
Authorization: Bearer <token>
Content-Type: application/json

{
  "totalBudget": 1000000
}
```

#### Get Budget
```http
GET /budget
Authorization: Bearer <token>
```

### Task Endpoints

#### Create Task (Admin Only)
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Venue",
  "estimatedCost": 200000,
  "description": "Wedding venue booking"
}
```

#### Get All Tasks
```http
GET /tasks
Authorization: Bearer <token>

Response includes:
- Task details
- Actual cost (from approved expenses)
- Budget status (over/under/on-track)
```

### Expense Endpoints

#### Create Expense
```http
POST /expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "task": "<task_id>",
  "description": "Advance payment",
  "amount": 50000,
  "date": "2025-10-01"
}

Note: Admin expenses are auto-approved
```

#### Approve/Reject Expense (Admin Only)
```http
PUT /expenses/<expense_id>/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved"  // or "rejected"
}
```

### Dashboard Endpoints

#### Admin Dashboard
```http
GET /dashboard/admin
Authorization: Bearer <admin_token>

Returns:
- Budget summary
- Task statistics
- Expense counts by status
- Over-budget alerts
- Recent activities
```

#### User Dashboard
```http
GET /dashboard/user
Authorization: Bearer <token>

Returns:
- Personal expense statistics
- Budget overview
- Recent submissions
```

---

## Authentication & Authorization

### Authentication Flow

1. **Registration**
   - User provides mobile number and 4-digit PIN
   - PIN is hashed using bcrypt (salt rounds: 10)
   - User document created in database
   - JWT token generated and returned

2. **Login**
   - User provides mobile number and PIN
   - PIN compared with stored hash
   - On success, JWT token generated

3. **Protected Routes**
   - Client includes token in Authorization header
   - Middleware verifies token signature
   - User object attached to request
   - Route handler executes

### JWT Token Structure
```javascript
{
  id: user._id,
  exp: timestamp + 30 days
}
```

### Authorization Levels

#### Public Routes
- POST /auth/register
- POST /auth/login

#### Protected Routes (Any authenticated user)
- GET /auth/me
- GET /budget
- GET /budget/summary
- GET /tasks
- GET /tasks/:id
- POST /expenses
- GET /expenses
- GET /expenses/:id
- PUT /expenses/:id (own expenses only)
- DELETE /expenses/:id (own pending expenses)

#### Admin-Only Routes
- POST /budget
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id
- PUT /expenses/:id/status
- GET /auth/users
- PUT /auth/reset-pin/:userId
- DELETE /auth/users/:userId
- GET /dashboard/admin
- GET /dashboard/analytics

---

## Business Logic

### Budget Management

1. **Budget Creation**
   - Admin sets total budget
   - `amountSpent` initialized to 0
   - `remaining = totalBudget`

2. **Budget Updates**
   - Admin can modify `totalBudget`
   - `remaining` recalculated: `totalBudget - amountSpent`

3. **Automatic Adjustments**
   - When expense approved:
     - `amountSpent += expense.amount`
     - `remaining = totalBudget - amountSpent`

### Expense Approval Workflow

```
User submits expense
      ↓
Status: pending
      ↓
Admin reviews
      ↓
  ┌───┴───┐
  ↓       ↓
Approve  Reject
  ↓       ↓
Budget   No budget
updates  change
```

### Admin Expense Auto-Approval
```javascript
if (req.user.role === 'admin') {
  expense.status = 'approved';
  updateBudgetAfterApproval(expense);
}
```

### Task Actual Cost Calculation
```javascript
// Recalculated on each expense approval
const approvedExpenses = await Expense.find({ 
  task: taskId, 
  status: 'approved' 
});
task.actualCost = approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
```

### Budget Status Indicators

```javascript
if (actualCost > estimatedCost) {
  budgetStatus = 'over-budget';  // 🔴
} else if (actualCost < estimatedCost * 0.9) {
  budgetStatus = 'under-budget';  // 🟢
} else {
  budgetStatus = 'on-track';  // 🟡
}
```

### Data Validation

#### PIN Validation
```javascript
// Must be exactly 4 digits
/^\d{4}$/.test(pin)
```

#### Mobile Number
- Stored as string
- Unique constraint
- No specific format enforced (can be customized)

#### Amount Validation
- Must be positive number
- Required for expenses and task estimates

---

## Deployment Guide

### Local Deployment

1. **Prerequisites**
   ```bash
   node --version  # v14+
   mongod --version  # v4.4+
   ```

2. **Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Database Seeding**
   ```bash
   npm run seed
   ```

4. **Start Server**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

### Production Deployment

#### Using Heroku

1. **Setup Heroku**
   ```bash
   heroku create wedding-expense-tracker
   heroku addons:create mongolab:sandbox
   ```

2. **Configure Environment**
   ```bash
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set JWT_EXPIRE=30d
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

#### Using AWS EC2

1. **Launch EC2 Instance** (Ubuntu)
2. **Install Node.js & MongoDB**
3. **Clone Repository**
4. **Setup PM2** for process management
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   ```

#### Using Docker

```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## Development Workflow

### Adding New Features

1. **Create Model** (if needed)
   ```javascript
   // models/NewModel.js
   const mongoose = require('mongoose');
   const schema = new mongoose.Schema({...});
   module.exports = mongoose.model('NewModel', schema);
   ```

2. **Create Controller**
   ```javascript
   // controllers/newController.js
   exports.someFunction = async (req, res) => {...};
   ```

3. **Create Routes**
   ```javascript
   // routes/newRoutes.js
   router.get('/', protect, someFunction);
   ```

4. **Add to server.js**
   ```javascript
   const newRoutes = require('./routes/newRoutes');
   app.use('/api/new', newRoutes);
   ```

### Testing Checklist

- [ ] Authentication works
- [ ] Role-based access enforced
- [ ] Budget calculations correct
- [ ] Expense approval workflow functions
- [ ] Dashboard data accurate
- [ ] Error handling works
- [ ] Validation prevents invalid data

### Code Style

- Use async/await for promises
- Handle errors with try-catch
- Return consistent response format
- Use meaningful variable names
- Comment complex logic

---

## Support & Maintenance

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify MONGO_URI in .env

2. **Token Expired**
   - User needs to login again
   - Check JWT_EXPIRE setting

3. **Budget Not Updating**
   - Ensure expenses are approved
   - Check updateBudgetAfterApproval function

### Monitoring

- Log all errors to console
- Monitor MongoDB performance
- Track API response times
- Set up alerts for failures

---

**Last Updated:** October 4, 2025
**Version:** 1.0.0
