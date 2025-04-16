
# Blog Application

A full-featured blog application built with Node.js, Express, and MongoDB.

## Features

- User authentication (signup/login)
- Blog post creation with Markdown support
- Image upload for blog covers
- Comment system
- Responsive design
- Authentication using JWT
- Protected routes

## Tech Stack

### Core Dependencies
- **Express.js** (v4.21.1) - Web application framework
- **MongoDB** (v6.15.0) - Database
- **Mongoose** (v8.13.1) - MongoDB ODM
- **EJS** (v3.1.10) - Template engine

### Authentication & Security
- **bcrypt** (v5.1.1) - Password hashing
- **bcryptjs** (v3.0.2) - Password hashing (JavaScript implementation)
- **jsonwebtoken** (v9.0.2) - JWT implementation
- **cookie-parser** (v1.4.7) - Cookie parsing middleware

### File Upload & Content
- **multer** (v1.4.5-lts.1) - File upload handling
- **marked** (v15.0.0) - Markdown parsing
- **dotenv** (v16.4.7) - Environment variable management

### Development Dependencies
- **nodemon** (v3.1.7) - Development server with auto-reload

## Project Structure

```
├── models/           # Database models
├── routes/           # Route handlers
├── services/         # Business logic
├── public/          
│   ├── images/      # Static images
│   └── uploads/     # Uploaded files
├── views/           # EJS templates
└── index.js         # Application entry point
```

## API Routes

### Authentication
- `POST /signup` - Create new user account
- `POST /login` - User login
- `GET /logout` - User logout

### Blog
- `GET /blog/create-blog` - Get blog creation page
- `POST /blog/create-blog` - Create new blog post
- `GET /blog/:id` - View specific blog post
- `POST /blog/:id/comment` - Add comment to blog

## Environment Variables

The application uses the following environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing

## Running the Application

To Clone the application:
```bash
git clone https://github.com/Musaveershaik/Blogging-WebSite.git
```
Then,
```bash
cd Blogging-WebSite
```
Install Packages
```bash
npm init
```

To run the application in development mode:
```bash
npm run dev
```

For production:
```bash
npm start
```
