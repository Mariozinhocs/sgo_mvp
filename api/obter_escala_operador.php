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

$username = isset($_GET['usuario']) ? trim($_GET['usuario']) : '';
$mes = isset($_GET['mes']) ? trim($_GET['mes']) : '';
$ano = isset($_GET['ano']) ? trim($_GET['ano']) : '';

if (empty($username) || empty($mes) || empty($ano)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Parâmetros usuario, mes e ano são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$mesAno = StringPad($mes) . '/' . $ano;

function StringPad($str) {
    return str_pad($str, 2, '0', STR_PAD_LEFT);
}

try {
    // 1. Fetch user ID and name
    $stmtUser = $pdo->prepare("SELECT id, nome FROM usuarios WHERE usuario = :usuario LIMIT 1");
    $stmtUser->execute(['usuario' => $username]);
    $user = $stmtUser->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode([
            "sucesso" => false,
            "erro" => "Operador não encontrado."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $userId = (int)$user['id'];
    $userNome = $user['nome'];

    // 2. Fetch all published scales for that month/year
    $stmtScales = $pdo->prepare("SELECT e.escala_data, p.nome as posto_nome FROM escalas e JOIN postos p ON e.posto_id = p.id WHERE e.status = 'Publicada' AND e.mes_ano = :mes_ano");
    $stmtScales->execute(['mes_ano' => $mesAno]);
    $escalas = $stmtScales->fetchAll();

    $assignedShifts = [];

    foreach ($escalas as $esc) {
        $grid = json_decode($esc['escala_data'], true);
        if (is_array($grid)) {
            foreach ($grid as $diaStr => $alocacoes) {
                if (is_array($alocacoes)) {
                    foreach ($alocacoes as $aloc) {
                        // Match either by user ID or name or username
                        if (
                            (isset($aloc['usuario_id']) && (int)$aloc['usuario_id'] === $userId) ||
                            (isset($aloc['usuario']) && $aloc['usuario'] === $username) ||
                            (isset($aloc['nome']) && $aloc['nome'] === $userNome)
                        ) {
                            $horario = isset($aloc['horario_inicio']) && isset($aloc['horario_fim'])
                                ? "{$aloc['horario_inicio']}–{$aloc['horario_fim']}"
                                : "Turno";
                            
                            $assignedShifts[] = [
                                "dia" => (int)$diaStr,
                                "horario" => $horario,
                                "posto" => $esc['posto_nome']
                            ];
                        }
                    }
                }
            }
        }
    }

    // Sort by day ascending
    usort($assignedShifts, function($a, $b) {
        return $a['dia'] <=> $b['dia'];
    });

    echo json_encode([
        "sucesso" => true,
        "dias" => $assignedShifts
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao processar escala do operador.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
