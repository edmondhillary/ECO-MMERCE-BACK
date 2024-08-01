import * as dotenv from 'dotenv';
dotenv.config();
console.log("Loaded PORT from .env:", process.env.PORT);
import cors from 'cors';
import express from 'express';
import '../database/dbConnection.js';
import middleware from './middleware.js';
import router from './router.js';
import { auth } from '../api/auth/auth.controller.js';

// Configura dotenv para cargar las variables de entorno automáticamente
// No necesitas especificar la ruta porque .env está en la raíz

const app = express();
const port = process.env.PORT || 3003;
const gmail = process.env.GMAIL_USER;


app.use(cors());
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});
app.use(auth);
app.use(express.json());
app.use(middleware);
app.use(router);

async function start() {
  const timelog = new Date();
  const server = app.listen(port, async () => {
    console.log(`SERVERLOG ${timelog} --> Server started on port ${port}.`);
    // console.log("Secret key is:", hideSecret(process.env.AUTH_SECRET_KEY));
    // console.log(process.env.GMAIL_USER);
  });

  process.on('unhandledRejection', err => {
    const timelog = new Date();
    console.error(`SERVERLOG ${timelog} --> Server has closed. An error occurred: ${err}`);
    server.close(() => process.exit(1));
  });
}

start();
