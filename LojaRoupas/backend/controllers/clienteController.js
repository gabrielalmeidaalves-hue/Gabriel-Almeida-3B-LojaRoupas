const { query } = require('../database');

function cpfValido(cpf) {
  if (cpf === undefined || cpf === null || cpf === '') {
    return false;
  }
  if (isNaN(Number(cpf)) || Number(cpf) < 0) {
    return false;
  }
  if (String(cpf).length != 11) {
    return false;
  }
  return true;
}



exports.listarClientes = async (req, res) => {
  try {
    const result = await query('SELECT cli.pessoa_cpf_pessoa, p.nome_pessoa, cli.renda_cliente, cli.data_cadastro_cliente FROM cliente cli, pessoa p WHERE cli.pessoa_cpf_pessoa = p.cpf_pessoa ORDER BY cli.pessoa_cpf_pessoa');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarCliente = async (req, res) => {
  try {
    const { pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente } = req.body;

    if (!cpfValido(pessoa_cpf_pessoa)) {
      return res.status(400).json({
        error: 'CPF deve conter apenas números (11 digitos)'
      });
    }

    // Validação básica (antes a mensagem dizia "nome do cliente", mas o campo é a renda)
    if (!renda_cliente || isNaN(Number(renda_cliente)) || Number(renda_cliente) < 0) {
      return res.status(400).json({
        error: 'A renda do cliente é obrigatória e deve ser um número (0 ou mais)'
      });
    }

    if (!data_cadastro_cliente) {
      return res.status(400).json({
        error: 'A data de cadastro do cliente é obrigatória'
      });
    }

    const result = await query(
      'INSERT INTO cliente (pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente) VALUES ($1, $2, $3) RETURNING *',
      [pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);

    // Violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    // Já é cliente
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Esta pessoa já está cadastrada como cliente'
      });
    }

    // Pessoa não existe
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'A pessoa informada não existe no cadastro'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterCliente = async (req, res) => {
  try {
    const id = req.params.id;

    if (!cpfValido(id)) {
      return res.status(400).json({ error: 'CPF deve conter apenas números (11 digitos)' });
    }

    const result = await query(
      'SELECT * FROM cliente WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarCliente = async (req, res) => {
  try {
    const id = req.params.id;
    const { renda_cliente, data_cadastro_cliente } = req.body;

    if (!cpfValido(id)) {
      return res.status(400).json({ error: 'CPF deve conter apenas números (11 digitos)' });
    }

    if (!renda_cliente || isNaN(Number(renda_cliente)) || Number(renda_cliente) < 0) {
      return res.status(400).json({ error: 'A renda do cliente é obrigatória e deve ser um número (0 ou mais)' });
    }

    if (!data_cadastro_cliente) {
      return res.status(400).json({ error: 'A data de cadastro do cliente é obrigatória' });
    }

    const updateResult = await query(
      'UPDATE cliente SET renda_cliente = $1, data_cadastro_cliente = $2 WHERE pessoa_cpf_pessoa = $3 RETURNING *',
      [renda_cliente, data_cadastro_cliente, id]
    );

    // Antes: se o cliente não existisse, devolvia resposta vazia com status 200
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarCliente = async (req, res) => {
  const id = req.params.id;

  try {
    if (!cpfValido(id)) {
      return res.status(400).json({ error: 'CPF deve conter apenas números (11 digitos)' });
    }

    // 1. Verifica se o cliente existe
    const existingPersonResult = await query(
      'SELECT * FROM cliente WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // 2. Deleta o cliente
    await query(
      'DELETE FROM cliente WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    // 3. Resposta de sucesso (204 No Content - Sem corpo)
    res.status(204).send();

  } catch (error) {
    console.error('Erro ao deletar cliente:', error);

    // Violação de foreign key (código 23503)
    if (error.code === '23503') {
      return res.status(409).json({
        error: 'Erro de integridade referencial - o cliente não pode ser excluído, pois está associado a outras entidades.'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor ao tentar excluir o cliente.' });
  }
}
