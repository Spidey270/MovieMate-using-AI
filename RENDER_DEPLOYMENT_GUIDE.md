# 🚀 Render Deployment Guide for MovieMate

This guide will walk you through deploying MovieMate on Render step-by-step.

## Prerequisites Checklist

Before starting, you need:
- [ ] GitHub account (code is already pushed)
- [ ] Render account (free): https://render.com
- [ ] Google Gemini API Key: https://makersuite.google.com/app/apikey
- [ ] MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas/register
- [ ] SECRET_KEY (generate below)

---

## Step 1: Generate SECRET_KEY

Run this command on your terminal:

```bash
openssl rand -hex 32
```

**Save this key** - you'll need it in Step 4.

Example output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

---

## Step 2: Set Up MongoDB Atlas

### 2.1 Create Free Cluster

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Choose **FREE** tier (M0)
4. Select cloud provider and region (closest to you)
5. Click **Create Cluster** (takes 3-5 minutes)

### 2.2 Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `moviemate_user` (or your choice)
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 2.3 Whitelist All IPs (for Render access)

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
4. Click **Confirm**

### 2.4 Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Python**, Version: **3.11 or later**
5. Copy the connection string:
   ```
   mongodb+srv://moviemate_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual password
7. **Save this connection string** - you'll need it in Step 4

Example:
```
mongodb+srv://moviemate_user:MyPassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

---

## Step 3: Deploy Backend to Render

### 3.1 Create Web Service

1. Go to: https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Choose **Build and deploy from a Git repository**
4. Click **Connect GitHub** (authorize if needed)
5. Find and select: **Spidey270/MovieMate-using-AI**
6. Click **Connect**

### 3.2 Configure Backend Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `moviemate-backend` |
| **Region** | Choose closest to you (e.g., Oregon USA) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120` |
| **Instance Type** | `Free` (or Starter if you prefer) |

### 3.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable**

Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `PYTHON_VERSION` | `3.11.0` | Python version |
| `SECRET_KEY` | `<your-secret-key-from-step-1>` | JWT secret |
| `GEMINI_API_KEY` | `<your-gemini-api-key>` | Get from Google AI Studio |
| `MONGO_URI` | `<your-mongodb-connection-string>` | From Step 2.4 |
| `DB_NAME` | `moviemate` | Database name |
| `FRONTEND_URL` | `https://moviemate-frontend.onrender.com` | Update after frontend deploy |

**Note:** You'll update `FRONTEND_URL` after deploying frontend in Step 4.

### 3.4 Deploy Backend

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Watch the logs for any errors
4. When complete, you'll see: ✅ **Live**

### 3.5 Get Backend URL

1. Your backend URL will be: `https://moviemate-backend.onrender.com`
2. Test it: Click the URL and add `/health`
   - Should see: `{"status":"healthy","service":"MovieMate API","version":"1.0.0"}`
3. **Save this URL** - you'll need it for frontend

---

## Step 4: Deploy Frontend to Render

### 4.1 Create Static Site

1. Go to: https://dashboard.render.com
2. Click **New +** → **Static Site**
3. Choose **Build and deploy from a Git repository**
4. Select: **Spidey270/MovieMate-using-AI** (already connected)
5. Click **Connect**

### 4.2 Configure Frontend Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `moviemate-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 4.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable**

Add these variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://moviemate-backend.onrender.com` |
| `VITE_WS_URL` | `wss://moviemate-backend.onrender.com` |

**Important:** Use your actual backend URL from Step 3.5.

### 4.4 Deploy Frontend

1. Click **Create Static Site**
2. Wait for deployment (5-10 minutes)
3. Watch the logs
4. When complete, you'll see: ✅ **Live**

### 4.5 Get Frontend URL

Your frontend URL will be: `https://moviemate-frontend.onrender.com`

---

## Step 5: Update Backend CORS

Now that you have your frontend URL, update the backend:

1. Go to **Render Dashboard** → **moviemate-backend**
2. Click **Environment** (left sidebar)
3. Find `FRONTEND_URL` variable
4. Update value to: `https://moviemate-frontend.onrender.com`
5. Click **Save Changes**
6. Backend will automatically redeploy

---

## Step 6: Verify Deployment

### 6.1 Test Backend

1. Open: `https://moviemate-backend.onrender.com/health`
2. Should see:
   ```json
   {"status":"healthy","service":"MovieMate API","version":"1.0.0"}
   ```

### 6.2 Test Frontend

