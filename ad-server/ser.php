<?php
/*
	this script serves ads
*/

if(!stristr( ini_get('disable_functions'), "set_time_limit")) set_time_limit ( 30 );
$root="./";

header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
if(!isset($_GET['test_id'])) header('Content-Type: text/javascript; charset=UTF-8');
if (function_exists('date_default_timezone_set')) date_default_timezone_set('Europe/Rome');

include($root."pons-settings.php");
include($root."src/_include/comode.php");
include($root."src/_include/botfilter.php");
include($root."src/componenti/7banner/_include/adserver.class.php");


if (!Connessione()) die(); else CollateConnessione();

dieIfBotOrSuspiciousTraffic( $_GET['f'] ?? '', getVarSetting("CONST_LOG_BLOCKED") );

$adserver = new adserver( [
	"media_folder" => $root."data/dbimg/media",
	"empty_banner_code" => "<!-- empty -->"
	] );




/*

vignette mode banner info
=========================

	f = id position
	m = mode [ nothing is normal ; v = vignettecontainer ; vm = vignette ad ]

	vignette mode is a bit tricky because of cookie policies
	and going back between javascript and php. Vignette mode
	needs two calls, this is the first that output vignette 
	container. The second is called with m = vm;

	all the code here should be sent to printJavascript

*/
if(isset($_GET['f']) && isset($_GET['m']) && $_GET['m']=="v" ) {
	$on = execute_scalar("select count(1) from ".DB_PREFIX."7banner where cd_posizione=".(integer)$_GET['f']." and (fl_stato='L' OR fl_stato='A') AND (dt_giorno1<='".date("Y-m-d")."')");

	if($on > 0) {
		$trigger = isset($_GET['tr']) ? strip_tags($_GET['tr']) : "p a, nav a, h2 a";
		$timer = isset($_GET['tm']) ? (integer)$_GET['tm'] : "5";


		// Javascript that handles the second call that shows the banner.
		?>
		(()=>{
			var amb_goto = "";

			var controves = (l) => {
				var closemeX=document.getElementById('closemexVIGNA');
				var q = parseInt(closemeX.innerText,10);
				if(isNaN(q)) q = 1;
				if (q<=1) {
					closemeX.setAttribute("href",l);
					closemeX.innerHTML = "X";
				} else {
					q--;
					closemeX.innerHTML = q;
					setTimeout(() => {controves(l)},1000);
				}
			}

			var A = document.querySelectorAll("<?php echo $trigger;?>");

			for (let i = 0; i < A.length; i++) {
				// skip AdAdmin banners
				if( A[i].closest('div') && A[i].closest('div').hasAttribute("id") && A[i].closest('div').getAttribute("id").startsWith("AADIV") ) continue;

				A[i].addEventListener('click', (e) => {
					e.preventDefault();
					let obj = e.target || e.srcElement;
					let l=obj.getAttribute("href");

					if(l.substring(0,1)!="#") { 
						amb_goto = l;
						if(document.body.contains(document.getElementById('amb_vignettazza')) ) {
							document.getElementById('amb_vignettazza').remove();
						}
					 
						let div = document.createElement("div");
						div.style.display = 'none';
						div.id = 'amb_vignettazza';
						divContent = "<style>#overlaybannerVIGNA img {width:100%;height:auto}#overlaybannerVIGNA {position:fixed;top:0;left:0;z-index: 99999999999;width:100vw;height:100vh;background-color:rgba(0,0,0,.9)}#overlaybannerVIGNA div.picVIGNA {display:block;position:absolute;top: 50%;transform: translate(-50%, -50%);left: 50%;width: 80%;max-width:80%}#closemexVIGNA {font-family:sans-serif;border:1px solid #ffffff;position:absolute;top:15px;right:30px;text-decoration:none;font-size:15px;display:inline-block;width:30px;height:30px;line-height:30px;text-align:center;background-color:#000000;color:#ffffff;border-radius:50%}@media only screen and (min-width: 1024px) {#overlaybannerVIGNA div.picVIGNA{max-width:50%!important}}</style><span id='overlaybannerVIGNA'><div id='sTTVIGNA' class='picVIGNA'></div><a href='#' id='closemexVIGNA'><?php echo $timer;?></a></span>";
						div.innerHTML = divContent;
						
						document.body.append( div );
						controves(l);

						<?php
						echo $adserver->printJavascript(array("cookie reader"));
						?>
						var s = document.createElement("script");
						s.src = "<?php echo WEBURL;?>/ser.php?t=sTTVIGNA"+String.fromCharCode(38)+"f=<?php echo (integer)$_GET['f'];?>"+String.fromCharCode(38)+"m=vm"+String.fromCharCode(38)+"psc=" + psc;
						document.head.appendChild(s);
						
					}

				});

			}

			

		})();
		<?php
	}
	die;
}





