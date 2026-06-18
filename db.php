<?php
require_once __DIR__ . '/db_config.php';

// Configura o cabeçalho padrão para comunicação via JSON
header('Content-Type: application/json; charset=utf-8');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // Retorna erro HTTP 500 caso ocorra falha na conexão
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Falha ao conectar com o banco de dados.",
        "detalhe" => $e->getMessage() // Útil em ambiente de desenvolvimento/staging
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
