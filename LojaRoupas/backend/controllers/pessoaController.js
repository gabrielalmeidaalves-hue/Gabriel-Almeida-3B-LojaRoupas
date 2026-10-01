const { query } = require('../database');
const path = require('path');


exports.abrirCrudPessoa = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pessoa/pessoa.html'));
};

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

exports.listarPessoas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pessoa ORDER BY cpf_pessoa');
    res.json({ sucesso: true, pessoas: result.rows });
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.criarPessoa = async (req, res) => {
  try {
    const { cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa } = req.body;

    if (!cpfValido(cpf_pessoa)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'CPF deve conter apenas números (11 digitos)'
      });
    }


    if (!nome_pessoa || !endereco_pessoa || !senha_pessoa || !email_pessoa) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome, email, endereço e senha são obrigatórios'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_pessoa)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Formato de email inválido'
      });
    }

    const result = await query(
      'INSERT INTO pessoa (cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa]
    );

    res.status(201).json({ sucesso: true, pessoa: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);

    if (error.code === '23505' && error.constraint === 'pessoa_unique') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Email já está em uso'
      });
    }

    // CPF repetido (chave primária) - antes caía em "Erro interno do servidor"
    if (error.code === '23505') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Já existe uma pessoa cadastrada com este CPF'
      });
    }

    if (error.code === '23502') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.obterPessoa = async (req, res) => {
  try {
    const id = req.params.id;

    if (!cpfValido(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF deve conter apenas números (11 digitos)' });
    }

    const result = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pessoa não encontrada' });
    }

    res.json({ sucesso: true, pessoa: result.rows[0] });
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.atualizarPessoa = async (req, res) => {
  try {
    const id = req.params.id;
    const { nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa } = req.body;

    if (!cpfValido(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF deve conter apenas números (11 digitos)' });
    }

    // Não deixa salvar campos vazios
    if (nome_pessoa === '' || endereco_pessoa === '' || senha_pessoa === '' || email_pessoa === '') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome, email, endereço e senha não podem ficar vazios'
      });
    }

    if (email_pessoa) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email_pessoa)) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Formato de email inválido'
        });
      }
    }

    const existingPersonResult = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pessoa não encontrada' });
    }

    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      nome_pessoa: nome_pessoa !== undefined ? nome_pessoa : currentPerson.nome_pessoa,
      data_nascimento_pessoa: data_nascimento_pessoa !== undefined ? data_nascimento_pessoa : currentPerson.data_nascimento_pessoa,
      endereco_pessoa: endereco_pessoa !== undefined ? endereco_pessoa : currentPerson.endereco_pessoa,
      senha_pessoa: senha_pessoa !== undefined ? senha_pessoa : currentPerson.senha_pessoa,
      email_pessoa: email_pessoa !== undefined ? email_pessoa : currentPerson.email_pessoa
    };

    const updateResult = await query(
      'UPDATE pessoa SET nome_pessoa = $1, data_nascimento_pessoa = $2, endereco_pessoa = $3, senha_pessoa = $4, email_pessoa = $5 WHERE cpf_pessoa = $6 RETURNING *',
      [updatedFields.nome_pessoa, updatedFields.data_nascimento_pessoa, updatedFields.endereco_pessoa, updatedFields.senha_pessoa, updatedFields.email_pessoa, id]
    );

    res.json({ sucesso: true, pessoa: updateResult.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);

    if (error.code === '23505' && error.constraint === 'pessoa_unique') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Email já está em uso por outra pessoa'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.deletarPessoa = async (req, res) => {
  try {
    const id = req.params.id;

    if (!cpfValido(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF deve conter apenas números (11 digitos)' });
    }

    const existingPersonResult = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pessoa não encontrada' });
    }

    await query(
      'DELETE FROM pessoa WHERE cpf_pessoa = $1',
      [id]
    );

    res.json({ sucesso: true, mensagem: 'Pessoa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Não é possível deletar pessoa com dependências associadas'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

