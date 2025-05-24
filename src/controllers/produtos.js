const db = require('../database/connection');

module.exports = {
    async listarProdutos(request, response) {

        const { id, nome, tipo, valor, disponivel = 1, page = 1, limit = 5 } = request.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        try {
            const [[{ vlr_max }]] = await db.query('SELECT MAX(prd_valor) as vlr_max FROM produtos');
            const valorLimite = parseFloat(valor ?? vlr_max);

            const countQuery = `
                SELECT COUNT(*) AS total
                FROM produtos prd
                INNER JOIN produto_tipos pdt ON pdt.ptp_id = prd.ptp_id
                WHERE prd.prd_disponivel = ?
                    AND prd.prd_nome LIKE ?
                    AND prd.ptp_id LIKE ?
                    ${id ? 'AND prd.prd_id = ?' : ''}
                    AND prd.prd_valor <= ?
            `;

            const countValues = id
                ? [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, id, valorLimite]
                : [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, valorLimite];

            const [[{ total }]] = await db.query(countQuery, countValues);

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
                LIMIT ?, ?
            `;

            const listValues = id
                ? [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, id, valorLimite, offset, parseInt(limit)]
                : [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, valorLimite, offset, parseInt(limit)];

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

            response.setHeader('X-Total-Count', total);
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

            if (!nome || !valor || !unidade || !tipo || typeof disponivel === 'undefined') {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Campos obrigatórios estão ausentes ou inválidos.',
                });
            } // bibliotecas como Joi (sem typescript) ou Zod (typescript) podem auxiliar nas validações.            

            const destaque = imagemDestaque ? 1 : 0;
            const img_destaque = imagemDestaque ? imagemDestaque : null;

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
            const [result] = await db.query(sql, values);

            // Exibe o id do registro inserido
            const prd_id = result.insertId;
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
    async listarIngredientesDoProduto(request, response) {
        try {
            const { id } = request.params;

            const sql = `
                SELECT 	
                    p.prd_id AS id,	
                    p.prd_nome AS nome,	
                    p.prd_valor AS valor,	
                    p.prd_unidade AS unidade,	
                    p.prd_disponivel AS disponivel,	
                    p.prd_img AS imagem,		
                    p.prd_descricao AS descricao,	
                        
                    pdtp.ptp_nome AS nomeTipo, 
                    pdtp.ptp_icone AS iconeTipo, 
                    
                    
                    i.ing_id AS idIngrediente,	
                    i.ing_nome AS nomeIngrediente,     
                    i.ing_img AS imagemIngrediente,     
                    i.ing_custo_adicional AS custoAdicionalIngrediente, 	
                    
                    pi.prd_ing_adicional =  1 AS adicionalProdutoIngrediente 
                FROM 	
                    produtos p 
                JOIN 	
                    produto_ingredientes pi ON pi.prd_id = p.prd_id 
                JOIN 	
                    ingredientes i ON i.ing_id = pi.ing_id 
                JOIN 
                    produto_tipos pdtp ON pdtp.ptp_id = p.ptp_id 
                WHERE 	
                    p.prd_id = ?;
            `;

            const [rows] = await db.query(sql, [id]);

            if (rows.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Produto com id ${id} não encontrado ou sem ingredientes.`,
                    dados: null
                });
            }

            // Extrai dados do produto (só do primeiro registro, pois todos têm os mesmos valores)
            const produto = {
                id: rows[0].id,
                nome: rows[0].nome,
                valor: parseFloat(rows[0].valor).toFixed(2),
                unidade: rows[0].unidade,
                disponivel: !!rows[0].disponivel,
                img: rows[0].imagem,
                descricao: rows[0].descricao,
                tipoNome: rows[0].nomeTipo,
                tipoIcone: rows[0].iconeTipo,
                ingredientes: rows.map(row => ({
                    id: row.idIngrediente,
                    nome: row.nomeIngrediente,
                    quantidade: row.imagemIngrediente,
                    unidade: row.custoAdicionalIngrediente,
                    adicional: row.adicionalProdutoIngrediente
                }))
            };

            return response.status(200).json({
                sucesso: true,
                mensagem: `Ingredientes do produto ${produto.nome}`,
                dados: produto
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async listarPromocoes(request, response) {
        try {

            const sql= `
                SELECT prd_img_destaque AS imgDestaque FROM produtos 
                WHERE prd_destaque = 1 
                ORDER BY RAND() 
                LIMIT 3;
            `;

            const [promo] = await db.query(sql); 

            return response.status(200).json({
                sucesso: true,
                mensagem: `Produtos em promoção.`,
                dados: promo
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

