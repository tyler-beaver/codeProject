/*
    Entry point of the backend server 

    - creates and starts the express app 
    - loads environment variables from .env
    - configures global middleware (CORS, JSON parsing)
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
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ${PORT}'));