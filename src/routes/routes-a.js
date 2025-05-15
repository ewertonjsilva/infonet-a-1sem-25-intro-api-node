const express = require('express'); 
const router = express.Router(); 

const UsuariosController = require('../controllers/usuarios'); 
const ProdutosController = require('../controllers/produtos');

router.get('/usuarios', UsuariosController.listarUsuarios); 
router.post('/usuarios', UsuariosController.cadastrarUsuarios); 
router.patch('/usuarios/:id', UsuariosController.editarUsuarios); // params
router.delete('/usuarios/:id', UsuariosController.apagarUsuarios); // params
router.delete('/usuarios/del/:id', UsuariosController.ocultarUsuario); // params 
router.get('/login', UsuariosController.login); // query

router.get('/produtos', ProdutosController.listarProdutos); 
router.post('/produtos', ProdutosController.cadastrarProdutos); 
router.patch('/produtos', ProdutosController.editarProdutos); 
router.delete('/produtos', ProdutosController.apagarProdutos); 

module.exports = router;