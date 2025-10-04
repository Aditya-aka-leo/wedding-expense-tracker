# Wedding Expense Tracker - Frontend

A modern React-based frontend application for managing wedding expenses, built with Vite, React Router, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Login/Register with mobile number and 4-digit PIN
- 📊 **Dashboard**: Comprehensive overview of budget and expenses
- 💰 **Expense Management**: Add, view, and manage wedding expenses
- 📋 **Task/Category Management**: Organize expenses by categories
- 💵 **Budget Tracking**: Monitor spending against estimated costs
- 👥 **User Management**: Admin can manage users and reset PINs
- 📱 **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Axios** - API calls
- **React Icons** - Icon library

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.jsx   # Main layout wrapper
│   ├── Navbar.jsx   # Top navigation bar
│   └── Sidebar.jsx  # Side navigation menu
├── context/         # React Context
│   └── AuthContext.jsx  # Authentication state management
├── pages/           # Page components
│   ├── Login.jsx    # Login page
│   ├── Register.jsx # Registration page
│   ├── Dashboard.jsx # Dashboard page
│   ├── Expenses.jsx  # Expense management
│   ├── Budget.jsx    # Budget overview
│   ├── Tasks.jsx     # Category management
│   └── Users.jsx     # User management (admin)
├── utils/           # Utility functions
│   └── api.js       # Axios configuration
├── App.jsx          # Main app component with routing
├── main.jsx         # App entry point
└── index.css        # Global styles with Tailwind

```

## API Integration

The frontend communicates with the backend API at `VITE_API_URL`. All API calls are authenticated using JWT tokens stored in localStorage.

### Authentication Flow

1. User logs in with mobile and PIN
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is automatically added to all subsequent API requests
5. On 401 errors, user is redirected to login

## Features by Role

### User Features
- View personal dashboard
- Add new expenses
- View expense history
- Check budget status
- View task/category breakdown

### Admin Features (in addition to user features)
- Approve/reject expenses
- Manage budget
- Create/edit/delete categories
- View all user expenses
- Manage users
- Reset user PINs

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
