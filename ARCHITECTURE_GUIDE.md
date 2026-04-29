# Smart Complaint System - ARCHITECTURE & CONNECTIONS

## COMPLETE SYSTEM FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CITIZEN (Frontend - React)                      │
│                                                                         │
│  ┌──────────────────┐      ┌──────────────────┐                       │
│  │   Login Page     │      │  Home Page       │                       │
│  │  - Email         │      │  - Dashboard     │                       │
│  │  - Password      │      │  - Stats         │                       │
│  │  - Role: Citizen │      │  - My Complaints │                       │
│  └────────┬─────────┘      └──────────────────┘                       │
│           │                         ▲                                  │
│           │                         │                                  │
│    AXIOS POST /auth/login  AXIOS GET /complaints                      │
│           │                         │                                  │
│           ▼                         │                                  │
│  ┌────────────────────────────────────────┐                          │
│  │        TailwindCSS Styled UI           │                          │
│  │    - Dark Mode Support                 │                          │
│  │    - Responsive Design                 │                          │
│  │    - i18next Translations              │                          │
│  └────────────────────────────────────────┘                          │
│           │                         ▲                                  │
└───────────┼─────────────────────────┼──────────────────────────────────┘
            │                         │
            │   HTTPS JSON API CALLS  │
            │                         │
┌───────────▼─────────────────────────┴──────────────────────────────────┐
│                    BACKEND (Express.js - Node.js)                      │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────┐        │
│  │          REQUEST MIDDLEWARE LAYER                        │        │
│  │  ├─ CORS (Cross-Origin Resource Sharing)               │        │
│  │  ├─ express.json() (Parse JSON body)                  │        │
│  │  └─ Static file serving (/uploads)                    │        │
│  └──────────────────────────────────────────────────────────┘        │
│                            │                                         │
│                    ┌───────▼──────────┐                             │
│                    │  ROUTE HANDLERS  │                             │
│                    └───────┬──────────┘                             │
│                            │                                        │
│           ┌────────────────┼────────────────┐                      │
│           │                │                │                      │
│      ┌────▼───┐    ┌──────▼──────┐  ┌─────▼─────┐                │
│      │ AUTH   │    │ COMPLAINTS  │  │DEPARTMENT │                │
│      │ROUTES  │    │ ROUTES      │  │ ROUTES    │                │
│      └────┬───┘    └──────┬──────┘  └─────┬─────┘                │
│           │                │               │                      │
│           ▼                ▼               ▼                      │
│      ┌─────────────┐  ┌─────────────┐  ┌──────────────┐          │
│      │   AUTH      │  │ COMPLAINTS  │  │ DEPARTMENT   │          │
│      │ CONTROLLER  │  │ CONTROLLER  │  │ CONTROLLER   │          │
│      │             │  │             │  │              │          │
│      │ ├─ register │  │ ├─ create   │  │ ├─ get all   │          │
│      │ ├─ login    │  │ ├─ get list │  │ ├─ create    │          │
│      │ ├─ getMe    │  │ ├─ update   │  │ └─ delete    │          │
│      │ └─ resetPass│  │ └─ assign   │  └──────────────┘          │
│      └─────┬───────┘  └─────┬───────┘                            │
│            │                │                                    │
│            └────────┬───────┘                                    │
│                     │                                            │
│           ┌─────────▼──────────┐                                │
│           │ AUTHENTICATION MW  │                                │
│           │  - protect()       │ (Verify JWT Token)             │
│           │  - authorize()     │ (Check User Role)              │
│           └─────────┬──────────┘                                │
│                     │                                            │
│           ┌─────────▼──────────────────────────────┐            │
│           │      MONGOOSE ODM QUERIES              │            │
│           │  - User.findOne()                      │            │
│           │  - Complaint.create()                  │            │
│           │  - Department.find()                   │            │
│           └─────────┬──────────────────────────────┘            │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │
                      │  MONGODB QUERIES
                      │
