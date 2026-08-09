# 🚀 CivicAI — Complete Deployment Guide (Urdu & English)

Aaj aapka CivicAI project poora ready hai cloud per deploy karne ke liye!
Neeche diye gaye **step-by-step procedure** ko follow karke aap is MERN Stack + AI application ko bilkul **FREE** cloud platforms (**Render** backend k liye aur **Vercel** frontend k liye) par live kar sakte hain.

---

## 🛠️ Step 1: Code Ko GitHub Par Push Karein

Agar aapne abhi tak code GitHub par push nahi kiya, to in commands ko chalayein:

```bash
git init
git add .
git commit -m "CivicAI deployment setup ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/civicai-project.git
git push -u origin main
```

---

## 🌐 Step 2: Backend Ko Render.com Par Live Karein

### Steps:
1. **Render Website Par Jaayein**: [https://render.com](https://render.com) par sign in / sign up karein (GitHub se sign in karna best hai).
2. **New Web Service Banayein**:
   - Dashboard par **New +** button par click karke **Web Service** choose karein.
   - Apni GitHub repository (`civicai-project`) select karein.
3. **Settings Configure Karein**:
   - **Name**: `civicai-backend`
   - **Root Directory**: `civicai-project/backend` (agar single repo folder hai to `backend`)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables Add Karein**:
   Add Environment Variables section me yeh keys and values daalein:

| Key | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://civic:civic123@cluster0.9ngdzyh.mongodb.net/` |
| `JWT_SECRET` | `civicai_secret_key_2026` |
| `GEMINI_API_KEY` | `YOUR_GEMINI_API_KEY` |
| `PORT` | `5000` |

5. **Create Web Service** par click karein.
6. 2 se 3 minute me Render aapka backend live kar dega.
7. Backend ka URL copy kar lein (E.g. `https://civicai-backend-xxxx.onrender.com`).

---

## ⚡ Step 3: Frontend Ko Vercel.com Par Live Karein

### Steps:
1. **Vercel Website Par Jaayein**: [https://vercel.com](https://vercel.com) par sign in karein.
2. **Add New Project**:
   - **Add New...** -> **Project** par click karein.
   - Apni GitHub repo select karke **Import** par click karein.
3. **Configuration Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `civicai-project/frontend` (ya `frontend` directory).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables Section**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://civicai-backend-xxxx.onrender.com/api` *(Isme apne Render backend URL ke aage `/api` lazmi lagayein!)*
5. **Deploy** button par click karein.

---

## 📋 Config Files Jo Humne Aapke Liye Set Kar Diye Hain:

1. `frontend/vercel.json` — React Router routing / page refresh handling k liye setup kar diya gaya hai.
2. `frontend/.env.example` — Environment variables reference guide file add kar di gayi hai.
3. `backend/vercel.json` — Backend serverless Vercel deployment support for Node.js API setup kar diya hai.
4. `backend/server.js` — Health check endpoint `/` route update kar diya hai takey deployment health checks pass hon.

---

## 🔍 Verification Checklist:

- [x] Frontend Build Tested: `npm run build` successful (`dist/` generated).
- [x] Backend MongoDB Atlas URI Verified & Ready.
- [x] Gemini Vision AI API Integration Configured.
- [x] Express CORS & 50MB Payload Limits Enabled.
- [x] Vercel SPA Rewrites Configured.

Aapka project ab 100% Cloud Deployment ke liye ready hai! 🎉
