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

$id = isset($data['id']) ? (int)$data['id'] : null;
$nome = trim($data['nome'] ?? '');
$posto_id = isset($data['posto_id']) && $data['posto_id'] !== '' ? (int)$data['posto_id'] : null;
$turno = trim($data['turno'] ?? 'Comercial');
$lider = trim($data['lider'] ?? '');

if (empty($nome)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "O nome da equipe é obrigatório."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if (!empty($id)) {
        // Modo: Atualizar
        $sql = "UPDATE equipes SET nome = :nome, posto_id = :posto_id, turno = :turno, lider = :lider WHERE id = :id";
        $params = [
            'nome' => $nome,
            'posto_id' => $posto_id,
            'turno' => $turno,
            'lider' => $lider,
            'id' => $id
        ];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Registro de Auditoria
        $stmtLog = $pdo->prepare("INSERT INTO historico_logs (evento, responsavel, detalhe) VALUES (:evento, :responsavel, :detalhe)");
        $stmtLog->execute([
            'evento' => 'Atualização de Equipe',
            'responsavel' => 'Gestor',
            'detalhe' => "Equipe {$nome} atualizada."
        ]);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Equipe atualizada com sucesso!"
        ], JSON_UNESCAPED_UNICODE);

    } else {
        // Modo: Inserir
        $sql = "INSERT INTO equipes (nome, posto_id, turno, lider) VALUES (:nome, :posto_id, :turno, :lider)";
        $params = [
            'nome' => $nome,
            'posto_id' => $posto_id,
            'turno' => $turno,
            'lider' => $lider
        ];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $novoId = $pdo->lastInsertId();

        // Registro de Auditoria
        $stmtLog = $pdo->prepare("INSERT INTO historico_logs (evento, responsavel, detalhe) VALUES (:evento, :responsavel, :detalhe)");
        $stmtLog->execute([
            'evento' => 'Cadastro de Equipe',
            'responsavel' => 'Gestor',
            'detalhe' => "Nova equipe {$nome} criada."
        ]);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Equipe criada com sucesso!",
            "id" => $novoId
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro de servidor ao salvar equipe.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
