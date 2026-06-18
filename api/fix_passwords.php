<?php
// Script temporário para corrigir os hashes das senhas no banco de dados
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Hash bcrypt correto da senha '123'
    $hashCorreto = '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZgG236nCgD.x3Y11G450Cq9k99n2q';
    
    // Atualiza todos os usuários para usarem este hash
    $stmt = $pdo->prepare("UPDATE usuarios SET senha = :senha");
    $stmt->execute(['senha' => $hashCorreto]);
    
    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Senhas atualizadas com sucesso para '123' no banco de dados!"
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao atualizar o banco de dados.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
