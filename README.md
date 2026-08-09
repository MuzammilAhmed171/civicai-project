# 🚀 CivicAI — Smart Civic Complaint System

MERN Stack + AI powered civic complaint platform.

## 📁 Project Structure

```
civicai-project/
├── backend/          # Node.js + Express API
│   ├── ai/           # Python AI models (scikit-learn)
│   ├── config/       # DB config
│   ├── controllers/  # Route controllers
│   ├── models/       # Mongoose models
│   └── routes/       # API routes
└── frontend/         # React + Tailwind + Vite
    └── src/
        ├── components/
        └── pages/
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Tailwind CSS + Vite |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| AI | Python + scikit-learn |
| Charts | Recharts |

## 🚀 Quick Start

### 1. Start MongoDB
Make sure MongoDB is running locally or use MongoDB Atlas.

### 2. Setup Backend
```bash
cd backend
npm install

# Train AI models (requires Python + scikit-learn)
cd ai
pip install -r requirements.txt
python train_model.py
cd ..

# Start server
npm run dev
```
Backend runs on `http://localhost:5000`

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/complaints | Get all complaints |
| POST | /api/complaints | Submit new complaint |
| GET | /api/complaints/:id | Get complaint by ID |
| PUT | /api/complaints/:id | Update complaint |
| DELETE | /api/complaints/:id | Delete complaint |
| GET | /api/analytics | Get dashboard analytics |
| POST | /api/ai/analyze | AI analyze complaint text |

## 🤖 AI Features

- **Complaint Classification** → Road, Water, Waste, Electricity, Drainage, Safety, Other
- **Priority Prediction** → Low, Medium, High, Critical

## 👥 Pages

- **Home** — Landing page
- **Submit Complaint** — Form with AI analysis
- **My Complaints** — List with search & filters
- **Admin Dashboard** — Analytics & charts
