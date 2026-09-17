import 'dotenv/config';

import { createApp } from './app.js';

const port = Number(process.env['PORT'] ?? 3000);
const app = createApp();

const server = app.listen(port, () => {
  console.log(
    JSON.stringify({
      msg: 'call-of-salah-server listening',
      node: process.version,
      env: process.env['NODE_ENV'] ?? 'development',
      port,
    }),
  );
});

