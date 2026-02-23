<?php
if(!isset($root)) die("no root");
require $root . 'src/vendor/autoload.php';

// V.4.3.0 gdpr support, code cleaning in banner detail, fixed bug on purchase (position name snapshot field is now too short), fixed bug on first banner creation of an advertiser (wrong path), fixed a bug inside video banner, added support to show audio toggle in video banners, updated documentation
// a => fixes error on installation (conn=false)
// b => fix error on video upload (need to save twice)
// c => bug on checkoutform fixed temp field missing
// V.4.3.1, added a viewer, moved libs to vendor, added smart back in navigation, prevented double submits on panel buttons, added support for svg upload, added support for tinymce and filemanager in richtext, fixed persistennce of filters
// a => fixed bugs on payments and websites filters in list of items
// V.4.3.2 added multi country in filter for geoip, added also filter for multi country separated by commas in configuration to limit the import of data of geoip. now it is possible to geotarget multiple countries, or 1 country-region-city.
// V.4.3.2a lib/vendo/assets folder missing
// V.4.3.2b types fixes
// V.4.3.2d types fixes
// V.4.3.2e zip include fix
// V.4.3.2f missing parameters on campaign creation
// V.4.3.3 added support for experimental functions forward parameter and autorefresh, fixed a bug on campaign and some php8 errors. Now you can configure the system to don't fitler bot traffic, added missing translations, now the edit my profile password isn't filled with the old password
// V.4.3.3a moved jquery to local folder inside assets (include is in config.php which is in gitignore), version number only on db and not redefined in config.php
// V.4.3.3b fixed positions and websites combo to filter correct data for webmaster users. added htaccess for security in some upload folders.
// V.4.3.3d missing transaction temp field for debug.
// V.4.3.4 Added more data on AdAdmin Client, added sql injection mini WAF filter, improved autocomplete, added captcha for AdAdmin signin
// V.4.3.4b Fixed bug on Manual Payment not tracked in Payments for Webmasters. Fixed some error on translations in Payments component.
// V.4.3.5 Changed session class to better handle multiple installations on same domain, track last access, translations updated, fixed a bug on banner detail country selection when multiple countries are selected.

$public = isset($public) ? $public : false;  // $public = false (default, for pages that need login)


//
//
// manage pons-settings file to simplify installation process
if(!file_exists($root."pons-settings.php")) {	
	if(file_exists($root."pons-settings-install.php")) {
		rename($root."pons-settings-install.php", $root."pons-settings.php");
		if(!file_exists($root."pons-settings.php")) {
			die("<pre>"."\n\n".
				"Can't rename pons-settings-install.php to pons-settings.php please check permissions for this file.\n\n".
				"PHP must be allowed to read and write on pons-settings*.php files and on some folders under data folder.\n\n".
				"</pre>");
		}
	}
}

include($root."pons-settings.php");


//
// array that contains translations labels
$langArrayLabels = array();


//
// check old configuration
if(!DEFINED("LANGUAGEFILE")) {
	die("<pre>Old configuration found.\nPlease, open your pons-settings.php file and add this:\n\n\t\tdefine(\"LANGUAGEFILE\",\"en.lang.txt\");\n\n</pre>");
}
if(DEFINED("JQUERYINCLUDE")) {
	die("<pre>Old configuration found.\nPlease, open your pons-settings.php file and remove this:\n\n\t\tdefine(\"JQUERYINCLUDE\",\"...lot of code here ...\");\n\n</pre>");
}
if(!DEFINED("INSTALLER")) {
	die("<pre>Old configuration found.\nPlease, open your pons-settings.php file and add this:\n\n\t\tdefine(\"INSTALLER\",\"install\");\n\n</pre>");
}

function checkUserInput($element) {
    if (is_array($element)) return array_map("checkUserInput", $element);
    if (detectSqlInjection($element)) {
        trigger_error("SQL injection attempt blocked: ".$element);
        die("Access denied");
    }
    return $element;
}

