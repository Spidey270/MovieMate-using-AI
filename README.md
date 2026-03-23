# MovieMate 🎬

MovieMate is an AI-powered social movie recommendation platform. Connect with friends, discuss your favorite films in real-time global or direct chats, and receive highly personalized, AI-generated movie recommendations based on your unique watch history and preferences!

## ✨ Features

- **User Authentication**: Secure JWT-based login and registration.
- **Movie Catalog**: Browse movies, view details, and manage your personal wishlist.
- **Social Connections**: Send and accept friend requests to build your network.
- **Real-Time Global Chat**: Jump into the worldwide lobby and chat with all active MovieMate users instantly via WebSockets.
- **Direct Messaging (DMs)**: Have private, real-time 1-on-1 conversations with your friends. 
- **AI Recommendation Engine**: Click a button to generate a bespoke list of movie recommendations tailored exactly to your tastes using Gemini AI.
- **Admin Dashboard**: Secure administrative portal to view real-time platform metrics (users, movies, reviews, chats).
- **User Management**: Dedicated interface for administrators to list users and securely delete abusive accounts.
- **Broadcast System**: Administrators can dispatch custom system notifications to specific users or broadcast securely to the entire platform.
- **Interactive Notifications**: Instantly receive live alerts when friends message you, when AI recommendations finish generating, or when admins send a broadcast. Click the notification to jump straight to the content!

## 🚀 Tech Stack

### Frontend
- **React 18** (via Vite)
- **Tailwind CSS** for sleek, responsive, modern styling
- **React Router DOM** for seamless, single-page navigation
- **Lucide React** for beautiful iconography
- **Axios** (API requests) & **Native WebSockets** (Real-time chat & notifications)

### Backend
- **Python / FastAPI**: High-performance asynchronous API framework.
- **MongoDB** (via PyMongo): Flexible NoSQL database schema for movies, users, and chats.
- **WebSockets**: Built-in FastAPI ConnectionManager for instant message broadcasting and DM delivery.
- **JWT (JSON Web Tokens)**: For secure, stateless user authentication and route protection.

## 🛠️ Setup & Installation

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` folder and configure your variables:
   ```env
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=moviemate
   SECRET_KEY=your_super_secret_jwt_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit `http://localhost:5173`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is open-source and available under the MIT License.
