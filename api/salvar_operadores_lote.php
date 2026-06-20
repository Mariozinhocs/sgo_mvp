<?php
require_once __DIR__ . '/../db.php';

// Permite apenas requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Método não permitido. Utilize POST."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtém corpo da requisição JSON
$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

if ($data === null) {
    $data = $_POST;
}

$ids = isset($data['ids']) ? $data['ids'] : [];
$campos = isset($data['campos']) ? $data['campos'] : [];

if (!is_array($ids) || empty($ids)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Nenhum operador selecionado para atualização."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!is_array($campos) || empty($campos)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Nenhum campo selecionado para alteração."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$allowedMap = [
    'postoPrincipal'    => 'posto_principal',
    'status'            => 'status',
    'cpf'               => 'cpf',
    'cargo'             => 'cargo',
    'hierarquia'        => 'hierarquia',
    'jornadaContratual' => 'jornada_contratual',
    'turnoAtual'        => 'turno_atual',
    'preferenciaTurno'  => 'preferencia_turno',
    'disponibilidade'   => 'disponibilidade',
    'restricoesMedicas' => 'restricoes_medicas',
    'qualificacoes'     => 'qualificacoes',
    'feriasProgramadas' => 'ferias_programadas',
    'afastamentos'      => 'afastamentos'
];

try {
    $sets = [];
    $params = [];
    
    foreach ($campos as $key => $val) {
        if (array_key_exists($key, $allowedMap)) {
            $col = $allowedMap[$key];
            $sets[] = "{$col} = :{$key}";
            $params[$key] = trim((string)$val);
        }
    }
    
    if (empty($sets)) {
        http_response_code(400);
        echo json_encode([
            "sucesso" => false,
            "erro" => "Nenhum campo válido para atualização em lote."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Bind IDs securely
    $idPlaceholderList = [];
    foreach ($ids as $idx => $idVal) {
        $paramName = "id_" . $idx;
        $idPlaceholderList[] = ":{$paramName}";
        $params[$paramName] = (int)$idVal;
    }
    
    $sql = "UPDATE usuarios SET " . implode(', ', $sets) . " WHERE id IN (" . implode(', ', $idPlaceholderList) . ")";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rowsAffected = $stmt->rowCount();
    
    // Convert field names to friendly Portuguese text for audit logs
    $friendlyFields = [];
    foreach (array_keys($campos) as $k) {
        switch ($k) {
            case 'postoPrincipal': $friendlyFields[] = 'Posto Principal'; break;
            case 'status': $friendlyFields[] = 'Status'; break;
            case 'jornadaContratual': $friendlyFields[] = 'Jornada Contratual'; break;
            case 'turnoAtual': $friendlyFields[] = 'Turno Atual'; break;
            case 'feriasProgramadas': $friendlyFields[] = 'Férias Programadas'; break;
            case 'afastamentos': $friendlyFields[] = 'Afastamentos'; break;
            case 'qualificacoes': $friendlyFields[] = 'Qualificações'; break;
            default: $friendlyFields[] = $k; break;
        }
    }
    
    $fieldsStr = implode(', ', $friendlyFields);
    
    // Add audit log
    $stmtLog = $pdo->prepare("INSERT INTO historico_logs (evento, responsavel, detalhe) VALUES (:evento, :responsavel, :detalhe)");
    $stmtLog->execute([
        'evento' => 'Edição em Lote',
        'responsavel' => 'Gestor',
        'detalhe' => "Atualização em lote de " . count($ids) . " operador(es). Campos alterados: {$fieldsStr}."
    ]);
    
    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Lote atualizado com sucesso!",
        "afetados" => $rowsAffected
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro de servidor ao processar atualização em lote.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