function detectSqlInjection($value) {
    if (is_array($value)) return array_map("detectSqlInjection", $value);

    // Normalizza
    $str = strtolower(trim($value));

    // Pattern euristici per SQL injection
    $patterns = [
        '/\bunion\b\s+select\b/',    // UNION SELECT
        '/\bselect\b.*\bfrom\b/',    // SELECT ... FROM
        '/\binsert\b.*\binto\b/',    // INSERT INTO
        '/\bupdate\b.*\bset\b/',     // UPDATE ... SET
        '/\bdelete\b.*\bfrom\b/',    // DELETE FROM
        '/\bdrop\b.*\btable\b/',     // DROP TABLE
        '/\balter\b.*\btable\b/',    // ALTER TABLE
        '/\btruncate\b.*\btable\b/', // TRUNCATE TABLE
        '/information_schema/',      // meta-query MySQL
    ];

    foreach ($patterns as $regex) {
        if (preg_match($regex, $str)) {
            return true; // query sospetta
        }
    }

    return false;
}



//
//	works like old php deprecated function "magic_quotes_gpc"
//	make all variables in get and post with slashes
//
function magicSlashes($element) {
	if (is_array($element)) return array_map("magicSlashes", $element); else return addslashes($element);  
}
// Aggiungo gli slashes a tutti i dati GET/POST/COOKIE  
if (isset ($_GET) && count($_GET)) {
	array_map("checkUserInput", $_GET);
	$_GET = array_map("magicSlashes", $_GET);  
}
if (isset ($_POST) && count($_POST)) {
	array_map("checkUserInput", $_POST);
	$_POST = array_map("magicSlashes", $_POST);
}
if (isset ($_REQUEST) && count($_REQUEST)) {
	array_map("checkUserInput", $_REQUEST);
	$_REQUEST = array_map("magicSlashes", $_REQUEST);  
}
//if (isset ($_COOKIES) && count($_COOKIES))$_COOKIE = array_map("magicSlashes", $_COOKIE);  


if (function_exists('date_default_timezone_set')) date_default_timezone_set('Europe/Rome');
// if( phpversion() >= '5.0' ) @ini_set('zend.ze1_compatibility_mode', '0');// for PHP 5 compatibility

include($root."src/_include/comode.php");

include($root."src/_include/cryptor.class.php");
include($root."src/_include/logger.class.php");

$logger = new logger();

// check writing permissions
writehere($root."data/dbimg/demofiles", false);
writehere($root."data/dbimg/media", false);
if(file_exists($root."data/geoip")) writehere($root."data/geoip");
writehere($root. str_replace(basename(LOGS_FILENAME),"lock.txt", LOGS_FILENAME), false);
writehere($root."data/logs/log.txt");

$lockupdate = $root. str_replace(basename(LOGS_FILENAME),"lock.txt", LOGS_FILENAME);
if(!Connessione() && file_exists($lockupdate)) {
	// start installation

	if( !stristr( $_SERVER['REQUEST_URI'] , "/".INSTALLER."/" )) {
		if(isset($_GET['modificaStep2'])) $op = "?op=modificaStep2&fromconfig=".rand(1,11111); else $op ="?no1&rnd=".rand(1,111111);
		echo "<script>document.location.href='".$root."src/componenti/".INSTALLER."/index.php".$op."';</script>";
		die;
	}
} else {

	if(!Connessione() && WEBDOMAIN!="") {
		die("DB SERVER DOWN");
	}

	if(!Connessione() && WEBDOMAIN=="") {
		if( !stristr( $_SERVER['REQUEST_URI'] , "/".INSTALLER."/" )) {
			$op="?op2=startinstall";
			echo "<script>document.location.href='".$root."src/componenti/".INSTALLER."/index.php".$op."';</script>";
			die;
		}
	}

	// db connected ok
	// check tables

	
	
	if (!table_exists(DB_PREFIX."frw_vars") || file_exists($lockupdate) ) {
		// install needed

		
		if( !stristr( $_SERVER['REQUEST_URI'] , "/".INSTALLER."/" )) {
			if(isset($_GET['modificaStep2'])) $op = "?op=modificaStep2&fromconfig2=".rand(1,11111); else $op ="?no2&rnd=".rand(1,111111);
			echo "<script>document.location.href='".$root."src/componenti/".INSTALLER."/index.php".$op."';</script>";
			die;
		}

	}


	CollateConnessione();
}



include($root."src/_include/session.class.php");
include($root."src/_include/ambiente.class.php");

$ambiente = new Ambiente();

