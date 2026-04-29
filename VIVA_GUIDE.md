# Smart Complaint Escalation System - VIVA GUIDE

## PROJECT OVERVIEW

The **Smart Complaint Escalation System** is a full-stack MERN (MongoDB, Express, React, Node.js) web application that helps municipalities manage and track civic complaints efficiently with automated SLA (Service Level Agreement) tracking.

---

## 🎯 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│  - User Interface (Citizen, Officer, Admin, Worker)         │
│  - Dark Mode Support (TailwindCSS)                          │
│  - Internationalization (i18next - English, Hindi, Telugu)  │
│  - Real-time interactions                                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API Calls (Axios)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                    │
│  - REST API Server                                          │
│  - Authentication & Authorization (JWT)                    │
│  - Business Logic (Complaints, Users, Departments)          │
│  - Email Notifications (Nodemailer)                        │
│  - File Upload Handler (Multer)                            │
└────────────────────┬────────────────────────────────────────┘
                     │ Database Queries (Mongoose ODM)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB)                              │
│  - Collections: Users, Complaints, Departments, etc.        │
│  - In-Memory MongoDB for Development                        │
│  - Can use MongoDB Atlas for Production                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 KEY TECHNOLOGIES & HOW THEY WORK

### **FRONTEND TECHNOLOGIES**

#### 1. **React (UI Framework)**
- **What it is**: A JavaScript library for building user interfaces
- **How it works**: Component-based architecture where each page/section is a reusable component
- **Example**: `CitizenDashboard.jsx`, `Login.jsx`, `Navbar.jsx`
- **Key features in project**:
  ```jsx
  function CitizenDashboard() {
    const [complaints, setComplaints] = useState([]);
    useEffect(() => {
      fetchComplaints(); // Fetch data on component load
    }, []);
    return <div>{/* JSX rendering */}</div>;
  }
  ```

#### 2. **Vite (Build Tool)**
- **What it is**: Modern frontend build tool and dev server
- **How it works**: 
  - Provides hot module replacement (HMR) - instant updates without refresh
  - Bundles React code for production
  - Faster startup time than Create React App
- **Config**: `vite.config.js` in frontend folder

#### 3. **React Router (Navigation)**
- **What it is**: Library for client-side routing
- **How it works**: Maps URLs to different components
- **Example**:
  ```javascript
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login/citizen" element={<Login expectedRole="citizen" />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  </Routes>
  ```

#### 4. **Axios (HTTP Client)**
- **What it is**: Promise-based HTTP client for making API calls
- **How it works**: Sends requests to backend, receives JSON responses
- **Example**:
  ```javascript
  const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
  ```

#### 5. **TailwindCSS (Styling)**
- **What it is**: Utility-first CSS framework
- **How it works**: Uses predefined CSS classes for styling
- **Dark Mode**: Automatically switches between light/dark themes
- **Example**: `<button className="btn-primary w-full py-3">`

#### 6. **i18next (Internationalization)**
- **What it is**: Multi-language support library
- **Languages**: English, Hindi, Telugu
- **JSON Files**: Stored in `src/i18n/` folder
- **Usage**: `const { t } = useTranslation(); t('auth.login')`

---

### **BACKEND TECHNOLOGIES**

#### 1. **Node.js & Express (Server Framework)**
- **What it is**: JavaScript runtime + web framework for APIs
- **How it works**: 
  - Handles HTTP requests from frontend
  - Processes data using controllers
  - Queries database using models
  - Returns JSON responses
- **Port**: 5000

#### 2. **MongoDB (Database)**
- **What it is**: NoSQL document-based database
- **How it works**: Stores data as JSON-like documents
- **Collections Used**:
  ```
  Users          → Stores user accounts (email, password, role)
  Complaints     → Stores all complaints filed
  Departments    → Government departments (Roads, Water, Garbage, etc.)
  Notifications  → In-app notifications for users
  Escalations    → Complaint escalations
  SLAConfigs     → Service level timelines
  ```

#### 3. **Mongoose (MongoDB ODM)**
- **What it is**: Object Data Modeling library for MongoDB
- **How it works**: 
  - Defines schemas (structure of documents)
  - Provides methods like `.create()`, `.find()`, `.updateOne()`
  - Enforces data validation
- **Example Schema**:
  ```javascript
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'worker', 'officer', 'admin'] },
    civicPoints: { type: Number, default: 0 }
  });
  ```

