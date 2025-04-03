const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { validateToken } = require('./services/authentication');
const Blog = require('./models/blog');
const User = require('./models/user');
const userRoutes = require("./routes/user");

const app = express();
const PORT = 3000;

// Database connection
mongoose.connect('mongodb://localhost:27017/Blogs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Authentication middleware
const checkAuth = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect('/login');
    }

    const userData = validateToken(token);
    if (!userData) {
        res.clearCookie('token');
        return res.redirect('/login');
    }

    try {
        // Fetch complete user data from database
        const user = await User.findById(userData.userId);
        if (!user) {
            res.clearCookie('token');
            return res.redirect('/login');
        }

        // Make user data available to views
        res.locals.user = user;
        res.locals.userId = user._id;
        res.locals.userRole = user.role;
        req.user = user;
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// Clear any existing session cookies
app.use((req, res, next) => {
    res.clearCookie('connect.sid');
    next();
});

// Routes
app.use(userRoutes);

// Mount blog routes with base path
const blogRoutes = require("./routes/blog");
app.use('/blog', blogRoutes);  // Add base path '/blog'

// Protected route
app.get('/', checkAuth, async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .populate('author', 'fullname profileImage')
            .sort({ createdAt: -1 });
            
        res.render('home', { 
            user: req.user,
            blogs: blogs
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.render('home', { 
            user: req.user,
            blogs: []
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
