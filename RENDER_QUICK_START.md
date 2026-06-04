# 🚀 Render Deployment - Quick Start Checklist

Follow this checklist to deploy MovieMate to Render in ~20 minutes.

## ✅ Pre-Deployment Checklist

### 1. Get Your API Keys

- [ ] **Google Gemini API Key**
  - Go to: https://makersuite.google.com/app/apikey
  - Click "Create API Key"
  - Copy and save the key

- [ ] **Generate SECRET_KEY**
  ```bash
  openssl rand -hex 32
  ```
  - Copy and save the output

### 2. Set Up MongoDB Atlas (5 minutes)

- [ ] Create account: https://www.mongodb.com/cloud/atlas/register
- [ ] Create FREE M0 cluster
- [ ] Create database user (username + password)
- [ ] Whitelist all IPs (0.0.0.0/0)
- [ ] Get connection string
- [ ] Replace `<password>` in connection string with your password

Your connection string should look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 🎯 Deployment Steps

### Step 1: Deploy Backend (10 minutes)

1. **Go to Render:** https://dashboard.render.com
2. **New + → Web Service**
3. **Connect GitHub** → Select `Spidey270/MovieMate-using-AI`
4. **Configure:**
   - Name: `moviemate-backend`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120`
5. **Add Environment Variables:**
   ```
   PYTHON_VERSION = 3.11.0
   SECRET_KEY = <your-generated-secret-key>
   GEMINI_API_KEY = <your-gemini-api-key>
   MONGO_URI = <your-mongodb-connection-string>
   DB_NAME = moviemate
   FRONTEND_URL = https://moviemate-frontend.onrender.com
   ```
6. **Create Web Service** → Wait for deployment

**Test:** Open `https://moviemate-backend.onrender.com/health`
- Should see: `{"status":"healthy"}`

---

### Step 2: Deploy Frontend (10 minutes)

1. **New + → Static Site**
2. **Select** `Spidey270/MovieMate-using-AI`
3. **Configure:**
   - Name: `moviemate-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. **Add Environment Variables:**
   ```
   VITE_API_URL = https://moviemate-backend.onrender.com
   VITE_WS_URL = wss://moviemate-backend.onrender.com
   ```
5. **Create Static Site** → Wait for deployment

**Test:** Open `https://moviemate-frontend.onrender.com`
- Should see MovieMate homepage

---

### Step 3: Update Backend CORS

1. **Go to Backend Service** → Environment
2. **Update** `FRONTEND_URL` to your actual frontend URL
3. **Save** → Backend will redeploy automatically

---

## ✅ Verification

Test these features:
- [ ] Homepage loads
- [ ] Register new account
- [ ] Login works
- [ ] Movies page shows movies
- [ ] Search works
- [ ] Movie details page
- [ ] Add to wishlist
- [ ] Write a review
- [ ] Recommendations generate

---

## 🎉 Success!

Your app is live at:
- **Frontend:** `https://moviemate-frontend.onrender.com`
- **Backend:** `https://moviemate-backend.onrender.com`

---

## ⚠️ Common Issues

**Backend won't start:**
- Check environment variables are correct
- Verify MongoDB connection string

**CORS errors:**
- Ensure FRONTEND_URL matches your frontend URL exactly
- Backend needs to redeploy after changing CORS

**Slow first load:**
- Free tier spins down after 15 minutes
- First request takes 30-60 seconds to wake up

---

## 📚 Need More Help?

See the complete guide: `RENDER_DEPLOYMENT_GUIDE.md`

---

## 💰 Cost

**Free Tier (Perfect for testing):**
- Everything is FREE with limitations
- Services spin down after 15 minutes of inactivity
- 750 hours/month (enough for hobby projects)

**Upgrade to Always-On ($7/month):**
- No spin-down delays
- Instant response times
- 24/7 availability
