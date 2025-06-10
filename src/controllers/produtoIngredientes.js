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

            // Verificar se o produto existe
            const sqlProduto = `SELECT prd_id FROM produtos WHERE prd_id = ?`;
            const [produtoResult] = await db.query(sqlProduto, [produto]);

            if (produtoResult.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Produto não encontrado.',
                    dados: null
                });
            }

            // Verificar se o ingrediente existe
            const sqlIngrediente = `SELECT ing_id FROM ingredientes WHERE ing_id = ?`;
            const [ingredienteResult] = await db.query(sqlIngrediente, [ingrediente]);

            if (ingredienteResult.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Ingrediente não encontrado.',
                    dados: null
                });
            }

            // Verificar se o registro já existe
            const sqlCheck = `
                SELECT * FROM produto_ingredientes 
                WHERE prd_id = ? AND ing_id = ?
            `;
            const valuesCheck = [produto, ingrediente];
            const [check] = await db.query(sqlCheck, valuesCheck);

            if (check.length > 0) {
                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'Este ingrediente já está relacionado a este produto.',
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
            const { idProd, idIng } = request.params;
            const { adicional } = request.body;
    
            // Validação dos parâmetros
            if (!idProd || !idIng) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Produto e Ingrediente são obrigatórios nos parâmetros.',
                    dados: null
                });
            }
    
            // Verificar se o vínculo existe
            const [vinculo] = await db.query(
                `SELECT prd_id AS idProduto, ing_id AS idIngrediente, prd_ing_adicional = 1 AS adicional FROM produto_ingredientes WHERE prd_id = ? AND ing_id = ?`,
                [idProd, idIng]
            );
    
            if (vinculo.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Vínculo entre produto e ingrediente não encontrado.',
                    dados: null
                });
            }
    
            // Validar e preparar campos para atualizar
            if (adicional !== undefined) {
                if (![0, 1].includes(adicional)) {
                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'O campo adicional deve ser 0 (não é adicional) ou 1 (é adicional).',
                        dados: null
                    });
                }
            }
    
            const sql = `UPDATE produto_ingredientes SET prd_ing_adicional = ? WHERE prd_id = ? AND ing_id = ?`;
            const values = [adicional, idProd, idIng];
    
            await db.query(sql, values);
    
            // Buscar dados atualizados
            const [vinculoAtualizado] = await db.query(
                `SELECT prd_id AS idProduto, ing_id AS idIngrediente, prd_ing_adicional = 1 AS adicional FROM produto_ingredientes WHERE prd_id = ? AND ing_id = ?`,
                [idProd, idIng]
            );

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Vínculo atualizado com sucesso.',
                dados: {
                    antigo: vinculo[0],
                    atualizado: vinculoAtualizado[0]
                }
            });
    
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar vínculo.',
                dados: error.message
            });
        }
    },    
    async apagarProdutoIngredientes(request, response) {
        try {
            const { produto, ingrediente } = request.body;
    
            if (!produto || !ingrediente) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Campos obrigatórios: produto e ingrediente.',
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
    
            // Verificar se há vínculo para excluir
            const [vinculo] = await db.query(
                `SELECT * FROM produto_ingredientes WHERE prd_id = ? AND ing_id = ?`,
                [produto, ingrediente]
            );
    
            if (vinculo.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Vínculo não encontrado.',
                    dados: null
                });
            }
    
            // Executar exclusão
            await db.query(
                `DELETE FROM produto_ingredientes WHERE prd_id = ? AND ing_id = ?`,
                [produto, ingrediente]
            );
    
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Vínculo removido com sucesso.',
                dados: vinculo[0] // retorna o que foi deletado como confirmação
            });
    
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir vínculo.',
                dados: error.message
            });
        }
    },
}

