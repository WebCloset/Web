<?php
/*

	Banners page handler

*/

$root="../../../";


//
// require classes to send mail with SMTP
require '../../../src/vendor/autoload.php';
include("../../../src/lib/php-zip/Zip.php");	// not in packagist


//
include($root."src/_include/config.php");
include($root."src/_include/grid.class.php");
include($root."src/_include/formcampi.class.php");
include($root."src/componenti/gestioneutenti/_include/user.class.php");
include("_include/banner.class.php");
include("_include/adserver.class.php");
include("_include/dashboard.class.php");
include("_include/callback_griglia.php");
include($root."src/componenti/gestioneutenti/_include/gestioneutenti.class.php");
include($root."src/componenti/7gestioneutenti/_include/BANNER.gestioneutenti.class.php");

//
// update main position
if(isset($_GET["op"]) && ($_GET["op"]=="dashboard"|| $_GET["op"]=="dashboardnew")) $position = "Dashboard"; else $position="Banner";
print $ambiente->setPosizione("{" . $position . "}");


$obj = new Banner();
$obj->uploadDir = $root."data/dbimg/media/";
$obj->maxX= 2000;
$obj->maxY= 1800;
$obj->maxKB = MAXSIZE_UPLOAD; // moved in settings
$obj->max_files= 10;

$objDashboard = new Dashboard( $obj );


$html="";


$command = getVar("op", ["", ["coinbaseredir","paypalredir","modifica","duplica","modificaStep2checkout","modificaStep2reload","modificaStep2","elimina","eliminaSelezionati","aggiungi","aggiungiStep2checkout","aggiungiStep2reload","aggiungiStep2","checkout","stats","dashboard","dashboardnew"]]);
$parameter = (int)getvar("id");

if($session->get("idprofilo")=="10"){ 
	// limit command for lower user (webmaster)
	$command = "dashboardnew";
	$parameter= 0;
}


//
// banner list filters
$combotipo = getvar("combotipo", ["-999",null, $obj->tbdb]);
$keyword = getvar("keyword", ["",null, $obj->tbdb]);
$comboclient = getvar("comboclient", ["-999",null, $obj->tbdb]);
$combocampaign = getvar("combocampaign", ["-999",null, $obj->tbdb]);
//
// banner stats filters
// $combobanner = get("combobanner","");
$combobanner = getvar("combobanner", ["",null, $obj->tbdb]);
//
// stats and dashbaord filters
$combosite = getvar("combosite", ["",null, $obj->tbdb]);
$enddate = getvar("enddate", ["",null, $obj->tbdb]);
$startdate = getvar("startdate", ["",null, $obj->tbdb]);



