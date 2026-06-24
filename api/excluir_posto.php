<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["sucesso" => false, "erro" => "Método não permitido."]);
    exit;
}

$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);
$id = isset($data['id']) ? (int)$data['id'] : null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "erro" => "ID do posto é obrigatório."]);
    exit;
}

try {
    // Primeiro, verifica se o posto existe
    $stmtCheck = $pdo->prepare("SELECT nome FROM postos WHERE id = :id");
    $stmtCheck->execute(['id' => $id]);
    $posto = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$posto) {
        echo json_encode(["sucesso" => false, "erro" => "Posto não encontrado."]);
        exit;
    }

    $nomePosto = $posto['nome'];

    // Deleta o posto
    $stmt = $pdo->prepare("DELETE FROM postos WHERE id = :id");
    $stmt->execute(['id' => $id]);

    // Log the deletion
    $stmtLog = $pdo->prepare("INSERT INTO historico_logs (evento, responsavel, detalhe) VALUES (:evento, :responsavel, :detalhe)");
    $stmtLog->execute([
        'evento' => 'Exclusão de Posto',
        'responsavel' => 'Gestor',
        'detalhe' => "Posto {$nomePosto} (ID: {$id}) foi excluído do sistema."
    ]);

    echo json_encode(["sucesso" => true, "mensagem" => "Posto excluído com sucesso!"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro de servidor ao excluir posto.",
        "detalhe" => $e->getMessage()
    ]);
}
