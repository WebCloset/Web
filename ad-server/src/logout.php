<?php
$root="../";
include("_include/config.php");

$logger->addlog( 2 , "{ending session user #".$session->get("idutente")."}" );
setcookie($session->prefix."comein","",time()-3600,"/");
$session->finish();
print $ambiente->loadLogin("See you soon.");

?>
