// middleware/auth.js

const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.headers['authorization']?.split(' ')[1]; // Assumes token is sent as Bearer <token>

    if (!token) {
        return res.sendStatus(401); // Unauthorized if no token is provided
    }

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden if token is invalid
        }
        req.user = user; // Attach the user data to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken; // Export the middleware
