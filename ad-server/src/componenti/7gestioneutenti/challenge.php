<?php
/*

	captcha challenge

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
// echo "Challenge created: " . 
echo json_encode($challenge);

// // Example payload to verify
// $payload = [
//     'algorithm' => $challenge->algorithm,
//     'challenge' => $challenge->challenge,
//     'number'    => 12345, // Example number
//     'salt'      => $challenge->salt,
//     'signature' => $challenge->signature,
// ];

// // Verify the solution
// $ok = $altcha->verifySolution($payload, true);

// if ($ok) {
//     echo "Solution verified!\n";
// } else {
//     echo "Invalid solution.\n";
// }
