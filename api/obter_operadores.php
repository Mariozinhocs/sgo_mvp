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
    // Verifica se a tabela está vazia e faz o seeding
    $stmtCount = $pdo->query("SELECT COUNT(*) FROM usuarios");
    if ($stmtCount->fetchColumn() == 0) {
        $senhaHash = password_hash('123', PASSWORD_BCRYPT);
        $pdo->exec("INSERT INTO usuarios (nome, matricula, usuario, senha, roles, status, scope_type, scope_value, posto_principal, cargo, hierarquia, jornada_contratual, turno_atual) VALUES
            ('User User', '00001', 'user.user', '$senhaHash', 'OPERADOR', 'ATIVO', 'UNIDADE', 'Posto Central', 'Posto Central', 'Operador de Monitoramento', 'Operador I', 'Tradicional 8h/44h', 'Fixo'),
            ('Supervisor Teste', '80001', 'supervisor.teste', '$senhaHash', 'SUPERVISOR', 'ATIVO', 'UNIDADE', 'Posto Central', 'Posto Central', 'Supervisor Operacional', 'Supervisor I', 'Tradicional 8h/44h', 'Fixo'),
            ('Gestor Gestor', '90001', 'gestor.gestor', '$senhaHash', 'GESTOR', 'ATIVO', 'UNIDADE', 'Posto Central', 'Posto Central', 'Gestor de Contrato', 'Gestor I', 'Tradicional 8h/44h', 'Fixo'),
            ('Admin Admin', '99999', 'admin.admin', '$senhaHash', 'ADMIN', 'ATIVO', 'GLOBAL', NULL, 'Posto Central', 'Administrador do Sistema', 'Diretoria', 'Tradicional 8h/44h', 'Fixo')
        ");
    }

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
