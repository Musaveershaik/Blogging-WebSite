const path = require("path");
const multer = require("multer");
const express = require("express");
const fs = require('fs');
const router = express.Router();
const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const { validateToken } = require("../services/authentication");
const { marked } = require('marked');

// Create uploads directory if it doesn't exist
const uploadDir = path.resolve('./public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

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
        const user = await User.findById(userData.userId);
        if (!user) {
            res.clearCookie('token');
            return res.redirect('/login');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// Configure marked options (optional)
marked.setOptions({
    breaks: true,  // Convert \n to <br>
    gfm: true,     // GitHub Flavored Markdown
    sanitize: false // Allow HTML in the markdown
});

// Blog routes
router.get('/create-blog', checkAuth, (req, res) => {
    res.render('createBlog', { user: req.user });
});

// Handle blog creation
router.post('/create-blog', checkAuth, upload.single('coverImage'), async (req, res) => {
    try {
        const { title, body } = req.body;
        
        const blogData = {
            title,
            body,
            author: req.user._id
        };

        // Only add coverImage if a file was uploaded
        if (req.file) {
            blogData.coverImage = `/uploads/${req.file.filename}`;  // Store the path relative to public directory
        }

        const blog = await Blog.create(blogData);
        
        res.redirect('/');
    } catch (error) {
        console.error('Blog creation error:', error);
        res.render('createBlog', { 
            user: req.user,
            error: 'Error creating blog'
        });
    }
});

//read blog
router.get('/:id', checkAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'fullname profileImage');
        
        if (!blog) {
            return res.status(404).render('error', { message: 'Blog not found' });
        }

        // Fetch comments for this blog
        const comments = await Comment.find({ blog: req.params.id })
            .populate('author', 'fullname profileImage')
            .sort({ createdAt: -1 });

        // Convert markdown to HTML
        const contentHtml = marked(blog.body);

        return res.render('blog', {
            user: req.user,
            blog: {
                ...blog.toObject(),
                body: contentHtml
            },
            comments: comments
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.render('error', { message: 'Error fetching blog' });
    }
});

// Add comment route
router.post('/:id/comment', checkAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const blogId = req.params.id;

        if (!content) {
            return res.redirect(`/blog/${blogId}`);
        }

        await Comment.create({
            content,
            blog: blogId,
            author: req.user._id
        });

        res.redirect(`/blog/${blogId}`);
    } catch (error) {
        console.error('Comment creation error:', error);
        res.redirect(`/blog/${req.params.id}`);
    }
});

module.exports = router;