#### 4. **JWT (Authentication)**
- **What it is**: JSON Web Token for secure authentication
- **How it works**:
  1. User registers/logs in → Gets a token
  2. Token stored in browser's localStorage
  3. Token sent with each API request in Authorization header
  4. Backend verifies token before allowing access
- **Token Structure**:
  ```
  Header.Payload.Signature
  eyJhbGc...iOiJob... (encoded user ID & role)
  ```

#### 5. **Bcrypt (Password Encryption)**
- **What it is**: Password hashing library
- **How it works**:
  1. User registers with password
  2. Bcrypt hashes it (one-way encryption)
  3. Hash stored in database (never store plain password!)
  4. On login, password compared with hash
- **Usage**: `bcrypt.hash(password, 10)` or `bcrypt.compare(password, hashedPassword)`

#### 6. **Multer (File Upload)**
- **What it is**: Middleware for handling file uploads
- **How it works**:
  1. User uploads image with complaint
  2. Multer saves file to `/uploads` folder
  3. Returns file path stored in database
  4. Path used later to display image
- **Location**: `backend/uploads/` folder

#### 7. **Nodemailer (Email Notifications)**
- **What it is**: Service for sending emails
- **How it works**:
  1. Uses Gmail SMTP server
  2. Sends confirmation emails when complaint registered
  3. Sends status updates
  4. Sends password reset OTPs
- **Requires**: Gmail app password in `.env` file

---

## 🔐 AUTHENTICATION FLOW

```
1. USER REGISTRATION
   ├─ User fills form (name, email, password, role)
   ├─ Password hashed using Bcrypt
   ├─ User document created in MongoDB
   ├─ JWT token generated
   └─ Token + user data returned to frontend

2. USER LOGIN
   ├─ User enters email & password
   ├─ Backend finds user by email
   ├─ Compares password with stored hash using Bcrypt
   ├─ If match → JWT token generated
   ├─ Token stored in localStorage
   └─ Redirect to dashboard based on role

3. API REQUEST (Protected Routes)
   ├─ Frontend sends token in header: "Authorization: Bearer <token>"
   ├─ Backend's middleware `protect` verifies token
   ├─ Token decoded to get user ID & role
   ├─ User authorized based on role
   └─ Request processed & response sent

4. LOGOUT
   ├─ Token deleted from localStorage
   ├─ User redirected to login page
```

---

## 📝 DATA MODELS & RELATIONSHIPS

### **User Model**
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  password: "<hashed>",
  role: "citizen",  // citizen, worker, officer, admin
  civicPoints: 50,  // Earned by helping resolve complaints
  departmentId: ObjectId, // For workers/officers
  phone: "9876543210"
}
```

### **Complaint Model**
```javascript
{
  userId: ObjectId,           // Who filed the complaint
  title: "Pothole on Main St",
  description: "Large hole causing accidents",
  issueType: "Road",          // 'Road', 'Water', 'Garbage', etc.
  priority: "High",           // Low, Medium, High
  status: "In Progress",      // Registered → In Progress → Resolved
  location: { lat: 28.6139, lng: 77.209 },
  imageUrls: ["/uploads/image1.jpg"],
  departmentId: ObjectId,     // Auto-assigned based on issueType
  workerId: ObjectId,         // Worker assigned to fix it
  slaDeadline: "2026-04-28T10:00:00Z",  // Must be resolved by this time
  feedback: { rating: 5, comment: "Great job!" },
  messages: [{ senderId, text, createdAt }],  // Chat between citizen & worker
  isEscalated: false
}
```

### **Department Model**
```javascript
{
  departmentName: "Roads & Transportation",
  issueTypes: ["Road", "Pothole", "Street Light", "Traffic Signal"]
}
```

### **Relationship Diagram**
```
User (Citizen) ──── Creates ──── Complaint
                                    │
                              Auto-assigns to
                                    │
                                    ▼
                            Department
                                    │
                              Sends to
                                    │
                                    ▼
                    Worker (from that department)
                                    │
                              Resolves & Comments
