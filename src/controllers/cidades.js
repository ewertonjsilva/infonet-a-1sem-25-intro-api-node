const db = require('../database/connection');

module.exports = {
    async listarCidades(request, response) {
        try {
            const { uf, cidade } = request.body;
            const cid_nome = cidade ? `${cidade}%` : `%%`;
            const sql = `
                SELECT 
                    cid_id, cid_nome, cid_uf 
                FROM 
                    cidades 
                WHERE 
                    cid_uf = ? AND cid_nome like ?;
            `;

            const values = [uf, cid_nome];
            const [rows] = await db.query(sql, values);
            const nItens = rows.length;
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de cidades.',
                dados: rows,
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
    async listarUfs(request, response) {
        try {
            const sql = `
                SELECT DISTINCT 
                    cid_uf 
                FROM 
                    cidades 
                ORDER BY 
                    cid_uf ASC;
            `;

            const [rows] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de estados.',
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
}