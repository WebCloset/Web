<?php
/*

	ajax call handler for banners

*/

$root="../../../";
include($root."src/_include/config.php");
include("_include/banner.class.php");

$obj = new Banner();
$obj->uploadDir = $root."data/dbimg/media/";
$obj->max_files= 2;

$html=""; $command="";

$command = getVar("op",["",["go","pause","region","city","posizione","coinbase","manual"]]);
$parameter = (int)getVar("id");

//esegue eventuali comandi passati
switch ($command) {
	case "go":
		$obj->setStato($parameter,"A");
		$html = "ok";
		break;
	case "pause":
		$obj->setStato($parameter,"P");
		$html = "ok";
		break;
	case "region":
		$html = $obj->getListRegion($_GET['country']);
		break;
	case "city":
		$html = $obj->getListCity($_GET['country'],$_GET['region']);
		break;
	case "posizione":
		$html = $obj->getPosInfo($parameter);
		break;
	case "coinbase":
		$html = $obj->coinbase_getCharge($parameter);
		break;
    case "manual":
        $html = $obj->manual_pay($parameter);
        break;

}



print translateHtml( $html );

?>