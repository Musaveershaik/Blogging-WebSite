const path = require("path");
const bcrypt = require("bcryptjs");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { validateToken } = require("./services/authentication");
const Blog = require("./models/blog");
const User = require("./models/user");
const userRoutes = require("./routes/user");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = 3000;

// ✅ Use the fixed MongoDB URI
const mongoURI = "mongodb+srv://musaveershaikh43:Mohammad%40143@cluster0.1onuz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// ✅ Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
  })
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Authentication middleware
const checkAuth = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/login");
    }

    const userData = validateToken(token);
    if (!userData) {
        res.clearCookie("token");
        return res.redirect("/login");
    }

    try {
        const user = await User.findById(userData.userId);
        if (!user) {
            res.clearCookie("token");
            return res.redirect("/login");
        }

        res.locals.user = user;
        res.locals.userId = user._id;
        res.locals.userRole = user.role;
        req.user = user;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.clearCookie("token");
        return res.redirect("/login");
    }
};

// Clear any existing session cookies
app.use((req, res, next) => {
    res.clearCookie("connect.sid");
    next();
});

// Routes
app.use(userRoutes);

// Mount blog routes with base path
const blogRoutes = require("./routes/blog");
app.use("/blog", blogRoutes);

// Protected route
app.get("/", checkAuth, async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .populate("author", "fullname profileImage")
            .sort({ createdAt: -1 });

        res.render("home", {
            user: req.user,
            blogs: blogs,
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.render("home", {
            user: req.user,
            blogs: [],
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
