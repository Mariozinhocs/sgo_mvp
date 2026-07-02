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

$usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : null;

if (empty($usuario_id)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "usuario_id é obrigatório."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, mes_ano, pdf_path, data_geracao FROM escalas_salvas WHERE usuario_id = :uid ORDER BY data_geracao DESC");
    $stmt->execute(['uid' => $usuario_id]);
    $escalas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "sucesso" => true,
        "escalas" => $escalas
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao buscar escalas: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
