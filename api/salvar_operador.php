<?php
require_once __DIR__ . '/../db.php';

// Permite apenas requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Método não permitido. Utilize POST."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtém corpo da requisição JSON
$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

// Se não for JSON, lê do formulário normal POST
if ($data === null) {
    $data = $_POST;
}

$id = isset($data['id']) ? (int)$data['id'] : null;
$nome = trim($data['nome'] ?? '');
$matricula = trim($data['matricula'] ?? '');
$usuario = trim($data['usuario'] ?? '');
$senha = trim($data['senha'] ?? '');
$roles = $data['roles'] ?? 'OPERADOR';
$postoPrincipal = trim($data['postoPrincipal'] ?? 'Centro de Cooperação da Cidade');
$status = trim($data['status'] ?? 'ATIVO');
$scopeType = trim($data['scopeType'] ?? 'GLOBAL');
$scopeValue = isset($data['scopeValue']) && $data['scopeValue'] !== '' ? trim($data['scopeValue']) : null;

$cpf = trim($data['cpf'] ?? '');
$cargo = trim($data['cargo'] ?? '');
$hierarquia = trim($data['hierarquia'] ?? '');
$jornadaContratual = trim($data['jornadaContratual'] ?? '');
$turnoAtual = trim($data['turnoAtual'] ?? 'Fixo');
$preferenciaTurno = trim($data['preferenciaTurno'] ?? '');
$disponibilidade = trim($data['disponibilidade'] ?? '');
$restricoesMedicas = trim($data['restricoesMedicas'] ?? '');
$qualificacoes = trim($data['qualificacoes'] ?? '');
$feriasProgramadas = trim($data['feriasProgramadas'] ?? '');
$afastamentos = trim($data['afastamentos'] ?? '');
$fotoPerfil = trim($data['fotoPerfil'] ?? '');

// Converte roles se for enviado como array (caso comum do frontend)
if (is_array($roles)) {
    $roles = implode(',', $roles);
}
$roles = strtoupper(trim($roles));

