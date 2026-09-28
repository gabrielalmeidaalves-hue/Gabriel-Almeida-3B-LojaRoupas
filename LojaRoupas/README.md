# StyleShop

Sistema CRUD baseado no CandyShop, adaptado para uma loja de roupas.

Alterações necessárias:
- Produto com tamanho e cor.
- Unidade de medida substituída por categoria de roupa (ID por sigla: FEM, MASC, VER, INV, INF).
- Banco de dados `styleshop`.
- Mesma estrutura MVC e demais módulos do projeto original.

## Banco
1. Execute `documentacao/CRIAR_BANCO.sql`.
2. Conecte-se ao banco `styleshop`.
3. Execute `documentacao/styleshop.sql`.

O `backend/.env` já usa `DB_NAME=styleshop`.
