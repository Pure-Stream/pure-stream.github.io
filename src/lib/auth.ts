import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

// Helper function to transform account from schema field names back to better-auth field names
function transformAccountFromDb(account: any) {
  if (!account) return account;
  return {
    ...account,
    providerId: account.provider,
    accountId: account.providerAccountId,
    // Remove the schema field names since better-auth expects the transformed names
  };
}

// Create a wrapper around the Prisma client to fix schema mismatches
const wrappedDb = {
  ...db,
  user: {
    ...db.user,
    create: (args: any) => {
      // Fix emailVerified: convert false to null
      if (args.data && args.data.emailVerified === false) {
        args.data.emailVerified = null;
      }
      return db.user.create(args);
    },
    update: (args: any) => {
      // Fix emailVerified: convert false to null
      if (args.data && args.data.emailVerified === false) {
        args.data.emailVerified = null;
      }
      return db.user.update(args);
    },
    upsert: (args: any) => {
      // Fix emailVerified in create and update
      if (args.create && args.create.emailVerified === false) {
        args.create.emailVerified = null;
      }
      if (args.update && args.update.emailVerified === false) {
        args.update.emailVerified = null;
      }
      return db.user.upsert(args);
    }
  },
  session: {
    ...db.session,
    create: (args: any) => {
      console.log('💾 Creating session with data:', JSON.stringify(args.data, null, 2));

      // Map better-auth field names to Prisma schema
      if (args.data.token && !args.data.sessionToken) {
        args.data.sessionToken = args.data.token;
        delete args.data.token;
      }
      if (args.data.expiresAt && !args.data.expires) {
        args.data.expires = args.data.expiresAt;
        delete args.data.expiresAt;
      }

      // Remove fields not in Session model
      if (args.data.createdAt) {
        delete args.data.createdAt;
      }
      if (args.data.updatedAt) {
        delete args.data.updatedAt;
      }
      if (args.data.id) {
        delete args.data.id;
      }
      if (args.data.ipAddress) {
        delete args.data.ipAddress;
      }
      if (args.data.userAgent) {
        delete args.data.userAgent;
      }

      console.log('💾 Saving session with processed data:', JSON.stringify(args.data, null, 2));
      return db.session.create(args).then((result: any) => {
        console.log('✅ Session created successfully:', result.id);
        return result;
      }).catch((error: any) => {
        console.error('❌ Failed to create session:', error);
        throw error;
      });
    },
    findUnique: (args: any) => {
      return db.session.findUnique(args);
    },
    findMany: (args: any) => {
      return db.session.findMany(args);
    },
    update: (args: any) => {
      return db.session.update(args);
    },
    delete: (args: any) => {
      return db.session.delete(args);
    },
    deleteMany: (args: any) => {
      return db.session.deleteMany(args);
    }
  },
  account: {
    ...db.account,
    create: (args: any) => {
      // Map better-auth field names to Prisma schema
      if (args.data.providerId) {
        args.data.provider = args.data.providerId;
        delete args.data.providerId;
      }
      if (args.data.accountId && !args.data.providerAccountId) {
        args.data.providerAccountId = args.data.accountId;
        delete args.data.accountId;
      }

      // Keep password field for credential accounts - better-auth stores credentials in Account table
      // For non-credential accounts, password should not be present
      if (args.data.password && args.data.provider !== 'credential') {
        delete args.data.password;
      }
      // createdAt and updatedAt are handled automatically by Prisma
      if (args.data.createdAt) {
        delete args.data.createdAt;
      }
      if (args.data.updatedAt) {
        delete args.data.updatedAt;
      }
      // id is also auto-generated, let Prisma handle it
      if (args.data.id && !args.data.id.startsWith('cuid')) {
        delete args.data.id;
      }

      // For credential accounts, ensure type is set
      if (args.data.provider === 'credential') {
        args.data.type = 'credential';
      }
      // For all accounts, make sure type is set
      if (!args.data.type) {
        args.data.type = 'oauth';
      }

      return db.account.create(args).catch((error: any) => {
        console.error('❌ Failed to create account:', error);
        throw error;
      });
    },
    findUnique: (args: any) => {
      // Map better-auth field names in where clause
      if (args.where?.providerId) {
        args.where.provider = args.where.providerId;
        delete args.where.providerId;
      }
      if (args.where?.accountId) {
        args.where.providerAccountId = args.where.accountId;
        delete args.where.accountId;
      }
      return db.account.findUnique(args).then((result: any) => {
        // Transform field names back for better-auth
        return transformAccountFromDb(result);
      });
    },
    findMany: (args: any) => {
      // Map better-auth field names in where clause
      if (args.where) {
        if (args.where.providerId) {
          args.where.provider = args.where.providerId;
          delete args.where.providerId;
        }
        if (args.where.accountId) {
          args.where.providerAccountId = args.where.accountId;
          delete args.where.accountId;
        }
        // Handle nested conditions
        if (args.where.AND) {
          args.where.AND = args.where.AND.map((condition: any) => {
            if (condition.providerId) {
              condition.provider = condition.providerId;
              delete condition.providerId;
            }
            if (condition.accountId) {
              condition.providerAccountId = condition.accountId;
              delete condition.accountId;
            }
            return condition;
          });
        }
      }

      return db.account.findMany(args).then((results: any[]) => {
        // Transform field names back for better-auth
        return results.map(transformAccountFromDb);
      });
    }
  }
};

export const auth = betterAuth({
  database: prismaAdapter(wrappedDb as any, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
  trustedOrigins: ["http://localhost:4321", "http://localhost:4328"],
});
