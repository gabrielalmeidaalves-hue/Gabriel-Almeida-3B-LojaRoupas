const express = require('express');
const cors = require('cors');
const path = require('path');
// Carrega o .env da pasta backend (antes carregava o da pasta onde o node foi iniciado,
// e a PORT só funcionava por acaso porque o database.js já tinha carregado o .env certo)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Importa a função de consulta do banco
const { query } = require('./database');

// Importa as rotas
const produtoRoutes = require('./routes/produtoRoutes');
const categoriaRoupaRoutes = require('./routes/categoriaRoupaRoutes');
const cargoRoutes = require('./routes/cargoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir imagens estáticas
app.use('/imagens', express.static(path.join(__dirname, '../imagens')));

// Definir Rotas
app.use('/produto', produtoRoutes);
app.use('/categoria_roupa', categoriaRoupaRoutes);


// Cliente e funcionário são cadastrados pela tela de Pessoa
const clienteRoutes = require('./routes/clienteRoutes');
app.use('/cliente', clienteRoutes);

const funcionarioRoutes = require('./routes/funcionarioRoutes');
app.use('/funcionario', funcionarioRoutes);

const pessoaRoutes = require('./routes/pessoaRoutes');
app.use('/pessoa', pessoaRoutes);

app.use('/cargo', cargoRoutes);

// Erros que o Express devolvia como página HTML agora voltam como JSON
app.use((erro, req, res, next) => {
    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({ sucesso: false, mensagem: 'JSON inválido na requisição.' });
    }
    if (erro.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ sucesso: false, mensagem: 'A imagem deve ter no máximo 5 MB.' });
    }
    console.error('Erro não tratado:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;

// Inicializa o servidor e testa o PostgreSQL
app.listen(PORT, async () => {
    console.log(`\n=================================`);
    console.log(`🚀 Servidor executando na porta ${PORT}`);
    
    try {
        await query('SELECT 1');
        console.log(`✅ Banco de Dados  ${process.env.DB_NAME} conectado com sucesso!`);
    } catch (error) {
        console.error(`❌ FALHA NA CONEXÃO COM O BANCO DE DADOS:`);
        console.error(`   Motivo: ${error.message}`);
        console.error(`👉 Ajuste o arquivo .env com a senha correta do seu PostgreSQL.`);
    }
    console.log(`=================================\n`);
});
