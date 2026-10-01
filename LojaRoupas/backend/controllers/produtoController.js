const { query } = require('../database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

exports.listarProdutos = async (req, res) => {
    try {
        const result = await query('SELECT * FROM public.produto ORDER BY id_produto');
        res.json({ sucesso: true, produtos: result.rows });
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar produtos.' });
    }
};

exports.obterProduto = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        const result = await query('SELECT * FROM public.produto WHERE id_produto = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        res.json({ sucesso: true, produto: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter produto:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

exports.criarProduto = async (req, res) => {
    try {
        const {
            id_produto,
            nome_produto,
            id_categoria_roupa,
            tamanho,
            cor,
            quantidade_estoque_produto,
            preco_unitario_produto
        } = req.body;

        if (!id_produto || isNaN(Number(id_produto)) || Number(id_produto) < 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'O ID do produto deve ser um número (0 ou mais).' });
        }

        if (!nome_produto) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome do produto é obrigatório.' });
        }

        if (!id_categoria_roupa) {
            return res.status(400).json({ sucesso: false, mensagem: 'A categoria é obrigatória.' });
        }

        if (!tamanho) {
            return res.status(400).json({ sucesso: false, mensagem: 'O tamanho é obrigatório.' });
        }

        if (!cor) {
            return res.status(400).json({ sucesso: false, mensagem: 'A cor é obrigatória.' });
        }

        if (isNaN(Number(quantidade_estoque_produto)) || Number(quantidade_estoque_produto) < 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'A quantidade em estoque deve ser um número (0 ou mais).' });
        }

        if (isNaN(Number(preco_unitario_produto)) || Number(preco_unitario_produto) < 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'O preço deve ser um número (0 ou mais).' });
        }

        const result = await query(`
            INSERT INTO public.produto
            (id_produto, nome_produto, id_categoria_roupa, tamanho, cor,
             quantidade_estoque_produto, preco_unitario_produto)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            id_produto,
            nome_produto,
            id_categoria_roupa || null,
            tamanho || null,
            cor || null,
            quantidade_estoque_produto || 0,
            preco_unitario_produto || 0.0
        ]);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Produto inserido com sucesso!',
            produto: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        // ID repetido - antes caía em "Erro ao inserir produto no banco de dados."
        if (error.code === '23505') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Já existe um produto cadastrado com este ID.'
            });
        }
        if (error.code === '23503') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A categoria informada não existe no cadastro.'
            });
        }
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao inserir produto no banco de dados.'
        });
    }
};

exports.atualizarProduto = async (req, res) => {
    try {
        const {
            nome_produto,
            id_categoria_roupa,
            tamanho,
            cor,
            quantidade_estoque_produto,
            preco_unitario_produto
        } = req.body;

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        if (!nome_produto) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome do produto é obrigatório.' });
        }

        if (!id_categoria_roupa) {
            return res.status(400).json({ sucesso: false, mensagem: 'A categoria é obrigatória.' });
        }

        if (!tamanho) {
            return res.status(400).json({ sucesso: false, mensagem: 'O tamanho é obrigatório.' });
        }

        if (!cor) {
            return res.status(400).json({ sucesso: false, mensagem: 'A cor é obrigatória.' });
        }

        if (isNaN(Number(quantidade_estoque_produto)) || Number(quantidade_estoque_produto) < 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'A quantidade em estoque deve ser um número (0 ou mais).' });
        }

        if (isNaN(Number(preco_unitario_produto)) || Number(preco_unitario_produto) < 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'O preço deve ser um número (0 ou mais).' });
        }

        const result = await query(`
            UPDATE public.produto
            SET nome_produto = $1,
                id_categoria_roupa = $2,
                tamanho = $3,
                cor = $4,
                quantidade_estoque_produto = $5,
                preco_unitario_produto = $6
            WHERE id_produto = $7
            RETURNING *
        `, [
            nome_produto,
            id_categoria_roupa || null,
            tamanho || null,
            cor || null,
            quantidade_estoque_produto || 0,
            preco_unitario_produto || 0.0,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        res.json({
            sucesso: true,
            mensagem: 'Produto alterado com sucesso!',
            produto: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        if (error.code === '23503') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A categoria informada não existe no cadastro.'
            });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar produto.' });
    }
};

exports.uploadImagem = async (req, res) => {
    try {
        // SEGURANÇA: o id vai direto para o nome do arquivo (imagens/<id>.png).
        // Sem validar, um id como "..%2F..%2Falgo" gravava imagem fora da pasta imagens.
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }
        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo enviado.' });
        }

        const pastaImagens = path.join(__dirname, '../../imagens');
        if (!fs.existsSync(pastaImagens)) {
            fs.mkdirSync(pastaImagens, { recursive: true });
        }

        const caminhoDestino = path.join(pastaImagens, `${id}.png`);

        await sharp(req.file.buffer)
            .resize(300, 300, { fit: 'cover' })
            .toFormat('png')
            .toFile(caminhoDestino);

        res.json({ sucesso: true, mensagem: 'Imagem salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagem.' });
    }
};

exports.deletarProduto = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        const resultado = await query('DELETE FROM public.produto WHERE id_produto = $1', [id]);

        // Antes: excluir um ID inexistente respondia "excluído com sucesso"
        if (resultado.rowCount === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        const imgPath = path.join(__dirname, '../../imagens', `${id}.png`);
        if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
        }

        res.json({ sucesso: true, mensagem: 'Produto excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        if (error.code === '23503') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Não é possível excluir: este produto possui registros associados.'
            });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir produto.' });
    }
};
