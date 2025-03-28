const express = require('express'); 
const router = express.Router(); 

const UsuariosController = require('../controllers/usuarios'); 

router.get('/usuarios', UsuariosController.listarUsuarios); 

module.exports = router;