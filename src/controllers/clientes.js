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
    async editarProdutos(request, response) {
        try {
            // Extrai o ID do produto a ser editado da URL (ex: /produtos/:id)
            const { id } = request.params;

            // Extrai os dados enviados no corpo da requisição (front-end)
            const campos = request.body;

            // Verifica se o ID é válido
            if (!id || isNaN(id)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID inválido.',
                });
            }

            // Verifica se foi enviado algum dado para atualizar
            if (!campos || Object.keys(campos).length === 0) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhum dado enviado para atualização.',
                });
            }

            // Define os campos permitidos para atualização, mapeando os nomes do front para os nomes do banco
            const camposValidos = {
                nome: 'prd_nome',
                valor: 'prd_valor',
                unidade: 'prd_unidade',
                tipo: 'ptp_id',
                disponivel: 'prd_disponivel',
                imgProduto: 'prd_img',
                imagemDestaque: 'prd_img_destaque',
                descricao: 'prd_descricao',
            };

            const setClauses = []; // Armazena as partes da cláusula SET da SQL
            const values = [];     // Armazena os valores correspondentes aos campos

            // Percorre cada campo recebido do front-end
            for (const key in campos) {
                if (camposValidos[key]) {
                    // Se for imagemDestaque, também atualiza o campo prd_destaque (1 ou 0)
                    if (key === 'imagemDestaque') {
                        setClauses.push('prd_destaque = ?');
                        values.push(campos[key] ? 1 : 0); // true vira 1, false vira 0
                    }

                    // Monta a cláusula SET: ex: prd_nome = ?, prd_valor = ? ...
                    setClauses.push(`${camposValidos[key]} = ?`);
                    values.push(campos[key]); // Adiciona o valor correspondente
                }
            }

            // Verifica se algum campo válido foi processado
            if (setClauses.length === 0) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhum campo válido para atualização.',
                });
            }

            // Monta a SQL dinamicamente com os campos válidos
            const sql = `
                UPDATE produtos 
                SET ${setClauses.join(', ')} 
                WHERE prd_id = ?;
            `;

            values.push(id); // Adiciona o ID como parâmetro da cláusula WHERE

            // Executa a query com os valores dinamicamente construídos
            const [result] = await db.query(sql, values);

            // Verifica se algum produto foi afetado (ou seja, se existia com o ID informado)
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Produto com o id ${id} não encontrado.`,
                });
            }

            // Retorno de sucesso
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Produto atualizado com sucesso.',
                dados: { id }
            });

        } catch (error) {
            // Captura e retorna qualquer erro interno que ocorrer
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar produto.',
                dados: error.message
            });
        }
    },
}