```

---

## 🔄 KEY WORKFLOWS

### **WORKFLOW 1: FILING A COMPLAINT**
```
1. Citizen logs in → goes to dashboard
2. Clicks "New Complaint" button → opens modal
3. Fills form:
   - Title: "Water Leak in Park"
   - Description: "Pipe leaking..."
   - Issue Type: "Water" (auto-detects based on description)
   - Priority: "High"
   - Location: GPS coordinates (auto-detected or manual)
   - Images: Upload proof photos
4. Clicks Submit
5. Frontend sends POST request to /api/complaints:
   └─ Backend processes:
      a) Creates Complaint document
      b) Auto-assigns Department based on issueType
      c) Calculates SLA deadline based on priority
      d) Saves images to /uploads folder
      e) Sends confirmation email
      f) Returns complaint object
6. Frontend shows success message
7. Complaint appears in citizen's dashboard
```

### **WORKFLOW 2: HANDLING COMPLAINTS (Officer/Worker)**
```
1. Officer logs in → sees complaints for their department
2. Officer reviews complaint details, updates status:
   Status Flow: Registered → In Progress → Resolved
                    ↓ (if delayed)
                  Escalated
3. Officer assigns a Worker to the complaint
4. Worker receives notification about assignment
5. Worker views complaint, adds updates via chat messages
6. When fixed, Worker uploads "Before & After" image
7. Worker marks as "Resolved"
8. System automatically:
   - Gives citizen Civic Points (reputation)
   - Notifies citizen via email
   - Stores resolved image as proof
9. Citizen provides feedback (rating + comment)
```

### **WORKFLOW 3: ESCALATION & SLA TRACKING**
```
1. Each complaint has SLA deadline based on priority:
   - High Priority: 24 hours
   - Medium Priority: 48 hours
   - Low Priority: 72 hours

2. If status not changed before deadline:
   - Complaint auto-escalates
   - Senior officer notified
   - Flag raised in system

3. Escalation workflow:
   Original Officer → Senior Officer → Admin
   
4. Admin can:
   - Force assign to different worker
   - Change priority
   - Override SLA
```

---

## 🖥️ ROLE-BASED ACCESS CONTROL

### **CITIZEN**
- **Can do**:
  - File complaints
  - View own complaints
  - Upload images/proof
  - Chat with worker
  - Give feedback/rating
  - See civic points
- **Cannot do**:
  - Change complaint status
  - View other citizen's complaints
  - Access admin features

### **WORKER**
- **Can do**:
  - View assigned complaints
  - Update status
  - Upload resolution images
  - Chat with citizens
  - See metrics (complaints handled, average rating)
- **Cannot do**:
  - Create complaints
  - Assign themselves
  - Delete complaints

### **OFFICER**
- **Can do**:
  - View all complaints in their department
  - Assign workers
  - Update status
  - Escalate complaints
  - See department metrics
- **Cannot do**:
  - Access other departments
  - Modify workers
  - Delete users

### **ADMIN**
- **Can do**:
  - Full system access
  - Create users of all roles
  - Create departments
  - Assign officers to departments
  - Assign workers to officers
  - View all complaints (system-wide)
  - Configure SLA timelines
  - Override any status
  - See system metrics

---

## 🔌 API ENDPOINTS

### **Authentication APIs**
```
POST   /api/auth/register          → Register new user
POST   /api/auth/login             → Login & get JWT token
GET    /api/auth/me                → Get current user profile
POST   /api/auth/forgot-password   → Send OTP to email
POST   /api/auth/verify-otp        → Verify OTP
POST   /api/auth/reset-password    → Reset password with OTP
```

### **Complaint APIs**
```
POST   /api/complaints             → File new complaint (citizen)
GET    /api/complaints             → Get complaints (role-based)
PUT    /api/complaints/:id         → Update complaint (officer/worker)
PUT    /api/complaints/:id/status  → Change status
PUT    /api/complaints/:id/assign  → Assign worker
POST   /api/complaints/:id/messages → Add chat message
PUT    /api/complaints/:id/feedback → Submit rating/feedback
```

### **Department APIs**
```
GET    /api/departments            → Get all departments
POST   /api/departments            → Create department (admin)
```

### **User APIs**
```
GET    /api/auth/users             → Get all users (admin)
PUT    /api/auth/users/:id/role    → Change user role (admin)
GET    /api/auth/workers           → Get workers (officer/admin)
```

---

## 💾 DATA FLOW EXAMPLE

### **User Files Complaint**
```mermaid
Frontend                          Backend                    Database
   │                              │                           │
   ├─ Form filled ────────────────►                           │
   │  (title, desc,               │                           │
   │   location, images)          │                           │
   │                              ├─ Validate input           │
   │                              ├─ Hash files               │
   │                              ├─ Find department          │
   │                              ├─ Calculate SLA deadline   │
   │                              ├─ Create Complaint doc ────┤
   │                              ├─ Send email notification  │
   │                              ├─ Return complaint object  │
   │◄─────────── JSON response ───┤                           │
   │                              │                           │
   ├─ Show success message        │                           │
   ├─ Add to complaints list      │                           │
   ├─ Show in dashboard           │                           │
   │                              │                           │
