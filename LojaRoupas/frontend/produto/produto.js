const URL_API = 'http://localhost:3001';
const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

let oQueEstaFazendo = '';
let produto = null;
bloquearAtributos(true);

async function inicializar() {
    await carregarCategoriasRoupa();
    await listar();
}

async function carregarCategoriasRoupa() {
    const select = document.getElementById("selectId_categoria_roupa");

    try {
        const resposta = await fetch(`${URL_API}/categoria_roupa/listar`);
        const data = await resposta.json();

        if (data.sucesso) {
            select.innerHTML = '<option value="">-- Selecione uma Categoria --</option>';

            data.categorias.forEach(categoria => {
                select.innerHTML += `<option value="${categoria.id_categoria_roupa}">${categoria.id_categoria_roupa} - ${categoria.nome_categoria_roupa}</option>`;
            });
        }
    } catch (erro) {
        select.innerHTML = '<option value="">Erro ao carregar categorias</option>';
    }
}

function carregarImagem(id) {
    const img = document.getElementById('imgProduto');

    if (!id) {
        img.src = SILHUETA_URL;
        return;
    }

    img.src = `${URL_API}/imagens/${id}.png?t=${new Date().getTime()}`;
    img.onerror = () => { img.src = SILHUETA_URL; };
}

function acionarUpload() {
    if (oQueEstaFazendo !== 'inserindo' && oQueEstaFazendo !== 'alterando') {
        mostrarAviso("Clique em Inserir ou Alterar primeiro para poder escolher uma imagem.");
        return;
    }
    document.getElementById('inputImagem').click();
}

function previewImagem() {
    const inputFiles = document.getElementById('inputImagem').files;
    if (inputFiles.length > 0) {
        const url = URL.createObjectURL(inputFiles[0]);
        document.getElementById('imgProduto').src = url;
        mostrarAviso("Imagem escolhida! Clique em Salvar para concluir.");
    }
}

async function uploadImagemParaServidor(id) {
    const inputFiles = document.getElementById('inputImagem').files;
    if (inputFiles.length === 0) return;

    const formData = new FormData();
    formData.append('imagem', inputFiles[0]);

    try {
        await fetch(`${URL_API}/produto/upload/${id}`, {
            method: 'POST',
            body: formData
        });
    } catch (erro) {
        console.error("Erro ao enviar imagem:", erro);
    }
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/produto/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.produto : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_produto = document.getElementById("inputId_produto").value;

    if (isNaN(id_produto) || !Number.isInteger(Number(id_produto)) || id_produto === "") {
        mostrarAviso("Precisa ser um número inteiro");
        return;
    }

    produto = await procurePorChavePrimaria(id_produto);
    oQueEstaFazendo = '';

    if (produto) {
        mostrarDadosProduto(produto);
        carregarImagem(id_produto);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
        carregarImagem(null);
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Não achou no banco, pode inserir");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Digite os dados, escolha a imagem e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Digite os dados, mude a imagem (opcional) e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusão");
}

