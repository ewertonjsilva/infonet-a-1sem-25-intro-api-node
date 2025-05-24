const db = require('../database/connection');

module.exports = {
    async listarProdutoIngredientes(request, response) {
        try {
            const { produto, adicional } = request.query;

            const sql = `
                SELECT 
                    ing.ing_id,
                    ing.ing_nome, 
                    ing.ing_img, 
                    ing.ing_custo_adicional 
                FROM 
                    produto_ingredientes pi 
                INNER JOIN 
                    ingredientes ing ON ing.ing_id = pi.ing_id 
                WHERE 
                    pi.prd_id = ? AND pi.prd_ing_adicional = ?;
            `;

            const values = [produto, adicional];

            const [prdIng] = await db.query(sql, values);
            const nItens = prdIng.length;

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de Ingredientes do produto.',
                dados: prdIng,
                nItens
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async cadastrarProdutoIngredientes(request, response) {
        try {
            const { produto, ingrediente, adicional } = request.body;

            // Validação manual dos dados
            if (!produto || !ingrediente || adicional === undefined) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Campos obrigatórios: produto, ingrediente e adicional.',
                    dados: null
                });
            }

            if (isNaN(produto) || isNaN(ingrediente)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Os campos produto e ingrediente devem ser números.',
                    dados: null
                });
            }

            if (adicional !== 0 && adicional !== 1) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'O campo adicional deve ser 0 (não é adicional) ou 1 (é adicional).',
                    dados: null
                });
            }

            // Verificar se o registro já existe
            const sqlCheck = `
                SELECT * FROM produto_ingredientes 
                WHERE prd_id = ? AND ing_id = ? AND prd_ing_adicional = ?
            `;
            const valuesCheck = [produto, ingrediente, adicional];
            const [check] = await db.query(sqlCheck, valuesCheck);

            if (check.length > 0) {
                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'Este ingrediente já está cadastrado para este produto com este status de adicional.',
                    dados: null
                });
            }

            // Inserir registro
            const sql = `
                INSERT INTO produto_ingredientes 
                    (prd_id, ing_id, prd_ing_adicional) 
                VALUES (?, ?, ?);
            `;
            const values = [produto, ingrediente, adicional];

            await db.query(sql, values);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Ingrediente adicionado ao produto com sucesso.',
                dados: { produto, ingrediente, adicional }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar ingrediente no produto.',
                dados: error.message
            });
        }
    },     
    async editarProdutoIngredientes(request, response) {
        try {
            const { prd_id, ing_id } = request.params;
            const { prd_ing_adicional, quantidade, unidade, observacao } = request.body;

            const sql = `
                UPDATE produto_ingredientes
                SET prd_ing_adicional = ?, quantidade = ?, unidade = ?, observacao = ?
                WHERE prd_id = ? AND ing_id = ?;
            `;

            const values = [prd_ing_adicional, quantidade, unidade, observacao, prd_id, ing_id];

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Relação produto/ingrediente não encontrada.',
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Ingrediente do produto atualizado com sucesso.',
                dados: null
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao editar ingrediente do produto.',
                dados: error.message
            });
        }
    },
    async apagarProdutoIngredientes(request, response) {
        try {
            const { prd_id, ing_id } = request.params;

            const sql = `
                DELETE FROM produto_ingredientes
                WHERE prd_id = ? AND ing_id = ?;
            `;

            const values = [prd_id, ing_id];

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Relação produto/ingrediente não encontrada.',
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Ingrediente removido do produto com sucesso.',
                dados: null
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir ingrediente do produto.',
                dados: error.message
            });
        }
    },
}

