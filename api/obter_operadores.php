<?php
require_once __DIR__ . '/../db.php';

// Permite apenas requisições GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Método não permitido. Utilize GET."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Retorna todos os usuários cadastrados (sem retornar o hash de senha por segurança)
    $stmt = $pdo->query("SELECT id, nome, matricula, usuario, roles, posto_principal, status, cpf, cargo, hierarquia, jornada_contratual, turno_atual, preferencia_turno, disponibilidade, restricoes_medicas, qualificacoes, ferias_programadas, afastamentos, foto_perfil, scope_type, scope_value FROM usuarios ORDER BY nome ASC");
    $usuarios = $stmt->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "usuarios" => $usuarios
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro ao buscar operadores no banco de dados.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
