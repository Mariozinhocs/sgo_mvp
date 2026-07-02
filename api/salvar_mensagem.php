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

function getTimezoneForLatLng($lat, $lng) {
    $lat = (float)$lat;
    $lng = (float)$lng;
    
    if (empty($lat) || empty($lng)) {
        return 'America/Sao_Paulo';
    }
    
    // Fernando de Noronha (UTC-2)
    if ($lng > -34.5) {
        return 'America/Noronha';
    }
    
    // Acre e Extremo Oeste do Amazonas (UTC-5)
    if ($lng < -70.0) {
        return 'America/Rio_Branco';
    }
    
    // Central/Norte (UTC-4: MS, MT, RO, RR, maioria do AM)
    if ($lng < -54.0) {
        return 'America/Manaus';
    }
    
    // Leste/Sudeste/Nordeste (UTC-3: Padrão Brasília/SP)
    return 'America/Sao_Paulo';
}

$remetente_id = isset($data['remetente_id']) ? (int)$data['remetente_id'] : null;
$tipo_destinatario = trim($data['tipo_destinatario'] ?? 'INDIVIDUAL');
$destinatario_id = isset($data['destinatario_id']) && $data['destinatario_id'] !== '' ? (int)$data['destinatario_id'] : null;
$posto_id = isset($data['posto_id']) && $data['posto_id'] !== '' ? (int)$data['posto_id'] : null;
$equipe_id = isset($data['equipe_id']) && $data['equipe_id'] !== '' ? (int)$data['equipe_id'] : null;
$assunto = trim($data['assunto'] ?? '');
$corpo = trim($data['corpo'] ?? '');
$anexo_base64 = trim($data['anexo_base64'] ?? '');
$lat = isset($data['latitude']) && $data['latitude'] !== '' ? (float)$data['latitude'] : null;
$lng = isset($data['longitude']) && $data['longitude'] !== '' ? (float)$data['longitude'] : null;

if (empty($remetente_id) || empty($assunto) || empty($corpo)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Remetente, assunto e corpo da mensagem são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 1. Obter nome de usuário para compor o nome do arquivo de anexo
$username = 'usuario';
if ($remetente_id) {
    $stmtUser = $pdo->prepare("SELECT usuario FROM usuarios WHERE id = :id");
    $stmtUser->execute(['id' => $remetente_id]);
    $userRow = $stmtUser->fetch(PDO::FETCH_ASSOC);
    if ($userRow && !empty($userRow['usuario'])) {
        $username = $userRow['usuario'];
    }
}

// Limpar caracteres indesejados no nome de usuário
$cleanUsername = str_replace('.', '-', $username);
$cleanUsername = preg_replace('/[^a-zA-Z0-9\-]/', '', $cleanUsername);

// 2. Processar anexo se houver
$dbPath = null;
if (!empty($anexo_base64)) {
    // Detectar extensão da imagem
    $extension = 'jpg';
    if (preg_match('/^data:image\/(\w+);base64,/', $anexo_base64, $typeMatch)) {
        $ext = strtolower($typeMatch[1]);
        if (in_array($ext, ['jpeg', 'jpg', 'png', 'webp', 'gif'])) {
            $extension = $ext === 'jpeg' ? 'jpg' : $ext;
        }
    }
    
    // Limpar prefixo base64 se presente
    if (strpos($anexo_base64, 'data:') === 0) {
        $parts = explode(',', $anexo_base64);
        $anexo_base64 = end($parts);
    }
    
    $imgBinary = base64_decode($anexo_base64);
    if ($imgBinary !== false) {
        $uploadDir = __DIR__ . '/../uploads/mensagens';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Obter data no fuso correto (Brasília por padrão ou local)
        $tzName = getTimezoneForLatLng($lat, $lng);
        $dtObj = new DateTime("now", new DateTimeZone($tzName));
        $dateStr = $dtObj->format('Ymd_Hi');
        
        // Padrão solicitado: user-user_20260702_0020.jpg
        $baseName = $cleanUsername . '_' . $dateStr;
        $fileName = $baseName . '.' . $extension;
        $filePath = $uploadDir . '/' . $fileName;
        
        // Prevenir sobrescrita caso enviem múltiplas fotos no mesmo minuto
        $counter = 1;
        while (file_exists($filePath)) {
            $fileName = $baseName . '_' . $counter . '.' . $extension;
            $filePath = $uploadDir . '/' . $fileName;
            $counter++;
        }
        
        if (file_put_contents($filePath, $imgBinary) !== false) {
            $dbPath = 'uploads/mensagens/' . $fileName;
        }
    }
}

try {
    $tzName = getTimezoneForLatLng($lat, $lng);
    $dt = new DateTime("now", new DateTimeZone($tzName));
    $data_envio = $dt->format("Y-m-d H:i:s");

    $sql = "INSERT INTO mensagens (remetente_id, tipo_destinatario, destinatario_id, posto_id, equipe_id, assunto, corpo, anexo_path, data_envio, latitude, longitude)
            VALUES (:remetente_id, :tipo_destinatario, :destinatario_id, :posto_id, :equipe_id, :assunto, :corpo, :anexo_path, :data_envio, :lat, :lng)";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'remetente_id' => $remetente_id,
        'tipo_destinatario' => $tipo_destinatario,
        'destinatario_id' => $destinatario_id,
        'posto_id' => $posto_id,
        'equipe_id' => $equipe_id,
        'assunto' => $assunto,
        'corpo' => $corpo,
        'anexo_path' => $dbPath,
        'data_envio' => $data_envio,
        'lat' => $lat,
        'lng' => $lng
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
