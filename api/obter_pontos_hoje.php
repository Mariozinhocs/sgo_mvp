<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $clientDate = isset($_GET['data']) ? trim($_GET['data']) : '';
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $clientDate)) {
        // Fallback to Server timezone date
        $clientDate = date('Y-m-d');
    }

    // Busca todos os registros de ponto do dia (data = :client_date) com informações do usuário
    $sql = "SELECT r.*, u.nome AS usuario_nome, u.matricula AS usuario_matricula, u.posto_principal AS usuario_posto 
            FROM registro_ponto r
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.data = :client_date";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['client_date' => $clientDate]);
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
