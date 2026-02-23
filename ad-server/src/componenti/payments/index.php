<?php
/*
	handler for payments to webmaster list
*/
$root="../../../";
include($root."src/_include/config.php");
include($root."src/_include/grid.class.php");
include($root."src/_include/formcampi.class.php");
include("_include/payments.class.php");
include("_include/grid_callbacks.php");


print $ambiente->setPosizione( "{Payments}" );

$obj = new Payments();

$html="";

$command = getVar("op", ["", ["modifica","modificaStep2"]]);
$parameter = (int)getvar("id");
$combotipo = (int)getvar("combotipo", ["-999",null, $obj->tbdb]);
$keyword = getvar("keyword", ["",null, $obj->tbdb]);


switch ($command) {
	case "modifica":
		$risultato = $obj->getDettaglio( $parameter, $command );
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","jsback");
		} else $html = $risultato;
		break;
	case "modificaStep2" :
		$risultato = $obj->updateAndInsert($_POST,$_FILES);
		if ($risultato=="0") {
			$html = returnmsg("{You're not authorized.}","jsback");
		} elseif(str_replace(strstr($risultato,"|"),"",$risultato)=="-1") {
			$html = returnmsg(str_replace("|","",strstr($risultato,"|")),"jsback");
		} else {
			if ($command != "modificaStep2reload") $html = returnmsgok("{Done.}","reload");
				else $html = returnmsgok("{Done.}","load ".$_SERVER['SCRIPT_NAME']."?op=modifica&id={$parameter}");
		}
		break;
}

if ($html=="") {
	$html = loadTemplateAndParse ("template/elenco.html");
	$html = str_replace("##corpo##", ($obj->elenco($combotipo,$keyword)), $html);
	$html = str_replace("##keyword##", $keyword, $html);
	$html = str_replace("##combotipo##", $obj->getHtmlcombotipo($combotipo), $html);
}


print translateHtml($html);
