<?php

$map = require __DIR__ . '/../../../src/vendor/composer/autoload_classmap.php';

if(file_exists(__DIR__ . '/../../../src/vendor/composer/autoload_classmap.php')) {  
    echo "found file\n\n";
    foreach ($map as $class => $path) {
        echo "map: " . $class . " => " . $path . "\n";
        if (str_contains($class, 'Altcha')) {
            echo "FOUND!\n";
        }
    }
} else {
    echo "not found\n\n";
}
