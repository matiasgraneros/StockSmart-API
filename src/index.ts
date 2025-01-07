import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { routerApi } from './routes';

dotenv.config();
const app = express();

const PORT = process.env.PORT;

const corsOptions = {
  origin: ['https://stock-smart.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
routerApi(app);

app
  .listen(PORT, () => {
    // console.log('Server running at PORT: ', PORT);
  })
  .on('error', (error) => {
    throw new Error(error.message);
  });