$session=new Session();

header('Content-type: text/html; charset=utf-8');

if(!defined("SERVER_NAME")) {
    
		// all variables that starts with CONST_ from table frw_vars become constants
		if(!mysqli_connect_errno() && table_exists(DB_PREFIX."frw_vars")) {
			$sql = "select * from ".DB_PREFIX."frw_vars WHERE de_nome like 'CONST_%'";
			$rs = $conn->query($sql) or trigger_error($conn->error);
			while($riga = $rs->fetch_array()) {
				$NAME =str_replace("CONST_","",$riga['de_nome']);
				if($riga['de_value'] == "true") $riga['de_value'] = true;
				if($riga['de_value'] == "false") $riga['de_value'] = false;
				define($NAME, $riga['de_value']);
			}
		}
	
} else {
	/*
	// why?
	foreach($_SESSION as $k=>$v) {
		if(preg_match("/^CONST\_/",$k)) {
			$NAME =str_replace("CONST_","",$k);
			define($NAME, $v);
		}
	}
	*/
}

$VERSION_NUMBER = "0.0.0";

if(isset($conn)) {
	$VERSION_NUMBER = getVarSetting("CURRENT_VERSION");
}

//
// jquery inclusion and other stuff in <head> tag.
define("JQUERYINCLUDE",'
	<link rel="stylesheet" type="text/css" href="'.$root.'src/template/stile.css?ver='.$VERSION_NUMBER.'"><!-- common styles -->
	<link rel="stylesheet" type="text/css" href="'.$root.'data/'.DOMINIODEFAULT.'/stile.css?ver='.$VERSION_NUMBER.'"><!-- theme style -->
	<script src="'.$root.'src/assets/jquery/jquery.min.js"></script>
	<script src="'.$root.'src/assets/jquery/jquery-ui.min.js"></script>
	<link rel="stylesheet" href="'.$root.'src/assets/jquery/jquery-ui.css">
	<link href="'.$root.'src/icons/fontello/css/fontello.css?ver='.$VERSION_NUMBER.'" rel="stylesheet">
	<link href="//fonts.googleapis.com/css?family=Titillium+Web" rel="stylesheet">
	<link rel="icon" type="image/png" href="'.$root.'data/'.DOMINIODEFAULT.'/favicon.png?ver='.$VERSION_NUMBER.'" />
');

//
// these are variable replaced automatically in templates 
// (used in calls to loadTemplateAndParse)
// this array can be modified runtime to add more replaces
// -----------------------------------------------------------------------------------------------------------------
$defaultReplace = array(
	"##root##"=>$root,
	"##DOMINIO##"=>DOMINIODEFAULT,
	"##JQUERYINCLUDE##"=>JQUERYINCLUDE,
	"##PONSDIR##"=>PONSDIR,
	"##rand##"=>rand(1,9999),
	"##VER##"=>$VERSION_NUMBER,
	"##SERVER_NAME##"=>defined("SERVER_NAME") ? SERVER_NAME : "not_provided",
	"##classes##"=>"profile". $session->get("idprofilo"),
);



include($root."src/_include/login.class.php");
$login = new Login();


//
// check login on not public pages (login is public!)
// -----------------------------------------------------------------------------------------------------------------
if ( ( !$public && !$login->logged() )      ) {

	//
	//	if not logged load login form
	//	this if is mandatory
	//
	$session->finish();
	print $ambiente->loadLogin("", $_SERVER["REQUEST_URI"] ?? "");
	die;

}


// ---------------------------------------------------------------------------------
// trigger error is this function doesn't exist in PHP it's needed

if(!function_exists("mb_detect_encoding")) trigger_error("You need to activate php 'MBSTRING'.");

// ---------------------------------------------------------------------------------


if ($session->get("idutente") > 0 ) {
	// track last access
	$q = execute_scalar( "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
		 	WHERE TABLE_SCHEMA='".DEFDBNAME."' AND TABLE_NAME = '".DB_PREFIX."frw_utenti' AND COLUMN_NAME = 'dt_last_access'");
	if($q==1) $conn->query("update ".DB_PREFIX."frw_utenti set dt_last_access='".date("Y-m-d H:i:s")."' where id='{$session->get("idutente")}'");
}