// Valida campos obrigatórios
if (empty($nome) || empty($matricula) || empty($usuario)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Nome, matrícula e nome de usuário são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Se for inserção de novo usuário, a senha é obrigatória
if (empty($id) && empty($senha)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Senha é obrigatória para a criação de um novo usuário."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 1. Verifica se já existe outro usuário cadastrado com a mesma matrícula ou nome de usuário
    $stmtDuplicate = $pdo->prepare("SELECT id, usuario, matricula FROM usuarios WHERE (usuario = :usuario OR matricula = :matricula) AND id != :id LIMIT 1");
    $stmtDuplicate->execute([
        'usuario' => $usuario,
        'matricula' => $matricula,
        'id' => $id ?? 0
    ]);
    $duplicate = $stmtDuplicate->fetch();

    if ($duplicate) {
        http_response_code(409);
        $motivo = ($duplicate['usuario'] === $usuario) ? "Nome de usuário já cadastrado." : "Matrícula já cadastrada.";
        echo json_encode([
            "sucesso" => false,
            "erro" => $motivo
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!empty($id)) {
        // --- MODO EDIÇÃO (UPDATE) ---
        if (!empty($senha)) {
            // Se informou uma nova senha, gera o hash e atualiza tudo
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
            $sql = "UPDATE usuarios SET nome = :nome, matricula = :matricula, usuario = :usuario, senha = :senha, roles = :roles, posto_principal = :postoPrincipal, status = :status, cpf = :cpf, cargo = :cargo, hierarquia = :hierarquia, jornada_contratual = :jornada_contratual, turno_atual = :turno_atual, preferencia_turno = :preferencia_turno, disponibilidade = :disponibilidade, restricoes_medicas = :restricoes_medicas, qualificacoes = :qualificacoes, ferias_programadas = :ferias_programadas, afastamentos = :afastamentos, foto_perfil = :foto_perfil, scope_type = :scopeType, scope_value = :scopeValue WHERE id = :id";
            $params = [
                'nome' => $nome,
                'matricula' => $matricula,
                'usuario' => $usuario,
                'senha' => $senhaHash,
                'roles' => $roles,
                'postoPrincipal' => $postoPrincipal,
                'status' => $status,
                'cpf' => $cpf,
                'cargo' => $cargo,
                'hierarquia' => $hierarquia,
                'jornada_contratual' => $jornadaContratual,
                'turno_atual' => $turnoAtual,
                'preferencia_turno' => $preferenciaTurno,
                'disponibilidade' => $disponibilidade,
                'restricoes_medicas' => $restricoesMedicas,
                'qualificacoes' => $qualificacoes,
                'ferias_programadas' => $feriasProgramadas,
                'afastamentos' => $afastamentos,
                'foto_perfil' => $fotoPerfil,
                'scopeType' => $scopeType,
                'scopeValue' => $scopeValue,
                'id' => $id
            ];
        } else {
            // Se não informou senha, não altera a senha atual
            $sql = "UPDATE usuarios SET nome = :nome, matricula = :matricula, usuario = :usuario, roles = :roles, posto_principal = :postoPrincipal, status = :status, cpf = :cpf, cargo = :cargo, hierarquia = :hierarquia, jornada_contratual = :jornada_contratual, turno_atual = :turno_atual, preferencia_turno = :preferencia_turno, disponibilidade = :disponibilidade, restricoes_medicas = :restricoes_medicas, qualificacoes = :qualificacoes, ferias_programadas = :ferias_programadas, afastamentos = :afastamentos, foto_perfil = :foto_perfil, scope_type = :scopeType, scope_value = :scopeValue WHERE id = :id";
            $params = [
                'nome' => $nome,
                'matricula' => $matricula,
                'usuario' => $usuario,
                'roles' => $roles,
                'postoPrincipal' => $postoPrincipal,
                'status' => $status,
                'cpf' => $cpf,
                'cargo' => $cargo,
                'hierarquia' => $hierarquia,
                'jornada_contratual' => $jornadaContratual,
                'turno_atual' => $turnoAtual,
                'preferencia_turno' => $preferenciaTurno,
                'disponibilidade' => $disponibilidade,
                'restricoes_medicas' => $restricoesMedicas,
                'qualificacoes' => $qualificacoes,
                'ferias_programadas' => $feriasProgramadas,
                'afastamentos' => $afastamentos,
                'foto_perfil' => $fotoPerfil,
                'scopeType' => $scopeType,
                'scopeValue' => $scopeValue,
                'id' => $id
            ];
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Registro de auditoria
        $stmtLog = $pdo->prepare("INSERT INTO historico_logs (evento, responsavel, detalhe) VALUES (:evento, :responsavel, :detalhe)");
        $stmtLog->execute([
            'evento' => 'Atualização de Operador',
            'responsavel' => 'Gestor',
            'detalhe' => "Operador {$nome} (Matrícula: {$matricula}) atualizado."
        ]);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Usuário atualizado com sucesso!"
        ], JSON_UNESCAPED_UNICODE);

    } else {
        // --- MODO CRIAÇÃO (INSERT) ---
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO usuarios (nome, matricula, usuario, senha, roles, posto_principal, status, cpf, cargo, hierarquia, jornada_contratual, turno_atual, preferencia_turno, disponibilidade, restricoes_medicas, qualificacoes, ferias_programadas, afastamentos, foto_perfil, scope_type, scope_value) VALUES (:nome, :matricula, :usuario, :senha, :roles, :postoPrincipal, :status, :cpf, :cargo, :hierarquia, :jornada_contratual, :turno_atual, :preferencia_turno, :disponibilidade, :restricoes_medicas, :qualificacoes, :ferias_programadas, :afastamentos, :foto_perfil, :scopeType, :scopeValue)";
        $params = [
            'nome' => $nome,
            'matricula' => $matricula,
            'usuario' => $usuario,
            'senha' => $senhaHash,
            'roles' => $roles,
            'postoPrincipal' => $postoPrincipal,
            'status' => $status,
            'cpf' => $cpf,
            'cargo' => $cargo,
            'hierarquia' => $hierarquia,
            'jornada_contratual' => $jornadaContratual,
            'turno_atual' => $turnoAtual,
            'preferencia_turno' => $preferenciaTurno,
            'disponibilidade' => $disponibilidade,
            'restricoes_medicas' => $restricoesMedicas,
            'qualificacoes' => $qualificacoes,
            'ferias_programadas' => $feriasProgramadas,
            'afastamentos' => $afastamentos,
            'foto_perfil' => $fotoPerfil,
            'scopeType' => $scopeType,
            'scopeValue' => $scopeValue
        ];

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $novoId = $pdo->lastInsertId();

        // Registro de auditoria
        $stmtLog = $pdo->prepare("INSERT INTO historico_logs (evento, responsavel, detalhe) VALUES (:evento, :responsavel, :detalhe)");
        $stmtLog->execute([
            'evento' => 'Cadastro de Operador',
            'responsavel' => 'Gestor',
            'detalhe' => "Novo operador {$nome} (Matrícula: {$matricula}) criado."
        ]);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Usuário criado com sucesso!",
            "id" => $novoId
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro de servidor ao salvar operador.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
