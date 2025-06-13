const db = require('../database/connection');

const {
    validarCPF,
    validarEmail,
    validarTelefone,
    validarDataNascimento
} = require('../utils/validacoesUsuarios');

function cpfToInt(cpf) {
    const cpfSemMascara = cpf.replace(/\D/g, '');
    const cpfInteiro = parseInt(cpfSemMascara);
    return cpfInteiro;
};

module.exports = {
    async listarClientes(request, response) {
        try {
            const { usu_nome, usu_cpf, cli_cel } = request.query;

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
                INNER JOIN cliente_enderecos edcl ON edcl.usu_id = cl.usu_id 
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
                nome,
                email,
                senha,
                dataNasc,
                cpf,
                logradouro,
                num,
                bairro,
                complemento,
                idCidade,
                cel
            } = request.body;

            // Verifica campos obrigatórios
            if (
                !nome || !email || !senha || !dataNasc || !cpf ||
                !logradouro || !num || !bairro || !idCidade || !cel
            ) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Todos os campos obrigatórios devem ser preenchidos.',
                    dados: null
                });
            }

            // Validação de e-mail
            if (!validarEmail(email)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'E-mail inválido.',
                    dados: null
                });
            }

            // Validação de CPF
            if (!validarCPF(cpf)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'CPF inválido.',
                    dados: null
                });
            }

            const usu_cpf = cpfToInt(cpf);

            // Validação de data de nascimento (formato básico yyyy-mm-dd)
            const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dataRegex.test(dataNasc)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Data de nascimento inválida. Use o formato YYYY-MM-DD.',
                    dados: null
                });
            }

            if (!validarDataNascimento(dataNasc)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'A data de nascimento não pode ser hoje!',
                    dados: null
                });
            }

            // Remove máscara do telefone e valida
            if (!validarTelefone(cel)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Telefone inválido.',
                    dados: null
                });
            }

            const cli_cel = cel.replace(/\D/g, '');

            // Verifica se o e-mail já existe
            const [emailExiste] = await db.query(`SELECT usu_id FROM usuarios WHERE usu_email = ?`, [email]);
            if (emailExiste.length > 0) {
                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'E-mail já cadastrado.',
                    dados: null
                });
            }

            // Verifica se o CPF já existe
            const [cpfExiste] = await db.query(`SELECT usu_id FROM usuarios WHERE usu_cpf = ?`, [usu_cpf]);
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
            const [usuarios] = await db.query(sqlUsu, [nome, email, senha, dataNasc, usu_cpf, usu_tipo, usu_ativo]);
            const usu_id = usuarios.insertId;

            // Inserir cliente
            const sqlCli = `
                INSERT INTO clientes (usu_id, cli_cel, cli_pts) 
                VALUES (?, ?, ?)
            `;
            await db.query(sqlCli, [usu_id, cli_cel, cli_pts]);

            // Inserir endereço
            const sqlEnd = `
                INSERT INTO cliente_enderecos  
                    (usu_id, end_logradouro, end_num, end_bairro, end_complemento, cid_id, end_principal, end_excluido) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await db.query(sqlEnd, [usu_id, logradouro, num, bairro, complemento, idCidade, end_principal, end_excluido]);

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
            const { id } = request.params;
            const dados = request.body;

            // Mapeamento dos campos válidos para o banco de dados
            const camposValidos = {
                cel: 'cli_cel',
                pontos: 'cli_pts'
            };

            // Arrays para montar a query dinamicamente
            const setClauses = [];
            const values = [];

            // Monta dinamicamente os campos a serem atualizados
            for (const key in dados) {
                if (camposValidos[key] && dados[key] !== undefined) {
                    setClauses.push(`${camposValidos[key]} = ?`);
                    values.push(dados[key]);
                }
            }

            // Se nenhum campo válido foi enviado, retorna erro
            if (setClauses.length === 0) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhum campo válido enviado para atualização.',
                    dados: null
                });
            }

            // Adiciona o ID ao final dos valores (para a cláusula WHERE)
            values.push(id);

            // Monta a query final
            const sql = `
                UPDATE clientes
                SET ${setClauses.join(', ')}
                WHERE usu_id = ?;
            `;

            // Executa a query
            const [result] = await db.query(sql, values);

            // Se nenhum registro foi alterado
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Cliente com ID ${id} não encontrado.`,
                    dados: null
                });
            }

            // Sucesso
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Atualização de dados do cliente realizada com sucesso.',
                dados: { id, alterados: result.affectedRows }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar cliente.',
                dados: error.message
            });
        }
    }
}

