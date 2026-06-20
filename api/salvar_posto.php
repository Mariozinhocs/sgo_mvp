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
$cidade = trim($data['cidade'] ?? 'São Paulo/SP');
$status = trim($data['status'] ?? 'ATIVO');
$jornada = trim($data['jornada'] ?? '8h');
$turnoPreferencial = trim($data['turnoPreferencial'] ?? 'Diurno');
$intrajornada = trim($data['intrajornada'] ?? '1h');
$interjornada = trim($data['interjornada'] ?? '11h');
$extras = trim($data['extras'] ?? '2h/dia');
$bancoHoras = trim($data['bancoHoras'] ?? 'Sim');
$dsr = trim($data['dsr'] ?? 'Sim');
$especial = trim($data['especial'] ?? '');
$descricao = trim($data['descricao'] ?? '');
$funcionalidades = trim($data['funcionalidades'] ?? '');
$revezamentoNecessario = trim($data['revezamentoNecessario'] ?? 'Não');
$adicionalNoturno = trim($data['adicionalNoturno'] ?? 'Não');

if (empty($nome)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "O nome do posto é obrigatório."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if (!empty($id)) {
        // Mode: Update
        $sql = "UPDATE postos SET nome = :nome, cidade = :cidade, status = :status, jornada = :jornada, turno_preferencial = :turno_preferencial, intrajornada = :intrajornada, interjornada = :interjornada, extras = :extras, banco_horas = :banco_horas, dsr = :dsr, especial = :especial, descricao = :descricao, funcionalidades = :funcionalidades, revezamento_necessario = :revezamento_necessario, adicional_noturno = :adicional_noturno WHERE id = :id";
        $params = [
            'nome' => $nome,
            'cidade' => $cidade,
            'status' => $status,
            'jornada' => $jornada,
            'turno_preferencial' => $turnoPreferencial,
            'intrajornada' => $intrajornada,
            'interjornada' => $interjornada,
            'extras' => $extras,
            'banco_horas' => $bancoHoras,
            'dsr' => $dsr,
            'especial' => $especial,
            'descricao' => $descricao,
            'funcionalidades' => $funcionalidades,
            'revezamento_necessario' => $revezamentoNecessario,
            'adicional_noturno' => $adicionalNoturno,
            'id' => $id
        ];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // System Audit log
        $stmtLog = $pdo->prepare("INSERT INTO historico_logs (evento, responsavel, detalhe) VALUES (:evento, :responsavel, :detalhe)");
        $stmtLog->execute([
            'evento' => 'Atualização de Posto',
            'responsavel' => 'Gestor',
            'detalhe' => "Posto {$nome} atualizado."
        ]);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Posto atualizado com sucesso!"
        ], JSON_UNESCAPED_UNICODE);

    } else {
        // Mode: Insert
        $sql = "INSERT INTO postos (nome, cidade, status, jornada, turno_preferencial, intrajornada, interjornada, extras, banco_horas, dsr, especial, descricao, funcionalidades, revezamento_necessario, adicional_noturno) VALUES (:nome, :cidade, :status, :jornada, :turno_preferencial, :intrajornada, :interjornada, :extras, :banco_horas, :dsr, :especial, :descricao, :funcionalidades, :revezamento_necessario, :adicional_noturno)";
        $params = [
            'nome' => $nome,
            'cidade' => $cidade,
            'status' => $status,
            'jornada' => $jornada,
            'turno_preferencial' => $turnoPreferencial,
            'intrajornada' => $intrajornada,
            'interjornada' => $interjornada,
            'extras' => $extras,
            'banco_horas' => $bancoHoras,
            'dsr' => $dsr,
            'especial' => $especial,
            'descricao' => $descricao,
            'funcionalidades' => $funcionalidades,
            'revezamento_necessario' => $revezamentoNecessario,
            'adicional_noturno' => $adicionalNoturno
        ];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $novoId = $pdo->lastInsertId();

        // System Audit log
        $stmtLog = $pdo->prepare("INSERT INTO historico_logs (evento, responsavel, detalhe) VALUES (:evento, :responsavel, :detalhe)");
        $stmtLog->execute([
            'evento' => 'Cadastro de Posto',
            'responsavel' => 'Gestor',
            'detalhe' => "Novo posto {$nome} criado."
        ]);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Posto criado com sucesso!",
            "id" => $novoId
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro de servidor ao salvar posto.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
