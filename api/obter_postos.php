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
    $stmt = $pdo->query("SELECT id, nome, cidade, status, jornada, turno_preferencial, intrajornada, interjornada, extras, banco_horas, dsr, especial, descricao, funcionalidades, revezamento_necessario, adicional_noturno FROM postos ORDER BY nome ASC");
    $postos = $stmt->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "postos" => $postos
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao buscar postos no banco de dados.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
