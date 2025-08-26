import type { User } from './users/entity/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

declare module '*.png' {
  const value: string;
  export default value;
}
