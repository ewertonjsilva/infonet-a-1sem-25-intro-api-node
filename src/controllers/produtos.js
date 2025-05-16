const db = require('../database/connection');

module.exports = {
    async listarProdutos(request, response) {

        const { id, nome, tipo, valor, disponivel = 1 } = request.query;

        try {
            const [[{ vlr_max }]] = await db.query('SELECT MAX(prd_valor) as vlr_max FROM produtos');
            const valorLimite = parseFloat(valor ?? vlr_max);

            const listQuery = `
                SELECT prd.prd_id, prd.prd_nome, prd.prd_valor, prd.prd_unidade,
                        pdt.ptp_icone, prd.prd_img, prd.prd_descricao
                FROM produtos prd
                INNER JOIN produto_tipos pdt ON pdt.ptp_id = prd.ptp_id
                WHERE prd.prd_disponivel = ?
                    AND prd.prd_nome LIKE ?
                    AND prd.ptp_id LIKE ?
                    ${id ? 'AND prd.prd_id = ?' : ''}
                    AND prd.prd_valor <= ?
            `;

            const listValues = id
                ? [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, id, valorLimite]
                : [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, valorLimite];

            const [produtos] = await db.query(listQuery, listValues);

            const dados = produtos.map(produto => ({
                id: produto.prd_id,
                nome: produto.prd_nome,
                valor: produto.prd_valor,
                unidade: produto.prd_unidade,
                icone: produto.ptp_icone,
                imgProduto: produto.prd_img,
                descricao: produto.prd_descricao
            }));

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de produtos',
                nItens: dados.length,
                dados
            });

        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao listar produtos.',
                dados: error.message
            });
        }
    },
    async cadastrarProdutos(request, response) {
        try {

            const { nome, valor, unidade, tipo, disponivel, descricao, img, imagemDestaque } = request.body;
            const destaque = imagemDestaque ? 1 : 0;
            const img_destaque = imagemDestaque ? imagemDestaque : null;

            if (!nome || !valor || !unidade || !tipo || typeof disponivel === 'undefined') {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Campos obrigatórios estão ausentes ou inválidos.',
                });
            }
            // bibliotecas como Joi (sem typescript) ou Zod (typescript) podem auxiliar nas validações.

            // instrução sql para inserção
            const sql = `
                INSERT INTO produtos 
                    (prd_nome, prd_valor, prd_unidade, ptp_id, prd_disponivel, prd_img, prd_destaque, prd_img_destaque, prd_descricao) 
                VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;

            // definição de array com os parâmetros que receberam os valores do front-end
            const values = [nome, valor, unidade, tipo, disponivel, img, destaque, img_destaque, descricao];

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