1. Open: `https://moviemate-frontend.onrender.com`
2. You should see the MovieMate homepage
3. Try to register a new account
4. Try to login
5. Browse movies

### 6.3 Test Features

- ✅ User registration
- ✅ Login/Logout
- ✅ Browse movies
- ✅ Movie details page
- ✅ Search functionality
- ✅ Add to wishlist
- ✅ Write reviews
- ✅ View recommendations
- ✅ Friend requests
- ✅ Messages
- ✅ Notifications

---

## Troubleshooting

### Backend Issues

**Problem: Backend won't start**
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Check MongoDB connection string (password special characters?)

**Problem: 502 Bad Gateway**
- Backend might be starting up (Render free tier spins down after inactivity)
- Wait 30 seconds and refresh
- Check backend logs for errors

**Problem: Database connection failed**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure password has no special characters that need URL encoding

### Frontend Issues

**Problem: Can't connect to API**
- Check `VITE_API_URL` in frontend environment variables
- Verify backend URL is correct (include https://)
- Check browser console for CORS errors

**Problem: WebSocket not connecting**
- Verify `VITE_WS_URL` uses `wss://` (not `ws://`)
- Check backend is running
- Real-time features (chat, notifications) need WebSocket

### CORS Errors

**Problem: CORS policy blocking requests**
- Ensure `FRONTEND_URL` is set in backend environment
- Check it matches your exact frontend URL
- Backend needs to redeploy after changing FRONTEND_URL

---

## Performance Notes

### Free Tier Limitations

**Render Free Tier:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month included (enough for hobby projects)

**MongoDB Atlas Free Tier:**
- 512 MB storage
- Shared CPU
- Good for development and small apps

### Upgrade Recommendations

**When to upgrade:**
- More than 100 daily active users → Upgrade to Render Starter ($7/month)
- Database > 400 MB → Upgrade MongoDB to M2 ($9/month)
- Need faster response times → Always-on backend

---

## Custom Domain (Optional)

### Add Custom Domain to Render

1. Go to **Settings** → **Custom Domain**
2. Click **Add Custom Domain**
3. Enter your domain: `moviemate.yourdomain.com`
4. Add DNS records (shown in Render):
   - Type: `CNAME`
   - Name: `moviemate`
   - Value: `moviemate-frontend.onrender.com`
5. Wait for DNS propagation (5 minutes to 24 hours)
6. SSL certificate automatically provisioned

---

## Monitoring & Maintenance

### Check Logs

**Backend Logs:**
1. Render Dashboard → moviemate-backend
2. Click **Logs** tab
3. View real-time logs

**Frontend Logs:**
1. Render Dashboard → moviemate-frontend
2. Click **Events** tab

### Database Monitoring

1. MongoDB Atlas Dashboard
2. Click **Metrics** tab
3. Monitor:
   - Storage usage
   - Connection count
   - Operations per second

---

## Security Checklist

- [x] SECRET_KEY is unique and secure
- [x] GEMINI_API_KEY is kept secret
- [x] MongoDB has authentication enabled
- [x] CORS is configured with frontend URL
- [x] HTTPS enabled automatically by Render
- [x] Environment variables not in git

---

## Cost Summary

**Free Tier:**
- Render Backend: $0/month (750 hours)
- Render Frontend: $0/month (100 GB bandwidth)
- MongoDB Atlas: $0/month (512 MB storage)
- **Total: $0/month** ✨

**Paid Tier (Recommended for production):**
- Render Backend Starter: $7/month (always-on)
- Render Frontend: $0/month
- MongoDB M2: $9/month (2 GB storage)
- **Total: $16/month**

---

## Next Steps After Deployment

1. **Seed Database** (optional):
   - Run backend seed script if you have sample data
   - Or let users create content organically

2. **Share Your App:**
   - Frontend URL: `https://moviemate-frontend.onrender.com`
   - Share with friends and testers

3. **Monitor Performance:**
   - Check logs regularly
   - Monitor database usage
   - Track user feedback

4. **Future Enhancements:**
   - Add more movies to database
   - Customize UI/UX
   - Add more social features
   - Implement caching for better performance

---

## Support

If you encounter issues:
1. Check the logs in Render dashboard
2. Review this guide's troubleshooting section
3. Check environment variables are correct
4. Test backend health endpoint
5. Open GitHub issue if needed

---

**🎉 Congratulations! Your MovieMate app is now live on Render!**

Frontend: `https://moviemate-frontend.onrender.com`
Backend: `https://moviemate-backend.onrender.com`
