const jwt = require('jsonwebtoken');

const SECRET_KEY = "$uperMan";

// Create JWT token
const createToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id,
            email: user.email,
            role: user.role 
        }, 
        SECRET_KEY, 
        { expiresIn: '7d' }
    );
};

// Verify JWT token
const validateToken = (token) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
};

module.exports = {
    createToken,
    validateToken
}; 