/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session: {
      user?: {
        id?: string;
        email?: string;
        name?: string;
        image?: string;
      };
      expires?: string;
    } | null;
  }
}
