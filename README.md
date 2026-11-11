# CivicPulse AI

Real-time civic issue triage, AI severity scoring, and authority dispatch command center.

## Run locally

1. Copy `.env.example` to `.env`.
2. Start all services with `docker compose up --build`.
3. Open the citizen report flow at `http://localhost:3000/report` or the command center at `http://localhost:3000/dashboard`.

The AI service downloads `yolov8n.pt` on its first inference when a model is available. It also has a deterministic OpenCV fallback so the API remains usable in development without model weights.
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
