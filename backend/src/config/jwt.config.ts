import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 900),
}));
