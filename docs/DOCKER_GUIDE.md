# Docker Desktop Deployment Guide — Loan Eligibility AI

This guide explains how to build, orchestrate, and run the entire multi-container Loan Eligibility AI platform inside **Docker Desktop**.

---

## 1. Prerequisites

1. Install **Docker Desktop** on Windows/Mac/Linux.
2. Start Docker Desktop and ensure the engine is running (`docker info` or green indicator in Docker Desktop).

---

## 2. Architecture of the Docker Compose Setup

When you run `docker compose up --build`, Docker starts four containers in an isolated bridge network (`loan_ai_net`):

| Service | Container Name | Image / Base | Internal Port | Exposed Port | Role |
|---|---|---|---|---|---|
| **mysql** | `loan_ai_mysql` | `mysql:8.0` | 3306 | `3306` | MySQL relational database |
| **ml-service** | `loan_ai_ml_service` | `python:3.11-slim` | 8000 | `8000` | FastAPI EBM Inference Service |
| **backend** | `loan_ai_backend` | `node:20-alpine` | 5000 | `5000` | Express REST API Gateway |
| **frontend** | `loan_ai_frontend` | `nginx:alpine` | 80 | `3000` | React Vite Web App & Proxy |

---

## 3. Launching with Docker Desktop

Open your terminal (PowerShell, Command Prompt, or bash) in the root directory `loan-eligibility-ai/` and execute:

```bash
docker compose up --build
```

### What happens automatically:
1. **MySQL 8.0** initializes and performs healthchecks.
2. **ML Service** builds, installs dependencies, verifies the trained EBM model, and starts Uvicorn.
3. **Backend** compiles TypeScript, generates the Prisma Client, pushes the database schema to MySQL, seeds demo accounts (`admin@loanai.local` and `arjun@loanai.local`), and starts Express.
4. **Frontend** builds the production React application with Vite and serves it through Nginx on port `3000`.

---

## 4. Accessing the Application

Once the containers are up:
- **Web Application**: Open [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/health](http://localhost:5000/health)
- **ML Service Health & Docs**: [http://localhost:8000/health](http://localhost:8000/health) and [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

### Demo Accounts for Testing:
- **Applicant Demo**: `arjun@loanai.local` / `User@12345`
- **Underwriter Admin**: `admin@loanai.local` / `Admin@12345`

---

## 5. Helpful Commands

### Run in background (detached mode):
```bash
docker compose up -d
```

### View container logs:
```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# ML Service only
docker compose logs -f ml-service
```

### Stop all containers:
```bash
docker compose down
```

### Stop and clear database volumes:
```bash
docker compose down -v
```
