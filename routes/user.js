const { Router } = require("express");
const User = require("../models/user");
const { createToken } = require('../services/authentication');
const router = Router();

// Middleware to check if user is already logged in
const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        return res.redirect('/');
    }
    next();
};

router.get("/signup", redirectIfAuthenticated, (req, res) => {
    res.render("signup", { message: null });
});

router.get("/login", redirectIfAuthenticated, (req, res) => {
    res.render("login", { message: null });
});

router.post("/signup", redirectIfAuthenticated, async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        // Validation
        if (!fullname || !email || !password) {
            return res.render("signup", { 
                message: "All fields are required" 
            });
        }

        if (password.length < 6) {
            return res.render("signup", { 
                message: "Password must be at least 6 characters long" 
            });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", { 
                message: "Email already registered" 
            });
        }

        // Create user
        const user = new User({ fullname, email, password });
        await user.save();

        res.redirect("/login?message=Registration successful! Please login");
    } catch (error) {
        console.error("Signup error:", error);
        res.render("signup", { 
            message: "Error during registration" 
        });
    }
});

router.post("/login", redirectIfAuthenticated, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.render("login", { 
                message: "Email and password are required" 
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login", { 
                message: "Invalid email or password" 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render("login", { 
                message: "Invalid email or password" 
            });
        }

        // Create JWT token
        const token = createToken(user);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Success
        res.redirect("/");
    } catch (error) {
        console.error("Login error:", error);
        res.render("login", { 
            message: "Error during login" 
        });
    }
});

// Add logout route
router.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.redirect("/login");
});

module.exports = router;
