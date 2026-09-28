export {};

declare global {
  namespace Express {
    interface Request {
      user?: import('../../generated/prisma/models.js').UserModel;
    }
  }
}