/*
	standard banner call with:
		f = position id
		t = div target
		psc = adadmin cookies

	optional: (handles the second call of vignette mode)
		m = "vm"

*/
if(isset($_GET['f']) && isset($_GET['t'])  ){
	$f = (integer)$_GET['f'];
	
	if (isset($_REQUEST['time'])) usleep($_REQUEST['time'] * 1000);
	$psc = ( isset ( $_GET['psc'] ) && preg_match("/^(([0-9]*),([0-9]*))*$/", $_GET['psc']) ) ? $_GET['psc'] : "";
	$psc = explode(",",$psc);

	$output = $adserver->showBanner($f, "yes",null,$psc);
	
	$banner = $output[0];
	$pscUpdate = $output[1];
	$iframe_id = $output[2];

	//
	// empty vignette banner should not open
	// the layer, but should still handle cookie
	// for frequency cap limitation.
	if ( isset($_GET['m']) && $_GET['m']=="vm" ) {
		if(strlen($banner)!=0 && $banner!=$adserver->getEmptyBannerCode() ) {
			echo "document.getElementById('amb_vignettazza').style.display='block';";
		} else {
			echo "if(amb_goto!='') document.location.href = amb_goto;";
		}
	}

	/* output minify js script */
	$banner = str_replace("\n","",$banner);
	$banner = str_replace("\r","",$banner);
	$banner = str_replace("\t"," ",$banner);
	$banner = str_replace("'","\'",$banner);
	// $banner = "<div>".$banner."</div>";
	echo $adserver->printJavascript( ["set get cookie","iframe tricks","set HTML","autorefresh","forward" ], $iframe_id );
	echo "amb_sH( document.getElementById('". $_GET['t']."'),'".$banner."', true);";

	$arFlags = execute_row("SELECT fl_forward,fl_autorefresh FROM `".DB_PREFIX."7banner_posizioni` WHERE id_posizione='".$f."'");

	//
	// these are flags activated on the position
	// to trigger special behaviours
	if($arFlags['fl_forward']==1) echo "amb_forward('". $_GET['t']."');";
	if($arFlags['fl_autorefresh']==1) echo "amb_autorefresh('". $_GET['t']."', $f);";

	
	if($pscUpdate<>'') echo "var amb_tc=amb_gC('$pscUpdate'); amb_sC('$pscUpdate', (amb_tc+1), 3);";
	die;
}





/*
	
	banner call for old installations without target div, allows document.write
		f = position id

*/
if(isset($_GET['f'])) {

	$f = (integer)$_GET['f'];
	if (isset($_REQUEST['time'])) usleep($_REQUEST['time'] * 1000);
	$banner = $adserver->showBanner($f);

	// If there is not target div, it's an old banner and need document.write
	
	$banner[0] = str_replace("+","%20",urlencode($banner[0]));
	echo "document.write ( unescape(\"".$banner[0]."\") );";
	die;
}


/*
	
	banner call by id, should not be used anymore, deprecated

*/
if(isset($_GET['id'])) { /* code for old installation with standard banner called by ID, it doesn't update rotation */
	/* DON'T KNOW ANYMORE */
	echo "document.write('<div style=\"color:red;padding:50px;background:yellow;text-align:center;\">Not a valid call now (2).</div>');";
	die;
}




/*

	text link mode

	Used for text link position, extract the click tag of the banner in the specified position and update rotation,
	I don't know how much is used / documented

 */
if(isset($_GET['flp'])) {
	$f = (integer)$_GET['flp'];
	if (isset($_REQUEST['time'])) usleep($_REQUEST['time'] * 1000);
	$banner = $adserver->showBanner($f);
	if(isset($banner[3])) {
		$url = $banner[3];
		header("Location: ".$url);
	}
	die;
}


/*

	test moto, to show the banner in the backend (doesn't update rotation)

*/
if(isset($_GET['test_id'])) { 
	$id = (integer)$_GET['test_id'];
	$banner = $adserver->showBanner(null,"no",$id);
	echo "<html lang=\"en-US\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Testing banner id #".$id."</title><meta name='robots' content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' /></head><body>";
	echo $banner[0];
	echo "</body></html>";
	die;
}


