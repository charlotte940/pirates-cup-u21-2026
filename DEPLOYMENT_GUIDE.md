# Pirates Cup U21 2026 - Deployment Guide

## Table of Contents
1. [Firebase Setup](#step-1-firebase-setup)
2. [Environment Variables](#step-2-environment-variables)
3. [Firebase Configuration](#step-3-firebase-configuration)
4. [Deploy to Firebase Hosting](#step-4-deploy-to-firebase-hosting)
5. [Database Security Rules](#step-5-database-security-rules)
6. [Future Code Updates](#step-6-future-code-updates)

---

## Step 1: Firebase Setup

### 1.1 Get Your Firebase Config
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → Project settings
4. Scroll down to "Your apps" section
5. Click the web app (</>) or create one
6. Copy the Firebase configuration object

### 1.2 Install Firebase CLI
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### 1.3 Initialize Firebase in Project
```bash
cd /path/to/your/project
firebase init
```

**Select these options:**
- ✅ Firestore: Configure security rules
- ✅ Storage: Configure security rules
- ✅ Hosting: Configure files for Firebase Hosting
- ❌ Functions (optional - for advanced features)
- ❌ Emulators (optional - for local testing)

**When prompted:**
- What do you want to use as your public directory? `dist`
- Configure as a single-page app? `Yes`
- Set up automatic builds and deploys with GitHub? `No` (or Yes if you want CI/CD)

---

## Step 2: Environment Variables

### 2.1 Create .env File
Create a `.env` file in your project root:

```bash
# Copy from example
cp .env.example .env
```

### 2.2 Add Your Firebase Config
Edit `.env` and replace with your actual Firebase values:

```env
VITE_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxx
```

**Note:** These values are from your Firebase Console → Project Settings → General → Your apps

---

## Step 3: Firebase Configuration

### 3.1 Verify firebase.ts
The `src/config/firebase.ts` file should already be configured. It reads from environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### 3.2 Build the Project
```bash
npm run build
```

This creates a `dist` folder with production files.

---

## Step 4: Deploy to Firebase Hosting

### 4.1 Deploy
```bash
firebase deploy
```

### 4.2 View Your Live Site
After deployment, you'll see:
```
✔ Deploy complete!
Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project.web.app
```

### 4.3 Custom Domain (Optional)
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS verification steps

---

## Step 5: Database Security Rules

### 5.1 Firestore Rules
Go to Firebase Console → Firestore Database → Rules

Replace with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all authenticated users
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'manager');
    }
    
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.role == 'manager' ||
         request.auth.token.role == 'fieldmanager');
    }
    
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role == 'admin' || 
         request.auth.token.role == 'manager');
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role == 'admin');
    }
  }
}
```

### 5.2 Storage Rules
Go to Firebase Console → Storage → Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /teams/{teamId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'manager');
    }
    
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Step 6: Future Code Updates

### 6.1 YES - You Can Edit Code After Deployment!

Here's how to make updates:

#### Option A: Edit Locally, Then Redeploy

1. **Make your changes** to the code
2. **Test locally:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```
4. **Deploy:**
   ```bash
   firebase deploy
   ```

#### Option B: Using Git (Recommended for Team)

1. **Clone the repository** (if not already)
   ```bash
   git clone <your-repo-url>
   cd my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a new branch for your changes**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make changes and commit**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

5. **Deploy to Firebase**
   ```bash
   npm run build
   firebase deploy
   ```

### 6.2 Common Update Scenarios

#### Update Team Data
```typescript
import { updateTeam } from './services/teamService';

await updateTeam(teamId, {
  points: 6,
  won: 2,
  played: 2
});
```

#### Update Match Score
```typescript
import { updateMatch } from './services/matchService';

await updateMatch(matchId, {
  homeScore: 2,
  awayScore: 1,
  status: 'completed'
});
```

#### Add New Coach
```typescript
import { registerCoach } from './services/userService';

const newCoach = await registerCoach(
  'coach@team.com',
  'password123',
  'John Doe',
  'Team Name',
  '0821234567'
);
```

### 6.3 Managing Data via Firebase Console

You can also manually edit data:

1. **Firestore Database**: Go to Firebase Console → Firestore
   - View/edit teams, matches, users
   - Add/delete documents
   
2. **Storage**: Go to Firebase Console → Storage
   - View team logos
   - Upload/delete files

3. **Authentication**: Go to Firebase Console → Authentication
   - View all users
   - Reset passwords
   - Disable accounts

---

## Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Deploy Issues
```bash
# Re-login to Firebase
firebase logout
firebase login

# Re-initialize if needed
firebase init
```

### Environment Variables Not Working
- Make sure `.env` is in project root
- Variables must start with `VITE_`
- Restart dev server after changing .env

---

## Recommended Stack Summary

| Component | Recommendation | Why |
|-----------|---------------|-----|
| **Frontend** | React + Vite + TypeScript | Fast, modern, type-safe |
| **Backend** | Firebase (Firestore + Auth + Storage) | Serverless, scalable, easy |
| **Database** | Firestore | Real-time, NoSQL, scalable |
| **Auth** | Firebase Auth | Secure, supports email/social |
| **File Storage** | Firebase Storage | Integrated, secure |
| **Hosting** | Firebase Hosting | Free SSL, CDN, easy deploy |
| **State Management** | React Context + Hooks | Simple, no extra libraries |

---

## Cost Estimation (Firebase)

**Free Tier (Spark Plan):**
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1GB storage
- 10GB bandwidth/month

**For your tournament (72 teams, ~200 matches):**
- Well within free tier limits
- If you exceed, Blaze plan is pay-as-you-go (~$0.10 per 100k reads)

---

## Next Steps After Deployment

1. ✅ Create admin account in Firebase Auth
2. ✅ Add initial teams to Firestore
3. ✅ Create field manager accounts
4. ✅ Upload team logos
5. ✅ Test all user roles
6. ✅ Share login credentials with stakeholders

---

## Support & Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Firestore Queries**: https://firebase.google.com/docs/firestore/query-data/queries
- **Firebase Auth**: https://firebase.google.com/docs/auth/web/start
- **Vite Env Variables**: https://vitejs.dev/guide/env-and-mode.html
