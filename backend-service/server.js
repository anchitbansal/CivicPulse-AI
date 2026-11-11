import http from 'http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { registerSocketHandlers } from './src/socket/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);
const io = registerSocketHandlers(server);

app.set('io', io);

connectDB();

server.listen(port, () => {
  console.log(`CivicPulse backend is running on http://localhost:${port}`);
});
