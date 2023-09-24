import express from 'express';
import cors from 'cors';
import '../database/dbConnection.js'
import middleware from './middleware.js';
import router from './router.js';
import * as dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { auth } from '../api/auth/auth.controller.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
const envConfig = fs.readFileSync(envPath, 'utf8');

for (const line of envConfig.split('\n')) {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
}


const app = express();
const port = 3003;

app.use(cors());
app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
  });
  app.use(auth);
app.use(express.json());
app.use(middleware);
app.use(router);
function hideSecret(secret) {
  return '*'.repeat(secret.length);
}
async function start() {
  const timelog = new Date();
  const server = app.listen(port, async () => {
    console.log(`SERVERLOG ${timelog} --> Server started on port ${port}.`);
    // console.log("Secret key is:", hideSecret(process.env.AUTH_SECRET_KEY));
    // console.log(process.env.GMAIL_USER)


  });

  process.on('unhandledRejection', err => {
    const timelog = new Date();
    console.error(`SERVERLOG ${timelog} --> Server has closed. An error occurred: ${err}`)
    server.close(() => process.exit(1))
  });
}

start();
