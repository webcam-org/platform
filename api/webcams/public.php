<?php
/**
 * Public Webcams API
 * Returns all public webcams with coordinates
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Database connection (peer auth)
$dbconn = pg_connect("dbname=webcamorg user=postgres");

if (!$dbconn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get all public webcams
$query = "
    SELECT
        id,
        name,
        description,
        camera_type,
        ST_Y(location::geometry) as lat,
        ST_X(location::geometry) as lon,
        city,
        state,
        country,
        embed_url,
        thumbnail_url,
        source
    FROM external_cameras
    WHERE is_online = TRUE
    ORDER BY name
";

$result = pg_query($dbconn, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed']);
    exit;
}

$webcams = [];
while ($row = pg_fetch_assoc($result)) {
    $webcams[] = $row;
}

pg_close($dbconn);

echo json_encode([
    'success' => true,
    'count' => count($webcams),
    'webcams' => $webcams
]);
