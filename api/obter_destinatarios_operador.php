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

if (empty($usuario_id)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "O parâmetro usuario_id é obrigatório."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 1. Buscar superior imediato (líder da equipe ou supervisor do mesmo posto como fallback)
    $superior = null;
    
    // Tenta obter o líder da equipe do operador
    $sqlEquipe = "SELECT e.lider, u.id AS superior_id, u.nome AS superior_nome 
                  FROM equipe_operadores eo
                  JOIN equipes e ON eo.equipe_id = e.id
                  JOIN usuarios u ON u.nome = e.lider
                  WHERE eo.usuario_id = :uid AND u.status = 'ATIVO'
                  LIMIT 1";
    $stmtEquipe = $pdo->prepare($sqlEquipe);
    $stmtEquipe->execute(['uid' => $usuario_id]);
    $resEquipe = $stmtEquipe->fetch(PDO::FETCH_ASSOC);
    
    if ($resEquipe) {
        $superior = [
            "id" => (int)$resEquipe['superior_id'],
            "nome" => $resEquipe['superior_nome'] ?? $resEquipe['lider']
        ];
    } else {
        // Fallback: busca qualquer supervisor/gestor no mesmo posto do operador
        $sqlFallback = "SELECT id, nome FROM usuarios 
                        WHERE id != :uid 
                          AND (roles LIKE '%SUPERVISOR%' OR roles LIKE '%GESTOR%' OR roles LIKE '%ADMIN%')
                          AND posto_principal = (SELECT posto_principal FROM usuarios WHERE id = :uid LIMIT 1)
                          AND status = 'ATIVO'
                        LIMIT 1";
        $stmtFallback = $pdo->prepare($sqlFallback);
        $stmtFallback->execute(['uid' => $usuario_id]);
        $resFallback = $stmtFallback->fetch(PDO::FETCH_ASSOC);
        
        if ($resFallback) {
            $superior = [
                "id" => (int)$resFallback['id'],
                "nome" => $resFallback['nome']
            ];
        } else {
            // Último recurso: busca qualquer gestor ou admin global ativo
            $sqlGlobal = "SELECT id, nome FROM usuarios 
                          WHERE id != :uid 
                            AND (roles LIKE '%GESTOR%' OR roles LIKE '%ADMIN%')
                            AND status = 'ATIVO'
                          LIMIT 1";
            $stmtGlobal = $pdo->prepare($sqlGlobal);
            $stmtGlobal->execute(['uid' => $usuario_id]);
            $resGlobal = $stmtGlobal->fetch(PDO::FETCH_ASSOC);
            if ($resGlobal) {
                $superior = [
                    "id" => (int)$resGlobal['id'],
                    "nome" => $resGlobal['nome']
                ];
            }
        }
    }
    
    // 2. Buscar se existe algum agente de RH cadastrado (role contendo RH)
    $rh = null;
    $sqlRH = "SELECT id, nome FROM usuarios 
              WHERE roles LIKE '%RH%' AND status = 'ATIVO' 
              LIMIT 1";
    $stmtRH = $pdo->prepare($sqlRH);
    $stmtRH->execute();
    $resRH = $stmtRH->fetch(PDO::FETCH_ASSOC);
    
    if ($resRH) {
        $rh = [
            "id" => (int)$resRH['id'],
            "nome" => $resRH['nome']
        ];
    }
    
    echo json_encode([
        "sucesso" => true,
        "superior" => $superior,
        "rh" => $rh
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao processar busca de destinatários.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