//
// command controller
switch ($command) {
	case "coinbaseredir":
		$risultato = $obj->coinbase_checkTransaction($_REQUEST);
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","link index.php");
		} else {
			$ar = explode("|",$risultato);
			$val = $ar[0];
			$msg = $ar[1];
			$html = returnmsgok($msg,"link index.php");
		}
		break;



	case "paypalredir":
		$risultato = $obj->paypal_checkTransaction($_REQUEST);
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","link index.php");
		} else {
			$ar = explode("|",$risultato);
			$val = $ar[0];
			$msg = $ar[1];
			if($val=="-1") {
				$html = returnmsg($msg,"link index.php");
			} elseif($val=="1") {
				$html = returnmsgok($msg,"link index.php");
			} else {
				$html = returnmsg("Error: ".$msg,"link index.php");
			}
		}
		break;

	case "modifica":
	case "duplica":
		$risultato = $obj->getDettaglio( $parameter, $command );
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","jsback");
		} elseif ($risultato=="-1") {
			$html = returnmsg("{You can't edit or delete a banner after payment.}","link index.php");
		} elseif (str_replace(strstr($risultato,"|"),"",$risultato)=="-2") {
			$html = returnmsg("{Please, go on and complete the payment}","link ". str_replace("|","",strstr($risultato,"|")));
		} elseif (str_replace(strstr($risultato,"|"),"",$risultato)=="-3") {
			$html = returnmsg(str_replace("|","",strstr($risultato,"|")),"link index.php");
		} elseif (str_replace(strstr($risultato,"|"),"",$risultato)=="-4") {
			$html = returnmsg(str_replace("|","",strstr($risultato,"|")),"link index.php");
		} else {
			$html = $risultato;
		}
		break;
	
	case "modificaStep2checkout":
	case "modificaStep2reload" :
	case "modificaStep2" :
		$risultato = $obj->updateAndInsert($_POST,$_FILES);
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","jsback");
		} elseif(str_replace(strstr($risultato,"|"),"",$risultato)=="-1") {
			$html = returnmsg(str_replace("|","",strstr($risultato,"|")),"jsback");
		} else {
			if ($command == "modificaStep2") $html = returnmsgok("Done.","reload");
			if ($command == "modificaStep2reload") $html = returnmsgok("{Done.}","load index.php?op=modifica&id={$parameter}");
			if ($command == "modificaStep2checkout") $html = returnmsgok("{Done.}","load index.php?op=checkout&id={$parameter}");
		}
		break;
	case "elimina":
	case "eliminaSelezionati":
		$risultato = $obj->eliminaSelezionati($_POST);
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","jsback");
		} elseif ($risultato=="-1") {
			$html = returnmsg("{You can't edit or delete a banner after payment.}","link index.php");
		} else $html = returnmsgok("{Deleted.}","load index.php");
		break;
	case "aggiungi":
		$risultato = $obj->getDettaglio();
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","jsback");
		} else $html = $risultato;

		break;

	case "aggiungiStep2checkout":
	case "aggiungiStep2reload":
	case "aggiungiStep2":
		$risultato = $obj->updateAndInsert($_POST,$_FILES);
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","jsback");
		} elseif(str_replace(strstr($risultato,"|"),"",$risultato)=="-1") {
			$html = returnmsg(str_replace("|","",strstr($risultato,"|")),"jsback");
		} else {
			$id = str_replace( "|","",stristr( $risultato, "|")) ; 
			if ($command == "aggiungiStep2") $html = returnmsgok("{Done.}","load index.php");
			if ($command == "aggiungiStep2reload") $html = returnmsgok("{Done.}","load index.php?op=modifica&id=".$id."");
			if ($command == "aggiungiStep2checkout") $html = returnmsgok("{Done.}","load index.php?op=checkout&id=".$id);
		}
		break;

	case "checkout":
		$risultato = $obj->checkoutForm($parameter);
		$html = $risultato;
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","jsback");
		} elseif ($risultato=="-1") {
			$html = returnmsg("{Missing payments configuration}","link index.php?op=modifica&id=".$parameter);
		}
		break;
	
	case "stats":
		$risultato = $objDashboard->getCharts($parameter,$combobanner,$startdate,$enddate);
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","jsback");
		} else {
			$html = $risultato;
		}
		break;
	case "dashboard":
    case "dashboardnew":
            $risultato = $objDashboard->getDashboardNew($startdate,$enddate,$combosite);
            if ($risultato=="0") {
                $html = returnmsg("{You're not authorized.}","jsback");
            } else {
                $html = $risultato;
            }
            break;        
	default:
		$gu = new BANNER_gestioneutenti("frw_utenti",40,"name","asc",0);
		$gu->checkAdAdminUser();
	
		$elenco = $obj->elenco($combotipo,$comboclient,$combocampaign,$keyword);
		if($elenco!="0") {

			$bodyclass="";
			if($session->get("idprofilo")>=20) $bodyclass .='admin ';
			if($session->get("idprofilo")==5) $bodyclass.=' advertiser';
			if($session->get("idprofilo")==5 && PAYMENTS=="OFF") $bodyclass.=' nopayments';

			$html = loadTemplateAndParse ("template/elenco.html");
			$html = str_replace("##corpo##", $elenco, $html);
			$html = str_replace("##bodyclass##", $bodyclass, $html);

			$html = str_replace("##keyword##", $keyword, $html);
			
			if($session->get("idprofilo")>5 || 
				(PAYMENTS=="ON" && $session->get("idprofilo")==5) ) {
				$html = str_replace("##bottoni1##","<a href=\"$obj->linkaggiungi\" title=\"{Add new item}\" class='aggiungi'></a>", $html);
				$html = str_replace("##bottoni2##","<a href=\"$obj->linkeliminamarcate\" title=\"{Delete selected items}\" class='elimina'></a>", $html);
			} else {
				$html = str_replace("##bottoni2##","", $html);
				$html = str_replace("##bottoni1##","", $html);
			}

			$html = str_replace("##combotipo##", $obj->getHtmlcombotipo($combotipo), $html);
			$html = str_replace("##comboclient##", $obj->getHtmlcomboclient($comboclient), $html);
			$html = str_replace("##combocampaign##", $obj->getHtmlcombocampaign($combocampaign), $html);

		} else {
			$html = returnmsg("{You're not authorized.}");
		}

}



print translateHtml($html);

