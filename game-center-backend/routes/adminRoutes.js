const express = require('express');
const jwt = require('jsonwebtoken');
const verifyRole = require('../middleware/verifyRole');
const authenticateToken = require('../middleware/authenticateToken');
const adminController = require('../controllers/adminController');
const customerController = require('../controllers/customers');
const router = express.Router();

const { updateCustomerMembership } = customerController;

// Routes for admin operations
router.post('/login', adminController.loginAdmin); // Admin login
router.post('/reset-password', adminController.resetAdminPassword); // Reset password
router.put('/api/customers/membership_level', authenticateToken, verifyRole(['admin']), updateCustomerMembership);

router.use(authenticateToken);
router.post('/create', verifyRole(['super_admin']), adminController.createAdmin); // Create new admin (restricted to super_admin)
router.get('/all', verifyRole(['super_admin']), adminController.getAllAdmins); // Get all admins (restricted to super_admin)



module.exports = router;
