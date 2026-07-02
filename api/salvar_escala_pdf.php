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

$usuario_id = isset($data['usuario_id']) ? (int)$data['usuario_id'] : null;
$mes_ano = isset($data['mes_ano']) ? trim($data['mes_ano']) : '';
$pdf_base64 = isset($data['pdf_base64']) ? trim($data['pdf_base64']) : '';

if (empty($usuario_id) || empty($mes_ano) || empty($pdf_base64)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "usuario_id, mes_ano e pdf_base64 são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Limpar caracteres estranhos e decodificar base64
// O base64 enviado pode conter o prefixo: "data:application/pdf;base64,"
if (strpos($pdf_base64, 'data:') === 0) {
    $parts = explode(',', $pdf_base64);
    $pdf_base64 = end($parts);
}

$pdf_data = base64_decode($pdf_base64);
if ($pdf_data === false) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Base64 do PDF inválido."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Verificar se usuário existe
    $stmtUser = $pdo->prepare("SELECT id FROM usuarios WHERE id = :id");
    $stmtUser->execute(['id' => $usuario_id]);
    if (!$stmtUser->fetch()) {
        http_response_code(404);
        echo json_encode([
            "sucesso" => false,
            "erro" => "Usuário não encontrado."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Criar diretório de uploads se não existir
    $uploadDir = __DIR__ . '/../uploads/escalas';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Gerar caminho e nome de arquivo limpo
    $clean_mes_ano = str_replace('/', '_', $mes_ano);
    $fileName = 'escala_' . $usuario_id . '_' . $clean_mes_ano . '.pdf';
    $filePath = $uploadDir . '/' . $fileName;

    // Salvar o arquivo PDF no servidor
    if (file_put_contents($filePath, $pdf_data) === false) {
        throw new Exception("Falha ao escrever arquivo no servidor.");
    }

    // Caminho relativo para salvar no banco de dados
    $dbPath = 'uploads/escalas/' . $fileName;

    // Verificar se já existe escala salva para o mês/ano desse usuário
    $stmtCheck = $pdo->prepare("SELECT id FROM escalas_salvas WHERE usuario_id = :uid AND mes_ano = :ma");
    $stmtCheck->execute([
        'uid' => $usuario_id,
        'ma' => $mes_ano
    ]);
    $existing = $stmtCheck->fetch();

    if ($existing) {
        // Atualizar
        $stmtUpdate = $pdo->prepare("UPDATE escalas_salvas SET pdf_path = :path, data_geracao = CURRENT_TIMESTAMP WHERE id = :id");
        $stmtUpdate->execute([
            'path' => $dbPath,
            'id' => $existing['id']
        ]);
    } else {
        // Inserir
        $stmtInsert = $pdo->prepare("INSERT INTO escalas_salvas (usuario_id, mes_ano, pdf_path) VALUES (:uid, :ma, :path)");
        $stmtInsert->execute([
            'uid' => $usuario_id,
            'ma' => $mes_ano,
            'path' => $dbPath
        ]);
    }

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "PDF da escala salvo com sucesso!",
        "pdf_path" => $dbPath
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao salvar a escala: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
