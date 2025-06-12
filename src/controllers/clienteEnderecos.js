const db = require('../database/connection');

module.exports = {
    async listarClienteEnderecos(request, response) {
        try {

            const sql = `
                SELECT 
                    CONCAT(cliend.end_logradouro, ' ', IFNULL(cliend.end_complemento, ''), ', ' , 
                        cliend.end_num, ' - ', cliend.end_bairro) AS endereco,   
                    CONCAT(cid.cid_nome, ' - ', cid.cid_uf) AS cidade, end_principal = 1 AS principal
                FROM 
                    cliente_enderecos cliend 
                INNER JOIN 
                    cidades cid ON cid.cid_id = cliend.cid_id 
                WHERE 
                    cliend.end_excluido = false;
            `;

            const [rows] = await db.query(sql);
            const nItens = rows.length;

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de endereço do cliente.',
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
    async cadastrarClienteEnderecos(request, response) {
        try {

            const { idUsuario, logradouro, num, bairro, complemento, idCidade, principal } = request.body;
            const end_excluido = false; 
            let end_principal = principal;

            // 1. Verificar se já existem endereços para este usuário
            const sqlChecarEndereco = `SELECT COUNT(*) AS total_enderecos FROM cliente_enderecos WHERE usu_id = ? AND end_excluido = false;`;
            const [resultCheck] = await db.query(sqlChecarEndereco, [idUsuario]);
            const totalEnderecos = resultCheck[0].total_enderecos;

            // 2. Se não houver endereços, defina o novo como principal
            if (totalEnderecos === 0) {
                end_principal = true;
            } else {
                // Se já houver endereços e o que está sendo cadastrado for definido como principal
                if (end_principal === true) {
                    const sqlUpdateEnd = `UPDATE cliente_enderecos SET end_principal = 0 WHERE usu_id = ?;`;
                    await db.query(sqlUpdateEnd, [idUsuario]);
                }
            }

            const sql = `
                INSERT INTO cliente_enderecos 
                    (usu_id, end_logradouro, end_num, end_bairro, end_complemento, cid_id, end_principal, end_excluido) 
                VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?);
            `;

            const values = [idUsuario, logradouro, num, bairro, complemento, idCidade, principal, end_excluido];

            const [result] = await db.query(sql, values);

            const end_id = result.insertId;

            return response.status(200).json({
                sucesso: true,
                mensagem: `Cadastro de endereço do cliente ${idUsuario} realizado com sucesso.`,
                dados: { end_id }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async editarClienteEnderecos(request, response) {
        try {

            const { end_logradouro, end_num, end_bairro, end_complemento, cid_id, end_principal } = request.body;
            const { end_id } = request.params;

            const sql = `
                UPDATE endereco_clientes SET 
                    end_logradouro = ?, end_num = ?, end_bairro = ?, end_complemento = ?, cid_id = ?, end_principal = ? 
                WHERE 
                    end_id = ?;
            `;

            const values = [end_logradouro, end_num, end_bairro, end_complemento, cid_id, end_principal, end_id];

            const [result] = await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Endereço atualizado com sucesso!',
                dados: result.affectedRows
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async apagarClienteEnderecos(request, response) {
        try {

            const { end_id } = request.params;
            const end_excluido = true;

            const sql = `UPDATE endereco_clientes SET end_excluido = ? WHERE end_id = ?;`;

            const values = [end_excluido, end_id];

            await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Endereço excluído com sucesso.',
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
    async listarClienteEnderecosAdm(request, response) {
        try {

            const sql = `
                SELECT 
                    end_id AS id, usu_id AS idUsuarios, end_logradouro AS logradouro, end_num AS numero, 
                    end_bairro AS bairro, end_complemento AS complemento, cid_id AS idCidade, end_principal = 1 AS principal, 
                    end_excluido = 1 AS excluido   
                FROM 
                    cliente_enderecos;
            `; // depois filtrar no header

            const [rows] = await db.query(sql);
            const nItens = rows.length;

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de endereço do cliente.',
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
}

