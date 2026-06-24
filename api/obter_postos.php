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

try {
    // Verifica se a tabela está vazia e faz o seeding
    $stmtCount = $pdo->query("SELECT COUNT(*) FROM postos");
    if ($stmtCount->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO postos (nome, cidade, status, jornada, turno_preferencial, intrajornada, interjornada, extras, banco_horas, dsr, especial, descricao, funcionalidades, revezamento_necessario, adicional_noturno, latitude, longitude) VALUES
            ('Posto Central', 'São Paulo/SP', 'ATIVO', '8h', 'Diurno', '1h', '11h', '2h/dia', 'Sim', 'Sim', '', 'Posto Central principal de monitoramento', 'Câmeras', 'Não', 'Não', -23.561684, -46.655981),
            ('Base Leste', 'São Paulo/SP', 'ATIVO', '8h', 'Diurno', '1h', '11h', '2h/dia', 'Sim', 'Sim', '', 'Base operacional leste', 'Rádio', 'Não', 'Não', -23.541434, -46.574677),
            ('Posto Norte', 'Guarulhos/SP', 'ATIVO', '8h', 'Diurno', '1h', '11h', '2h/dia', 'Sim', 'Sim', '', 'Posto operacional norte', 'Ronda', 'Não', 'Não', -23.462778, -46.533333),
            ('Base Sul', 'Santo André/SP', 'INATIVO', '8h', 'Diurno', '1h', '11h', '2h/dia', 'Sim', 'Sim', '', 'Base operacional sul inativa', 'Inativo', 'Não', 'Não', -23.666667, -46.533333)
        ");
    }

    $stmt = $pdo->query("SELECT p.id, p.nome, p.cidade, p.status, p.jornada, p.turno_preferencial, p.intrajornada, p.interjornada, p.extras, p.banco_horas, p.dsr, p.especial, p.descricao, p.funcionalidades, p.revezamento_necessario, p.adicional_noturno, p.latitude, p.longitude, p.endereco, p.operador_responsavel_id, p.telefone_contato, u.nome AS responsavel_nome 
                         FROM postos p 
                         LEFT JOIN usuarios u ON p.operador_responsavel_id = u.id 
                         ORDER BY p.nome ASC");
    $postos = $stmt->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "postos" => $postos
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao buscar postos no banco de dados.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
