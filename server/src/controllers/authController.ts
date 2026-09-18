import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { userStore } from '../utils/userStore.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, membershipPlan } = req.body;

    // 1. Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: 'Full name is required (minimum 2 characters).',
      });
      return;
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({
        success: false,
        error: 'A valid email address is required.',
      });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if user already exists
    const existingUser = await userStore.findByEmail(normalizedEmail);
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      });
      return;
    }

    // 3. Hash password using bcrypt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create new user document (membershipStatus starts as "none")
    const newUser = await userStore.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      membershipPlan: membershipPlan === 'monthly' || membershipPlan === 'yearly' ? membershipPlan : null,
    });

    // 5. Automatic login: generate JWT & set cookie
    const token = generateToken({
      userId: newUser.id || newUser._id,
      email: newUser.email,
    });

    setAuthCookie(res, token);

    const safeUser = typeof newUser.toJSON === 'function' ? newUser.toJSON() : { ...newUser };
    delete safeUser.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Account created and authenticated successfully.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during registration. Please try again.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userStore.findByEmail(normalizedEmail);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please verify your credentials.',
      });
      return;
    }

    // Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please verify your credentials.',
      });
      return;
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id || user._id,
      email: user.email,
    });

    setAuthCookie(res, token);

    const safeUser = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
    delete safeUser.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while signing in. Please try again.',
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const safeUser = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
    delete safeUser.passwordHash;

    res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve authenticated user session.',
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    clearAuthCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error clearing authentication session.',
    });
  }
};

/**
 * Idempotent Admin Account Seed Endpoint
 * Can be called via GET or POST to ensure the admin test account
 * exists and has the correct bcrypt password hash and admin role.
 */
export const seedAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { seedAdminAccount } = await import('../utils/seedData.js');
    const { seedAdminInMemory } = await import('../utils/userStore.js');

    await seedAdminInMemory();
    const result = await seedAdminAccount();

    res.status(200).json({
      success: true,
      message: result.message,
      action: result.action,
      account: {
        email: 'admin@digitalheroes.test',
        role: 'admin',
        passwordConfig: 'Admin@12345 (bcrypt encrypted)',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to seed admin account',
      details: error?.message || error,
    });
  }
};

