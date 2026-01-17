const express = require("express"); 
const router = express.Router(); 
const axios = require("axios");
const { supabase } = require("../db"); 


router.get("/enriched-users", (req, res) => {
    res.json({ message: "Enrich route is working!"}); 
});

module.exports = router; 