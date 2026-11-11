# CivicPulse AI

Real-time civic issue triage, AI severity scoring, and authority dispatch command center.

## Run locally

1. Copy `.env.example` to `.env`.
2. Start all services with `docker compose up --build`.
3. Open the citizen report flow at `http://localhost:3000/report` or the command center at `http://localhost:3000/dashboard`.

The AI service downloads `yolov8n.pt` on its first inference when a model is available. It also has a deterministic OpenCV fallback so the API remains usable in development without model weights.
