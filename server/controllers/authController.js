const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user by email or username
    const user = await User.findOne({ 
      $or: [{ email }, { username: email }] 
    });

    if (user && (await user.matchPassword(password))) {
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Account is inactive. Please contact admin.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin only depending on logic, let's keep it public for now for initial setup or restrict later)
const registerUser = async (req, res) => {
  const { name, email, username, password } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      username,
      password,
      role: 'user' // Default to normal user
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = {
  loginUser,
  registerUser
};
