<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $usuarioId = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : 0;
    $mesAno = isset($_GET['mes_ano']) ? trim($_GET['mes_ano']) : '';

    if ($usuarioId <= 0) {
        throw new Exception("ID de usuário inválido.");
    }

    if (empty($mesAno) || !preg_match('/^\d{2}\/\d{4}$/', $mesAno)) {
        $mesAno = date('m/Y');
    }

    $sql = "SELECT r.*, u.nome AS usuario_nome, u.matricula AS usuario_matricula, u.posto_principal AS usuario_posto,
                   p.latitude AS posto_lat, p.longitude AS posto_lng
            FROM registro_ponto r
            JOIN usuarios u ON r.usuario_id = u.id
            LEFT JOIN postos p ON u.posto_principal = p.nome
            WHERE r.usuario_id = :usuario_id
              AND DATE_FORMAT(r.data, '%m/%Y') = :mes_ano
            ORDER BY r.data DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'usuario_id' => $usuarioId,
        'mes_ano' => $mesAno
    ]);
    $pontos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "sucesso" => true,
        "pontos" => $pontos
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
