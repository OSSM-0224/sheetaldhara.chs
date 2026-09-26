import { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Resident, Admin, Watchman } from '../models/index.ts';
import { AuthenticatedRequest, generateToken } from '../middleware/auth.ts';
import { SESSION_COOKIE_OPTIONS } from '../config/cookies.ts';

export async function residentSignin(req: AuthenticatedRequest, res: Response) {
  try {
    const { room_number, phone } = req.body || {};

    if (!room_number || !phone) {
      return res.status(400).json({
        error: 'Please enter both your Room / Flat Number and registered Phone Number.',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database is not connected. Please configure MONGODB_URI in Settings.',
      });
    }

    const cleanRoom = String(room_number).trim().toUpperCase();
    const cleanPhone = String(phone).trim();

    // Fast indexed lookup on room_number and phone compound index
    const resident = await Resident.findOne({
      room_number: cleanRoom,
      phone: cleanPhone,
    });

    if (!resident) {
      return res.status(401).json({
        error: "We couldn't find this room/phone combination. Please check your details or contact society admin.",
      });
    }

    const residentObj = resident.toJSON();

    const token = generateToken({
      role: 'RESIDENT',
      residentId: resident._id.toString(),
    });

    res.cookie('society_token', token, SESSION_COOKIE_OPTIONS);

    return res.json({
      role: 'RESIDENT',
      resident: residentObj,
      token,
      message: `Welcome back, ${resident.full_name}!`,
    });
  } catch (err: any) {
    console.error('Resident signin error:', err);
    return res.status(500).json({ error: 'Internal server error during sign-in.' });
  }
}

export async function adminLogin(req: AuthenticatedRequest, res: Response) {
  try {
    const { phone, password } = req.body || {};

    if (!phone || !password) {
      return res.status(400).json({ error: 'Admin phone and password are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database is not connected. Please configure MONGODB_URI in Settings.',
      });
    }

    const cleanPhone = String(phone).trim();
    const admin = await Admin.findOne({ phone: cleanPhone });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid administrator phone or password.' });
    }

    const match = bcrypt.compareSync(String(password), admin.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid administrator phone or password.' });
    }

    const token = generateToken({
      role: 'ADMIN',
      userId: admin._id.toString(),
    });

    res.cookie('society_token', token, SESSION_COOKIE_OPTIONS);

    return res.json({
      role: 'ADMIN',
      user: {
        id: admin._id.toString(),
        phone: admin.phone,
        role: 'ADMIN',
        full_name: admin.full_name,
      },
      token,
      message: 'Logged in as Society Administrator.',
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Internal server error during admin login.' });
  }
}

export async function watchmanLogin(req: AuthenticatedRequest, res: Response) {
  try {
    const { phone, password } = req.body || {};

    if (!phone || !password) {
      return res.status(400).json({ error: 'Watchman phone number and password are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database is not connected. Please configure MONGODB_URI in Settings.',
      });
    }

    const cleanPhone = String(phone).trim();
    const watchman = await Watchman.findOne({ phone: cleanPhone });

    if (!watchman) {
      return res.status(401).json({ error: 'Invalid watchman phone or password.' });
    }

    if (!watchman.is_active) {
      return res.status(403).json({ error: 'This watchman account has been deactivated by the admin.' });
    }

    const match = bcrypt.compareSync(String(password), watchman.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid watchman phone or password.' });
    }

    const token = generateToken({
      role: 'WATCHMAN',
      userId: watchman._id.toString(),
    });

    res.cookie('society_token', token, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 12 * 60 * 60 * 1000, // 12 hours shift session
    });

    return res.json({
      role: 'WATCHMAN',
      watchman: {
        id: watchman._id.toString(),
        phone: watchman.phone,
        full_name: watchman.full_name || 'Gate Watchman',
        role: 'WATCHMAN',
        status: watchman.is_active ? 'active' : 'inactive',
      },
      token,
      message: `Welcome, ${watchman.full_name || 'Gate Watchman'}!`,
    });
  } catch (err: any) {
    console.error('Watchman login error:', err);
    return res.status(500).json({ error: 'Internal server error during watchman login.' });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  res.clearCookie('society_token', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (req.role === 'ADMIN' && req.user) {
    return res.json({
      role: 'ADMIN',
      user: {
        id: req.user.id,
        phone: req.user.phone,
        role: 'ADMIN',
        full_name: req.user.full_name,
      },
    });
  }

  if (req.role === 'WATCHMAN' && req.watchman) {
    return res.json({
      role: 'WATCHMAN',
      watchman: {
        id: req.watchman.id,
        phone: req.watchman.phone,
        full_name: req.watchman.full_name,
        role: 'WATCHMAN',
        status: req.watchman.status,
      },
    });
  }

  if (req.role === 'RESIDENT' && req.resident) {
    return res.json({
      role: 'RESIDENT',
      resident: req.resident,
    });
  }

  return res.status(401).json({ error: 'Not authenticated.' });
}
