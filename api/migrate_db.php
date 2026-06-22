<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

$logs = [];
$success = true;

function runQuery($pdo, $sql, &$logs, &$success) {
    try {
        $pdo->exec($sql);
        $logs[] = "SUCESSO: " . substr(preg_replace('/\s+/', ' ', $sql), 0, 80) . "...";
    } catch (PDOException $e) {
        // Ignora erro se a coluna/tabela já existir
        // Código 42S21 (Duplicate column name) ou similar
        if (strpos($e->getMessage(), 'Duplicate column') !== false || strpos($e->getMessage(), 'already exists') !== false) {
            $logs[] = "IGNORADO (já existe): " . substr(preg_replace('/\s+/', ' ', $sql), 0, 80) . "...";
        } else {
            $success = false;
            $logs[] = "ERRO: " . $e->getMessage() . " em [" . $sql . "]";
        }
    }
}

// 1. Alterar tabela de usuários para adicionar novas características
$alterUsuarios = [
    "ALTER TABLE usuarios ADD COLUMN cpf VARCHAR(15) NULL",
    "ALTER TABLE usuarios ADD COLUMN cargo VARCHAR(100) NULL",
    "ALTER TABLE usuarios ADD COLUMN hierarquia VARCHAR(100) NULL",
    "ALTER TABLE usuarios ADD COLUMN jornada_contratual VARCHAR(100) NULL",
    "ALTER TABLE usuarios ADD COLUMN turno_atual VARCHAR(100) NULL",
    "ALTER TABLE usuarios ADD COLUMN preferencia_turno VARCHAR(100) NULL",
    "ALTER TABLE usuarios ADD COLUMN disponibilidade TEXT NULL",
    "ALTER TABLE usuarios ADD COLUMN restricoes_medicas TEXT NULL",
    "ALTER TABLE usuarios ADD COLUMN qualificacoes TEXT NULL",
    "ALTER TABLE usuarios ADD COLUMN ferias_programadas VARCHAR(100) NULL",
    "ALTER TABLE usuarios ADD COLUMN afastamentos VARCHAR(100) NULL",
    "ALTER TABLE usuarios ADD COLUMN foto_perfil LONGTEXT NULL",
    "ALTER TABLE usuarios ADD COLUMN scope_type VARCHAR(50) DEFAULT 'GLOBAL'",
    "ALTER TABLE usuarios ADD COLUMN scope_value VARCHAR(100) DEFAULT NULL"
];

foreach ($alterUsuarios as $sql) {
    runQuery($pdo, $sql, $logs, $success);
}

// 2. Alterar tabela de postos para adicionar características customizadas
$alterPostos = [
    "ALTER TABLE postos ADD COLUMN revezamento_necessario VARCHAR(10) DEFAULT 'Não'",
    "ALTER TABLE postos ADD COLUMN adicional_noturno VARCHAR(10) DEFAULT 'Não'"
];

foreach ($alterPostos as $sql) {
    runQuery($pdo, $sql, $logs, $success);
}

// 3. Alterar tabela de escalas para adicionar escala_data
$alterEscalas = [
    "ALTER TABLE escalas ADD COLUMN escala_data LONGTEXT NULL"
];

foreach ($alterEscalas as $sql) {
    runQuery($pdo, $sql, $logs, $success);
}

// 4. Alterar tabela de mensagens para adicionar destinatários
$alterMensagens = [
    "ALTER TABLE mensagens ADD COLUMN destinatario_id INT NULL",
    "ALTER TABLE mensagens ADD COLUMN posto_id INT NULL",
    "ALTER TABLE mensagens ADD COLUMN equipe_id INT NULL",
    "ALTER TABLE mensagens ADD COLUMN tipo_destinatario VARCHAR(20) DEFAULT 'INDIVIDUAL'"
];

foreach ($alterMensagens as $sql) {
    runQuery($pdo, $sql, $logs, $success);
}

// 5. Criar tabelas equipes e equipe_operadores se não existirem
$createTables = [
    "CREATE TABLE IF NOT EXISTS equipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        posto_id INT NULL,
        turno VARCHAR(50) DEFAULT 'Comercial',
        lider VARCHAR(100) NULL,
        FOREIGN KEY (posto_id) REFERENCES postos(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    
    "CREATE TABLE IF NOT EXISTS equipe_operadores (
        equipe_id INT NOT NULL,
        usuario_id INT NOT NULL,
        PRIMARY KEY (equipe_id, usuario_id),
        FOREIGN KEY (equipe_id) REFERENCES equipes(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
];

foreach ($createTables as $sql) {
    runQuery($pdo, $sql, $logs, $success);
}

echo json_encode([
    "sucesso" => $success,
    "logs" => $logs
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