async function salvar() {
    const id_produto = document.getElementById("inputId_produto").value;
    const nome_produto = document.getElementById("inputNome_produto").value.trim();
    const id_categoria_roupa = document.getElementById("selectId_categoria_roupa").value;
    const tamanho = document.getElementById("inputTamanho").value.trim();
    const cor = document.getElementById("inputCor").value.trim();
    const textoEstoque = document.getElementById("inputQuantidade_estoque_produto").value;
    const textoPreco = document.getElementById("inputPreco_unitario_produto").value;

    // Só confere os campos quando for inserir ou alterar (na exclusão não precisa)
    if (oQueEstaFazendo === 'inserindo' || oQueEstaFazendo === 'alterando') {

        if (id_produto === "" || !Number.isInteger(Number(id_produto))) {
            mostrarAviso("O ID do produto precisa ser um número inteiro.");
            return;
        }
        if (nome_produto === "") {
            mostrarAviso("Digite o nome da roupa.");
            return;
        }
        if (nome_produto.length > 45) {
            mostrarAviso("O nome da roupa pode ter no máximo 45 letras.");
            return;
        }
        if (id_categoria_roupa === "") {
            mostrarAviso("Escolha uma categoria.");
            return;
        }
        if (tamanho === "") {
            mostrarAviso("Digite o tamanho.");
            return;
        }
        if (tamanho.length > 10) {
            mostrarAviso("O tamanho pode ter no máximo 10 letras.");
            return;
        }
        if (cor === "") {
            mostrarAviso("Digite a cor.");
            return;
        }
        if (cor.length > 30) {
            mostrarAviso("A cor pode ter no máximo 30 letras.");
            return;
        }
        if (textoEstoque === "" || !Number.isInteger(Number(textoEstoque)) || Number(textoEstoque) < 0) {
            mostrarAviso("A quantidade em estoque precisa ser um número inteiro (0 ou mais).");
            return;
        }
        if (textoPreco === "" || isNaN(Number(textoPreco)) || Number(textoPreco) <= 0) {
            mostrarAviso("O preço precisa ser um número maior que zero.");
            return;
        }
    }

    const quantidade_estoque_produto = parseInt(textoEstoque) || 0;
    const preco_unitario_produto = parseFloat(textoPreco) || 0.0;

    const dadosProduto = {
        id_produto,
        nome_produto,
        id_categoria_roupa: id_categoria_roupa || null,
        tamanho,
        cor,
        quantidade_estoque_produto,
        preco_unitario_produto
    };

    try {
        if (oQueEstaFazendo === 'inserindo') {
            const resposta = await fetch(`${URL_API}/produto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosProduto)
            });
            const data = await resposta.json();
            if (!data.sucesso) return mostrarAviso(data.mensagem);

            await uploadImagemParaServidor(id_produto);
            mostrarAviso("Inserido no Banco de Dados com sucesso!");

        } else if (oQueEstaFazendo === 'alterando') {
            const resposta = await fetch(`${URL_API}/produto/${id_produto}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosProduto)
            });
            const data = await resposta.json();
            if (!data.sucesso) return mostrarAviso(data.mensagem);

            await uploadImagemParaServidor(id_produto);
            mostrarAviso("Alterado no Banco de Dados com sucesso!");

        } else if (oQueEstaFazendo === 'excluindo') {
            const resposta = await fetch(`${URL_API}/produto/${id_produto}`, { method: 'DELETE' });
            const data = await resposta.json();

            if (!data.sucesso) return mostrarAviso(data.mensagem);

            carregarImagem(null);
            mostrarAviso("Excluído do Banco de Dados!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_produto").value = "";
        listar();

    } catch (erro) {
        mostrarAviso("Erro ao efetuar operação no servidor.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/produto/listar`);
        const data = await resposta.json();

        if (data.sucesso) {
            let texto = "";

            for (let linha of data.produtos) {
                const categoria = linha.id_categoria_roupa ? ` [${linha.id_categoria_roupa}]` : '';
                texto += `${linha.id_produto} - ${linha.nome_produto}${categoria} - Tamanho: ${linha.tamanho || '-'} - Cor: ${linha.cor || '-'} - Estoque: ${linha.quantidade_estoque_produto} - Preço: R$ ${parseFloat(linha.preco_unitario_produto).toFixed(2)}<br>`;
            }

            document.getElementById("outputSaida").innerHTML =
                texto || "Nenhuma roupa cadastrada.";
        }
    } catch (erro) {
        document.getElementById("outputSaida").innerHTML = "Servidor offline.";
    }
}

function cancelarOperacao() {
    limparAtributos();
    carregarImagem(null);
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operação");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDadosProduto(p) {
    document.getElementById("inputId_produto").value = p.id_produto;
    document.getElementById("inputNome_produto").value = p.nome_produto;
    document.getElementById("selectId_categoria_roupa").value = p.id_categoria_roupa || "";
    document.getElementById("inputTamanho").value = p.tamanho || "";
    document.getElementById("inputCor").value = p.cor || "";
    document.getElementById("inputQuantidade_estoque_produto").value = p.quantidade_estoque_produto;
    document.getElementById("inputPreco_unitario_produto").value = p.preco_unitario_produto;
    bloquearAtributos(true);
}

function limparAtributos() {
    produto = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome_produto").value = "";
    document.getElementById("selectId_categoria_roupa").value = "";
    document.getElementById("inputTamanho").value = "";
    document.getElementById("inputCor").value = "";
    document.getElementById("inputQuantidade_estoque_produto").value = "";
    document.getElementById("inputPreco_unitario_produto").value = "";
    document.getElementById("inputImagem").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_produto").readOnly = !soLeitura;
    document.getElementById("inputNome_produto").readOnly = soLeitura;
    document.getElementById("selectId_categoria_roupa").disabled = soLeitura;
    document.getElementById("inputTamanho").readOnly = soLeitura;
    document.getElementById("inputCor").readOnly = soLeitura;
    document.getElementById("inputQuantidade_estoque_produto").readOnly = soLeitura;
    document.getElementById("inputPreco_unitario_produto").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}
