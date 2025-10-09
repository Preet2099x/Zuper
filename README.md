# Zuper
Zuper is a full-stack web application being built to simplify vehicle rentals and subscriptions. It enables customers to lease cars, bikes, or scooters through flexible plans, while providers can list and manage their vehicles. Using React, Node.js, and MongoDB, Zuper integrates Razorpay (test mode) for payments and offers role-based dashboards for customers, providers, and admins. Features will include contract management, mileage caps, renewals, and upgrade options, making it a scalable and extensible platform for the modern subscription economy.
<br><br>

## 🚀 Quick Start

### Running the Full Application

```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all

# Run both backend and frontend in development mode
npm run dev
```

### Individual Commands

```bash
# Run only backend (from root)
npm run dev:backend

# Run only frontend (from root)
npm run dev:frontend

# Production mode (run built frontend with backend)
npm start
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:5173`

<br><br>
### CURRENT FEATURES
- 👤 Customer Signup → Users can register with name, email, phone, and password.
- ✉️ Email OTP Verification → 6-digit code sent by email; must be verified before login.
- 🔑 Login & JWT Auth → Secure login with email/phone + password; issues JWT for session handling.
- 🗄️ MongoDB Integration → User data and verification codes stored/retrieved via Mongoose.
- 📩 Resend Verification Code → Users can request a fresh OTP if the previous one expires.
- 🛡️ Password Security → Passwords stored with bcrypt hashing.
- 📨 Email Service → Nodemailer with Gmail SMTP (App Passwords) for sending verification codes.
- ⚡ Frontend Integration → React/Vite signup flow, inline OTP entry, and auto-login after verification.
<br><br>
### TECH STACK
- 🖥️ Frontend: React
- 🎨 Styling: Tailwind CSS
- ⚙️ Backend: Node.js & Express
- 🗃️ Database: MongoDB
- 🔐 Auth & Security: JWT (JSON Web Tokens), bcrypt for password hashing
- ✉️ Email Service: Nodemailer (via Gmail SMTP for dev)
- 🛠️ Environment Management: dotenv
- 🧩 Routing (Frontend): React Router DOM
- 🧪 Dev Tools: Nodemon for backend auto-reload, Postman for API testing

### 

---
