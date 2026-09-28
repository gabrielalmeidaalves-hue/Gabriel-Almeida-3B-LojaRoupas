const express = require('express');
const router = express.Router();
const categoriaRoupaController = require('../controllers/categoriaRoupaController');

router.get('/listar', categoriaRoupaController.listarCategoriasRoupa);
router.get('/:id', categoriaRoupaController.obterCategoriaRoupa);
router.post('/', categoriaRoupaController.criarCategoriaRoupa);
router.put('/:id', categoriaRoupaController.atualizarCategoriaRoupa);
router.delete('/:id', categoriaRoupaController.deletarCategoriaRoupa);

module.exports = router;
