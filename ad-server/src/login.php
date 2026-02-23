<?php
/*

	Login process

*/
$root="../";

$public = true;

include($root."src/_include/config.php");

$msg = strip_tags( setVariabile("msg","") );
$login_form = "";

//
// try to login using username and password in POST
// (login is public, so no need to check if logged here
// because config.php check only on not public pages)
//

if (!$login->logged()) {
	//
	// if it fails, retrieve the login form
	//
	$session->finish();
	$login_form = $login->getLoginForm(isset($_POST[$login->usernamevar]) ? "fail" : "", $_GET["redirectUrl"] ?? '');
} else {
	//
	// user is logged, redirect to index.php
	//
	echo "<script>document.location.href='index.php';</script>";
	die;
}

//
// show login form
//
echo $login_form;

?>