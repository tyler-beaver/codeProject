/*
    Entry point of the backend server 

    - Creates and starts the express app 
    - Loads environment variables from .env
    - Configures global middleware (CORS, JSON parsing)
    - Mounts routes (authentication and enrichment)
    - Includes fake external APIs for enrichment
    - Listens on a port for incoming HTTP requests 
*/

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const enrichRoutes = require('./routes/enrich');

const app = express();

// Middleware
app.use(cors()); // allow frontend requests
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/enrich', enrichRoutes); 


// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
