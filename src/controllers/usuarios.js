const db = require('../database/connection');

module.exports = {
    async listarUsuarios(request, response) {
        try {

            const sql = `
                SELECT 
                    usu_id, usu_nome, usu_email, usu_cpf, usu_dt_nasc, usu_senha, 
                    usu_tipo, usu_ativo = 1 AS usu_ativo 
                FROM usuarios;
            `;

            const [rows] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de usuários',
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
    async cadastrarUsuarios(request, response) {
        try {

            const { usu_nome, usu_email, usu_dt_nasc, usu_senha, usu_tipo, usu_cpf } = request.body;
            const usu_ativo = 1;

            // instrução SQL
            const sql = `
                INSERT INTO usuarios 
                    (usu_nome, usu_email, usu_dt_nasc, usu_senha, usu_tipo, usu_ativo, usu_cpf) 
                VALUES 
                    (?, ?, ?, ?, ?, ?, ?);
            `;

            // definição dos dados a serem inseridos em um array
            const values = [usu_nome, usu_email, usu_dt_nasc, usu_senha, usu_tipo, usu_ativo, usu_cpf];

            // execução da instrução sql passando os parâmetros
            const [result] = await db.query(sql, values);

            // identificação do ID do registro inserido
            const usu_id = result.insertId;

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Cadastro de usuários',
                dados: usu_id
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async editarUsuarios(request, response) {
        try {
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Alteração no cadastro de usuário',
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
    async apagarUsuarios(request, response) {
        try {
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Exclusão de usuário',
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

