<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $passwordHash = '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZgG236nCgD.x3Y11G450Cq9k99n2q'; // hash of '123'
    
    $posts = [
        'Posto Central' => ['central', 10001],
        'Base Leste'    => ['leste', 10005],
        'Posto Norte'   => ['norte', 10009],
        'Base Sul'      => ['sul', 10013]
    ];
    
    $insertedCount = 0;
    
    $stmtCheck = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = :usuario LIMIT 1");
    $stmtInsert = $pdo->prepare("
        INSERT INTO usuarios (
            nome, matricula, usuario, senha, roles, posto_principal, status,
            cpf, cargo, hierarquia, jornada_contratual, turno_atual, preferencia_turno,
            disponibilidade, restricoes_medicas, qualificacoes, ferias_programadas, afastamentos
        ) VALUES (
            :nome, :matricula, :usuario, :senha, :roles, :posto_principal, :status,
            :cpf, :cargo, :hierarquia, :jornada_contratual, :turno_atual, :preferencia_turno,
            :disponibilidade, :restricoes_medicas, :qualificacoes, :ferias_programadas, :afastamentos
        )
    ");
    
    $logs = [];

    foreach ($posts as $postoName => $info) {
        $suffix = $info[0];
        $startMat = $info[1];
        
        for ($i = 1; $i <= 4; $i++) {
            $username = "op{$i}.{$suffix}";
            $matricula = (string)($startMat + $i - 1);
            $nome = "Operador {$i} " . str_replace('Posto ', '', $postoName);
            
            // Check if user already exists
            $stmtCheck->execute(['usuario' => $username]);
            if ($stmtCheck->fetch()) {
                $logs[] = "Usuário {$username} já existe.";
                continue;
            }
            
            // Alternating details for better test coverage
            $jornada = ($i % 2 === 0) ? '12x36' : 'Tradicional 8h/44h';
            $preferencia = ($i === 4) ? 'Noturno' : 'Diurno';
            $cpf = sprintf("%03d.%03d.%03d-%02d", rand(100,999), rand(100,999), rand(100,999), rand(10,99));
            
            $params = [
                'nome' => $nome,
                'matricula' => $matricula,
                'usuario' => $username,
                'senha' => $passwordHash,
                'roles' => 'OPERADOR',
                'posto_principal' => $postoName,
                'status' => 'ATIVO',
                'cpf' => $cpf,
                'cargo' => 'Operador de Monitoramento',
                'hierarquia' => 'Operacional',
                'jornada_contratual' => $jornada,
                'turno_atual' => 'Fixo',
                'preferencia_turno' => $preferencia,
                'disponibilidade' => 'Disponível',
                'restricoes_medicas' => '',
                'qualificacoes' => 'Monitoramento Avançado, PWA SGO',
                'ferias_programadas' => '',
                'afastamentos' => ''
            ];
            
            $stmtInsert->execute($params);
            $insertedCount++;
            $logs[] = "Usuário {$username} criado com sucesso para o posto {$postoName}.";
        }
    }
    
    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Operações concluídas.",
        "inseridos" => $insertedCount,
        "detalhes" => $logs
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Falha ao criar operadores fictícios.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
