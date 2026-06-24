<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

$username = isset($_GET['usuario']) ? trim($_GET['usuario']) : '';

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

try {
    $timezoneName = 'America/Sao_Paulo';
    $postoNome = '';
    $cidade = '';

    $lat = isset($_GET['lat']) ? trim($_GET['lat']) : '';
    $lng = isset($_GET['lng']) ? trim($_GET['lng']) : '';
    
    $geoTimezone = getTimezoneForLatLng($lat, $lng);
    
    if ($geoTimezone) {
        $timezoneName = $geoTimezone;
        if (!empty($username)) {
            // 1. Obter posto para contexto informativo
            $stmtUser = $pdo->prepare("SELECT posto_principal FROM usuarios WHERE usuario = :usuario LIMIT 1");
            $stmtUser->execute(['usuario' => $username]);
            $user = $stmtUser->fetch();
            if ($user && !empty($user['posto_principal'])) {
                $postoNome = $user['posto_principal'];
            }
        }
    } else if (!empty($username)) {
        // 1. Get user's principal post name
        $stmtUser = $pdo->prepare("SELECT posto_principal FROM usuarios WHERE usuario = :usuario LIMIT 1");
        $stmtUser->execute(['usuario' => $username]);
        $user = $stmtUser->fetch();
        
        if ($user && !empty($user['posto_principal'])) {
            $postoNome = $user['posto_principal'];
            
            // 2. Get city of the post
            $stmtPosto = $pdo->prepare("SELECT cidade FROM postos WHERE nome = :posto LIMIT 1");
            $stmtPosto->execute(['posto' => $postoNome]);
            $posto = $stmtPosto->fetch();
            
            if ($posto && !empty($posto['cidade'])) {
                $cidade = $posto['cidade'];
                $timezoneName = getTimezoneForCity($cidade);
            }
        }
    }

    $tz = new DateTimeZone($timezoneName);
    $now = new DateTime('now', $tz);

    echo json_encode([
        "sucesso" => true,
        "usuario" => $username,
        "posto" => $postoNome,
        "cidade" => $cidade ?: 'São Paulo/SP',
        "timezone" => $timezoneName,
        "data" => $now->format('Y-m-d'),
        "hora" => $now->format('H:i:s'),
        "timestamp" => $now->getTimestamp()
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao obter horário do servidor.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
