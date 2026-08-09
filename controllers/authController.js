const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'civicai_secret_key_2026', {
    expiresIn: '30d'
  });
};

// Helper: Format raw 13-digit CNIC to standard XXXXX-XXXXXXX-X
const formatCnic = (val = '') => {
  const digits = String(val).replace(/\D/g, '');
  if (digits.length === 13) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  }
  return val;
};

// Register Citizen
const registerUser = async (req, res) => {
  try {
    const { name, cnic: inputCnic, email, phone, city, password } = req.body;

    if (!name || !inputCnic || !email || !phone || !city || !password) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // Auto-format CNIC if typed without hyphens
    const formattedCnic = formatCnic(inputCnic);

    // CNIC Regex Format Check (13 digits: XXXXX-XXXXXXX-X)
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(formattedCnic)) {
      return res.status(400).json({ error: 'Invalid CNIC format. CNIC must contain 13 digits (e.g. 42101-1234567-1 or 4210112345671)' });
    }

    // Phone Regex Format Check
    const phoneRegex = /^(\+92|0|92)?-?3\d{2}-?\d{7}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Invalid Phone Number format. Must be valid Pakistani mobile number (e.g. 0300-1234567)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const rawDigits = formattedCnic.replace(/\D/g, '');

    // Check if user already exists with CNIC or Email
    const existingUser = await User.findOne({
      $or: [
        { cnic: formattedCnic },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.cnic === formattedCnic) {
        return res.status(400).json({ error: 'An account with this CNIC is already registered. Duplicate CNIC registration is prohibited.' });
      }
      return res.status(400).json({ error: 'An account with this Email address is already registered.' });
    }

    const user = await User.create({
      name,
      cnic: formattedCnic,
      email: email.toLowerCase(),
      phone,
      city,
      password,
      role: 'citizen'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        cnic: user.cnic,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ error: 'Invalid user registration data' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Citizen Login (Supports CNIC with or without dashes, or Email)
const loginUser = async (req, res) => {
  try {
    const { identity, password } = req.body;

    if (!identity || !password) {
      return res.status(400).json({ error: 'Please enter CNIC/Email and password' });
    }

    const cleanIdentity = identity.trim();
    const formattedCnic = formatCnic(cleanIdentity);
    const rawDigits = cleanIdentity.replace(/\D/g, '');

    const queryConditions = [
      { email: cleanIdentity.toLowerCase() },
      { cnic: cleanIdentity },
      { cnic: formattedCnic }
    ];

    if (rawDigits.length === 13) {
      queryConditions.push({ cnic: rawDigits });
    }

    const user = await User.findOne({ $or: queryConditions });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        cnic: user.cnic,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid CNIC/Email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Protected Admin Login
const adminLogin = async (req, res) => {
  try {
    const { username, password, key } = req.body;

    const isAdminPass = (username === 'admin@civicai.gov' || username === 'admin') && password === 'admin123';
    let adminUser = await User.findOne({ email: 'admin@civicai.gov' });

    if (isAdminPass) {
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Chief Municipal Inspector',
          cnic: '00000-0000000-0',
          email: 'admin@civicai.gov',
          phone: '+92-300-0000000',
          city: 'Islamabad Capital Territory',
          password: 'admin123',
          role: 'admin'
        });
      }
      return res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
        token: generateToken(adminUser._id)
      });
    }

    const dbUser = await User.findOne({ email: username, role: 'admin' });
    if (dbUser && (await dbUser.matchPassword(password))) {
      return res.json({
        _id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        token: generateToken(dbUser._id)
      });
    }

    res.status(401).json({ error: 'Invalid Admin credentials' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, loginUser, adminLogin, getMe };
