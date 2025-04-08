const db = require('../database/connection'); 

module.exports = {
    async listarProdutos(request, response) {
        try {

            const sql = 'SELECT prd_id, prd_nome, prd_valor, prd_unidade, ptp_id, prd_disponivel = 1 AS prd_disponivel, prd_img, prd_destaque = 1 AS prd_destaque, prd_img_destaque, prd_descricao FROM produtos;'; 

            const produtos = await db.query(sql);

            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Lista de produtos', 
                dados: produtos[0], 
                itens: produtos[0].length
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false, 
                mensagem: 'Erro na requisição.', 
                dados: error.message
            });
        }
    }, 
    async cadastrarProdutos(request, response) {
        try {
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Cadastro de produtos', 
                dados: null
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false, 
                mensagem: 'Erro na requisição.', 
                dados: error.message
            });
        }
    }, 
    async editarProdutos(request, response) {
        try {
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Alteração no cadastro de produto', 
                dados: null
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false, 
                mensagem: 'Erro na requisição.', 
                dados: error.message
            });
        }
    }, 
    async apagarProdutos(request, response) {
        try {
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Exclusão de produto', 
                dados: null
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false, 
                mensagem: 'Erro na requisição.', 
                dados: error.message
            });
        }
    }, 
};  