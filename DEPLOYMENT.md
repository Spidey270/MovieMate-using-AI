# 🚀 MovieMate Production Deployment Guide

This guide covers multiple deployment options for the MovieMate application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment Options](#cloud-deployment-options)
   - [Railway (Recommended)](#railway-deployment)
   - [Render](#render-deployment)
   - [Vercel + Railway](#vercel--railway-combo)
   - [DigitalOcean/AWS/GCP](#vps-deployment)
5. [Database Setup](#database-setup)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

### Required Accounts & API Keys
1. **Google Gemini API Key** - For AI recommendations
   - Get it from: https://makersuite.google.com/app/apikey
   - Free tier includes 60 requests per minute

2. **MongoDB Database** - Options:
   - MongoDB Atlas (Free tier available): https://www.mongodb.com/cloud/atlas
   - Self-hosted MongoDB
   - Railway MongoDB addon (easiest)

3. **Secret Key** - Generate with:
   ```bash
   openssl rand -hex 32
   ```

---

## Environment Configuration

### 1. Create `.env` file in project root:

```bash
cp .env.example .env
```

### 2. Fill in your values:

```env
# Backend Security
SECRET_KEY=your-generated-secret-key-here
GEMINI_API_KEY=your-google-gemini-api-key

# Frontend URL (update with your production domain)
FRONTEND_URL=https://your-frontend-domain.com

# API URLs for frontend
VITE_API_URL=https://your-backend-api.com
VITE_WS_URL=wss://your-backend-api.com

# MongoDB (if using external database)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=moviemate
```

---

## Docker Deployment

### Quick Start (Local Testing)

1. **Build and run all services:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - MongoDB: localhost:27017

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

### Production Docker Deployment

1. **Build images:**
   ```bash
   docker build -t moviemate-backend ./backend
   docker build -t moviemate-frontend ./frontend
   ```

2. **Push to registry (Docker Hub, AWS ECR, etc.):**
   ```bash
   docker tag moviemate-backend your-registry/moviemate-backend:latest
   docker push your-registry/moviemate-backend:latest
   ```

---

## Cloud Deployment Options

### Railway Deployment (Recommended - Easiest)

Railway provides free tier and simple deployment.

#### Backend Deployment:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize project:**
   ```bash
   cd backend
   railway init
   ```

3. **Add MongoDB:**
   ```bash
   railway add mongodb
   ```

4. **Set environment variables:**
   ```bash
   railway variables set SECRET_KEY=your-secret-key
   railway variables set GEMINI_API_KEY=your-gemini-key
   railway variables set FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Get backend URL:**
   ```bash
   railway domain
   ```

#### Frontend Deployment (Vercel):

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - `VITE_API_URL` = Your Railway backend URL
   - `VITE_WS_URL` = Your Railway backend URL (replace https with wss)

---

### Render Deployment

Render offers free tier with automatic deployments from GitHub.

#### Backend:

1. **Create account:** https://render.com
2. **New Web Service** → Connect GitHub repository
3. **Configure:**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
   - **Environment:** Python 3.11
4. **Add environment variables:**
   - `SECRET_KEY`
   - `GEMINI_API_KEY`
   - `MONGO_URI`
   - `FRONTEND_URL`
5. **Deploy**

#### MongoDB on Render:

1. **New PostgreSQL/MongoDB** → Choose MongoDB
2. **Copy connection string** to `MONGO_URI`

#### Frontend on Render:

1. **New Static Site**
2. **Build Command:** `npm install && npm run build`
3. **Publish Directory:** `dist`
4. **Add environment variables** (as build-time variables):
   - `VITE_API_URL`
   - `VITE_WS_URL`

---

### Vercel + Railway Combo (Frontend + Backend)

**Best for:** Optimal performance with CDN (Vercel) + backend (Railway)

#### Step 1: Deploy Backend to Railway (see Railway section)

#### Step 2: Deploy Frontend to Vercel

1. **Push code to GitHub**
2. **Import to Vercel:** https://vercel.com/new
3. **Configure:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:**
   - `VITE_API_URL` = Railway backend URL
   - `VITE_WS_URL` = Railway backend URL (wss://)
5. **Deploy**

---

### VPS Deployment (DigitalOcean, AWS, GCP)

**For full control and scalability.**

#### 1. Provision Server
- Ubuntu 22.04 LTS
- Minimum: 2 GB RAM, 1 CPU
- Recommended: 4 GB RAM, 2 CPU

#### 2. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Install Nginx
sudo apt install nginx -y
```

#### 3. Clone Repository
```bash
git clone https://github.com/Spidey270/MovieMate-using-AI.git
cd MovieMate-using-AI
```

#### 4. Configure Environment
```bash
cp .env.example .env
nano .env  # Edit with your values
```

#### 5. Deploy with Docker Compose
```bash
docker-compose up -d
```

#### 6. Configure Nginx (Reverse Proxy)

Create `/etc/nginx/sites-available/moviemate`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/moviemate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create free cluster:** https://www.mongodb.com/cloud/atlas/register
2. **Create database user:** Database Access → Add New User
3. **Whitelist IP:** Network Access → Add IP (0.0.0.0/0 for all IPs)
4. **Get connection string:** Clusters → Connect → Connect your application
5. **Format:** `mongodb+srv://username:password@cluster.mongodb.net/moviemate`

### Railway MongoDB

```bash
railway add mongodb
railway variables
```
Copy the `MONGO_URL` value.

---

## Post-Deployment

### 1. Verify Services

**Backend Health Check:**
```bash
curl https://your-backend-api.com/health
```

Expected response:
```json
{"status":"healthy","service":"MovieMate API","version":"1.0.0"}
```

**Frontend:**
Visit your frontend URL and check:
- ✅ Login/Register works
- ✅ Movies load
- ✅ Search works
- ✅ Recommendations generate

### 2. Seed Database (Optional)

If you have seed data:
```bash
cd backend
python seed_db.py
```

### 3. Monitor Logs

**Docker Compose:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Railway:**
```bash
railway logs
```

**Render:**
View logs in dashboard

### 4. Performance Optimization

**Backend:**
- Workers: Adjust `--workers` in gunicorn (CPU cores * 2 + 1)
- Database: Add indexes (automatic on startup)
- Caching: Recommendations cached for 12 hours

**Frontend:**
- CDN: Vercel/Netlify provide automatic CDN
- Image optimization: Already using lazy loading
- Code splitting: Vite handles automatically

### 5. Monitoring Setup

**Backend Monitoring:**
- Add Sentry for error tracking
- Use Railway metrics or custom monitoring

**Database Monitoring:**
- MongoDB Atlas provides built-in monitoring
- Set up alerts for high memory/CPU usage

---

## Troubleshooting

### Backend Issues

**502 Bad Gateway:**
- Check backend logs: `docker-compose logs backend`
- Verify MongoDB connection
- Check environment variables

**CORS Errors:**
- Add frontend URL to `FRONTEND_URL` env var
- Check CORS configuration in `main.py`

**Database Connection Failed:**
- Verify `MONGO_URI` format
- Check network access (MongoDB Atlas whitelist)
- Test connection: `mongosh "your-connection-string"`

### Frontend Issues

**API Calls Failing:**
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend
- Inspect browser console for errors

**Build Failures:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node -v` (should be 18+)

### WebSocket Issues

**Real-time features not working:**
- Verify `VITE_WS_URL` uses `wss://` for HTTPS
- Check firewall allows WebSocket connections
- Test WebSocket: Browser console → Network → WS tab

---

## Scaling Considerations

### Horizontal Scaling

**Backend:**
- Increase worker count in gunicorn
- Deploy multiple instances with load balancer
- Use Redis for session management

**Database:**
- MongoDB sharding for large datasets
- Read replicas for read-heavy workloads
- Connection pooling (already configured)

### Vertical Scaling

**Start with:**
- Backend: 512 MB RAM, 0.5 CPU
- Database: 512 MB RAM

**Scale to:**
- Backend: 2-4 GB RAM, 2 CPU
- Database: 2-4 GB RAM

---

## Security Checklist

- [ ] SECRET_KEY is strong and unique
- [ ] GEMINI_API_KEY is kept secret
- [ ] MongoDB has authentication enabled
- [ ] CORS is configured with specific origins
- [ ] HTTPS is enabled (SSL certificate)
- [ ] Environment variables are not committed to git
- [ ] Database backups are configured
- [ ] Rate limiting is enabled (optional: add to backend)

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/Spidey270/MovieMate-using-AI/issues
- Email: arjunsbiju6@gmail.com

---

**🎉 Congratulations! Your MovieMate application is now deployed and ready for production use!**
