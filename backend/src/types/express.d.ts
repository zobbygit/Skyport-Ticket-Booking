import { TokenAudience } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        role: string;
        email: string;
        aud: TokenAudience;
      };
    }
  }
}

export {};
