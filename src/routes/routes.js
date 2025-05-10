const express = require('express'); 
const router = express.Router(); 

const UsuariosController = require('../controllers/usuarios'); 
const ProdutosController = require('../controllers/produtos'); 
const IngredientesController = require('../controllers/ingredientes'); 
const CidadesController = require('../controllers/cidades');

router.get('/usuarios', UsuariosController.listarUsuarios); 
router.post('/usuarios', UsuariosController.cadastrarUsuarios); 
router.patch('/usuarios/:id', UsuariosController.editarUsuarios); // params
router.delete('/usuarios/:id', UsuariosController.apagarUsuarios); // params
router.delete('/usuarios/del/:id', UsuariosController.ocultarUsuario); // params

router.get('/produtos', ProdutosController.listarProdutos); 
router.post('/produtos', ProdutosController.cadastrarProdutos); 
router.patch('/produtos', ProdutosController.editarProdutos); 
router.delete('/produtos', ProdutosController.apagarProdutos); 

router.get('/ingredientes', IngredientesController.listarIngredientes); 
router.post('/ingredientes', IngredientesController.cadastrarIngredientes); 
router.patch('/ingredientes', IngredientesController.editarIngredientes); 
router.delete('/ingredientes', IngredientesController.apagarIngredientes); 

router.post('/cidades/listar-cidades', CidadesController.listarCidades);
router.get('/cidades/listar-ufs', CidadesController.listarUfs);

module.exports = router;

