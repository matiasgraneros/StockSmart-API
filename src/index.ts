import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { routerApi } from './routes';

dotenv.config();
const app = express();

const PORT = process.env.PORT;

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
