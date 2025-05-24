const express = require('express'); 
const router = express.Router(); 

const ProdutosController = require('../controllers/produtos');
const IngredientesController = require('../controllers/ingredientes'); 
const ProdutoIngredientesController = require('../controllers/produtoIngredientes');

router.get('/produtos', ProdutosController.listarProdutos); 
router.post('/produtos', ProdutosController.cadastrarProdutos); 
router.patch('/produtos', ProdutosController.editarProdutos); 
router.delete('/produtos', ProdutosController.apagarProdutos); 
router.get('/produtos/promocao', ProdutosController.listarPromocoes); 
router.get('/produtos/:id', ProdutosController.listarIngredientesDoProduto);

router.get('/ingredientes', IngredientesController.listarIngredientes); 
router.post('/ingredientes', IngredientesController.cadastrarIngredientes); 
router.patch('/ingredientes', IngredientesController.editarIngredientes); 
router.delete('/ingredientes', IngredientesController.apagarIngredientes); 

router.get('/produto-ingredientes', ProdutoIngredientesController.listarProdutoIngredientes);
router.post('/produto-ingredientes', ProdutoIngredientesController.cadastrarProdutoIngredientes);
router.patch('/produto-ingredientes/:prd_id/:ing_id', ProdutoIngredientesController.editarProdutoIngredientes);
router.delete('/produto-ingredientes/:prd_id/:ing_id', ProdutoIngredientesController.apagarProdutoIngredientes);

module.exports = router;