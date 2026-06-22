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

$usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : null;
$role = trim($_GET['role'] ?? '');

if (empty($usuario_id)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "O parâmetro usuario_id é obrigatório."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Se o usuário for um OPERADOR, traz apenas mensagens relevantes a ele
    if ($role === 'OPERADOR') {
        // Obter posto_id e equipe_id associados a este operador
        $userQuery = $pdo->prepare("SELECT posto_principal, 
                                   (SELECT id FROM postos WHERE nome = posto_principal LIMIT 1) AS posto_id,
                                   (SELECT e.id FROM equipes e JOIN equipe_operadores eo ON eo.equipe_id = e.id WHERE eo.usuario_id = :uid LIMIT 1) AS equipe_id
                                   FROM usuarios WHERE id = :uid");
        $userQuery->execute(['uid' => $usuario_id]);
        $userInfo = $userQuery->fetch(PDO::FETCH_ASSOC);
        
        $posto_id = $userInfo['posto_id'] ?? null;
        $equipe_id = $userInfo['equipe_id'] ?? null;
        
        $sql = "SELECT m.id, m.remetente_id, r.nome AS remetente_nome, m.assunto, m.corpo, m.anexo_path, m.data_envio,
                       m.tipo_destinatario, m.destinatario_id, m.posto_id, m.equipe_id,
                       d.nome AS destinatario_nome, p.nome AS posto_nome, eq.nome AS equipe_nome
                FROM mensagens m
                LEFT JOIN usuarios r ON m.remetente_id = r.id
                LEFT JOIN usuarios d ON m.destinatario_id = d.id
                LEFT JOIN postos p ON m.posto_id = p.id
                LEFT JOIN equipes eq ON m.equipe_id = eq.id
                WHERE m.remetente_id = :my_id
                   OR m.destinatario_id = :my_id
                   OR (m.tipo_destinatario = 'POSTO' AND m.posto_id = :posto_id)
                   OR (m.tipo_destinatario = 'EQUIPE' AND m.equipe_id = :equipe_id)
                   OR m.tipo_destinatario = 'GLOBAL'
                ORDER BY m.data_envio DESC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'my_id' => $usuario_id,
            'posto_id' => $posto_id,
            'equipe_id' => $equipe_id
        ]);
        
    } else {
        // Gestor / Supervisor / Admin vê todas as mensagens
        $sql = "SELECT m.id, m.remetente_id, r.nome AS remetente_nome, m.assunto, m.corpo, m.anexo_path, m.data_envio,
                       m.tipo_destinatario, m.destinatario_id, m.posto_id, m.equipe_id,
                       d.nome AS destinatario_nome, p.nome AS posto_nome, eq.nome AS equipe_nome
                FROM mensagens m
                LEFT JOIN usuarios r ON m.remetente_id = r.id
                LEFT JOIN usuarios d ON m.destinatario_id = d.id
                LEFT JOIN postos p ON m.posto_id = p.id
                LEFT JOIN equipes eq ON m.equipe_id = eq.id
                ORDER BY m.data_envio DESC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    }
    
    $mensagens = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "sucesso" => true,
        "mensagens" => $mensagens
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao carregar mensagens no banco de dados.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
