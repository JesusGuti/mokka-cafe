import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  enabled: process.env.SWAGGER_ENABLED
    ? process.env.SWAGGER_ENABLED === 'true'
    : process.env.NODE_ENV !== 'production',
  path: process.env.SWAGGER_PATH ?? 'api',
  title: 'Mokka Café API',
  description: 'API del backend de Mokka Café',
  version: '1.0',
}));
