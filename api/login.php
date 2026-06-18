<?php
// Inclui o script de conexão segura com o banco de dados
require_once __DIR__ . '/../db.php';

// Garante que apenas requisições POST sejam processadas
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Método não permitido. Utilize POST."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtém o corpo da requisição JSON
$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

// Se não for JSON válido, tenta ler do POST tradicional
$usuario = trim($data['usuario'] ?? $_POST['usuario'] ?? '');
$senha = trim($data['senha'] ?? $_POST['senha'] ?? '');

// Valida campos obrigatórios
if (empty($usuario) || empty($senha)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Informe usuário e senha."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Busca o usuário ativo no banco de dados
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = :usuario AND status = 'ATIVO' LIMIT 1");
    $stmt->execute(['usuario' => $usuario]);
    $userRow = $stmt->fetch();

    if ($userRow) {
        // Verifica a senha (suporta bcrypt seguro ou comparação simples para testes/módulos legados)
        if (password_verify($senha, $userRow['senha']) || $senha === $userRow['senha']) {
            
            // Retorna os dados no formato esperado pelo localStorage do frontend
            echo json_encode([
                "sucesso" => true,
                "token" => "sgo-token-" . time() . "-" . bin2hex(random_bytes(4)),
                "usuario" => [
                    "nome" => $userRow['nome'],
                    "username" => $userRow['usuario'],
                    "matricula" => $userRow['matricula'],
                    // Transforma os papéis de string separada por vírgula em array
                    "roles" => array_map('trim', explode(',', $userRow['roles'])),
                    "postoPrincipal" => $userRow['posto_principal']
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // Retorna erro se credenciais forem inválidas
    http_response_code(401);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Usuário ou senha inválidos."
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "erro" => "Erro interno no servidor.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
