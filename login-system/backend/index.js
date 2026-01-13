/*
    Entry point of the backend server 

    - Creates and starts the express app 
    - Loads environment variables from .env
    - Configures global middleware (CORS, JSON parsing)
    - Mounts routes (authentication in this case)
    - Listens on a port for incoming HTTP requests 

    This file wires together the server, middleware, and routes, 
    but does NOT contain business logic. That lives in separate route files 
*/

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors()); // allow React frontend requests
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
