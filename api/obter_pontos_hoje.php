<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Busca todos os registros de ponto do dia de hoje (data = CURDATE()) com informações do usuário
    $sql = "SELECT r.*, u.nome AS usuario_nome, u.matricula AS usuario_matricula 
            FROM registro_ponto r
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.data = CURDATE()";
            
    $stmt = $pdo->query($sql);
    $pontos = $stmt->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "pontos" => $pontos
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao buscar registros de ponto de hoje.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
