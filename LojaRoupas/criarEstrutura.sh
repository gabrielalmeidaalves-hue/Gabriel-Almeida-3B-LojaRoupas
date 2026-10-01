#!/bin/bash

# ==============================================================================
# Script para criação da estrutura do projeto StyleShop (MVC + CRUDs)
# ==============================================================================

echo "Criando diretórios do projeto..."

# Estrutura Backend (MVC)
mkdir -p backend/controllers
mkdir -p backend/routes

# Estrutura Frontend
mkdir -p frontend/menu
mkdir -p frontend/produto
mkdir -p frontend/categoria_roupa
mkdir -p frontend/cargo
mkdir -p frontend/pessoa

# Pasta para Imagens e documentação
mkdir -p imagens
mkdir -p documentacao

echo "Criando arquivos do Backend (vazios)..."
touch backend/server.js
touch backend/database.js
touch backend/.env
touch backend/controllers/produtoController.js
touch backend/controllers/categoriaRoupaController.js
touch backend/controllers/cargoController.js
touch backend/controllers/pessoaController.js
touch backend/controllers/clienteController.js
touch backend/controllers/funcionarioController.js
touch backend/routes/produtoRoutes.js
touch backend/routes/categoriaRoupaRoutes.js
touch backend/routes/cargoRoutes.js
touch backend/routes/pessoaRoutes.js
touch backend/routes/clienteRoutes.js
touch backend/routes/funcionarioRoutes.js

echo "Criando arquivos do Frontend (vazios)..."
touch frontend/menu/menu.html frontend/menu/menu.css frontend/menu/menu.js
touch frontend/produto/produto.html frontend/produto/produto.css frontend/produto/produto.js
touch frontend/categoria_roupa/categoria_roupa.html frontend/categoria_roupa/categoria_roupa.css frontend/categoria_roupa/categoria_roupa.js
touch frontend/cargo/cargo.html frontend/cargo/cargo.css frontend/cargo/cargo.js
touch frontend/pessoa/pessoa.html frontend/pessoa/pessoa.css frontend/pessoa/pessoa.js

touch index.html

echo "Criando arquivos de configuração (vazios)..."
touch package.json
touch README.md

echo "Estrutura criada com sucesso!"
