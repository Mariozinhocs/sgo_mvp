<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

function getTimezoneForLatLng($lat, $lng) {
    $lat = (float)$lat;
    $lng = (float)$lng;
    
    if (empty($lat) || empty($lng)) {
        return null;
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

function getTimezoneForCity($cidade) {
    $cidade = strtolower(trim($cidade));
    if (empty($cidade)) {
        return 'America/Sao_Paulo';
    }
    
    if (strpos($cidade, '/am') !== false || strpos($cidade, 'manaus') !== false) {
        return 'America/Manaus';
    }
    if (strpos($cidade, '/ac') !== false || strpos($cidade, 'rio branco') !== false) {
        return 'America/Rio_Branco';
    }
    if (strpos($cidade, '/ro') !== false || strpos($cidade, 'porto velho') !== false) {
        return 'America/Porto_Velho';
    }
    if (strpos($cidade, '/rr') !== false || strpos($cidade, 'boa vista') !== false) {
        return 'America/Boa_Vista';
    }
    if (strpos($cidade, '/ms') !== false || strpos($cidade, 'campo grande') !== false) {
        return 'America/Campo_Grande';
    }
    if (strpos($cidade, '/mt') !== false || strpos($cidade, 'cuiaba') !== false || strpos($cidade, 'cuiabá') !== false) {
        return 'America/Cuiaba';
    }
    if (strpos($cidade, 'noronha') !== false) {
        return 'America/Noronha';
    }
    
    return 'America/Sao_Paulo';
}

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
    // 1. Obter posto e cidade principal do usuário para fallback de timezone
    $stmtUser = $pdo->prepare("SELECT u.posto_principal, p.cidade 
                               FROM usuarios u 
                               LEFT JOIN postos p ON u.posto_principal = p.nome 
                               WHERE u.id = :usuario_id LIMIT 1");
    $stmtUser->execute(['usuario_id' => $usuario_id]);
    $user = $stmtUser->fetch();
    $cidade = ($user && !empty($user['cidade'])) ? $user['cidade'] : '';

    // 2. Determinar fuso horário correto baseado nas coordenadas ou no posto
    $timezoneName = 'America/Sao_Paulo';
    $geoTimezone = getTimezoneForLatLng($lat, $lng);
    if ($geoTimezone) {
        $timezoneName = $geoTimezone;
    } else if (!empty($cidade)) {
        $timezoneName = getTimezoneForCity($cidade);
    }

    $tz = new DateTimeZone($timezoneName);
    $now = new DateTime('now', $tz);
    $localDate = $now->format('Y-m-d');
    $localDateTime = $now->format('Y-m-d H:i:s');

    // Verifica se já existe um registro para o usuário no dia de hoje (no fuso local do operador)
    $stmt = $pdo->prepare("SELECT id FROM registro_ponto WHERE usuario_id = :usuario_id AND data = :local_date LIMIT 1");
    $stmt->execute(['usuario_id' => $usuario_id, 'local_date' => $localDate]);
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
                    VALUES (:usuario_id, :local_date, :local_datetime, :lat, :lng, :status, :foto)";
        } elseif ($tipo === 'intervalo_inicio') {
            $sql = "INSERT INTO registro_ponto (usuario_id, data, intervalo_inicio, status) 
                    VALUES (:usuario_id, :local_date, :local_datetime, :status)";
        } elseif ($tipo === 'intervalo_fim') {
            $sql = "INSERT INTO registro_ponto (usuario_id, data, intervalo_fim, status) 
                    VALUES (:usuario_id, :local_date, :local_datetime, :status)";
        } else { // checkout
            $sql = "INSERT INTO registro_ponto (usuario_id, data, checkout, lat, lng, status, foto_checkout) 
                    VALUES (:usuario_id, :local_date, :local_datetime, :lat, :lng, :status, :foto)";
        }

        $params = [
            'usuario_id' => $usuario_id,
            'local_date' => $localDate,
            'local_datetime' => $localDateTime
        ];
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
            $sql = "UPDATE registro_ponto SET checkin = :local_datetime, lat = :lat, lng = :lng, status = :status, foto_checkin = :foto WHERE id = :id";
        } elseif ($tipo === 'intervalo_inicio') {
            $sql = "UPDATE registro_ponto SET intervalo_inicio = :local_datetime, status = :status WHERE id = :id";
        } elseif ($tipo === 'intervalo_fim') {
            $sql = "UPDATE registro_ponto SET intervalo_fim = :local_datetime, status = :status WHERE id = :id";
        } else { // checkout
            $sql = "UPDATE registro_ponto SET checkout = :local_datetime, lat = :lat, lng = :lng, status = :status, foto_checkout = :foto WHERE id = :id";
        }

        $params = [
            'id' => $registro_id, 
            'status' => $status,
            'local_datetime' => $localDateTime
        ];
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
