// middleware/verifyRole.js
const verifyRole = (allowedRoles) => (req, res, next) => {
  const { role } = req.admin;

  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }

  next();
};

module.exports = verifyRole;
