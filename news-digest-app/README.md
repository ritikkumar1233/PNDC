# Personalized News Digest Composer

A production-ready full-stack app that collects news every hour, summarizes articles using OpenAI, matches articles to user interests, generates a daily digest at **8 PM**, sends it via **SendGrid**, and displays it in a **React dashboard**.

## Folder Structure

```
/news-digest-app
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── newsRoutes.js
│   │   ├── digestRoutes.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Article.js
│   │   ├── Digest.js
│   ├── services/
│   │   ├── newsService.js
│   │   ├── aiService.js
│   │   ├── emailService.js
│   ├── cron/
│   │   ├── fetchNewsJob.js
│   │   ├── sendDigestJob.js
│   ├── seedDemoData.js
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── styles.css
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Signup.js
│   │   │   ├── Login.js
│   │   │   ├── Preferences.js
│   │   │   ├── Dashboard.js
│   │   └── services/
│   │       ├── api.js
└── README.md
```

> Note: In this environment, writing `.env.example` may be blocked. If it’s missing, create `backend/.env.example` manually using the template below.

## API Endpoints

- **POST** `/auth/register` → Create user
- **POST** `/auth/login` → Login user
- **POST** `/user/preferences` → Save interests (JWT required)
- **GET** `/news/fetch` → Fetch latest news now (manual trigger)
- **GET** `/news/all` → Get stored news
- **GET** `/digest/:userId` → Get latest digest for user (JWT required)

## Database Schema (MongoDB / Mongoose)

- **User**
  - `name: String`
  - `email: String (unique)`
  - `password: String (hashed)`
  - `interests: [String]`
  - `createdAt: Date`
- **Article**
  - `title: String`
  - `content: String`
  - `category: String`
  - `source: String`
  - `url: String`
  - `publishedAt: Date`
  - `summary: String`
  - `createdAt: Date`
- **Digest**
  - `userId: ObjectId`
  - `date: Date`
  - `articles: [Article]` (embedded)
  - `summaryText: String`

## Automation (Cron Jobs)

- **Every hour**: fetch news from NewsAPI → store → summarize each article via OpenAI
- **Every day at 8 PM**: for each user → filter by interests → create digest → email via SendGrid

Cron schedules are in:
- `backend/cron/fetchNewsJob.js` (`0 * * * *`)
- `backend/cron/sendDigestJob.js` (`0 20 * * *`)

## Environment Variables

Create `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/news-digest-app?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
NEWS_API_KEY=your_newsapi_key
# Prefer Gemini (recommended)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=models/text-bison-001

# Optional fallback provider
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=sender@example.com
```

Optionally create `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:5000
```

## Setup Instructions

### 1) MongoDB Atlas

- Create a cluster in MongoDB Atlas
- Create a database user and allow network access (IP allowlist)
- Copy the connection string into `MONGODB_URI`

### 2) Install & Run Backend

From `news-digest-app/backend`:

```
npm install
npm run dev
```

Backend starts at `http://localhost:5000`.

### 3) Install & Run Frontend

From `news-digest-app/frontend`:

```
npm install
npm start
```

Frontend starts at `http://localhost:3000`.

## Sample Demo Data

Seed demo user, 5 articles, and 1 digest:

From `news-digest-app/backend`:

```
node seedDemoData.js
```

Demo login:
- Email: `ritik@example.com`
- Password: `Password@123`

## How it Works

- News is fetched from **NewsAPI** (`top-headlines`) and stored in MongoDB.
- Each article is summarized with Gemini (preferred) or OpenAI (fallback) using the prompt:
  - “Summarize the following news in 5 detailed bullet points...”
- At 8 PM daily, the system:
  - Matches articles to each user’s `interests`
  - Generates a digest summary
  - Emails the digest via SendGrid
  - Saves the digest to MongoDB for the dashboard

