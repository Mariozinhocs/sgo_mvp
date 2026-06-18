-- Script de Criação do Banco de Dados SGO (MVP)

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, -- Senhas salvas com hash seguro em PHP
    roles VARCHAR(100) NOT NULL, -- Papéis separados por vírgula (ex: "OPERADOR", "GESTOR", "ADMIN,GESTOR")
    posto_principal VARCHAR(100) DEFAULT 'Centro de Cooperação da Cidade',
    status VARCHAR(20) DEFAULT 'ATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS postos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'ATIVO',
    jornada VARCHAR(50) DEFAULT '8h',
    turno_preferencial VARCHAR(20) DEFAULT 'Diurno',
    intrajornada VARCHAR(20) DEFAULT '1h',
    interjornada VARCHAR(20) DEFAULT '11h',
    extras VARCHAR(50) DEFAULT '2h/dia',
    banco_horas VARCHAR(10) DEFAULT 'Sim',
    dsr VARCHAR(10) DEFAULT 'Sim',
    especial VARCHAR(50) DEFAULT '',
    descricao TEXT NULL,
    funcionalidades TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS equipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    posto_id INT NULL,
    turno VARCHAR(50) DEFAULT 'Comercial',
    lider VARCHAR(100) NULL,
    FOREIGN KEY (posto_id) REFERENCES postos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS equipe_operadores (
    equipe_id INT NOT NULL,
    usuario_id INT NOT NULL,
    PRIMARY KEY (equipe_id, usuario_id),
    FOREIGN KEY (equipe_id) REFERENCES equipes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registro_ponto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    data DATE NOT NULL,
    checkin DATETIME NULL,
    intervalo_inicio DATETIME NULL,
    intervalo_fim DATETIME NULL,
    checkout DATETIME NULL,
    lat VARCHAR(50) NULL,
    lng VARCHAR(50) NULL,
    status VARCHAR(20) DEFAULT 'INATIVO',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (usuario_id, data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS escalas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    posto_id INT NOT NULL,
    mes_ano VARCHAR(10) NOT NULL, -- Formato MM/AAAA
    operadores_total INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Rascunho', -- Rascunho, Publicada, Conflito, Sem cobertura
    assinatura VARCHAR(50) DEFAULT 'Pendente',
    FOREIGN KEY (posto_id) REFERENCES postos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS disponibilidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Disponível', -- Disponível, Folga, Férias, Indisponível
    observacao TEXT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    assunto VARCHAR(150) NOT NULL,
    corpo TEXT NOT NULL,
    anexo_path VARCHAR(255) NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS historico_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evento VARCHAR(100) NOT NULL,
    responsavel VARCHAR(100) NOT NULL,
    detalhe TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserção dos usuários mockados (Senha padrão para todos é '123' usando password_hash padrão do PHP)
-- Hash gerado de '123': $2y$10$wT0X8.3dDfg1kR/W5/vLSeQ43fWlB5sW3hWc6V0qV6oK0YmGqS20a (Pode variar, mas este é um hash válido)
INSERT INTO usuarios (nome, matricula, usuario, senha, roles) VALUES 
('User User', '00001', 'user.user', '$2y$10$tZ2cEqY/Zsz82Vw23RkKLuZ0kK5fG49WJq3W9r52g/B3vD3VvR3g2', 'OPERADOR'),
('Gestor Gestor', '90001', 'gestor.gestor', '$2y$10$tZ2cEqY/Zsz82Vw23RkKLuZ0kK5fG49WJq3W9r52g/B3vD3VvR3g2', 'GESTOR'),
('Admin Admin', '99999', 'admin.admin', '$2y$10$tZ2cEqY/Zsz82Vw23RkKLuZ0kK5fG49WJq3W9r52g/B3vD3VvR3g2', 'ADMIN,GESTOR');

-- Inserção de dados iniciais de postos para testes
INSERT INTO postos (nome, cidade, status) VALUES
('Posto Central', 'São Paulo/SP', 'ATIVO'),
('Base Leste', 'São Paulo/SP', 'ATIVO'),
('Posto Norte', 'Guarulhos/SP', 'ATIVO'),
('Base Sul', 'Santo André/SP', 'INATIVO');
