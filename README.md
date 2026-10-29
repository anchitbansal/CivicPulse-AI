# CivicPulse AI

A civic issue triage monorepo with:

- Python AI vision service for issue analysis
- Node.js backend with Socket.io and MongoDB
- React frontend for citizen reporting and command center

### Quick start

1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies for backend and frontend.
3. Start the AI service:
   `cd ai-vision-service && uvicorn app.main:app --reload --host 0.0.0.0 --port 5000`
4. Start the backend:
   `cd backend-service && npm install && npm run dev`
5. Start the frontend:
   `cd frontend-app && npm install && npm run dev`

> Docker files are included for deployment previews, but the project is designed primarily for local development without Docker.
