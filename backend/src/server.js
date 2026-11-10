import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

await connectDatabase();
app.listen(env.port, () => console.info(`API listening on http://localhost:${env.port}`));
