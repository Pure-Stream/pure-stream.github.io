/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: {
      id: string;
      email: string;
      user_metadata?: {
        name?: string;
        avatar_url?: string;
      };
      app_metadata?: {
        providers?: string[];
      };
      aud?: string;
      confirmation_sent_at?: string;
      confirmed_at?: string;
      created_at?: string;
      email_change?: string;
      email_change_confirm_token?: string;
      email_change_token_new?: string;
      email_change_token_old?: string;
      email_confirmed_at?: string;
      phone?: string;
      phone_change?: string;
      phone_change_token?: string;
      phone_confirmed_at?: string;
      updated_at?: string;
    } | null;
  }
}
