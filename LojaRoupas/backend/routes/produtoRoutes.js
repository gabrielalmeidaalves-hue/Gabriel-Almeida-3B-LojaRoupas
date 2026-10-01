const express = require('express');
const multer = require('multer');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// Configura o Multer para armazenar em memória temporária para o Sharp processar
// (limite de 5 MB por imagem; arquivo que não é imagem o Sharp recusa no controller)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Rotas do CRUD de Produtos
router.get('/listar', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProduto);
router.post('/', produtoController.criarProduto);
router.put('/:id', produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

// Rota para upload da imagem
router.post('/upload/:id', upload.single('imagem'), produtoController.uploadImagem);

module.exports = router;