┌─────────────────────▼────────────────────────────────────────────┐
│              DATABASE (MongoDB - In-Memory/Atlas)               │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   USERS      │  │ COMPLAINTS   │  │ DEPARTMENTS  │          │
│  │ Collection   │  │ Collection   │  │ Collection   │          │
│  │              │  │              │  │              │          │
│  │ ├─ _id       │  │ ├─ _id       │  │ ├─ _id       │          │
│  │ ├─ name      │  │ ├─ title     │  │ ├─ dept Name │          │
│  │ ├─ email     │  │ ├─ userId    │  │ └─ issueTypes          │
│  │ ├─ password  │  │ ├─ status    │  └──────────────┘          │
│  │ ├─ role      │  │ ├─ priority  │                            │
│  │ └─ civicPts  │  │ ├─ deptId    │  ┌──────────────┐          │
│  │              │  │ ├─ location  │  │NOTIFICATIONS│          │
│  │ INDEXES:     │  │ ├─ slaDeadln │  │ Collection   │          │
│  │ - email      │  │ ├─ messages  │  │              │          │
│  │ - role       │  │ ├─ feedback  │  │ ├─ userId    │          │
│  │              │  │ └─ imageUrls │  │ └─ message   │          │
│  │              │  │              │  └──────────────┘          │
│  │              │  │ INDEXES:     │                            │
│  │              │  │ - userId     │                            │
│  │              │  │ - status     │                            │
│  │              │  │ - deptId     │                            │
│  │              │  │ - slaDeadln  │                            │
│  │              │  │              │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ ESCALATIONS  │  │ SLA CONFIGS  │                            │
│  │ Collection   │  │ Collection   │                            │
│  │              │  │              │                            │
│  │ ├─ id        │  │ ├─ high hrs  │                            │
│  │ ├─ complaintId│ │ ├─ med hrs   │                            │
│  │ └─ reason    │  │ └─ low hrs   │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## REQUEST-RESPONSE CYCLE (USER FILING COMPLAINT)

```
STEP 1: USER SUBMITS FORM
┌──────────────────┐
│ Citizen enters:  │
│ - Title          │
│ - Description    │
│ - Issue Type     │
│ - Location       │
│ - Images         │
└────────┬─────────┘
         │
         ▼

STEP 2: FRONTEND VALIDATION
┌──────────────────┐
│ Check:           │
│ - All required   │
│ - Image size ok  │
│ - Location valid │
└────────┬─────────┘
         │
         ▼

STEP 3: AXIOS SENDS REQUEST
┌────────────────────────────┐
│ axios.post(                │
│   '/api/complaints',       │
│   formData,                │
│   {                        │
│     headers: {             │
│       Authorization: 'Bearer <JWT_TOKEN>'
│     }                      │
│   }                        │
│ )                          │
└────────┬───────────────────┘
         │
         ▼  (HTTPS Network Transmission)

STEP 4: BACKEND RECEIVES REQUEST
┌────────────────────────────────────┐
│ Express app catches POST request   │
│ Middleware processes:              │
│ 1. CORS allows origin              │
│ 2. express.json parses body        │
│ 3. Multer extracts files           │
│ 4. protect() validates JWT         │
└────────┬─────────────────────────────┘
         │
         ▼

STEP 5: CONTROLLER LOGIC
┌────────────────────────────────────┐
│ complaintController.createComplaint │
│                                    │
│ 1. Extract data from request      │
│ 2. Save images to disk            │
│ 3. Find Department by issueType  │
│ 4. Get SLA config for priority   │
│ 5. Calculate deadline            │
│ 6. Create Complaint document     │
│ 7. Send confirmation email       │
└────────┬─────────────────────────────┘
         │
         ▼

STEP 6: DATABASE OPERATIONS
┌────────────────────────────────────┐
│ Mongoose creates document:         │
│                                    │
│ db.complaints.insertOne({         │
│   userId: ObjectId("..."),        │
│   title: "Pothole...",            │
│   status: "Registered",           │
│   slaDeadline: ISODate("..."),    │
│   departmentId: ObjectId("...")  │
│   ...                             │
│ })                                │
│                                    │
│ Returns: Complaint object with _id │
└────────┬─────────────────────────────┘
         │
         ▼

STEP 7: EMAIL SERVICE
┌────────────────────────────────────┐
│ Nodemailer sends email:            │
│ To: citizen@example.com            │
│ Subject: Complaint Confirmation    │
│ Body: Details + Complaint ID       │
└────────┬─────────────────────────────┘
         │
         ▼

STEP 8: RESPONSE TO FRONTEND
┌────────────────────────────────────┐
│ Backend returns JSON:              │
│ {                                  │
│   _id: "63abc...",                │
│   title: "Pothole...",            │
│   status: "Registered",           │
│   departmentId: "62def...",       │
│   slaDeadline: "2026-04-28T...",  │
│   ...                              │
│ }                                  │
└────────┬─────────────────────────────┘
         │
         ▼ (HTTPS Network Transmission)

STEP 9: FRONTEND RECEIVES RESPONSE
┌──────────────────────────────────────┐
│ .then(response => {                 │
│   // Add to state                   │
│   setComplaints([...complaints,    │
│     response.data]);               │
│ })                                  │
└────────┬─────────────────────────────┘
         │
         ▼

STEP 10: UI UPDATES
┌──────────────────────────────────────┐
│ - Show success message               │
│ - Modal closes                       │
│ - New complaint appears in list     │
│ - Stats update (total count +1)     │
│ - User sees confirmation            │
└──────────────────────────────────────┘
```

