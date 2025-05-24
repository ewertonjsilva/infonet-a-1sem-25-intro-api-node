const db = require('../database/connection');

// var fse = require('fs-extra');

module.exports = {
    async listarIngredientes(request, response) {
        try {
            const { nome } = request.query;             
            
            const ing_nome = nome ? `%${nome}%` : `%`;
            const sql = `
                SELECT 
                    ing_id, ing_nome, ing_img, ing_custo_adicional 
                FROM 
                    ingredientes 
                WHERE 
                    ing_nome like ?;
            `;
            
            const values = [ing_nome];
            
            const [rows] = await db.query(sql, values);
            const nItens = rows.length; 

            const dados = rows.map(ingrediente => ({
                id: ingrediente.ing_id, 
                nome: ingrediente.ing_nome, 
                img: ingrediente.ing_img, 
                custo_adicional: ingrediente.ing_custo_adicional 
            }));

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de ingredientes.',
                nItens, 
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
    async cadastrarIngredientes(request, response) {
        try {
            const { nome, imagem, custoComoAdicional } = request.body;

            const sql = `
                INSERT INTO ingredientes 
                    (ing_nome, ing_img, ing_custo_adicional) 
                VALUES (?, ?, 0);
            `;

            const values = [nome, imagem, custoComoAdicional];

            const [result] = await db.query(sql, values);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Ingrediente adicionado com sucesso.',
                dados: { id: result.insertId }
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    }, 
    async editarIngredientes(request, response) {
        try {
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Editar ingredientes.', 
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
    async apagarIngredientes(request, response) {
        try {
            return response.status(200).json({
                sucesso: true, 
                mensagem: 'Apagar ingredientes.', 
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
    async uploadImagem(request, response) {
        try {
            const img = request.file.filename; 
            return response.status(200).json(
                {
                    sucesso: true, 
                    dados: img
                }
            )
        } catch (error) {
            
        }
    }
}