```

---

## 🚀 KEY FEATURES EXPLAINED

### **1. Auto-categorization**
```javascript
// Based on keywords in description, system auto-suggests category
"pothole, street, road" → Category: "Road"
"water, leak, pipe" → Category: "Water"
"garbage, trash, waste" → Category: "Garbage"
```

### **2. Civic Points System**
```
When complaint resolved:
  Citizen gets: +10 civic points
  
Levels:
  0-50 points    → Civic Starter 🌱
  50-100 points  → Civic Contributor ⭐
  100+ points    → Civic Hero 👑
```

### **3. SLA Tracking**
```
Priority    Deadline
─────────────────────
High        24 hours
Medium      48 hours
Low         72 hours

If deadline exceeded → Auto-escalate to senior officer
```

### **4. Duplicate Detection**
```
Prevents multiple complaints about same issue:
- Checks issue type + location + time
- Warns citizen if similar complaint exists
- Citizen can still proceed if intentional
```

### **5. Image Upload**
```
- Citizen uploads complaint images
- Worker uploads resolution/before-after images
- Stored in /uploads folder
- Files served as static content
```

---

## 📊 DATABASE SCHEMA OVERVIEW

```
┌──────────────────────────────────────────────────────┐
│                    MongoDB Collections               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  users ─────────┬─→ complaints                      │
│    ├─ name      │     ├─ title                      │
│    ├─ email     │     ├─ description                │
│    ├─ password  │     ├─ status                     │
│    ├─ role      │     └─ userId (ref to users)      │
│    └─ civicPoints      │                            │
│                 │   departments ◄──┘                │
│                 │     ├─ departmentName             │
│                 │     └─ issueTypes                 │
│                 │                                   │
│                 └─→ notifications                   │
│                       ├─ userId (ref to users)      │
│                       └─ message                    │
│                                                      │
│  slaconfigs                                         │
│    ├─ highPriorityHours: 24                         │
│    ├─ mediumPriorityHours: 48                       │
│    └─ lowPriorityHours: 72                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## ⚠️ POSSIBLE VIVA QUESTIONS & ANSWERS

### **Q1: What is the purpose of this project?**
**A:** The Smart Complaint Escalation System helps municipalities efficiently manage civic complaints from citizens. It:
- Automates complaint registration and tracking
- Routes complaints to appropriate departments
- Ensures timely resolution with SLA tracking
- Provides transparency through status updates
- Implements a reputation system (civic points)
- Enables communication between citizens and workers