---

## AUTHENTICATION TOKEN FLOW

```
USER REGISTRATION/LOGIN
│
├─ User enters email & password
│  │
│  └─→ Backend validates credentials
│      │
│      ├─ Password hashed with Bcrypt
│      │
│      └─ Check: Hash matches stored hash?
│         │
│         ├─ YES: Generate JWT Token
│         │       └─ Header: { alg: "HS256" }
│         │       └─ Payload: { id: userId, role: "citizen" }
│         │       └─ Signature: HMAC-SHA256(secret)
│         │       └─ Result: "eyJhbGc...iOiJob...5FU..."
│         │
│         └─ NO: Return 401 Unauthorized
│
├─ Frontend receives token
│  │
│  └─→ localStorage.setItem('token', token)
│
│
SUBSEQUENT API REQUESTS
│
├─ Frontend needs data
│  │
│  └─→ axios.get(url, {
│      headers: {
│        Authorization: 'Bearer eyJhbGc...iOiJob...5FU...'
│      }
│    })
│
├─ Backend middleware.protect() checks:
│  │
│  ├─ 1. Is Authorization header present?
│  │  └─ NO: Return 401 "No token"
│  │
│  ├─ 2. Extract token from "Bearer <token>"
│  │
│  ├─ 3. Verify signature: jwt.verify(token, JWT_SECRET)
│  │  └─ If signature doesn't match: Return 401 "Invalid token"
│  │  └─ If expired: Return 401 "Token expired"
│  │
│  ├─ 4. Decode payload to get userId & role
│  │  └─ req.user = { id: userId, role: "citizen" }
│  │
│  └─ 5. Call next() to continue to controller
│
├─ Controller.authorize() checks user role
│  │
│  └─ authorizedRoles = ['officer', 'admin']
│     if (!authorizedRoles.includes(req.user.role))
│       └─ Return 403 "Not authorized for this role"
│     else
│       └─ Continue with business logic
│
└─ Request processed & response returned
```

---

## FILE UPLOAD FLOW (WITH MULTER)

