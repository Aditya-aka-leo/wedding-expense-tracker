# Wedding Expense Tracker - Deployment Guide

## 🚀 Quick Start for Deployment

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

---

## 📋 **Ports Required**

### Development:
- **Backend API:** `5001`
- **Frontend:** `5173`
- **MongoDB Atlas:** Uses HTTPS (port 443) - no local port needed

### Production:
- **Backend:** Configure based on your hosting platform
- **Frontend:** Configure based on your hosting platform

---

## ⚙️ **Environment Setup**

### **Backend Configuration:**

1. Create `backend/.env` file (copy from `.env.example`):
```bash
cd backend
cp .env.example .env
```

2. Update `backend/.env` with your values:
```env
PORT=5001
NODE_ENV=production
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

⚠️ **IMPORTANT:** Never commit your `.env` file to GitHub!

### **Frontend Configuration:**

1. Create `frontend/.env` file (copy from `.env.example`):
```bash
cd frontend
cp .env.example .env
```

2. Update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🔧 **Local Development**

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start Development Servers

**Backend (in one terminal):**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5001

**Frontend (in another terminal):**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

---

## 🚢 **Production Deployment**

### **Option 1: Deploy to Cloud Platforms**

#### Backend (Deploy to Railway/Render/Heroku):
1. Create account on your chosen platform
2. Connect your GitHub repository
3. Set environment variables in the platform dashboard:
   - `PORT` (will be auto-set by platform)
   - `NODE_ENV=production`
   - `MONGO_URI=your-mongodb-atlas-url`
   - `JWT_SECRET=your-secret`
   - `FRONTEND_URL=https://your-frontend-url.com`
4. Set build command: `npm install`
5. Set start command: `npm start`

#### Frontend (Deploy to Vercel/Netlify):
1. Create account on your chosen platform
2. Connect your GitHub repository
3. Set build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `frontend`
4. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.com/api`

### **Option 2: Deploy to VPS (Ubuntu/Linux)**

#### Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Clone and Setup:
```bash
git clone https://github.com/your-username/wedding-expense-tracker.git
cd wedding-expense-tracker

# Setup backend
cd backend
npm install
# Create .env file with production values

# Setup frontend
cd ../frontend
npm install
npm run build
```

#### Use PM2 to run backend:
```bash
sudo npm install -g pm2
cd backend
pm2 start server.js --name wedding-backend
pm2 save
pm2 startup
```

#### Use Nginx for frontend:
```bash
sudo apt install nginx
sudo cp -r frontend/dist/* /var/www/html/
sudo systemctl restart nginx
```

---

## 🔐 **Security Checklist Before Deployment**

- [ ] `.env` files are in `.gitignore`
- [ ] MongoDB connection string doesn't contain hardcoded credentials in code
- [ ] `JWT_SECRET` is a strong random string
- [ ] CORS is configured with specific origins (not `*`)
- [ ] All sensitive data is in environment variables
- [ ] MongoDB Atlas has IP whitelist configured
- [ ] Use HTTPS in production

---

## 🔥 **Firewall Configuration (If using VPS)**

### Ubuntu UFW:
```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow backend port (if not using reverse proxy)
sudo ufw allow 5001

# Enable firewall
sudo ufw enable
```

---

## 📦 **Verifying Deployment**

1. **Backend Health Check:**
   - Visit: `https://your-backend-url.com/api/`
   - Should return API status

2. **Frontend:**
   - Visit: `https://your-frontend-url.com`
   - Try logging in with test credentials

3. **Database Connection:**
   - Check MongoDB Atlas dashboard for connections
   - Verify collections are being created

---

## 🐛 **Common Issues**

### "Cannot connect to MongoDB"
- Check MongoDB Atlas IP whitelist
- Verify connection string in `.env`
- Ensure network access is configured

### "CORS Error"
- Update `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `backend/server.js`

### "Login not working"
- Verify JWT_SECRET is set
- Check if users exist in database
- Clear browser cookies/localStorage

---

## 📞 **Support**

For issues, please create an issue on GitHub or contact the development team.

---

## 📄 **License**

This project is licensed under the MIT License.
