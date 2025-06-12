const db = require('../database/connection');
const bcrypt = require('bcrypt');

module.exports = {
    async listarUsuarios(request, response) {
        try {

            const sql = `
                SELECT 
                    usu_id, usu_nome, usu_email, usu_cpf, usu_dt_nasc, usu_senha, 
                    usu_tipo, usu_ativo = 1 AS usu_ativo 
                FROM usuarios 
                WHERE usu_ativo = 1;
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
            const { nome, email, dt_nasc, senha, tipo, cpf } = request.body;
            const usu_ativo = 1;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(senha, saltRounds);

            const sql = `
                INSERT INTO usuarios 
                    (usu_nome, usu_email, usu_dt_nasc, usu_senha, usu_tipo, usu_ativo, usu_cpf) 
                VALUES 
                    (?, ?, ?, ?, ?, ?, ?);
            `;

            const values = [nome, email, dt_nasc, hashedPassword, tipo, usu_ativo, cpf];

            const [result] = await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Cadastro de usuário efetuado com sucesso!',
                dados: {
                    id: result.insertId,
                    nome,
                    email,
                    tipo
                }
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
            // parâmetros recebidos pelo corpo da requisição
            const { nome, email, dt_nasc, senha, tipo, ativo } = request.body;
            // parâmetro recebido pela URL via params ex: /usuario/1
            const { id } = request.params;
            // instruções SQL
            const sql = `
                UPDATE usuarios SET 
                    usu_nome = ?, usu_email = ?, usu_dt_nasc = ?, usu_senha = ?, usu_tipo = ?, usu_ativo = ? 
                WHERE 
                    usu_id = ?;
            `;
            // preparo do array com dados que serão atualizados
            const values = [nome, email, dt_nasc, senha, tipo, ativo, id];
            // execução e obtenção de confirmação da atualização realizada
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }

            const dados = {
                id,
                nome,
                email,
                tipo
            };

            return response.status(200).json({
                sucesso: true,
                mensagem: `Usuário ${id} atualizado com sucesso!`,
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
    async apagarUsuarios(request, response) {
        try {
            // parâmetro passado via url na chamada da api pelo front-end
            const { id } = request.params;
            // comando de exclusão
            const sql = `DELETE FROM usuarios WHERE usu_id = ?`;
            // array com parâmetros da exclusão
            const values = [id];
            // executa instrução no banco de dados
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Usuário ${id} excluído com sucesso`,
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
    async editarUsuariosAvancado(request, response) {
        try {
            const { id } = request.params;
            const updates = {};
            const values = [];

            // Verifica cada campo e o adiciona ao objeto 'updates' se existir no body
            if (request.body.nome) {
                updates.usu_nome = '?';
                values.push(request.body.nome);
            }
            if (request.body.email) {
                updates.usu_email = '?';
                values.push(request.body.email);
            }
            if (request.body.dt_nasc) {
                updates.usu_dt_nasc = '?';
                values.push(request.body.dt_nasc);
            }
            if (request.body.senha) {
                updates.usu_senha = '?';
                values.push(request.body.senha);
            }
            if (request.body.tipo) {
                updates.usu_tipo = '?';
                values.push(request.body.tipo);
            }
            if (request.body.ativo !== undefined) { // Importante verificar se 'ativo' existe
                updates.usu_ativo = '?';
                values.push(request.body.ativo);
            }

            // Se não houver campos para atualizar, retorna um erro
            if (Object.keys(updates).length === 0) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhum campo para atualizar foi fornecido.',
                    dados: null
                });
            }

            // Constrói a parte SET da query dinamicamente
            const setClauses = Object.keys(updates)
                .map(key => `${key} = ${updates[key]}`)
                .join(', ');

            const sql = `
                UPDATE usuarios SET
                    ${setClauses}
                WHERE
                    usu_id = ?;
            `;

            values.push(id); // Adiciona o ID aos valores

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }

            // Retorna os dados atualizados (apenas os que foram enviados)
            const dadosAtualizados = { id, ...request.body };

            return response.status(200).json({
                sucesso: true,
                mensagem: `Usuário ${id} atualizado com sucesso!`,
                dados: dadosAtualizados
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async ocultarUsuario(request, response) {
        try {

            const ativo = false;
            const { id } = request.params;
            const sql = `
                UPDATE usuarios SET 
                    usu_ativo = ? 
                WHERE 
                    usu_id = ?;
            `;

            const values = [ativo, id];
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Usuário ${id} excluído com sucesso`,
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
    async login(request, response) {
        try {
            const { email, senha } = request.query;

            const sql = `
                SELECT 
                    usu_id, usu_nome, usu_tipo, usu_senha 
                FROM 
                    usuarios 
                WHERE 
                    usu_email = ? AND usu_ativo = 1;
            `;

            const [rows] = await db.query(sql, [email]);

            if (rows.length === 0) {
                return response.status(403).json({
                    sucesso: false,
                    mensagem: 'Email não encontrado ou usuário inativo.',
                    dados: null,
                });
            }

            const usuario = rows[0];
            const senhaCorreta = await bcrypt.compare(senha, usuario.usu_senha);

            if (!senhaCorreta) {
                return response.status(403).json({
                    sucesso: false,
                    mensagem: 'Senha incorreta.',
                    dados: null,
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Login efetuado com sucesso',
                dados: {
                    id: usuario.usu_id,
                    nome: usuario.usu_nome,
                    tipo: usuario.usu_tipo
                }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async atualizaSenha(request, response) {
        try {
            const { senha } = request.body;
            const { id } = request.params;
    
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(senha, saltRounds);
    
            const sql = `
                UPDATE usuarios 
                SET usu_senha = ? 
                WHERE usu_id = ?;
            `;
    
            const [result] = await db.query(sql, [hashedPassword, id]);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }
    
            return response.status(200).json({
                sucesso: true,
                mensagem: `Senha do usuário ${id} atualizada com sucesso!`,
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

