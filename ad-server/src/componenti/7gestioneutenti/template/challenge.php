<?php
/*

	captcha challenge with Altcha

*/
$public = true;

$root="../../../";

// config
include($root."src/_include/config.php");

use \AltchaOrg\Altcha\ChallengeOptions;
use \AltchaOrg\Altcha\Altcha;


$altcha = new Altcha('dslkslkfdksdkls');

// Create a new challenge
$options = new ChallengeOptions(
    maxNumber: 50000, // the maximum random number
    expires: (new \DateTimeImmutable())->add(new \DateInterval('PT10S')),
);

$challenge = $altcha->createChallenge($options);

echo json_encode($challenge);