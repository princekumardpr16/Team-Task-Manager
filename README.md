# TaskFlow — Team Task Manager

Full-stack task management app built with Spring Boot + React.

## Tech Stack
- **Backend**: Spring Boot 3, Spring Security + JWT, JPA, PostgreSQL
- **Frontend**: React + Vite, Tailwind CSS, Zustand, Axios
- **Deploy**: Railway

---

## Local Development

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL running locally

### Backend Setup

```bash
cd backend

# Create database
createdb taskmanager

# Run
./mvnw spring-boot:run
```

Backend runs on `http://localhost:8080`

Environment variables (or edit application.properties):
```
DATABASE_URL=jdbc:postgresql://localhost:5432/taskmanager
DB_USERNAME=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # edit VITE_API_URL if needed
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Railway Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/taskflow.git
git push -u origin main
```

### 2. Deploy Backend
1. Go to railway.app → New Project → Deploy from GitHub
2. Select your repo → select `backend` folder as root
3. Add PostgreSQL plugin (Railway provides it)
4. Set environment variables:
   - `DATABASE_URL` → use Railway's PostgreSQL URL
   - `DB_USERNAME` → from Railway PostgreSQL
   - `DB_PASSWORD` → from Railway PostgreSQL
   - `JWT_SECRET` → any long random string
   - `FRONTEND_URL` → your frontend Railway URL (set after deploying frontend)

### 3. Deploy Frontend
1. New Service → same repo → select `frontend` folder as root
2. Set environment variables:
   - `VITE_API_URL` → your backend Railway URL + `/api`

---

## API Endpoints

### Auth
| Method | URL | Body |
|---|---|---|
| POST | /api/auth/signup | name, email, password |
| POST | /api/auth/login | email, password |

### Projects
| Method | URL | Auth |
|---|---|---|
| GET | /api/projects | ✓ |
| POST | /api/projects | ✓ |
| GET | /api/projects/:id | ✓ member |
| PUT | /api/projects/:id | ✓ admin |
| DELETE | /api/projects/:id | ✓ owner |
| GET | /api/projects/:id/members | ✓ member |
| POST | /api/projects/:id/members | ✓ admin |
| DELETE | /api/projects/:id/members/:userId | ✓ admin |

### Tasks
| Method | URL | Auth |
|---|---|---|
| GET | /api/dashboard | ✓ |
| GET | /api/projects/:id/tasks | ✓ member |
| POST | /api/projects/:id/tasks | ✓ member |
| PUT | /api/tasks/:id | ✓ member |
| DELETE | /api/tasks/:id | ✓ admin |
