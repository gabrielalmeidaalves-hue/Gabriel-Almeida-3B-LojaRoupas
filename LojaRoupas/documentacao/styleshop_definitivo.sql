


-- ============================================
-- 1. CRIAÇÃO DAS TABELAS
-- ============================================

-- Tabelas sem dependências (primeiro)
CREATE TABLE public.pessoa (
    cpf_pessoa character varying(20) NOT NULL,
    nome_pessoa character varying(60) NOT NULL,
    data_nascimento_pessoa date NOT NULL,
    endereco_pessoa character varying(150) NOT NULL,
    senha_pessoa character varying(50) NOT NULL,
    email_pessoa character varying(75) NOT NULL
);

CREATE TABLE public.cargo (
    id_cargo integer NOT NULL,
    nome_cargo character varying(45) NOT NULL
);

CREATE TABLE public.categoria_roupa (
    id_categoria_roupa character varying(4) NOT NULL,
    nome_categoria_roupa character varying(50) NOT NULL
);

-- Tabelas com dependências
CREATE TABLE public.cliente (
    pessoa_cpf_pessoa character varying(20) NOT NULL,
    renda_cliente double precision NOT NULL,
    data_cadastro_cliente date NOT NULL
);

CREATE TABLE public.funcionario (
    pessoa_cpf_pessoa character varying(20) NOT NULL,
    salario_funcionario double precision NOT NULL,
    cargo_id_cargo integer NOT NULL,
    porcentagem_comissao_funcionario double precision NOT NULL
);

CREATE TABLE public.produto (
    id_produto integer NOT NULL,
    nome_produto character varying(45) NOT NULL,
    quantidade_estoque_produto integer NOT NULL DEFAULT 0,
    preco_unitario_produto double precision NOT NULL DEFAULT 0,
    id_categoria_roupa character varying(4) NOT NULL,
    tamanho character varying(10) NOT NULL,
    cor character varying(30) NOT NULL
);


-- ============================================
-- 2. SEQUENCES
-- (as telas informam o ID na mão, mas a sequence fica pronta
--  e sincronizada para qualquer INSERT sem ID)
-- ============================================

CREATE SEQUENCE public.cargo_id_cargo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.produto_id_produto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ============================================
-- 3. ALTERS PARA DEFAULTS DAS SEQUENCES
-- ============================================

ALTER SEQUENCE public.cargo_id_cargo_seq OWNED BY public.cargo.id_cargo;
ALTER SEQUENCE public.produto_id_produto_seq OWNED BY public.produto.id_produto;

ALTER TABLE ONLY public.cargo ALTER COLUMN id_cargo SET DEFAULT nextval('public.cargo_id_cargo_seq'::regclass);
ALTER TABLE ONLY public.produto ALTER COLUMN id_produto SET DEFAULT nextval('public.produto_id_produto_seq'::regclass);


-- ============================================
-- 4. CONSTRAINTS (CHAVES PRIMÁRIAS, ÚNICAS, CHECKS E ESTRANGEIRAS)
-- ============================================

-- Chaves Primárias
ALTER TABLE ONLY public.pessoa ADD CONSTRAINT pessoa_pkey PRIMARY KEY (cpf_pessoa);
ALTER TABLE ONLY public.cargo ADD CONSTRAINT cargo_pkey PRIMARY KEY (id_cargo);
ALTER TABLE ONLY public.categoria_roupa ADD CONSTRAINT categoria_roupa_pkey PRIMARY KEY (id_categoria_roupa);
ALTER TABLE ONLY public.cliente ADD CONSTRAINT cliente_pkey PRIMARY KEY (pessoa_cpf_pessoa);
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT funcionario_pkey PRIMARY KEY (pessoa_cpf_pessoa);
ALTER TABLE ONLY public.produto ADD CONSTRAINT produto_pkey PRIMARY KEY (id_produto);

-- Email único (o pessoaController já trata o erro "pessoa_unique" -> "Email já está em uso")
ALTER TABLE ONLY public.pessoa ADD CONSTRAINT pessoa_unique UNIQUE (email_pessoa);

