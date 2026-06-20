<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Método não permitido. Utilize POST."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

if ($data === null) {
    $data = $_POST;
}

$postoId = isset($data['posto_id']) ? (int)$data['posto_id'] : null;
$mesAno = isset($data['mes_ano']) ? trim($data['mes_ano']) : '';
$operadoresTotal = isset($data['operadores_total']) ? (int)$data['operadores_total'] : 0;
$status = isset($data['status']) ? trim($data['status']) : 'Rascunho';
$assinatura = isset($data['assinatura']) ? trim($data['assinatura']) : 'Pendente';
$escalaData = isset($data['escala_data']) ? $data['escala_data'] : null;

if (empty($postoId) || empty($mesAno)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Campos posto_id e mes_ano são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Convert escala_data to JSON string
$escalaDataJson = null;
if ($escalaData !== null) {
    $escalaDataJson = json_encode($escalaData, JSON_UNESCAPED_UNICODE);
}

try {
    // 1. Fetch Post details for logging
    $stmtPosto = $pdo->prepare("SELECT nome FROM postos WHERE id = :id LIMIT 1");
    $stmtPosto->execute(['id' => $postoId]);
    $posto = $stmtPosto->fetch();
    $postoNome = $posto ? $posto['nome'] : "Posto #{$postoId}";

    // 2. Check if scale already exists for this post and month/year
    $stmtCheck = $pdo->prepare("SELECT id FROM escalas WHERE posto_id = :posto_id AND mes_ano = :mes_ano LIMIT 1");
    $stmtCheck->execute([
        'posto_id' => $postoId,
        'mes_ano' => $mesAno
    ]);
    $existing = $stmtCheck->fetch();

    if ($existing) {
        // Update existing scale
        $sql = "UPDATE escalas SET operadores_total = :operadores_total, status = :status, assinatura = :assinatura, escala_data = :escala_data WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'operadores_total' => $operadoresTotal,
            'status' => $status,
            'assinatura' => $assinatura,
            'escala_data' => $escalaDataJson,
            'id' => (int)$existing['id']
        ]);
        $escalaId = (int)$existing['id'];
        $mensagem = "Escala atualizada com sucesso!";
    } else {
        // Insert new scale
        $sql = "INSERT INTO escalas (posto_id, mes_ano, operadores_total, status, assinatura, escala_data) VALUES (:posto_id, :mes_ano, :operadores_total, :status, :assinatura, :escala_data)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'posto_id' => $postoId,
            'mes_ano' => $mesAno,
            'operadores_total' => $operadoresTotal,
            'status' => $status,
            'assinatura' => $assinatura,
            'escala_data' => $escalaDataJson
        ]);
        $escalaId = (int)$pdo->lastInsertId();
        $mensagem = "Escala criada com sucesso!";
    }

    // 3. Log the change in system audit logs
    $stmtLog = $pdo->prepare("INSERT INTO historico_logs (evento, responsavel, detalhe) VALUES (:evento, :responsavel, :detalhe)");
    $stmtLog->execute([
        'evento' => ($status === 'Publicada') ? 'Escala publicada' : 'Escala salva',
        'responsavel' => 'Gestor',
        'detalhe' => "Escala do posto {$postoNome} para o período {$mesAno} foi salva/atualizada como [{$status}]."
    ]);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => $mensagem,
        "id" => $escalaId
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro de servidor ao salvar escala.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
