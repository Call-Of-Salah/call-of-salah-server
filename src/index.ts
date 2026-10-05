import 'dotenv/config';

import { createApp } from './app.js';
import { loadConfig } from './common/config.js';

const config = loadConfig();
const app = createApp();

const server = app.listen(config.port, () => {
  console.log(
    JSON.stringify({
      msg: 'call-of-salah-server listening',
      node: process.version,
      env: config.env,
      port: config.port,
    }),
  );
});

