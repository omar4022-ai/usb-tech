<?php
declare(strict_types=1);

// Deploy this file to the PHP host, never to the GitHub Pages public directory.
// The state directory must remain outside every web-accessible document root.
const CONTACT_RECIPIENT = 'info@usb-tech.ly';
const CONTACT_SENDER = 'info@usb-tech.ly';
const CONTACT_STATE_DIRECTORY = '/home/moicarel/.usb-tech-contact';
const CONTACT_ALLOWED_ORIGINS = ['https://usb-tech.ly', 'https://www.usb-tech.ly'];

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Vary: Origin');

function respond(int $status, string $code, bool $success = false): void
{
    http_response_code($status);
    echo json_encode(['success' => $success, 'code' => $code]);
    exit;
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, CONTACT_ALLOWED_ORIGINS, true)) {
    respond(403, 'origin_not_allowed');
}
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($method !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(405, 'method_not_allowed');
}
if (!preg_match('/^application\/json(?:\s*;|$)/i', $_SERVER['CONTENT_TYPE'] ?? '')) {
    respond(415, 'json_required');
}

// A 32 KiB cap comfortably accommodates the 4,000-character UTF-8 brief.
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) {
    respond(413, 'request_too_large');
}
$body = file_get_contents('php://input', false, null, 0, 32769);
if ($body === false || strlen($body) > 32768) {
    respond(413, 'request_too_large');
}
$input = json_decode($body, true);
if (!is_array($input) || json_last_error() !== JSON_ERROR_NONE) {
    respond(400, 'invalid_json');
}

/** Validate UTF-8 lengths without requiring the optional mbstring extension. */
function textField(array $input, string $key, int $limit, bool $required = true): string
{
    if (!array_key_exists($key, $input)) {
        if (!$required) {
            return '';
        }
        respond(422, 'invalid_fields');
    }
    if (!is_string($input[$key]) || !preg_match('//u', $input[$key])) {
        respond(422, 'invalid_fields');
    }
    $value = trim($input[$key]);
    $length = preg_match_all('/./us', $value);
    if (($required && $value === '') || $length === false || $length > $limit
        || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
        respond(422, 'invalid_fields');
    }
    return $value;
}

$name = textField($input, 'name', 100);
$business = textField($input, 'business', 120, false);
$contact = textField($input, 'contact', 254);
$brief = textField($input, 'brief', 4000);
$service = textField($input, 'service', 20);
$language = textField($input, 'language', 2);
$honeypot = textField($input, 'website', 200, false);
if ($honeypot !== '') {
    respond(422, 'invalid_fields');
}

$serviceNames = [
    'company' => 'Business systems / منظومات الأعمال',
    'identity' => 'Company website / موقع الشركة',
    'store' => 'Online store / متجر إلكتروني',
    'automation' => 'Sales assistant / مساعد المبيعات',
    'hotel' => 'Hotel system / نظام الفندق',
    'restaurant' => 'Restaurant system / نظام المطعم',
];
if (!isset($serviceNames[$service]) || !in_array($language, ['ar', 'en'], true)) {
    respond(422, 'invalid_fields');
}

$replyTo = filter_var($contact, FILTER_VALIDATE_EMAIL);
$phone = strtr($contact, array_combine(
    preg_split('//u', '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', -1, PREG_SPLIT_NO_EMPTY),
    str_split('01234567890123456789')
));
$phone = preg_replace('/[\s().-]/u', '', $phone);
if (!$replyTo && !preg_match('/^\+?[0-9]{7,15}$/D', $phone)) {
    respond(422, 'invalid_fields');
}
// User data never controls recipient, sender, subject, or command-line options.
if ($replyTo && preg_match('/[\r\n]/', $contact)) {
    respond(422, 'invalid_fields');
}

