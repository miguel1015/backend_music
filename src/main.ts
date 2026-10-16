import { Logger } from '@nestjs/common';
import { createApp } from './app.factory';

async function bootstrap() {
  const app = await createApp();

  const port = process.env.PORT || 3001;
  await app.listen(port);

  Logger.log(`Server running on http://localhost:${port}/docs`, 'Bootstrap');
}
bootstrap();