### **Q2: Why is MongoDB used instead of SQL databases like MySQL?**
**A:** MongoDB is chosen because:
- **Flexible Schema**: Complaint data can vary (some have images, some don't)
- **Scalability**: Handles large volumes of complaints
- **Document Structure**: JSON-like format matches JavaScript objects naturally
- **Easy Serialization**: Direct to JSON for API responses
- **Embedded Arrays**: Can store messages and images arrays within complaint document

### **Q3: Explain the JWT authentication flow in this project.**
**A:**
1. User registers → password hashed with Bcrypt → JWT token generated with user ID & role
2. Token stored in localStorage on frontend
3. Each API request includes token in Authorization header
4. Backend middleware verifies token signature & expiry
5. If valid, user ID decoded and attached to request
6. Controller checks user role for authorization
7. If unauthorized role → return 403 error

### **Q4: How does role-based access control work?**
**A:**
- Middleware verifies JWT token and extracts user role
- Different routes protected with `authorize('citizen')`, `authorize('officer', 'admin')`
- Controllers implement role-based logic for queries
- Example: Citizen sees only own complaints, Officer sees department complaints
- Admin sees everything system-wide

### **Q5: Explain the complaint lifecycle.**
**A:**
```
Citizen files complaint
        ↓
Auto-assigned to Department based on issue type
        ↓
Officer reviews & assigns Worker
        ↓
Worker updates status to "In Progress"
        ↓
Worker resolves & uploads proof image
        ↓
Status changed to "Resolved"
        ↓
Citizen given Civic Points & Feedback form shown
        ↓
System ends complaint lifecycle
```

### **Q6: How is the SLA deadline calculated and what happens if it's exceeded?**
**A:**
- Each complaint gets deadline based on priority:
  - High: 24 hours from creation
  - Medium: 48 hours from creation
  - Low: 72 hours from creation
- If not resolved before deadline:
  - System flags it as "Escalated"
  - Senior officer notified
  - System prevents normal closure (forces escalation workflow)
- Admin can override SLA if needed

### **Q7: What is the purpose of Civic Points?**
**A:**
- **Gamification**: Encourages responsible complaint filing
- **Reputation**: Users earn points by helping system work
- **Levels**: Different levels (Starter, Contributor, Hero) based on points
- **Reward**: Citizens with high points get priority or recognition
- **Implementation**: +10 points given when complaint resolved

### **Q8: How are images handled in file uploads?**
**A:**
- **Multer Middleware**: Intercepts multipart/form-data requests
- **Storage**: Files saved to `/backend/uploads/` folder
- **Naming**: Stored with timestamp to prevent collisions
- **Database**: File path saved in imageUrls array
- **Serving**: Express static middleware serves `/uploads` folder
- **Response**: Frontend displays images using `/uploads/filename.jpg` path

### **Q9: Explain the auto-categorization feature using keywords.**
**A:**
```javascript
// On frontend, as user types description:
"pothole on street" → Keywords detected → Category changed to "Road"
"water leak in pipe" → Keywords detected → Category changed to "Water"
"garbage pile" → Keywords detected → Category changed to "Garbage"

// Backend auto-assigns department based on this category
```
This improves UX and prevents categorization errors.

### **Q10: How does the notification system work?**
**A:**
- **Database Notifications**: Stored in Notifications collection
- **Email Notifications**: Sent via Nodemailer (Gmail SMTP)
- **Triggers**:
  - Complaint registered → Confirmation email sent
  - Status updated → Status email sent
  - Worker assigned → In-app notification created
  - Forgot password → OTP email sent
- **Frontend**: Fetches notifications on load, displays count badge

### **Q11: What is i18n and how is it implemented here?**
**A:**
- **i18next**: International Framework for translations
- **Supported Languages**: English, Hindi, Telugu
- **JSON Files**: `/frontend/src/i18n/` folder contains `en.json`, `hi.json`, `te.json`
- **Usage**: `const { t } = useTranslation(); t('auth.login')`
- **Automatic Detection**: Browser language detected automatically
- **Manual Switch**: Dropdown to switch languages (stored in localStorage)

### **Q12: How is password security ensured?**
**A:**
1. **Hashing**: Bcrypt hashes passwords with salt (never store plain)
2. **Comparison**: On login, Bcrypt compares entered password with hash in DB
3. **No Recovery**: Since one-way hash, can't decrypt stored password
4. **Original Never Sent**: Password never sent over HTTPS without TLS
5. **OTP for Reset**: Forgot password uses OTP, not link-based (more secure)

### **Q13: Explain Multer middleware and its role in file uploads.**
**A:**
```javascript
// Middleware in authMiddleware.js:
const upload = multer({ storage: multer.diskStorage({ ... }) });

// Usage in routes:
router.post('/complaints', protect, upload.array('image'), createComplaint);

// In controller:
if (req.files && req.files.length > 0) {
  imageUrls = req.files.map(f => `/uploads/${f.filename}`);
}
```
- Intercepts file uploads
- Stores files to disk with unique names
- Returns paths for database storage

### **Q14: What is the MERN stack and why is it chosen?**
**A:**
- **M**ongoDB: Flexible NoSQL database
- **E**xpress: Lightweight Node.js web framework
- **R**eact: Powerful UI library with component reusability
- **N**ode.js: JavaScript runtime for backend

**Advantages**:
- Single language (JavaScript) across full stack
- Large community & ecosystem
- Fast development
- Scalable
- Easy to learn

### **Q15: How does Vite differ from Create React App?**
**A:**
- **Vite**: Uses ES modules, faster dev server, instant HMR
- **CRA**: Uses Webpack, slower startup, full rebuild on change
- **Vite faster** because it only rebuilds changed module
- **Vite bundling**: Uses Rollup for optimized production build

### **Q16: Explain the protect middleware in authentication.**
**A:**
```javascript
exports.protect = (req, res, next) => {
  // 1. Extract token from Authorization header
  let token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token' });
  
  try {
    // 2. Verify token signature and expiry
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 3. Attach user info to request object
    req.user = decoded;
    
    // 4. Pass control to next middleware/controller
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### **Q17: How would you deploy this application?**
**A:**
1. **Frontend**:
   - Build: `npm run build` → creates `dist/` folder
   - Deploy to: Vercel, Netlify, AWS S3, GitHub Pages
   - Set VITE_API_URL to production backend URL

2. **Backend**:
   - Deploy to: Heroku, Railway, AWS EC2, DigitalOcean
   - Use MongoDB Atlas (cloud) instead of in-memory
   - Set environment variables in deployment platform
   - Start with `npm run dev` or `npm start`

### **Q18: What are the limitations and improvements for this system?**
**A:**
**Current Limitations**:
- In-memory database (data lost on restart)
- No real-time updates (needs WebSocket)
- No payment/billing system
- Limited to single server (no load balancing)

**Possible Improvements**:
- **Real-time Updates**: Use Socket.io for instant notifications
- **Caching**: Redis for user sessions & complaint cache
- **Analytics**: Dashboard with charts & trends
- **Mobile App**: React Native version
- **Payment Integration**: For premium features
- **Microservices**: Separate complaints, users, notifications services
- **Advanced Search**: Elasticsearch for complaint search
- **ML Integration**: Predictive analytics for complaint resolution time

### **Q19: How is the complaint status flow controlled?**
**A:**
```javascript
// Valid transitions:
Registered → In Progress (when worker assigned)
In Progress → Resolved (when fixed)
Any Status → Escalated (if SLA exceeded or officer escalates)
Any Status → Cancelled (by citizen or admin)

// Backend enforces these transitions
// Invalid transitions rejected with 400 error
```

### **Q20: Explain the department assignment logic.**
**A:**
```javascript
// When complaint created:
1. systemfolds complaint.issueType (e.g., "Water")
2. Searches for department with this issueType
3. Found: "Water & Sanitation" dept with issueTypes: ["Water", "Leak", ...]
4. Assigns complaint to this department
5. All department's workers notified (via officers)
6. Officer assigns specific worker

// If no matching department:
7. Assigns to default/first department
8. Manual reassignment available in system
```

---

## 🎓 SUMMARY FOR VIVA

### **Key Points to Remember**:

1. **Architecture**: MERN stack with clear separation of frontend, backend, database
2. **Security**: JWT authentication + Bcrypt hashing + Role-based access control
3. **Data**: MongoDB stores users, complaints, departments, notifications
4. **Features**: Auto-routing, SLA tracking, Civic points, multi-language support
5. **Workflow**: Citizen files → Auto-assigned to department → Worker resolves → Feedback given
6. **APIs**: RESTful endpoints for all operations
7. **UI**: React components with TailwindCSS styling + Dark mode
8. **Scalability**: Can replace in-memory DB with MongoDB Atlas for production

### **Things to Practice**:
- Draw architecture diagram
- Explain JWT flow on whiteboard
- Walk through complaint filing process
- Explain role-based access control
- Discuss why MongoDB was chosen
- Talk about how you'd improve the system

---

## 📚 QUICK REFERENCE

| Component | Technology | Purpose |
|-----------|-----------|---------|
| UI | React | User interface |
| Styling | TailwindCSS | Design & dark mode |
| Build | Vite | Fast bundling |
| HTTP | Axios | API calls |
| Routing | React Router | Page navigation |
| Backend | Express | Server & APIs |
| Runtime | Node.js | JavaScript runtime |
| Database | MongoDB | Data storage |
| ODM | Mongoose | Database schema & queries |
| Auth | JWT | Secure authentication |
| Passwords | Bcrypt | Password hashing |
| Files | Multer | File upload handling |
| Email | Nodemailer | Email notifications |
| i18n | i18next | Multi-language support |

---

**Good luck with your viva! 🎉**
