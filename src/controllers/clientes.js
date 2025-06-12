const db = require('../database/connection');
const moment = require('moment'); 

const {
    validarCPF,
    validarEmail,
    validarTelefone,
    validarDataNascimento
} = require('../utils/validators');

function cpfToInt(cpf) {
    const cpfSemMascara = cpf.replace(/\D/g, '');
    const cpfInteiro = parseInt(cpfSemMascara);
    return cpfInteiro;
};

module.exports = {
    async listarClientes(request, response) {
        try {
            const { usu_nome, usu_cpf, cli_cel } = request.body;

            const pesqNome = usu_nome ? `%${usu_nome}%` : `%%`;
            const usu_ativo = 1;
            const end_principal = 1;
            const campo = cli_cel ? 'cl.cli_cel = ' : usu_cpf ? 'us.usu_cpf = ' : 'us.usu_nome LIKE ';
            const campoPesq = cli_cel ? cli_cel : usu_cpf ? usu_cpf : pesqNome;

            const sql = `
                SELECT 
                    us.usu_nome, us.usu_dt_nasc, cl.cli_cel, cl.cli_pts, cid.cid_nome 
                FROM 
                    clientes cl
                INNER JOIN usuarios us ON us.usu_id = cl.usu_id 
                INNER JOIN endereco_clientes edcl ON edcl.usu_id = cl.usu_id 
                INNER JOIN cidades cid ON cid.cid_id = edcl.cid_id 
                WHERE 
                    us.usu_ativo = ? AND edcl.end_principal = ? AND ${campo} ?;
            `;

            const values = [usu_ativo, end_principal, campoPesq];

            const [rows] = await db.query(sql, values);

            const nItens = rows.length;

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de Clientes.',
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
    async cadastrarClientes(request, response) {
        try {
            const {
                usu_nome,
                usu_email,
                usu_senha,
                usu_dt_nasc,
                usu_cpf,
                end_logradouro,
                end_num,
                end_bairro,
                end_complemento,
                cid_id,
                cli_cel
            } = request.body;

            // Verifica campos obrigatórios
            if (
                !usu_nome || !usu_email || !usu_senha || !usu_dt_nasc ||
                !usu_cpf || !end_logradouro || !end_num || !end_bairro ||
                !cid_id || !cli_cel
            ) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Todos os campos obrigatórios devem ser preenchidos.',
                    dados: null
                });
            }

            // Validação de e-mail
            if (!validarEmail(usu_email)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'E-mail inválido.',
                    dados: null
                });
            }

            // Validação de CPF
            if (!validarCPF(usu_cpf)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'CPF inválido.',
                    dados: null
                });
            }

            // Validação de data de nascimento (formato básico yyyy-mm-dd)
            const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dataRegex.test(usu_dt_nasc)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Data de nascimento inválida. Use o formato YYYY-MM-DD.',
                    dados: null
                });
            }

            if (!validarDataNascimento(usu_dt_nasc)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'A data de nascimento não pode ser hoje!',
                    dados: null
                });
            }

            // Remove máscara do telefone e valida
            if (!validarTelefone(cli_cel)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Telefone inválido.',
                    dados: null
                });
            }

            // Verifica se o e-mail já existe
            const [emailExiste] = await db.query(`SELECT usu_id FROM usuarios WHERE usu_email = ?`, [usu_email]);
            if (emailExiste.length > 0) {
                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'E-mail já cadastrado.',
                    dados: null
                });
            }

            // Verifica se o CPF já existe
            const [cpfExiste] = await db.query(`SELECT usu_id FROM usuarios WHERE usu_cpf = ?`, [cpf]);
            if (cpfExiste.length > 0) {
                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'CPF já cadastrado.',
                    dados: null
                });
            }

            const usu_tipo = 2;
            const usu_ativo = 1;
            const cli_pts = 0;
            const end_principal = true;
            const end_excluido = false;

            // Inserir usuário
            const sqlUsu = `
                INSERT INTO usuarios 
                    (usu_nome, usu_email, usu_senha, usu_dt_nasc, usu_cpf, usu_tipo, usu_ativo) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const [usuarios] = await db.query(sqlUsu, [usu_nome, usu_email, usu_senha, usu_dt_nasc, cpf, usu_tipo, usu_ativo]);
            const usu_id = usuarios.insertId;

            // Inserir cliente
            const sqlCli = `
                INSERT INTO clientes (usu_id, cli_cel, cli_pts) 
                VALUES (?, ?, ?)
            `;
            await db.query(sqlCli, [usu_id, telefoneSemMascara, cli_pts]);

            // Inserir endereço
            const sqlEnd = `
                INSERT INTO endereco_clientes 
                    (usu_id, end_logradouro, end_num, end_bairro, end_complemento, cid_id, end_principal, end_excluido) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await db.query(sqlEnd, [usu_id, end_logradouro, end_num, end_bairro, end_complemento, cid_id, end_principal, end_excluido]);

            return response.status(201).json({
                sucesso: true,
                mensagem: `Cadastro do cliente ${usu_id} realizado com sucesso!`,
                dados: { usu_id }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao cadastrar cliente.',
                dados: error.message
            });
        }
    },
    async editarClientes(request, response) {
        try {

            const { cli_cel, cli_pts } = request.body;
            const { usu_id } = request.params;

            const sql = `UPDATE clientes SET cli_cel = ?, cli_pts = ? WHERE usu_id = ?;`;

            const values = [cli_cel, cli_pts, usu_id];

            const [result] = await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Atualizado de dados do cliente realizada com sucesso!',
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
}