```
USER SELECTS FILES
│
└─→ <input type="file" name="images" multiple>
    │
    ├─ Browser reads files
    │
    └─→ FormData object created:
        {
          title: "complaint",
          images: [File, File, File], ← Files here
          ...
        }
        Content-Type: multipart/form-data

        │
        └─→ axios.post('/api/complaints', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })

BACKEND RECEIVES REQUEST
│
├─ Request goes through middleware chain:
│  │
│  └─→ app.use(express.json()) ✗ (skips binary files)
│
├─ Multer middleware activates:
│  │
│  └─→ router.post(
│       '/api/complaints',
│       protect,
│       upload.array('images'),  ← Multer processes here
│       createComplaint
│     )
│
├─ Multer operations:
│  │
│  ├─ 1. Detect multipart form data
│  │
│  ├─ 2. Stream bytes to disk storage
│  │     └─ Destination: /backend/uploads/
│  │     └─ Filename: complaint_<timestamp>_<random>.jpg
│  │
│  ├─ 3. Populate req.files array:
│  │     [{
│  │       fieldname: 'images',
│  │       originalname: 'photo.jpg',
│  │       encoding: '7bit',
│  │       mimetype: 'image/jpeg',
│  │       destination: '/uploads/',
│  │       filename: 'complaint_1234567890_abc.jpg',
│  │       path: '/uploads/complaint_1234567890_abc.jpg',
│  │       size: 245813
│  │     }, ...]
│  │
│  └─ 4. Pass control to next middleware (createComplaint)

CONTROLLER PROCESSES
│
├─ Extract image paths:
│  │
│  └─→ imageUrls = req.files.map(f => `/uploads/${f.filename}`)
│      └─ Result: ['/uploads/complaint_1234_abc.jpg', ...]
│
├─ Save to database:
│  │
│  └─→ Complaint.create({
│       title: "...",
│       imageUrls: imageUrls,  ← Paths stored
│       ...
│     })
│
└─→ Return success response

SERVE IMAGES
│
├─ Express static middleware:
│  │
│  └─→ app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
│
├─ Frontend requests:
│  │
│  └─→ <img src="/uploads/complaint_1234_abc.jpg" />
│
└─→ Backend serves file from disk
```

---

## DEPARTMENT AUTO-ASSIGNMENT LOGIC

```
CITIZEN FILES COMPLAINT
│
└─→ Fills form:
    {
      title: "Water leak in park",
      description: "Pipe leaking from ground",
      issueType: "Water",  ← Auto-detected from keywords
      ...
    }

BACKEND PROCESSES
│
├─ Step 1: Find matching department
│  │
│  └─→ Department.findOne({
│       issueTypes: { $in: ["Water"] }
│     })
│
├─ Step 2: Search result
│  │
│  ├─ Department found:
│  │  {
│  │    _id: ObjectId("62def..."),
│  │    departmentName: "Water & Sanitation",
│  │    issueTypes: ["Water", "Leak", "Drainage", "Sanitation"]
│  │  }
│  │
│  └─→ Assign this department to complaint
│
├─ Step 3: Get SLA deadline
│  │
│  └─→ SLAConfig.findOne()
│      // Returns: { highHours: 24, medHours: 48, lowHours: 72 }
│      priority = "High" → use 24 hours
│      deadline = now + 24 hours = "2026-04-28T10:00:00Z"
│
├─ Step 4: Create complaint with:
│  │
│  └─→ {
│       departmentId: ObjectId("62def..."),
│       slaDeadline: "2026-04-28T10:00:00Z",
│       status: "Registered",
│       ...
│     }
│
└─→ WORKFLOW:
    Complaint assigned to department
         │
         └─→ Officer of department notified
             │
             └─→ Officer assigns to worker
                 │
                 └─→ Worker updates status to "In Progress"
                     │
                     └─→ Complaint resolved before deadline
```

---

## ROLE-BASED ACCESS CONTROL (RBAC) IMPLEMENTATION

```
MIDDLEWARE LAYER
│
└─→ protect() Middleware
    │
    ├─ Verify JWT token
    ├─ Decode to get user ID & role
    ├─ Attach user to request: req.user = { id, role }
    │
    └─→ authorize(...roles) Middleware
        │
        ├─ Check if req.user.role in allowed roles
        │ if (!roles.includes(req.user.role))
        │   return 403 "Not authorized"
        │
        └─→ Next middleware/controller

ROUTE PROTECTION EXAMPLES
│
├─ Public routes (no middleware):
│  │
│  ├─ POST /api/auth/register
│  ├─ POST /api/auth/login
│  └─ GET  /api/departments (anyone can see available depts)
│
├─ Protected routes (require token):
│  │
│  ├─ GET  /api/auth/me                    [protect]
│  ├─ POST /api/complaints                 [protect]
│  └─ GET  /api/complaints                 [protect]
│
├─ Role-restricted routes:
│  │
│  ├─ PUT  /api/complaints/:id/status      [protect, authorize('officer', 'admin')]
│  ├─ PUT  /api/auth/users/:id/role        [protect, authorize('admin')]
│  └─ GET  /api/auth/officer-metrics       [protect, authorize('admin')]
│
└─ Role-specific logic in controllers:
   │
   ├─ getComplaints() {
   │   if (req.user.role === 'citizen')
   │     return complaints where userId = req.user.id
   │   else if (req.user.role === 'officer')
   │     return complaints for officer's department
   │   else if (req.user.role === 'admin')
   │     return all complaints
   │ }
```

