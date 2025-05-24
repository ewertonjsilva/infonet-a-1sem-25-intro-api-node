const express = require('express'); 
const router = express.Router(); 

const usuarios = require('./usuarios'); 
const produtos = require('./produtos'); 

router.use('/', usuarios);
router.use('/', produtos);

module.exports = router;

