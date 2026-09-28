const { query } = require('../database');

// Listar todas as categorias de roupas
exports.listarCategoriasRoupa = async (req, res) => {
    try {
        const result = await query('SELECT * FROM public.categoria_roupa ORDER BY id_categoria_roupa');
        res.json({ sucesso: true, categorias: result.rows });
    } catch (error) {
        console.error('Erro ao listar categorias de roupas:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar categorias de roupas.' });
    }
};

// Obter categoria por ID
exports.obterCategoriaRoupa = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.trim().toUpperCase() : '';
        if (!id || id.length > 4) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido (deve ter até 4 caracteres).' });
        }

        const result = await query('SELECT * FROM public.categoria_roupa WHERE id_categoria_roupa = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Categoria não encontrada.' });
        }

        res.json({ sucesso: true, categoria: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter categoria:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// Criar categoria
exports.criarCategoriaRoupa = async (req, res) => {
    try {
        const { id_categoria_roupa, nome_categoria_roupa } = req.body;
        const id = id_categoria_roupa ? id_categoria_roupa.trim().toUpperCase() : '';

        if (!id || id.length > 4) {
            return res.status(400).json({ sucesso: false, mensagem: 'A sigla/ID deve ter até 4 caracteres.' });
        }

        if (!nome_categoria_roupa) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome da categoria é obrigatório.' });
        }

        const sql = `
            INSERT INTO public.categoria_roupa (id_categoria_roupa, nome_categoria_roupa)
            VALUES ($1, $2)
            RETURNING *
        `;

        const result = await query(sql, [id, nome_categoria_roupa]);
        res.status(201).json({ sucesso: true, mensagem: 'Categoria inserida com sucesso!', categoria: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        if (error.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'Esta sigla de categoria já está cadastrada.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir categoria no banco de dados.' });
    }
};

// Atualizar categoria
exports.atualizarCategoriaRoupa = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.trim().toUpperCase() : '';
        const { nome_categoria_roupa } = req.body;

        if (!id || id.length > 4) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        if (!nome_categoria_roupa) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome da categoria é obrigatório.' });
        }

        const sql = `
            UPDATE public.categoria_roupa 
            SET nome_categoria_roupa = $1 
            WHERE id_categoria_roupa = $2
            RETURNING *
        `;

        const result = await query(sql, [nome_categoria_roupa, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Categoria não encontrada.' });
        }

        res.json({ sucesso: true, mensagem: 'Categoria alterada com sucesso!', categoria: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar categoria.' });
    }
};

// Deletar categoria
exports.deletarCategoriaRoupa = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.trim().toUpperCase() : '';

        if (!id || id.length > 4) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        await query('DELETE FROM public.categoria_roupa WHERE id_categoria_roupa = $1', [id]);

        res.json({ sucesso: true, mensagem: 'Categoria excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Não é possível excluir: existem produtos associados a esta categoria.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir categoria.' });
    }
};