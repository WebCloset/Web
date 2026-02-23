<?php
/*

	manage campaigns

*/


$root="../../../";
include($root."src/_include/config.php");
include($root."src/_include/grid.class.php");
include($root."src/_include/formcampi.class.php");
include($root."src/_include/crudbase.class.php");
include("../7banner/_include/banner.class.php");
include("_include/campagne.class.php");
include("_include/grid_callbacks.php");

// update position in html
print $ambiente->setPosizione( "{Campaigns}" );

$obj = new Campagne();
$obj->setAmbiente( $ambiente );	// bind the ambiente

$command = getVar("op", ["", ["modifica","modificaStep2","eliminaSelezionati","aggiungi","aggiungiStep2"]]);
$parameter = (int)getvar("id");
$combotipo = getvar("combotipo", ["-999",null, $obj->seskey]);
$keyword = getvar("keyword", ["",null, $obj->seskey]);

switch ($command) {
	case "modifica":
		$obj->getDettaglio( $parameter, $command );
		break;
	case "modificaStep2" :
		$obj->updateAndInsert($_POST,$_FILES);
		break;
	case "eliminaSelezionati":
		$obj->eliminaSelezionati($_POST);
		break;
	case "aggiungi":
		$obj->getDettaglio( $parameter, $command );
		break;
	case "aggiungiStep2":
		$obj->updateAndInsert($_POST,$_FILES);
		break;
	default:
		$obj->elenco($combotipo,$keyword);

}


print translateHtml( $ambiente->loadAndParse() );
