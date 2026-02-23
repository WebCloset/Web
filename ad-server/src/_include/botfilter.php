<?php

/**
 * Blocks access if traffic is considered bot or suspicious
 */
function dieIfBotOrSuspiciousTraffic( $banner_position = '', $logBlocked = "ON") {
    if ($logBlocked == "OFF") return;
	
	// Lista User-Agent sospetti
    $bots = [
        'googlebot','bingbot','slurp','duckduckbot','baiduspider','yandexbot','sogou','exabot',
        'facebot','applebot','ia_archiver','adsbot','msnbot','megaindex','ahrefsbot',
        'headless','phantomjs','selenium','curl','wget','python-requests','httpclient','libwww-perl','scrapy'
    ];
    
    $agent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
    foreach ($bots as $bot) {
        if (strpos($agent, $bot) !== false) {
			if($logBlocked == "ON") logBlockedRequest($banner_position . ', agent');
            die('Forbidden');
        }
    }

    // IP da datacenter noti (solo esempio semplificato)
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (isDataCenterIP($ip)) {
		if($logBlocked == "ON") logBlockedRequest($banner_position . ', datacenter IP');
        die('Forbidden');
    }

    // Filtro comportamentale semplice (rate limit per IP)
	if( $banner_position != '') {

		 $tmpFile = sys_get_temp_dir() . "/ratelimit_" . md5($ip . $banner_position);
		
		if (file_exists($tmpFile)) {
			$last = filemtime($tmpFile);
			if (time() - $last < 2) {
				if($logBlocked == "ON") logBlockedRequest($banner_position . ', too frequent requests');
				die('Blocked: too frequent');
			}
		}
		touch($tmpFile);
	}
}

/**
 * Controlla se l'IP appartiene a intervalli noti di datacenter
 */
function isDataCenterIP($ip) {
    $datacenterRanges = [
        '3.0.0.0/8',        // AWS
        '13.0.0.0/8',       // AWS
        '34.0.0.0/8',       // Google Cloud
        '104.16.0.0/12',    // Cloudflare
        '185.199.108.0/22', // GitHub
        '198.18.0.0/15',    // Test networks
    ];
    foreach ($datacenterRanges as $cidr) {
        if (ipInRange($ip, $cidr)) return true;
    }
    return false;
}

/**
 * Controlla se un IP è dentro un intervallo CIDR
 */
function ipInRange($ip, $cidr) {
    if (strpos($cidr, '/') === false) return false;
    list($subnet, $bits) = explode('/', $cidr);
    $ip = ip2long($ip);
    $subnet = ip2long($subnet);
    $mask = -1 << (32 - $bits);
    return ($ip & $mask) === ($subnet & $mask);
}

function logBlockedRequest($reason) {
    $log = sprintf("[%s] Blocked %s | IP: %s | UA: %s REF: %s\n",
        date('Y-m-d H:i:s'),
        $reason,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
		$_SERVER['HTTP_REFERER'] ?? 'unknown'
    );
    file_put_contents(__DIR__ . '/../../data/logs/'.date('Y-m-d').'_blocked.log', $log, FILE_APPEND);
}
