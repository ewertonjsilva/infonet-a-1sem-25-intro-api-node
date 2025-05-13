const express = require('express'); 
const router = express.Router(); 

const routes_a = require('./routes-a'); 
const routes_b = require('./routes-b'); 

router.use('/', routes_a);
router.use('/', routes_b);

module.exports = router;

