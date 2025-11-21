import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { db } from '../../../lib/db';
import {
  apiError,
  conflictError,
  createdResponse,
  internalError,
  parseRequestBody,
  validateRequiredFields,
} from '../../../utils/api';
import { AUTH_CONFIG } from '../../../config/constants';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await parseRequestBody<{ name: string; email: string; password: string }>(request);

    if (!body) {
      return apiError('Invalid request body');
    }

    const { name, email, password } = body;

    // Validate required fields
    const missingFields = validateRequiredFields(body, ['name', 'email', 'password']);
    if (missingFields.length > 0) {
      return apiError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate password length
    if (password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
      return apiError(
        `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters`
      );
    }

    if (password.length > AUTH_CONFIG.MAX_PASSWORD_LENGTH) {
      return apiError(
        `Password must not exceed ${AUTH_CONFIG.MAX_PASSWORD_LENGTH} characters`
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return conflictError('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Return user without password
    return createdResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      'Account created successfully'
    );

  } catch (error) {
    return internalError('Failed to create account', error);
  }
};

export const prerender = false;
