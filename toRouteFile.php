<?php

$text = "";
$file = $_POST["file"];
$usr = $_POST['name'];
$lat1 = 0;
$long1 = 0;

$fichier = fopen("data/".$file, "r");

// Lecture du fichier ligne par ligne
while (!feof($fichier)) {
    $ligne = trim(fgets($fichier));
    $lineRight = preg_match('#^[a-zA-Z0-9].*\s[0-9].*\s-?[0-9].*\s-?[0-9]#', $ligne);
    if ($ligne != "" || $lineRight === false) {
        $ligne = preg_replace('!\s+!', ' ', $ligne);
        list($name, $date, $lat, $long) = split(" ", $ligne);
        //pas de tableau

        if ($name == $usr) {
            if($lat1 != $lat && $long1 != $long){
                $text = 'L.LatLng('.$long.', '.$lat.'), ';
                //echo $text;
                //$text = array('latitude' => $lat, 'longitude' => $long);
                //echo json_encode($text);
            }
            $lat1 = $lat;
            $long1 = $long;
        }
    }
}

fclose($fichier);

$text = substr_replace($text, '', -2); // to get rid of extra comma
echo $text;
