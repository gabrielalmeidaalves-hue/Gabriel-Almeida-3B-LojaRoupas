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

// (a rota /abrirCrudFuncionario foi removida: apontava para frontend/funcionario/funcionario.html,
//  que não existe - o cadastro de funcionário é feito dentro da tela de Pessoa)

exports.listarFuncionarios = async (req, res) => {
  try {
    const result = await query(
      'SELECT func.pessoa_cpf_pessoa, p.nome_pessoa, func.salario_funcionario, func.cargo_id_cargo, func.porcentagem_comissao_funcionario ' +
      'FROM funcionario func, pessoa p WHERE func.pessoa_cpf_pessoa = p.cpf_pessoa ORDER BY func.pessoa_cpf_pessoa'
    );
    res.json({ sucesso: true, funcionarios: result.rows });
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.criarFuncionario = async (req, res) => {
  try {
    const { pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario } = req.body;

    if (!cpfValido(pessoa_cpf_pessoa)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'CPF deve conter apenas números (11 digitos)'
      });
    }

    if (!salario_funcionario || isNaN(Number(salario_funcionario)) || Number(salario_funcionario) <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O salário do funcionário é obrigatório e deve ser um número (0 ou mais)'
      });
    }

    if (cargo_id_cargo === undefined || cargo_id_cargo === '' || isNaN(Number(cargo_id_cargo))) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O cargo do funcionário é obrigatório'
      });
    }

    if (porcentagem_comissao_funcionario === undefined || porcentagem_comissao_funcionario === '' || isNaN(Number(porcentagem_comissao_funcionario)) || Number(porcentagem_comissao_funcionario) < 0 || Number(porcentagem_comissao_funcionario) > 100) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'A comissão deve ser um número de 0 a 100'
      });
    }

    const result = await query(
      'INSERT INTO funcionario (pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario) VALUES ($1, $2, $3, $4) RETURNING *',
      [pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario]
    );

    res.status(201).json({ sucesso: true, funcionario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);

    if (error.code === '23502') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios não fornecidos'
      });
    }

    if (error.code === '23505') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Esta pessoa já está cadastrada como funcionário'
      });
    }

    // Cargo ou pessoa inexistente
    if (error.code === '23503') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O cargo ou a pessoa informada não existe no cadastro'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.obterFuncionario = async (req, res) => {
  try {
    const id = req.params.id;

    if (!cpfValido(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF deve conter apenas números (11 digitos)' });
    }

    const result = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado' });
    }

    res.json({ sucesso: true, funcionario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao obter funcionário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.atualizarFuncionario = async (req, res) => {
  try {
    const id = req.params.id;
    const { salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario } = req.body;

    if (!cpfValido(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF deve conter apenas números (11 digitos)' });
    }

    const existingPersonResult = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado' });
    }

    const currentFunc = existingPersonResult.rows[0];

    const updatedFields = {
      salario_funcionario: salario_funcionario !== undefined ? salario_funcionario : currentFunc.salario_funcionario,
      cargo_id_cargo: cargo_id_cargo !== undefined ? cargo_id_cargo : currentFunc.cargo_id_cargo,
      porcentagem_comissao_funcionario: porcentagem_comissao_funcionario !== undefined ? porcentagem_comissao_funcionario : currentFunc.porcentagem_comissao_funcionario
    };

    if (isNaN(Number(updatedFields.salario_funcionario)) || Number(updatedFields.salario_funcionario) < 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'O salário deve ser um número (0 ou mais)' });
    }

    if (isNaN(Number(updatedFields.porcentagem_comissao_funcionario)) || Number(updatedFields.porcentagem_comissao_funcionario) < 0 || Number(updatedFields.porcentagem_comissao_funcionario) > 100) {
      return res.status(400).json({ sucesso: false, mensagem: 'A comissão deve ser um número de 0 a 100' });
    }

    const updateResult = await query(
      'UPDATE funcionario SET salario_funcionario = $1, cargo_id_cargo = $2, porcentagem_comissao_funcionario = $3 WHERE pessoa_cpf_pessoa = $4 RETURNING *',
      [updatedFields.salario_funcionario, updatedFields.cargo_id_cargo, updatedFields.porcentagem_comissao_funcionario, id]
    );

    res.json({ sucesso: true, funcionario: updateResult.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O cargo informado não existe no cadastro'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.deletarFuncionario = async (req, res) => {
  try {
    const id = req.params.id;

    if (!cpfValido(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF deve conter apenas números (11 digitos)' });
    }

    const existingPersonResult = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado' });
    }

    await query(
      'DELETE FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    res.json({ sucesso: true, mensagem: 'Funcionário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Não é possível deletar funcionário com dependências associadas'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};
