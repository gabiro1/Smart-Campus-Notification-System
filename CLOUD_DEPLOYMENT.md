# ==========================================
# FREE CLOUD DEPLOYMENT GUIDE
# ==========================================

This guide covers deploying the Smart Campus Notification System using FREE tier services.

---

## Service Overview

| Component | Free Service | Limit |
|-----------|--------------|-------|
| Backend | Render | 512MB RAM, 750 hours/month |
| Frontend | Vercel | 100GB bandwidth, unlimited requests |
| Database | MongoDB Atlas | 512MB storage (M0 cluster) |
| Redis | Upstash | 10,000 commands/day |

---

## STEP 1: MongoDB Atlas Setup (FREE)

### 1.1 Create Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up with GitHub/Google
3. Verify email

### 1.2 Create Cluster
1. Click **"Build a Database"**
2. Choose **FREE tier** (M0 Sandbox)
3. Select region closest to you (e.g., Ireland)
4. Click **"Create"**

### 1.3 Configure Network Access
1. Go to **Security → Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.4 Create Database User
1. Go to **Security → Database Access**
2. Click **"Add New Database User"**
3. Username: `scnsadmin`
4. Password: (generate secure password)
5. Role: **Read and write to any database**
6. Click **"Add User"**

### 1.5 Get Connection String
1. Go to **Deployment → Database**
2. Click **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password

```
mongodb+srv://scnsadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/uni-notify?retryWrites=true&w=majority
```

---

## STEP 2: Upstash Redis Setup (FREE)

### 2.1 Create Account
1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Create a new database

### 2.2 Configure Database
1. Region: Choose closest to your users
2. Protocol: **Redis**
3. Click **"Create"**

### 2.3 Get Connection URL
1. Go to **Database → Connect**
2. Copy **REST API URL** and **REST Token**
3. Use format: `redis://default:YOUR_TOKEN@xxx.upstash.io:6379`

---

## STEP 3: Backend Deployment (Render - FREE)

### 3.1 Create Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 3.2 Create Web Service
1. Click **"New +" → "Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `scns-backend`
   - **Region**: Oregon (or closest)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3.3 Environment Variables
Add these in Render dashboard:

```
NODE_ENV=production
PORT=8000

# MongoDB (from Step 1)
MONGO_URI=mongodb+srv://scnsadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/uni-notify

# JWT Secrets (generate at: https://randomkeygen.com)
JWT_SECRET=your-64-char-secret-key
JWT_REFRESH_SECRET=another-64-char-secret-key

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Twilio (optional - for SMS)
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_NUMBER=+1234567890

# AI Providers
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key

# Upstash Redis (from Step 2)
REDIS_URL=redis://default:YOUR_TOKEN@xxx.upstash.io:6379
```

### 3.4 Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (~2-3 minutes)
3. Note your backend URL: `https://scns-backend.onrender.com`

---

## STEP 4: Frontend Deployment (Vercel - FREE)

### 4.1 Create Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 4.2 Import Project
1. Click **"Add New..." → "Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.3 Environment Variables
Add in Vercel dashboard:

```
VITE_API_URL=https://scns-backend.onrender.com/api
VITE_APP_ENV=production
VITE_APP_NAME=Smart Campus Notification
```

### 4.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment (~1 minute)
3. Note your frontend URL: `https://your-project.vercel.app`

---

## STEP 5: Update Backend CORS

In your backend `.env` file on Render:

```
FRONTEND_URL=https://your-project.vercel.app
```

---

## Deployment Complete!

Your app should now be live at:
- **Frontend**: https://your-project.vercel.app
- **Backend API**: https://scns-backend.onrender.com

---

## Troubleshooting

### Backend Cold Start
Render's free tier spins down after 15 minutes. First request after inactivity may take ~30 seconds.

### MongoDB Connection Issues
- Check network access whitelist includes 0.0.0.0/0
- Verify username/password in connection string

### Redis Connection Issues
- Upstash free tier has 10,000 commands/day limit
- For heavy usage, consider self-hosting Redis on Render

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Include protocol (https://) and no trailing slash

---

## Cost Summary (FREE Forever)

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| Render Backend | $0 | 750 hours, spins down after 15 min |
| Vercel Frontend | $0 | Unlimited requests, 100GB bandwidth |
| MongoDB Atlas | $0 | 512MB storage (M0 cluster) |
| Upstash Redis | $0 | 10,000 commands/day |
| **Total** | **$0** | ✓ |

---

## Useful Links

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Upstash: https://upstash.com/docs
