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
    // Verificar se a tabela equipes está vazia
    $countStmt = $pdo->query("SELECT COUNT(*) FROM equipes");
    $count = $countStmt->fetchColumn();

    if ($count == 0) {
        // Mapear postos existentes para resolver posto_id a partir do nome
        $postosStmt = $pdo->query("SELECT id, nome FROM postos");
        $postosMap = [];
        while ($row = $postosStmt->fetch()) {
            $postosMap[$row['nome']] = $row['id'];
        }

        // Equipes padrão mockadas
        $seedTeams = [
            ['nome' => 'Equipe Alfa', 'posto' => 'Posto Central', 'turno' => 'Dia', 'lider' => 'Ana Silva'],
            ['nome' => 'Equipe Bravo', 'posto' => 'Posto Central', 'turno' => 'Noite', 'lider' => 'Bruno Costa'],
            ['nome' => 'Equipe Leste 01', 'posto' => 'Base Leste', 'turno' => 'Comercial', 'lider' => 'João Pedro'],
            ['nome' => 'Equipe Leste 02', 'posto' => 'Base Leste', 'turno' => 'Noite', 'lider' => 'Marina Costa'],
            ['nome' => 'Equipe Norte 01', 'posto' => 'Posto Norte', 'turno' => '12x36', 'lider' => 'Ursula Mendes']
        ];

        $insertStmt = $pdo->prepare("INSERT INTO equipes (nome, posto_id, turno, lider) VALUES (:nome, :posto_id, :turno, :lider)");
        foreach ($seedTeams as $team) {
            $postoId = isset($postosMap[$team['posto']]) ? $postosMap[$team['posto']] : null;
            $insertStmt->execute([
                'nome' => $team['nome'],
                'posto_id' => $postoId,
                'turno' => $team['turno'],
                'lider' => $team['lider']
            ]);
        }
    }

    // Buscar equipes com dados agregados
    $sql = "SELECT e.id, e.nome, e.posto_id, p.nome AS posto, e.turno, e.lider,
                   (SELECT COUNT(*) FROM equipe_operadores eo WHERE eo.equipe_id = e.id) AS operadores
            FROM equipes e
            LEFT JOIN postos p ON e.posto_id = p.id
            ORDER BY e.nome ASC";

    $stmt = $pdo->query($sql);
    $equipes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "sucesso" => true,
        "equipes" => $equipes
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao buscar equipes no banco de dados.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
