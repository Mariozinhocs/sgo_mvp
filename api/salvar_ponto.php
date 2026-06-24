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
$tipo = trim($data['tipo'] ?? ''); // checkin, intervalo_inicio, intervalo_fim, checkout
$lat = trim($data['lat'] ?? '');
$lng = trim($data['lng'] ?? '');
$foto_base64 = trim($data['foto_base64'] ?? '');

if (empty($usuario_id) || empty($tipo)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Campos usuario_id e tipo são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Mapeamento do tipo de ponto para a coluna e status correspondentes
$validTypes = ['checkin', 'intervalo_inicio', 'intervalo_fim', 'checkout'];
if (!in_array($tipo, $validTypes)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Tipo de registro inválido."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Verifica se já existe um registro para o usuário no dia de hoje
    $stmt = $pdo->prepare("SELECT id FROM registro_ponto WHERE usuario_id = :usuario_id AND data = CURDATE() LIMIT 1");
    $stmt->execute(['usuario_id' => $usuario_id]);
    $registro = $stmt->fetch();

    $status = 'INATIVO';
    if ($tipo === 'checkin' || $tipo === 'intervalo_fim') {
        $status = 'ATIVO';
    } elseif ($tipo === 'intervalo_inicio') {
        $status = 'INTERVALO';
    } elseif ($tipo === 'checkout') {
        $status = 'FINALIZADO';
    }

    if (!$registro) {
        // Cria novo registro para hoje
        if ($tipo === 'checkin') {
            $sql = "INSERT INTO registro_ponto (usuario_id, data, checkin, lat, lng, status, foto_checkin) 
                    VALUES (:usuario_id, CURDATE(), NOW(), :lat, :lng, :status, :foto)";
        } elseif ($tipo === 'intervalo_inicio') {
            $sql = "INSERT INTO registro_ponto (usuario_id, data, intervalo_inicio, status) 
                    VALUES (:usuario_id, CURDATE(), NOW(), :status)";
        } elseif ($tipo === 'intervalo_fim') {
            $sql = "INSERT INTO registro_ponto (usuario_id, data, intervalo_fim, status) 
                    VALUES (:usuario_id, CURDATE(), NOW(), :status)";
        } else { // checkout
            $sql = "INSERT INTO registro_ponto (usuario_id, data, checkout, lat, lng, status, foto_checkout) 
                    VALUES (:usuario_id, CURDATE(), NOW(), :lat, :lng, :status, :foto)";
        }

        $params = ['usuario_id' => $usuario_id];
        if ($tipo === 'checkin' || $tipo === 'checkout') {
            $params['lat'] = $lat ?: null;
            $params['lng'] = $lng ?: null;
            $params['foto'] = $foto_base64 ?: null;
        }
        $params['status'] = $status;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    } else {
        // Atualiza registro existente
        $registro_id = (int)$registro['id'];
        
        if ($tipo === 'checkin') {
            $sql = "UPDATE registro_ponto SET checkin = NOW(), lat = :lat, lng = :lng, status = :status, foto_checkin = :foto WHERE id = :id";
        } elseif ($tipo === 'intervalo_inicio') {
            $sql = "UPDATE registro_ponto SET intervalo_inicio = NOW(), status = :status WHERE id = :id";
        } elseif ($tipo === 'intervalo_fim') {
            $sql = "UPDATE registro_ponto SET intervalo_fim = NOW(), status = :status WHERE id = :id";
        } else { // checkout
            $sql = "UPDATE registro_ponto SET checkout = NOW(), lat = :lat, lng = :lng, status = :status, foto_checkout = :foto WHERE id = :id";
        }

        $params = ['id' => $registro_id, 'status' => $status];
        if ($tipo === 'checkin' || $tipo === 'checkout') {
            $params['lat'] = $lat ?: null;
            $params['lng'] = $lng ?: null;
            $params['foto'] = $foto_base64 ?: null;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Ponto registrado com sucesso!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao salvar registro de ponto.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
