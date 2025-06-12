const express = require('express'); 
const router = express.Router(); 

const UsuariosController = require('../controllers/usuarios'); 
const ClientesController = require('../controllers/clientes');
const CidadesController = require('../controllers/cidades'); 
const ClienteEnderecosController = require('../controllers/clienteEnderecos');

router.get('/usuarios', UsuariosController.listarUsuarios); 
router.post('/usuarios', UsuariosController.cadastrarUsuarios); 
router.patch('/usuarios/:id', UsuariosController.editarUsuarios); // params
router.patch('/usuarios/atualiza-senha/:id', UsuariosController.atualizaSenha); // params
router.delete('/usuarios/:id', UsuariosController.apagarUsuarios); // params
router.delete('/usuarios/del/:id', UsuariosController.ocultarUsuario); // params 
router.get('/login', UsuariosController.login); // query

router.post('/clientes', ClientesController.cadastrarClientes); 

router.get('/cliente-enderecos', ClienteEnderecosController.listarClienteEnderecos); 
router.get('/cliente-enderecos-adm', ClienteEnderecosController.listarClienteEnderecosAdm); 
router.post('/cliente-enderecos', ClienteEnderecosController.cadastrarClienteEnderecos); 

router.get('/cidades/listar-cidades', CidadesController.listarCidades);
router.get('/cidades/listar-ufs', CidadesController.listarUfs); 

module.exports = router;