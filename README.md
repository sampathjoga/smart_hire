# Job Board with ATS Resume Analysis

A full-stack web application built with modern Glassmorphism UI, React, Node.js, and MongoDB.

## Features
- **User Authentication**: Secure registration and login with JWT.
- **ATS Resume Analysis**: Automatic scoring of PDF resumes using keyword and structure analysis.
- **Professional Dashboard**: Detailed breakdown of ATS scores and improvement suggestions.
- **Profile Management**: View and edit professional details, including resume re-uploads with real-time score updates.
- **Glassmorphism UI**: Premium, dark-themed interface with smooth animations.

## Tech Stack
- **Frontend**: React, Vite, Vanilla CSS, Lucide-React.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Multer, PDF-Parse, JWT, BcryptJS.

## Setup Instructions

### Prerequisites
- Node.js installed.
- MongoDB installed and running locally.

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (one has been provided for you):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/jobboard
   JWT_SECRET=your_jwt_secret_key_12345
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## ATS Scoring Logic
The application analyzes resumes based on:
- **Technical Skills**: Matching against a database of modern tech keywords.
- **Soft Skills**: Identifying key professional qualities.
- **Structure**: Verifying standard resume sections (Experience, Education, etc.).
- **Content Density**: Optimizing for professional reading length.
