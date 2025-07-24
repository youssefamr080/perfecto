import { PrismaClient } from '@prisma/client';

// This is the recommended way to instantiate PrismaClient in a Next.js app.
// It prevents creating too many connections to the database during development
// due to hot-reloading.

declare global {
  // allow global `var` declarations
   
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
