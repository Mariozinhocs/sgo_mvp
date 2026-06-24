<?php
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');
try {
    \ = \->query("SELECT id, nome, cidade, latitude, longitude, endereco FROM postos");
    echo json_encode(\->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception \) {
    echo json_encode(['error' => \->getMessage()]);
}