/** Keep only anonymous counters; request names, contacts and briefs are not logged. */
function reserveMailAttempt(): void
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if (!filter_var($ip, FILTER_VALIDATE_IP)) {
        respond(503, 'temporarily_unavailable');
    }
    $directory = CONTACT_STATE_DIRECTORY;
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        respond(503, 'temporarily_unavailable');
    }
    $realDirectory = realpath($directory);
    $documentRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? __DIR__);
    if ($realDirectory === false || $documentRoot === false
        || $realDirectory === $documentRoot
        || strpos($realDirectory . DIRECTORY_SEPARATOR, $documentRoot . DIRECTORY_SEPARATOR) === 0) {
        respond(503, 'temporarily_unavailable');
    }

    $path = $realDirectory . '/rate-limit.json';
    $file = @fopen($path, 'c+');
    if ($file === false || !flock($file, LOCK_EX)) {
        if (is_resource($file)) {
            fclose($file);
        }
        respond(503, 'temporarily_unavailable');
    }
    @chmod($path, 0600);
    $raw = stream_get_contents($file, 65537);
    if ($raw === false || strlen($raw) > 65536) {
        fclose($file);
        respond(503, 'temporarily_unavailable');
    }
    if ($raw === '') {
        $state = ['salt' => bin2hex(random_bytes(32)), 'clients' => [], 'global' => []];
    } else {
        $state = json_decode($raw, true);
        if (!is_array($state) || !is_string($state['salt'] ?? null)
            || !is_array($state['clients'] ?? null) || !is_array($state['global'] ?? null)) {
            fclose($file);
            respond(503, 'temporarily_unavailable');
        }
    }

    $now = time();
    foreach ($state['clients'] as $key => $attempts) {
        $recent = is_array($attempts)
            ? array_values(array_filter($attempts, static function ($time) use ($now): bool {
                return is_int($time) && $time > $now - 900;
            })) : [];
        if ($recent) {
            $state['clients'][$key] = $recent;
        } else {
            unset($state['clients'][$key]);
        }
    }
    $state['global'] = array_values(array_filter($state['global'], static function ($time) use ($now): bool {
        return is_int($time) && $time > $now - 3600;
    }));
    $client = hash_hmac('sha256', $ip, $state['salt']);
    $clientAttempts = $state['clients'][$client] ?? [];
    $clientLimited = count($clientAttempts) >= 5;
    $globalLimited = count($state['global']) >= 50;
    if ($clientLimited || $globalLimited) {
        $retryAfter = max(
            1,
            $clientLimited ? $clientAttempts[0] + 900 - $now : 0,
            $globalLimited ? $state['global'][0] + 3600 - $now : 0
        );
        fclose($file);
        header('Retry-After: ' . $retryAfter);
        respond(429, 'try_later');
    }
    $state['clients'][$client][] = $now;
    $state['global'][] = $now;
    $encoded = json_encode($state);
    rewind($file);
    if ($encoded === false || !ftruncate($file, 0) || fwrite($file, $encoded) !== strlen($encoded) || !fflush($file)) {
        fclose($file);
        respond(503, 'temporarily_unavailable');
    }
    flock($file, LOCK_UN);
    fclose($file);
}

reserveMailAttempt();
$message = implode("\n\n", [
    'USB TECH — Website project request / طلب مشروع من الموقع',
    'Name / الاسم: ' . $name,
    'Business / النشاط: ' . ($business !== '' ? $business : '—'),
    'Contact / التواصل: ' . $contact,
    'Service / الخدمة: ' . $serviceNames[$service],
    'Language / اللغة: ' . $language,
    "Project brief / نبذة عن المشروع:\n" . $brief,
]);
$headers = [
    'From' => 'USB TECH Website <' . CONTACT_SENDER . '>',
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => 'base64',
];
if ($replyTo) {
    $headers['Reply-To'] = $contact;
}
if (!function_exists('mail')) {
    respond(503, 'mail_unavailable');
}
$accepted = @mail(
    CONTACT_RECIPIENT,
    'USB TECH website request: ' . $service,
    chunk_split(base64_encode($message), 76, "\r\n"),
    $headers
);
if (!$accepted) {
    respond(503, 'mail_unavailable');
}
// This confirms transport acceptance, not final inbox delivery.
respond(200, 'accepted_for_delivery', true);
