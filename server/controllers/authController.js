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

// @desc    Register a new user (Admin can set role; public defaults to 'user')
// @route   POST /api/auth/register
// @access  Public / Admin
const registerUser = async (req, res) => {
  const { name, email, username, password, role } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with that email or username.' });
    }

    // Allow role assignment only if the request comes from an authenticated admin
    const allowedRoles = ['user', 'staff', 'admin'];
    const assignedRole =
      req.user && req.user.role === 'admin' && role && allowedRoles.includes(role)
        ? role
        : 'user';

    const user = await User.create({
      name,
      email,
      username,
      password,
      role: assignedRole,
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
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Update own profile (name, email, username, password)
// @route   PUT /api/auth/profile
// @access  Private (any logged-in user)
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, username, password } = req.body;

    // If changing email/username, make sure they are not taken by another user
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) return res.status(400).json({ message: 'Email already in use by another account.' });
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameTaken = await User.findOne({ username, _id: { $ne: user._id } });
      if (usernameTaken) return res.status(400).json({ message: 'Username already taken.' });
      user.username = username;
    }

    if (name) user.name = name;
    if (password && password.trim() !== '') user.password = password;

    const updated = await user.save();

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      username: updated.username,
      role: updated.role,
      token: generateToken(updated._id), // refresh token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Admin updates another user's profile (name, email, username, password)
// @route   PUT /api/users/:id/profile
// @access  Private/Admin
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, username, password } = req.body;

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) return res.status(400).json({ message: 'Email already in use by another account.' });
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameTaken = await User.findOne({ username, _id: { $ne: user._id } });
      if (usernameTaken) return res.status(400).json({ message: 'Username already taken.' });
      user.username = username;
    }

    if (name) user.name = name;
    if (password && password.trim() !== '') user.password = password;

    const updated = await user.save();

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      username: updated.username,
      role: updated.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = {
  loginUser,
  registerUser,
  updateProfile,
  updateUserProfile,
};
