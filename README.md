# TextWave 💬

A real-time messaging platform built with **Next.js**, **Prisma**, **NextAuth.js**, and **Pusher** for instant notifications.

**Features:**
- 🔐 Secure authentication (username/password)
- 📧 Email or phone recovery options
- ⚡ Real-time messaging with Pusher
- 🎨 Modern dark UI
- 📱 Mobile-responsive design
- 🗄️ PostgreSQL database

---

## Quick Setup

### 1️⃣ Local Development

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/textwave.git
cd textwave
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your .env.local:
```

### 2️⃣ Database Setup (PostgreSQL)

Choose one:

**Option A: Neon (FREE, recommended)**
1. Go to [neon.tech](https://neon.tech) → Sign up free
2. Create a new project
3. Copy the connection string into `DATABASE_URL` in `.env.local`
4. Run: `npm run db:push`

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com) → Create project
2. Get PostgreSQL URI from Settings → Database
3. Add to `DATABASE_URL` in `.env.local`
4. Run: `npm run db:push`

**Option C: Local PostgreSQL**
```bash
# Install PostgreSQL, create database, then:
DATABASE_URL="postgresql://user:password@localhost:5432/textwave"
npm run db:push
```

### 3️⃣ Auth & Session Keys

Generate a random secret:
```bash
openssl rand -base64 32
```

Add to `.env.local`:
```
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 4️⃣ Pusher Setup (Real-time Messaging)

1. Go to [pusher.com](https://pusher.com) → Sign up FREE
2. Create an app → Select Channels
3. Copy your credentials:
   - App ID
   - Key
   - Secret
   - Cluster (e.g., `us2`)

Add to `.env.local`:
```
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

### 5️⃣ Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
- Sign up with username, password, and recovery method
- Create a second test account to message yourself
- Messages appear in real-time! 🚀

---

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/textwave.git
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Vercel Dashboard (Easiest)**
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"New Project"**
3. Import your `textwave` repository
4. Vercel auto-detects Next.js → Click **Deploy**
5. **Wait ~2-3 min** for deployment

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel
# Follow prompts, connect to GitHub
```

### Step 3: Add Environment Variables to Vercel

1. In Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Add each variable:

```
DATABASE_URL         → Your Neon/Supabase connection string
NEXTAUTH_SECRET      → Your generated secret
NEXTAUTH_URL         → https://your-domain.vercel.app
PUSHER_APP_ID        → From Pusher dashboard
PUSHER_KEY           → From Pusher dashboard
PUSHER_SECRET        → From Pusher dashboard
PUSHER_CLUSTER       → e.g., us2
NEXT_PUBLIC_PUSHER_KEY      → Same as PUSHER_KEY
NEXT_PUBLIC_PUSHER_CLUSTER  → Same as PUSHER_CLUSTER
```

3. Click **Save**
4. Vercel auto-redeploys with new env vars

### Step 4: Verify Deployment

- Visit your live URL (shown in Vercel dashboard)
- Sign up & test messaging
- If issues, check **Vercel Logs** → Deployments → Latest → Logs

---

## Project Structure

```
textwave/
├── app/
│   ├── (auth)/              # Login/signup pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/               # Protected chat pages
│   │   └── chat/page.tsx
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── messages/
│   │   └── conversations/
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Design system
├── components/
│   └── chat/                # Chat components
│       ├── ChatShell.tsx
│       ├── MessagePane.tsx
│       ├── ConversationList.tsx
│       └── NewConversationModal.tsx
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── prisma.ts            # Prisma client
│   ├── pusher.ts            # Pusher client
│   └── validations.ts       # Zod schemas
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

---

## Database Schema

```
Users
├── id, username (unique)
├── passwordHash (bcrypt)
├── email or phone (for recovery)
├── displayName, avatarColor

Conversations (1-to-1 only)
├── id
├── participantA, participantB (user ids)
├── messages[] (relation)

Messages
├── id, content
├── senderId (user)
├── conversationId
├── createdAt, readAt
```

---

## API Routes

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Messages
- `GET /api/messages?conversationId=...` - Load message history
- `POST /api/messages` - Send message (real-time via Pusher)

### Conversations
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create/get conversation with user

### Users
- `GET /api/users/search?q=...` - Search users by username

---

## Troubleshooting

### "Prisma error: DATABASE_URL not found"
- Make sure `DATABASE_URL` is in `.env.local` (local) or Vercel env vars (production)
- Run `npm run db:push` locally first

### "NextAuth signin failed"
- Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set
- Make sure they match between `.env.local` and Vercel

### "Messages not appearing in real-time"
- Verify Pusher credentials are correct
- Check Pusher app is active on dashboard
- Look at browser console for errors

### "Username already taken on signup"
- Each user must have unique username
- Try `username_123` instead

### Deploy fails on Vercel
- Check build logs: Vercel Dashboard → Deployments → Latest
- Ensure all env vars are set
- Run `npm run build` locally to test

---

## Tech Stack

| Component | Tech |
|-----------|------|
| Frontend | Next.js 14, React 18, CSS-in-JS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon/Supabase) |
| ORM | Prisma |
| Auth | NextAuth.js |
| Real-time | Pusher Channels |
| Validation | Zod |
| Hosting | Vercel |

---

## Development

```bash
# Database
npm run db:push      # Sync schema
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio (GUI)

# Dev server
npm run dev          # http://localhost:3000

# Build
npm run build
npm start            # Production
```

---

## Security Notes

✅ Passwords hashed with bcryptjs  
✅ JWT sessions with NextAuth  
✅ Private API routes (require auth)  
✅ CORS/CSRF protected  

⚠️ For production, also:
- Enable HTTPS only
- Set strong `NEXTAUTH_SECRET`
- Review Pusher channel subscriptions
- Add rate limiting on auth endpoints

---

## License

MIT

---

## Support

- 📚 [Next.js Docs](https://nextjs.org/docs)
- 🔐 [NextAuth.js Docs](https://next-auth.js.org)
- 📦 [Prisma Docs](https://www.prisma.io/docs)
- ⚡ [Pusher Docs](https://pusher.com/docs)

Happy coding! 🚀