-- Regras de validação (espelham o que as telas já exigem)
ALTER TABLE ONLY public.cliente ADD CONSTRAINT ck_cliente_renda CHECK (renda_cliente >= 0);
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT ck_funcionario_salario CHECK (salario_funcionario >= 0);
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT ck_funcionario_comissao CHECK (porcentagem_comissao_funcionario >= 0 AND porcentagem_comissao_funcionario <= 100);
ALTER TABLE ONLY public.produto ADD CONSTRAINT ck_produto_estoque CHECK (quantidade_estoque_produto >= 0);
ALTER TABLE ONLY public.produto ADD CONSTRAINT ck_produto_preco CHECK (preco_unitario_produto >= 0);

-- Chaves Estrangeiras
-- cliente/funcionario dependem da pessoa: ao excluir a pessoa, os papéis dela saem juntos.
ALTER TABLE ONLY public.cliente ADD CONSTRAINT fk_cliente_pessoa FOREIGN KEY (pessoa_cpf_pessoa) REFERENCES public.pessoa (cpf_pessoa) ON DELETE CASCADE;
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT fk_funcionario_pessoa FOREIGN KEY (pessoa_cpf_pessoa) REFERENCES public.pessoa (cpf_pessoa) ON DELETE CASCADE;

-- cargo e categoria NÃO usam CASCADE: assim o banco impede apagar um cargo/categoria em uso
-- (os controllers já tratam o erro 23503 com a mensagem "não é possível excluir...").
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT fk_funcionario_cargo FOREIGN KEY (cargo_id_cargo) REFERENCES public.cargo (id_cargo);
ALTER TABLE ONLY public.produto ADD CONSTRAINT fk_produto_categoria_roupa FOREIGN KEY (id_categoria_roupa) REFERENCES public.categoria_roupa (id_categoria_roupa);


-- ============================================
-- 5. INSERTS (ORDEM CORRETA DE DEPENDÊNCIA)
-- 10 registros em cada tabela. Toda pessoa cadastrada é cliente e funcionário.
-- ============================================

-- 5.1 PESSOA
INSERT INTO public.pessoa VALUES ('10101010101', 'Juliana Dias', '1989-10-25', 'Rua Lins, 352', '1111', 'juliana@email.com');
INSERT INTO public.pessoa VALUES ('22222222222', 'Maria Souza', '1985-02-15', 'Rua das Flores, 1234', '.123456', 'maria@email.com');
INSERT INTO public.pessoa VALUES ('33333333333', 'Carlos Pereira', '1992-03-20', 'Rua das Palmeiras, 234', '123456x', 'carlos@email.com');
INSERT INTO public.pessoa VALUES ('44444444444', 'Ana Lima', '1995-04-25', 'Alameda das Acácias, 4534 apto 13', '.123456', 'ana@email.com');
INSERT INTO public.pessoa VALUES ('55555555555', 'Lucas Mendes', '1988-05-30', 'Rua Sexta Feira, 13 apto 666', '.123456', 'lucas@email.com');
INSERT INTO public.pessoa VALUES ('66666666666', 'Fernanda Costa', '1993-06-05', 'Avenida Central, 243', '.123456', 'fernanda@email.com');
INSERT INTO public.pessoa VALUES ('77777777777', 'Ricardo Alves', '1987-07-10', 'Rua do Comércio, 34', '.123456', 'ricardo@email.com');
INSERT INTO public.pessoa VALUES ('88888888888', 'Patrícia Gomes', '1994-08-15', 'Rua Nova, 54', '.123456', 'patricia@email.com');
INSERT INTO public.pessoa VALUES ('99999999999', 'Marcos Rocha', '1991-09-20', 'Rua da Praia, 100', '.123456', 'marcos@email.com');
INSERT INTO public.pessoa VALUES ('11111111111', 'João Silva', '1990-01-01', 'Rua do Bosque, 10', '123456x', 'joao@email.com');

-- 5.2 CARGO
INSERT INTO public.cargo VALUES (1, 'Vendedor');
INSERT INTO public.cargo VALUES (2, 'Gerente');
INSERT INTO public.cargo VALUES (3, 'Caixa');
INSERT INTO public.cargo VALUES (4, 'Supervisor');
INSERT INTO public.cargo VALUES (5, 'Atendente');
INSERT INTO public.cargo VALUES (6, 'Repositor');
INSERT INTO public.cargo VALUES (7, 'Conferente');
INSERT INTO public.cargo VALUES (8, 'Assistente');
INSERT INTO public.cargo VALUES (9, 'Auxiliar');
INSERT INTO public.cargo VALUES (10, 'Diretor');

