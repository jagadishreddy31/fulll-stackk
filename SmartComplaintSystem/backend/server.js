const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const Department = require('./models/Department');

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Root
app.get('/', (req, res) => res.send('Smart Complaint System API is running...'));
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    databaseName: mongoose.connection.name || null
  });
});

const PORT = process.env.PORT || 5000;

// Seed default departments
const seedDepartments = async () => {
  try {
    const count = await Department.countDocuments();
    if (count === 0) {
      const defaultDepartments = [
        {
          departmentName: 'Roads & Transportation',
          issueTypes: ['Road', 'Pothole', 'Street Light', 'Traffic Signal']
        },
        {
          departmentName: 'Water & Sanitation',
          issueTypes: ['Water', 'Leak', 'Drainage', 'Sanitation']
        },
        {
          departmentName: 'Waste Management',
          issueTypes: ['Garbage', 'Waste', 'Cleanup', 'Recycling']
        },
        {
          departmentName: 'Electric Department',
          issueTypes: ['Power', 'Electricity', 'Cable', 'Maintenance']
        },
        {
          departmentName: 'Public Health',
          issueTypes: ['Health', 'Hygiene', 'Medical', 'Epidemic']
        },
        {
          departmentName: 'Parks & Recreation',
          issueTypes: ['Park', 'Garden', 'Recreation', 'Playground']
        }
      ];

      await Department.insertMany(defaultDepartments);
      console.log('Default departments seeded');
    }
  } catch (err) {
    console.error('Error seeding departments:', err.message);
  }
};

// Initialize MongoDB (local MongoDB Compass connection or MongoDB Atlas)
const initializeDatabase = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is missing. Add a local MongoDB or MongoDB Atlas URI in backend/.env');
    }

    try {
      console.log('Attempting to connect to MongoDB at', mongoUri);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB Connected: ${mongoose.connection.name}`);
    } catch (primaryErr) {
      console.log('Standard MongoDB connection failed. Falling back to in-memory database...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected! This allows the app to work without installing MongoDB.`);
    }

    // Seed departments
    await seedDepartments();

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

initializeDatabase();
