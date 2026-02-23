<?php
/*
	move file, for gallery items
*/
$root="../../../";
include($root."src/_include/config.php");
if($session->get("idutente")!="") {
	if(isset($_GET['da']) && isset($_GET['a']) && isset($_GET['div0'])) {
		$da = base64_decode($_GET['da']);
		$a = base64_decode($_GET['a']);
		$div0 = base64_decode($_GET['div0']);

		
		// riceve tutti gli altri dati per completare
		// la rigenerazione della stessa loadgallery
		// che ha inviato la chiamata
		if (isset($_GET['data'])) {
			$data = (array)json_decode(stripslashes($_GET['data']));
		} else {
			$data = null;
		}


		if($da && $a && $div0) die ( spostafilegallery($da,$a,$div0, $data) ); else die("ko3");
	} else die("ko2");
}
die("ko");