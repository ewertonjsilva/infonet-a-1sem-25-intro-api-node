const db = require('../database/connection');

module.exports = {
    async listarProdutos(request, response) {
        try {

            const sql = `
                SELECT 
                    prd_id, prd_nome, prd_valor, prd_unidade, ptp_id, prd_disponivel = 1 AS prd_disponivel, 
                    prd_img, prd_destaque = 1 AS prd_destaque, prd_img_destaque, prd_descricao 
                FROM produtos;
            `;

            const [rows] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de produtos',
                itens: rows.length,
                dados: rows
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

            const { nome, valor, unidade, tipo, disponivel, descricao, img } = request.body;
            const destaque = 0;
            const img_destaque = null;

            // instrução sql para inserção
            const sql = `
                INSERT INTO produtos 
                    (prd_nome, prd_valor, prd_unidade, ptp_id, prd_disponivel, prd_img, prd_destaque, prd_img_destaque, prd_descricao) 
                VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;

            // definição de array com os parâmetros que receberam os valores do front-end
            const values = [nome, parseFloat(valor), unidade, parseInt(tipo), parseInt(disponivel), img, destaque, img_destaque, descricao];

            // executa a instrução de inserção no banco de dados       
            const confirmacao = await db.query(sql, values);
            // Exibe o id do registro inserido
            const prd_id = confirmacao[0].insertId;
            // Mensagem de retorno no formato JSON
            const dados = {
                id: prd_id,
                nome,
                valor: parseFloat(valor).toFixed(2),
                unidade,
                tipo,
                disponivel,
                img
            };

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Produto cadastrado com sucesso!',
                dados
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