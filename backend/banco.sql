CREATE DATABASE IF NOT EXISTS sus_comunidade;

USE sus_comunidade;

CREATE TABLE IF NOT EXISTS unidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    telefone VARCHAR(30),
    atende_24h BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS informacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unidade_id INT NOT NULL,
    medicamentos VARCHAR(50),
    consultas VARCHAR(50),
    movimento VARCHAR(50),
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unidade_id) REFERENCES unidades(id)
);

INSERT INTO unidades
(nome, tipo, endereco, bairro, telefone, atende_24h)
VALUES
(
    'UBS Jardim Esperança',
    'UBS',
    'Rua das Flores, 100',
    'Jardim Esperança',
    '(11) 1111-1111',
    FALSE
),
(
    'UPA Central',
    'UPA',
    'Av. Brasil, 500',
    'Centro',
    '(11) 2222-2222',
    TRUE
);

INSERT INTO informacoes
(unidade_id, medicamentos, consultas, movimento)
VALUES
(
    1,
    'Disponível',
    'Com atendimento',
    'Médio'
),
(
    2,
    'Indisponível',
    'Com atendimento',
    'Alto'
);