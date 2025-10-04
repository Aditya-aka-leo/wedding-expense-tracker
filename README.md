# 💒 Wedding Expense Tracker

A comprehensive web application for managing wedding expenses with role-based access control, budget tracking, and approval workflows.

## 📖 Overview

The Wedding Expense Tracker helps families manage wedding budgets efficiently by:
- Setting a total budget and tracking expenses in real-time
- Creating estimated costs for different wedding tasks/categories
- Allowing multiple users to submit expenses
- Requiring admin approval before expenses affect the budget
- Providing visual indicators for over/under budget tracking
- Generating comprehensive dashboards and analytics

## ✨ Key Features

### 🔐 Authentication
- Simple mobile number + 4-digit PIN authentication
- No complex password requirements
- Secure PIN hashing with bcrypt
- JWT-based session management

### 👥 Role-Based Access
- **Admin**: Full control over budget, tasks, and expense approvals
- **User**: Can submit expenses and view personal statistics

### 💰 Budget Management
- Set and modify total wedding budget
- Real-time tracking of spent and remaining amounts
- Automatic updates when expenses are approved
- Budget percentage utilization

### 📋 Task/Category Management
- Create expense categories (Venue, Catering, Photography, etc.)
- Set estimated costs for each task
- Track actual costs against estimates
- Visual indicators for budget status

### 💸 Expense Tracking
- Users submit expenses under specific tasks
- Admin approval required (admin expenses auto-approved)
- Optional receipt image upload
- Status tracking (pending, approved, rejected)

### 📊 Dashboard & Analytics
- Admin dashboard with comprehensive overview
- User dashboard showing personal contributions
- Expense breakdown by task
- Over/under budget alerts
- Monthly expense trends

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator

### Frontend (To be implemented)
- React/Next.js or Vue.js
- State management: Redux/Context API
- Charts: Chart.js or Recharts
- UI Framework: Material-UI or Tailwind CSS

## 📁 Project Structure

```
wedding-expense-tracker/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   ├── server.js        # Entry point
│   ├── seed.js          # Database seeder
│   └── package.json
├── frontend/            # (To be implemented)
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wedding-expense-tracker
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```
   This creates sample data with:
   - Admin user (Mobile: 9876543210, PIN: 1234)
   - 2 regular users
   - Budget of ₹10,00,000
   - 5 tasks with estimates
   - Sample expenses

6. **Start Server**
   ```bash
   npm run dev
   ```

Server will run at `http://localhost:5000`

## 📚 API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation.

Quick reference:

### Authentication
```bash
POST /api/auth/register  # Register new user
POST /api/auth/login     # Login
GET  /api/auth/me        # Get current user
```

### Budget
```bash
POST /api/budget         # Create/update budget (Admin)
GET  /api/budget         # Get current budget
GET  /api/budget/summary # Get budget summary
```

### Tasks
```bash
POST   /api/tasks        # Create task (Admin)
GET    /api/tasks        # Get all tasks
GET    /api/tasks/:id    # Get single task
PUT    /api/tasks/:id    # Update task (Admin)
DELETE /api/tasks/:id    # Delete task (Admin)
```

### Expenses
```bash
POST   /api/expenses              # Create expense
GET    /api/expenses              # Get all expenses
GET    /api/expenses/:id          # Get single expense
PUT    /api/expenses/:id          # Update expense
PUT    /api/expenses/:id/status   # Approve/reject (Admin)
DELETE /api/expenses/:id          # Delete expense
```

### Dashboard
```bash
GET /api/dashboard/admin            # Admin dashboard
GET /api/dashboard/user             # User dashboard
GET /api/dashboard/expense-breakdown # Expense breakdown
GET /api/dashboard/analytics        # Analytics data (Admin)
```

## 🧪 Testing

See [backend/API_TESTING_GUIDE.md](backend/API_TESTING_GUIDE.md) for comprehensive testing instructions.

Quick test with seeded data:

1. **Run seed script**
   ```bash
   npm run seed
   ```

2. **Login as Admin**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"mobile": "9876543210", "pin": "1234"}'
   ```

3. **Get Dashboard**
   ```bash
   curl http://localhost:5000/api/dashboard/admin \
     -H "Authorization: Bearer <YOUR_TOKEN>"
   ```

## 📖 Example Workflow

1. **Admin Setup**
   - Admin logs in with mobile + PIN
   - Sets total budget (e.g., ₹10,00,000)
   - Creates tasks with estimates:
     - Venue: ₹2,00,000
     - Catering: ₹3,00,000
     - Photography: ₹1,50,000

2. **User Submits Expense**
   - User logs in
   - Submits expense under "Venue" for ₹50,000
   - Status: Pending

3. **Admin Reviews & Approves**
   - Admin views pending expenses
   - Approves the expense
   - Budget automatically updates:
     - Spent: ₹50,000
     - Remaining: ₹9,50,000

4. **Budget Tracking**
   - Dashboard shows:
     - Venue: ₹50,000 / ₹2,00,000 (Under Budget ✅)
     - Catering: ₹0 / ₹3,00,000 (On Track)
     - Total: 5% of budget used

## 🔒 Security Features

- ✅ PIN hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ MongoDB injection protection
- ✅ CORS enabled

## 🚧 Roadmap

### Phase 1: Backend (✅ Complete)
- [x] Authentication system
- [x] Budget management
- [x] Task/category management
- [x] Expense tracking with approval workflow
- [x] Dashboard and analytics
- [x] Database seeding

### Phase 2: Frontend (Next)
- [ ] React/Next.js setup
- [ ] Login/Register pages
- [ ] Admin dashboard
- [ ] User dashboard
- [ ] Task management UI
- [ ] Expense submission form
- [ ] Approval workflow UI

### Phase 3: Enhancements
- [ ] OTP-based authentication
- [ ] Receipt image upload (AWS S3/Firebase)
- [ ] PDF/Excel report generation
- [ ] Email/SMS notifications
- [ ] Mobile app (React Native)
- [ ] Multi-wedding support

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 👨‍💻 Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Contact the development team

---

**Happy Wedding Planning! 💍**
