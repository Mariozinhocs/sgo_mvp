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

$postoId = isset($_GET['posto_id']) && $_GET['posto_id'] !== '' ? (int)$_GET['posto_id'] : null;
$mesAno = isset($_GET['mes_ano']) ? trim($_GET['mes_ano']) : '';

if (empty($postoId)) {
    try {
        $stmt = $pdo->query("SELECT e.id, p.nome as posto, e.mes_ano as mesAno, e.operadores_total as operadores, e.status, e.assinatura FROM escalas e JOIN postos p ON e.posto_id = p.id ORDER BY e.mes_ano DESC, p.nome ASC");
        $lista = $stmt->fetchAll();
        echo json_encode([
            "sucesso" => true,
            "lista" => $lista
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "sucesso" => false,
            "erro" => "Erro de servidor ao buscar lista de escalas.",
            "detalhe" => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (empty($mesAno)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Parâmetro mes_ano é obrigatório."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, posto_id, mes_ano, operadores_total, status, assinatura, escala_data FROM escalas WHERE posto_id = :posto_id AND mes_ano = :mes_ano LIMIT 1");
    $stmt->execute([
        'posto_id' => $postoId,
        'mes_ano' => $mesAno
    ]);
    $escala = $stmt->fetch();

    if ($escala) {
        // Retorna a escala existente
        echo json_encode([
            "sucesso" => true,
            "existe" => true,
            "escala" => [
                "id" => (int)$escala['id'],
                "posto_id" => (int)$escala['posto_id'],
                "mes_ano" => $escala['mes_ano'],
                "operadores_total" => (int)$escala['operadores_total'],
                "status" => $escala['status'],
                "assinatura" => $escala['assinatura'],
                "escala_data" => $escala['escala_data'] ? json_decode($escala['escala_data'], true) : new stdClass()
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        // Retorna que não existe para que a interface inicialize uma vazia
        echo json_encode([
            "sucesso" => true,
            "existe" => false,
            "escala" => null
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro de servidor ao buscar escala.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
