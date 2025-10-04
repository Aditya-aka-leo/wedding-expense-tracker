# Changelog

All notable changes to the Wedding Expense Tracker project will be documented in this file.

## [1.0.0] - 2025-10-04

### 🎉 Initial Release

#### Added - Core Features

**Authentication System**
- Mobile number + 4-digit PIN authentication
- JWT-based session management
- Secure PIN hashing with bcrypt (10 salt rounds)
- User registration and login endpoints
- Role-based access control (Admin/User)
- Admin can reset user PINs
- User management (view all, delete users)

**Budget Management**
- Create and update total wedding budget
- Automatic calculation of spent and remaining amounts
- Budget summary endpoint with percentage utilization
- Single budget per application instance
- Real-time budget updates on expense approval

**Task/Category Management**
- Create expense categories (Venue, Catering, Photography, etc.)
- Set estimated costs for each task
- Track actual costs from approved expenses
- Task status (Pending/Completed)
- Budget status indicators (over-budget, on-track, under-budget)
- Task details with associated expenses
- Delete protection for tasks with approved expenses

**Expense Management**
- User expense submission under specific tasks
- Approval workflow (pending → approved/rejected)
- Auto-approval for admin-created expenses
- Optional receipt URL field
- Expense filtering (by status, task, submitter)
- Update pending expenses only
- Delete protection for approved expenses
- Automatic budget and task cost updates on approval

**Dashboard & Analytics**
- Admin dashboard with comprehensive overview
  - Budget summary
  - Task statistics with budget indicators
  - Expense counts by status
  - Over-budget alerts
  - Recent activities
- User dashboard
  - Personal expense statistics
  - Budget overview
  - Recent submissions
- Expense breakdown by task with percentages
- Analytics endpoint
  - User contribution statistics
  - Monthly expense trends (last 6 months)
  - Overview statistics

#### Added - Technical Implementation

**Database Models**
- User model with mobile and hashed PIN
- Budget model with total, spent, and remaining fields
- Task model with estimated and actual costs
- Expense model with approval workflow status

**API Endpoints**
- 25+ RESTful endpoints
- Consistent response format
- Proper HTTP status codes
- Error handling middleware

**Security**
- JWT token authentication
- Role-based authorization middleware
- bcrypt password hashing
- Input validation
- CORS enabled
- MongoDB injection protection

**Developer Experience**
- Comprehensive README documentation
- API testing guide with examples
- Postman collection for easy testing
- Database seeder script with sample data
- Quick start shell script
- Complete technical documentation
- Environment variable templates
- .gitignore for security

#### Project Structure
```
- config/ (Database connection)
- controllers/ (Business logic for auth, budget, tasks, expenses, dashboard)
- middleware/ (Authentication and authorization)
- models/ (MongoDB schemas)
- routes/ (API endpoints)
- utils/ (Helper functions - ready for future use)
- server.js (Application entry point)
- seed.js (Database seeder)
```

#### Dependencies
- express ^4.18.2
- mongoose ^7.0.0
- dotenv ^16.0.3
- bcryptjs ^2.4.3
- jsonwebtoken ^9.0.0
- cors ^2.8.5
- multer ^1.4.5-lts.1 (for future file uploads)
- express-validator ^7.0.1
- nodemon ^2.0.22 (dev)

#### Documentation
- README.md (Project overview)
- backend/README.md (Backend API documentation)
- DOCUMENTATION.md (Complete technical documentation)
- API_TESTING_GUIDE.md (Step-by-step testing guide)
- PROJECT_SUMMARY.md (Implementation summary)
- CHANGELOG.md (This file)

#### Testing & Development Tools
- Database seeder with realistic sample data
  - 1 Admin user
  - 2 Regular users
  - Budget of ₹10,00,000
  - 5 wedding tasks with estimates
  - 5 sample expenses (3 approved, 2 pending)
- Postman collection with all endpoints
- Quick start script (start.sh)
- NPM scripts:
  - `npm start` - Start production server
  - `npm run dev` - Start development server with nodemon
  - `npm run seed` - Seed database with sample data

#### Features Highlights

1. **Automatic Budget Updates**
   - Budget automatically updates when expenses are approved
   - Task actual costs calculated from approved expenses
   - No manual calculations needed

2. **Smart Budget Indicators**
   - 🟢 Under Budget: < 90% of estimate
   - 🟡 On Track: 90-100% of estimate
   - 🔴 Over Budget: > estimate

3. **Role-Based Workflow**
   - Admin creates budget and tasks
   - Users submit expenses (pending status)
   - Admin approves/rejects
   - Admin expenses auto-approved

4. **Comprehensive Dashboards**
   - Real-time budget tracking
   - Task-wise expense breakdown
   - User contribution statistics
   - Monthly trends
   - Over-budget alerts

#### Known Limitations

- Single budget per application (multi-wedding support planned)
- Receipt images not yet implemented (URL field available)
- No email/SMS notifications yet
- No OTP authentication (planned enhancement)
- No PDF/Excel export (planned enhancement)

#### Future Roadmap

**Phase 2 - Frontend**
- React/Next.js implementation
- Login/Register UI
- Admin dashboard
- User dashboard
- Task management interface
- Expense submission forms

**Phase 3 - Enhancements**
- OTP-based authentication
- Receipt image upload (AWS S3/Firebase)
- Email/SMS notifications
- PDF/Excel report generation
- Multi-wedding support
- Mobile app (React Native)
- Receipt OCR
- Budget alerts

---

## Version History

### [1.0.0] - 2025-10-04
- Initial release with complete backend implementation
- All PRD requirements fulfilled
- Production-ready API

---

**Note**: This project follows [Semantic Versioning](https://semver.org/).

Format based on [Keep a Changelog](https://keepachangelog.com/).
