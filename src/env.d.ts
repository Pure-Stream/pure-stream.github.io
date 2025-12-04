/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session: {
      user: {
        id: string;
        email: string;
        name: string;
        image?: string;
        emailVerified?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
      };
      session: {
        id: string;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string;
        userAgent?: string;
      };
    } | null;
  }
}
