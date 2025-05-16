const express = require('express'); 
const router = express.Router(); 

const IngredientesController = require('../controllers/ingredientes'); 
const CidadesController = require('../controllers/cidades');

router.get('/ingredientes', IngredientesController.listarIngredientes); 
router.post('/ingredientes', IngredientesController.cadastrarIngredientes); 
router.patch('/ingredientes', IngredientesController.editarIngredientes); 
router.delete('/ingredientes', IngredientesController.apagarIngredientes); 

router.get('/cidades/listar-cidades', CidadesController.listarCidades);
router.get('/cidades/listar-ufs', CidadesController.listarUfs);

module.exports = router;