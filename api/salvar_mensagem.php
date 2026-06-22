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

$remetente_id = isset($data['remetente_id']) ? (int)$data['remetente_id'] : null;
$tipo_destinatario = trim($data['tipo_destinatario'] ?? 'INDIVIDUAL'); // INDIVIDUAL, POSTO, EQUIPE, GLOBAL
$destinatario_id = isset($data['destinatario_id']) && $data['destinatario_id'] !== '' ? (int)$data['destinatario_id'] : null;
$posto_id = isset($data['posto_id']) && $data['posto_id'] !== '' ? (int)$data['posto_id'] : null;
$equipe_id = isset($data['equipe_id']) && $data['equipe_id'] !== '' ? (int)$data['equipe_id'] : null;
$assunto = trim($data['assunto'] ?? '');
$corpo = trim($data['corpo'] ?? '');
$anexo_base64 = trim($data['anexo_base64'] ?? '');

if (empty($remetente_id) || empty($assunto) || empty($corpo)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Remetente, assunto e corpo da mensagem são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $sql = "INSERT INTO mensagens (remetente_id, tipo_destinatario, destinatario_id, posto_id, equipe_id, assunto, corpo, anexo_path)
            VALUES (:remetente_id, :tipo_destinatario, :destinatario_id, :posto_id, :equipe_id, :assunto, :corpo, :anexo_path)";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'remetente_id' => $remetente_id,
        'tipo_destinatario' => $tipo_destinatario,
        'destinatario_id' => $destinatario_id,
        'posto_id' => $posto_id,
        'equipe_id' => $equipe_id,
        'assunto' => $assunto,
        'corpo' => $corpo,
        'anexo_path' => $anexo_base64 ?: null
    ]);
    
    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Mensagem enviada com sucesso!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao salvar mensagem no banco de dados.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