---

## COMPLAINT LIFECYCLE WITH NOTIFICATIONS

```
┌─────────────────────────────────────────────────────────────┐
│ COMPLAINT LIFECYCLE & NOTIFICATION FLOW                     │
└─────────────────────────────────────────────────────────────┘

1️⃣  CITIZEN FILES COMPLAINT
    │
    ├─ Complaint.create() ✓
    │
    ├─ Email sent: In-app notification created
    │  To: Citizen
    │  Message: "Complaint registered successfully"
    │
    └─ Status: "Registered"

2️⃣  OFFICER REVIEWS & ASSIGNS WORKER
    │
    ├─ updateComplaint() ✓
    │  Status: "Registered" → "In Progress"
    │
    ├─ Notifications sent:
    │  ├─ To: Worker - "You assigned: [Complaint Title]"
    │  └─ To: Citizen - "Worker assigned to your complaint"
    │
    └─ assignWorker() ✓

3️⃣  WORKER UPDATES STATUS
    │
    ├─ updateStatus() to "In Progress" ✓
    │
    ├─ Email & in-app:
    │  └─ To: Citizen - "Status: In Progress"
    │
    └─ Status: "In Progress"

4️⃣  WORKER UPLOADS RESOLUTION IMAGES & MARKS RESOLVED
    │
    ├─ updateStatus() to "Resolved" ✓
    │
    ├─ Multiple notifications:
    │  ├─ To: Citizen - "Your complaint resolved!"
    │  ├─ Action: +10 civic points added
    │  └─ Action: Feedback form shown to citizen
    │
    └─ Status: "Resolved"

5️⃣  CITIZEN PROVIDES FEEDBACK (Optional)
    │
    ├─ submitFeedback() ✓
    │  Rating: 5 stars
    │  Comment: "Great job!"
    │
    └─ Feedback stored in complaint document

⏰  IF SLA EXCEEDED (Not resolved before deadline)
    │
    ├─ System detects: slaDeadline < now
    │
    ├─ Auto-escalate:
    │  Status: Any → "Escalated"
    │
    ├─ Notifications:
    │  ├─ To: Senior Officer - "Escalated complaint: [ID]"
    │  ├─ To: Citizen - "Your complaint escalated to senior review"
    │  └─ To: Worker - "Complaint escalated, faster resolution required"
    │
    └─ Escalation document created
```

---

## SUMMARY OF CONNECTIONS

```
USER REGISTRATION/LOGIN
  ↓
JWT Token stored in localStorage
  ↓
Token sent with every API request
  ↓
Backend verifies & checks role
  ↓
Controller executes role-specific logic
  ↓
Mongoose queries MongoDB
  ↓
Response sent back as JSON
  ↓
Frontend updates state & UI
  ↓
User sees updates in real-time

FILE FLOW:
User uploads file
  ↓
Multer saves to /uploads folder
  ↓
Path stored in database
  ↓
Frontend requests: GET /uploads/filename.jpg
  ↓
Express static middleware serves file

DATABASE RELATIONSHIPS:
Complaint (userId) ──→ User
Complaint (departmentId) ──→ Department
Complaint (workerId) ──→ User
Notification (userId) ──→ User
```

---

**This architecture ensures:**
✅ Security (JWT + Bcrypt)
✅ Scalability (Modular code)
✅ Maintainability (Clear separation of concerns)
✅ Extensibility (Easy to add features)

