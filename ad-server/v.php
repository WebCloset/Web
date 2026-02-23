<?php
/**
 * this script handle the video banner start and end metrics
 */
if (function_exists('date_default_timezone_set')) date_default_timezone_set('Europe/Rome');

$root="";
include($root."pons-settings.php");
include($root."src/_include/comode.php");
include($root."src/_include/botfilter.php");

$idbanner = getpost("b",0);
$checkcode = getpost("c","");
$event = getpost("e","", ["start", "end"]);

if (!$idbanner) die("no banner");

if (!Connessione()) die(); else CollateConnessione();

$LOGBLOCKED = getVarSetting("CONST_LOG_BLOCKED");
dieIfBotOrSuspiciousTraffic( "video-" . $idbanner, $LOGBLOCKED);


if(DEFINED("ENCRYPTIONKEY")) {
    // 81 is the video test banner that doesn't have the checkcode
    // because it's used for testing the video banner and should work
    // on any site.
    if($idbanner!=81 && md5($idbanner . "-" .ENCRYPTIONKEY) != $checkcode) {
        die();
        // bad chcecksum, stops.
    }
}

// attribution
// referer comes from ref parameter in get because the call comes from the iframe
// so it's not the referer of the original website but it's the referer of the iframe
// which is always the same of the ad software
if(isset($_GET['ref'])){
    $parsed_url = parse_url($_GET['ref']);
    $host = isset($parsed_url['host']) ? $parsed_url['host'] : '';
} else $host ='';
	
// stats
if ( $event == "start") {
    $conn->query($sql = "UPDATE ".DB_PREFIX."7banner_stats SET nu_video_start=nu_video_start+1 WHERE id_day='".date("Y-m-d")."' AND cd_banner='".$idbanner."' and de_referrer='".addslashes($host)."'");
} 

if ( $event == "end") {
    $conn->query($sql = "UPDATE ".DB_PREFIX."7banner_stats SET nu_video_end=nu_video_end+1 WHERE id_day='".date("Y-m-d")."' AND cd_banner='".$idbanner."' and de_referrer='".addslashes($host)."'");
}



?>