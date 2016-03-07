<?php

$dir = "data";
$files = [];
// Open a directory, and read its contents
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            array_push($files, $file);

        }
        $files = json_encode($files);
        print_r($files);
        closedir($dh);
    }
} else {
    echo "Not dir";
}
