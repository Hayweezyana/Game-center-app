const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, Customer } = require('../models');
const verifyRole = require('../middleware/verifyRole');

// Constants
const SECRET_KEY = process.env.SECRET_KEY; // Replace with your actual secret key

// Login Admin
const loginAdmin = async (req, res) => {
  
    const { username, password } = req.body;
    try {
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate a JWT token that includes the admin's role
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      SECRET_KEY,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    console.log('Generated Token:', token);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Create Admin
const createAdmin = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if the logged-in admin is authorized to create other admins
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'You do not have permission to create admins' });
    }

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists with this username' });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const newAdmin = await Admin.create({
      username,
      password: hashedPassword,
      role, // You can set default role to 'admin' if role is not specified
    });

    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

// Reset Password
const resetAdminPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in the database
    await admin.update({ password: hashedPassword });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Example: Get all admins (can be restricted by role)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

// Export controllers
module.exports = {
  loginAdmin,
  createAdmin,
  resetAdminPassword,
  getAllAdmins,
};
