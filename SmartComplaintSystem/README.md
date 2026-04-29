# Smart Complaint Escalation System

A full-stack MERN application for municipalities to manage and escalate civic complaints with automated SLA tracking.

## Pre-requisites
- **Node.js**: Make sure Node.js is installed.
- **MongoDB**: Ensure MongoDB is running locally on port `27017` (or update `backend/.env` with your Mongo URI).

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a **new** terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on the URL provided by Vite (usually `http://localhost:5173`).*

## Features included
- **Authentication**: JWT based auth.
- **Role-Based Routing**: Citizen, Officer, and Admin.
- **Dark Mode**: Fully implemented with TailwindCSS.
- **SLA & Escalation**: Automatic escalation tracking script in Admin panel.
- **Image Uploads**: Integrated via Multer.
