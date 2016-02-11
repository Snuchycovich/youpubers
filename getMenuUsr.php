<?php

$file = $_POST["file"];
$fichier = fopen("data/".$file, "r");
$youpubers = [];
// Lecture du fichier ligne par ligne
while (!feof($fichier)) {
    $ligne = trim(fgets($fichier));
    if ($ligne != "") {
        $ligne = preg_replace('!\s+!', ' ', $ligne);
        list($name, $date, $lat, $long) = split(" ", $ligne);

        if (! in_array($name, $youpubers)) {
            array_push($youpubers, $name);
        }

    }
}
$youpubers = json_encode($youpubers);
print_r($youpubers);
fclose($fichier);
