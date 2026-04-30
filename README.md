# fulll-stackk
 🚀 Smart Complaint Escalation System

> A comprehensive full-stack MERN application designed for municipalities and civic bodies to efficiently manage, track, and escalate citizen complaints with automated SLA (Service Level Agreement) monitoring and real-time notifications.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Role-Based Features](#role-based-features)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **📝 Complaint Management**: Citizens can file complaints with images and detailed descriptions
- **🎯 Role-Based Access Control**: Separate dashboards for Citizens, Officers, Admins, and Workers
- **⏰ SLA Tracking**: Automated Service Level Agreement monitoring with escalation triggers
- **📊 Real-time Notifications**: Email and in-app notifications for complaint updates
- **🗓️ Calendar View**: Visual representation of complaint timelines and deadlines
- **🌐 Multi-Language Support**: English, Hindi, and Telugu language options
- **📸 Image Uploads**: Support for complaint evidence/proof images via Multer
- **🔐 JWT Authentication**: Secure session management with token-based authentication
- **🌙 Dark Mode**: Full dark mode support with TailwindCSS

### Advanced Features
- **⚡ Automatic Escalation**: Smart escalation based on SLA violations
- **🔔 Department Routing**: Automatic complaint assignment to relevant departments
- **📈 Analytics Dashboard**: Admin panel with complaint statistics and reports
- **🔄 Status Tracking**: Real-time complaint status updates
- **💬 Community Feed**: Citizens can view public complaint updates and solutions

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Encryption**: bcrypt
- **File Uploads**: Multer
- **Email Service**: Nodemailer
- **Development**: Nodemon

### Frontend
- **Library**: React 18+
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Styling Framework**: PostCSS
- **Internationalization**: i18n
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Deployment**: Vercel-ready

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v7.0.0 or higher) - comes with Node.js
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - MongoDB should be running on `localhost:27017` or accessible via your MongoDB URI
- **Git** (optional but recommended) - [Download](https://git-scm.com/)

## 🚀 Installation & Setup

### Option 1: Install All Dependencies at Once (Recommended)

From the root directory:

```bash
npm run install-all
```

This will install dependencies for both backend and frontend.

### Option 2: Manual Setup

#### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The backend server will run on `http://localhost:5000`

#### 2️⃣ Frontend Setup

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default)

### Option 3: Run Both Concurrently

From the root directory:

```bash
npm run dev
```

This will start both backend and frontend servers simultaneously using `concurrently`.

## 📂 Project Structure

```
SmartComplaintSystem/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   ├── departmentController.js
│   │   └── notificationController.js
│   ├── models/               # Mongoose schemas
│   │   ├── Complaint.js
│   │   ├── Department.js
│   │   ├── Escalation.js
│   │   ├── Notification.js
│   │   ├── SLAConfig.js
│   │   └── User.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── departmentRoutes.js
│   │   └── notificationRoutes.js
│   ├── middlewares/          # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── services/             # Business logic services
│   │   └── notificationService.js
│   ├── uploads/              # Uploaded files storage
│   ├── server.js             # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── CalendarView.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/          # React Context API
│   │   │   └── AuthContext.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── OfficerDashboard.jsx
│   │   │   ├── WorkerDashboard.jsx
│   │   │   ├── CommunityFeed.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── i18n/             # Internationalization
│   │   │   ├── en.json       # English translations
│   │   │   ├── hi.json       # Hindi translations
│   │   │   ├── te.json       # Telugu translations
│   │   │   └── i18n.js
│   │   ├── api.js            # API service calls
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json           # Vercel deployment config
│   └── package.json
│
├── README.md                  # This file
├── package.json              # Root package.json
├── code_explanation_script.md
└── frontend_presentation_script.md
```

## 🔧 Environment Variables

### Backend `.env` file

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smart-complaint-system
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-complaint-system

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### Frontend `.env` file (if needed)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Smart Complaint System
```

## 📖 Usage

### For Citizens
1. **Register** or **Login** with your credentials
2. **File a Complaint** with detailed description and images
3. **Track Status** in real-time on your dashboard
4. **View Notifications** for complaint updates
5. **Participate** in Community Feed

### For Officers
1. **Login** with officer credentials
2. **View Assigned Complaints** in dashboard
3. **Update Complaint Status** with progress notes
4. **Manage Department** complaints
5. **Monitor SLA** compliance

### For Admins
1. **Access Admin Dashboard** for system overview
2. **Manage Users** and roles
3. **Monitor SLA Metrics** and escalations
4. **View Analytics** and reports
5. **Configure SLA Rules** for departments

### For Workers
1. **View Assigned Tasks** from complaints
2. **Update Progress** on assigned work
3. **Mark Completion** when work is done

## 🔌 API Endpoints

### Authentication Routes
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password with token
POST   /api/auth/verify-otp      - Verify OTP
```

### Complaint Routes
```
GET    /api/complaints           - Get all complaints (with filters)
GET    /api/complaints/:id       - Get complaint details
POST   /api/complaints           - Create new complaint
PUT    /api/complaints/:id       - Update complaint
DELETE /api/complaints/:id       - Delete complaint
POST   /api/complaints/:id/escalate - Escalate complaint
```

### Department Routes
```
GET    /api/departments          - Get all departments
GET    /api/departments/:id      - Get department details
POST   /api/departments          - Create department (Admin)
PUT    /api/departments/:id      - Update department (Admin)
DELETE /api/departments/:id      - Delete department (Admin)
```

### Notification Routes
```
GET    /api/notifications        - Get user notifications
GET    /api/notifications/:id    - Get notification details
PUT    /api/notifications/:id/read - Mark notification as read
DELETE /api/notifications/:id    - Delete notification
```

## 👥 Role-Based Features

| Feature | Citizen | Officer | Admin | Worker |
|---------|---------|---------|-------|--------|
| File Complaint | ✅ | ❌ | ❌ | ❌ |
| View Own Complaints | ✅ | ✅ | ✅ | ❌ |
| View All Complaints | ❌ | ✅ | ✅ | ❌ |
| Update Complaint Status | ❌ | ✅ | ✅ | ❌ |
| Assign Complaints | ❌ | ✅ | ✅ | ❌ |
| Manage Departments | ❌ | ❌ | ✅ | ❌ |
| View Analytics | ❌ | ✅ | ✅ | ❌ |
| Configure SLA | ❌ | ❌ | ✅ | ❌ |
| Manage Users | ❌ | ❌ | ✅ | ❌ |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **nallamilli mohan sai jagadiswara reddy** - Initial work

[⬆ Back to Top](#-smart-complaint-escalation-system)

</div>