-- 5.3 CATEGORIA_ROUPA (ID é uma sigla de até 4 letras)
INSERT INTO public.categoria_roupa VALUES ('FEM', 'Feminino');
INSERT INTO public.categoria_roupa VALUES ('MASC', 'Masculino');
INSERT INTO public.categoria_roupa VALUES ('VER', 'Verão');
INSERT INTO public.categoria_roupa VALUES ('INV', 'Inverno');
INSERT INTO public.categoria_roupa VALUES ('INF', 'Infantil');
INSERT INTO public.categoria_roupa VALUES ('UNI', 'Unissex');
INSERT INTO public.categoria_roupa VALUES ('ESP', 'Esportivo');
INSERT INTO public.categoria_roupa VALUES ('ACE', 'Acessórios');
INSERT INTO public.categoria_roupa VALUES ('PRAI', 'Praia');
INSERT INTO public.categoria_roupa VALUES ('SOC', 'Social');

-- 5.4 CLIENTE
INSERT INTO public.cliente VALUES ('10101010101', 4500, '2024-01-10');
INSERT INTO public.cliente VALUES ('22222222222', 3200, '2024-01-02');
INSERT INTO public.cliente VALUES ('33333333333', 1800, '2024-01-03');
INSERT INTO public.cliente VALUES ('44444444444', 4000, '2024-01-04');
INSERT INTO public.cliente VALUES ('55555555555', 2100, '2024-01-05');
INSERT INTO public.cliente VALUES ('66666666666', 3500, '2024-01-06');
INSERT INTO public.cliente VALUES ('77777777777', 2700, '2024-01-07');
INSERT INTO public.cliente VALUES ('88888888888', 5000, '2024-01-08');
INSERT INTO public.cliente VALUES ('99999999999', 3800, '2024-01-09');
INSERT INTO public.cliente VALUES ('11111111111', 2500, '2024-01-01');

-- 5.5 FUNCIONARIO
INSERT INTO public.funcionario VALUES ('10101010101', 5000, 2, 15);
INSERT INTO public.funcionario VALUES ('22222222222', 3000, 2, 10);
INSERT INTO public.funcionario VALUES ('33333333333', 1500, 3, 3);
INSERT INTO public.funcionario VALUES ('44444444444', 2500, 4, 6);
INSERT INTO public.funcionario VALUES ('55555555555', 1800, 5, 4);
INSERT INTO public.funcionario VALUES ('66666666666', 1600, 6, 2);
INSERT INTO public.funcionario VALUES ('77777777777', 2200, 7, 5);
INSERT INTO public.funcionario VALUES ('88888888888', 1900, 8, 3);
INSERT INTO public.funcionario VALUES ('99999999999', 2800, 9, 7);
INSERT INTO public.funcionario VALUES ('11111111111', 1700, 1, 4);

-- 5.6 PRODUTO (os ids batem com as imagens da pasta /imagens)
INSERT INTO public.produto VALUES (2, 'Camiseta Estampada', 200, 43, 'VER', 'P', 'Branco');
INSERT INTO public.produto VALUES (3, 'Vestido Floral', 150, 89.9, 'FEM', 'M', 'Vermelho');
INSERT INTO public.produto VALUES (4, 'Blusa Casual', 80, 32, 'FEM', 'P', 'Branco');
INSERT INTO public.produto VALUES (5, 'Jaqueta Jeans', 50, 70, 'INV', 'G', 'Azul');
INSERT INTO public.produto VALUES (6, 'Blusa de Frio', 60, 45, 'INV', 'G', 'Cinza');
INSERT INTO public.produto VALUES (7, 'Shorts Esportivo', 300, 75, 'VER', 'M', 'Preto');
INSERT INTO public.produto VALUES (8, 'Camiseta Básica', 40, 60, 'MASC', 'M', 'Preto');
INSERT INTO public.produto VALUES (9, 'Calça Jeans', 30, 85, 'MASC', '42', 'Azul');
INSERT INTO public.produto VALUES (10, 'Vestido Casual', 20, 79.9, 'FEM', 'P', 'Verde');
INSERT INTO public.produto VALUES (50, 'Boné', 50, 50, 'VER', 'Único', 'Preto');


-- ============================================

