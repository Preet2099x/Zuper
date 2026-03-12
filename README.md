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

---

## 📚 API Documentation

### Swagger/OpenAPI
The API is fully documented using Swagger/OpenAPI 3.0. Access the interactive API documentation at:

**Local Development:** `http://localhost:5000/api-docs`

**Production:** `https://zuper-backend.onrender.com/api-docs`

The Swagger UI provides:
- Interactive API testing interface
- Complete endpoint documentation with request/response examples
- Authentication flow demonstration
- Schema definitions for all models

### API Versioning
All API endpoints are versioned under `/api/v1/` to ensure backward compatibility:

- **Authentication:** `/api/v1/auth/*`
- **Users:** `/api/v1/user/*`
- **Vehicles:** `/api/v1/vehicles/*`
- **Bookings:** `/api/v1/bookings/*`
- **Payments:** `/api/v1/payments/*`
- **Documents:** `/api/v1/documents/*`
- **Messages:** `/api/v1/messages/*`

---

## 🚀 Scalability & Architecture

### Current Architecture
Zuper is built with scalability in mind, following industry best practices:

**Backend Architecture:**
- **MVC Pattern:** Clean separation of Models, Views (Routes), and Controllers
- **Modular Design:** Independent route modules for easy feature additions
- **Middleware Pipeline:** Centralized authentication, validation, and error handling
- **Database:** MongoDB with connection pooling (10 max connections)
- **Cloud Storage:** Azure Blob Storage for vehicle images and documents

**Security Measures:**
- JWT-based authentication with role-based access control (Customer, Provider, Admin)
- Password hashing with bcrypt (10 rounds)
- Input validation and sanitization using express-validator
- CORS configuration with whitelisted origins
- Rate limiting on email sending (5 emails/sec)
- Secure file upload validation (type, size limits)

### Scalability Strategies

**1. Horizontal Scaling**
- Stateless API design enables easy horizontal scaling across multiple instances
- JWT tokens eliminate server-side session storage requirements
- Load balancers (Nginx, AWS ALB) can distribute traffic across instances

**2. Caching Layer (Future Enhancement)**
```javascript
// Redis caching for frequently accessed data
- Vehicle listings cache (TTL: 5 minutes)
- User profile cache (TTL: 15 minutes)
- Search results cache
- Reduces database queries by ~60-70%
```

**3. Database Optimization**
- **Indexing:** Compound indexes on frequently queried fields (email, phone, licensePlate)
- **Connection Pooling:** Configured for optimal concurrent connections
- **Read Replicas:** MongoDB Atlas supports read replicas for read-heavy operations
- **Sharding:** Can shard by geographic location or provider ID for multi-region scaling

**4. Microservices Migration Path**
The current modular structure enables seamless transition to microservices:
```
Current Monolith → Future Microservices
├── Auth Service (signup, login, JWT)
├── Vehicle Service (CRUD, search)
├── Booking Service (reservations, contracts)
├── Payment Service (Razorpay integration)
├── Notification Service (emails, SMS)
└── Media Service (Azure Blob Storage)
```

**5. Performance Optimizations**
- **Non-blocking Operations:** Email sending, Azure storage initialization
- **Lazy Loading:** Vehicle images loaded on-demand
- **Pagination:** All list endpoints support pagination
- **CDN Integration:** Static assets served via CDN (future)

**6. Monitoring & Logging**
```javascript
// Production-ready monitoring (future integration)
- Application Performance Monitoring (APM): New Relic, DataDog
- Error Tracking: Sentry for real-time error alerts
- Logging: Winston/Bunyan with centralized log aggregation
- Health Checks: /health endpoint for load balancer monitoring
```

**7. Deployment Strategy**
- **Containerization:** Docker support with multi-stage builds
- **CI/CD:** GitHub Actions for automated testing and deployment
- **Infrastructure as Code:** Terraform/CloudFormation for reproducible infrastructure
- **Auto-scaling:** Kubernetes HPA or cloud-native auto-scaling groups

### Load Capacity Estimates
With current architecture:
- **Single Instance:** ~500-1000 concurrent users
- **With Caching:** ~2000-3000 concurrent users
- **With Load Balancing (3 instances):** ~5000-10000 concurrent users
- **Microservices + Caching:** 50,000+ concurrent users

---
