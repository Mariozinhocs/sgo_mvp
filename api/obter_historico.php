<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Método não permitido. Utilize GET."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->query("SELECT DATE_FORMAT(data_hora, '%d/%m/%Y %H:%i') as dt, evento, responsavel as resp, detalhe as det FROM historico_logs ORDER BY data_hora DESC LIMIT 100");
    $historico = $stmt->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "historico" => $historico
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao buscar histórico no banco de dados.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
