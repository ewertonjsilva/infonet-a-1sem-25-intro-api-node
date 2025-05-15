const db = require('../database/connection');

module.exports = {
    async listarProdutos(request, response) {

        const { id, nome, idTipoProd, valor, page = 1, limit = 5 } = request.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const prd_disponivel = 1;
        
        try {

            const [[{ vlr_max }]] = await db.query('SELECT MAX(prd_valor) as vlr_max FROM produtos');
            const valorLimite = parseFloat(valor ?? vlr_max + 1);
            
            // contagem total produtos disponíveis
            const countQuery = `
                SELECT 
                    COUNT(*) AS total 
                FROM 
                    produtos prd 
                WHERE 
                    prd.prd_disponivel = ? 
                    AND prd.prd_nome LIKE ? 
                    AND prd.ptp_id LIKE ? 
                    AND prd.prd_valor < ? 
                    ${id ? 'AND prd.prd_id = ?' : ''};
            `;

            const countValues = [prd_disponivel, `%${nome ?? ''}%`, `%${idTipoProd ?? ''}%`, valorLimite, id];
              
            const [[{ total }]] = await db.query(countQuery, countValues);

            // Listagem itens
            const listQuery = `
                SELECT 
                    prd.prd_id, prd.prd_nome, prd.prd_valor, prd.prd_unidade, pdt.ptp_icone, 
                    prd.prd_img, prd.prd_descricao 
                FROM produtos prd 
                INNER JOIN 
                    produto_tipos pdt ON pdt.ptp_id = prd.ptp_id 
                WHERE 
                    prd.prd_disponivel = ? 
                    AND prd.prd_nome LIKE ? 
                    AND prd.ptp_id LIKE ?  
                    ${id ? 'AND prd.prd_id = ?' : ''}
                    AND prd.prd_valor < ? 
                LIMIT ?, ?;
            `;
                        
            const listValues = id
                ? [prd_disponivel, `%${nome ?? ''}%`, `%${idTipoProd ?? ''}%`, id, valorLimite, offset, parseInt(limit)]
                : [prd_disponivel, `%${nome ?? ''}%`, `%${idTipoProd ?? ''}%`, valorLimite, offset, parseInt(limit)];
    
            const [produtos] = await db.query(listQuery, listValues); 

            const dados = produtos.map( produto => ({
                id: produto.prd_id,
                nome: produto.prd_nome,
                valor: parseFloat(produto.prd_valor).toFixed(2),
                unidade: produto.prd_unidade,
                icone: produto.ptp_icone,
                img: produto.prd_img,
                descricao: produto.prd_descricao
            }));

            // total de produtos no cabeçalho
            response.setHeader('X-Total-Count', total);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de produtos.',
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