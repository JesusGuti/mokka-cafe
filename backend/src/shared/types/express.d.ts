import { AuthTokenPayload } from '../../modules/auth/domain/ports/token-generator';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}
