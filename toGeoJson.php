<?php

$text = "";
$file = $_POST["file"];
$usr = $_POST['name'];

if (is_array($usr)){
  var_dump("array");
  $text = '{ "type": "MultiLineString",
      "coordinates": [';
} else {
  $text = '{ "type": "LineString",
      "coordinates": [';
}

$fichier = fopen("data/".$file, "r");

// Lecture du fichier ligne par ligne
while (!feof($fichier)) {
    $ligne = trim(fgets($fichier));
    $lineRight = preg_match('#^[a-zA-Z0-9].*\s[0-9].*\s-?[0-9].*\s-?[0-9]#', $ligne);
    if ($ligne != "" || $lineRight === false) {
        $ligne = preg_replace('!\s+!', ' ', $ligne);
        list($name, $date, $lat, $long) = split(" ", $ligne);
        //var_dump($name);
        //si name est égale au usr passé en post on ajoute les cordonnées
        /*$index = 0;
        if (is_array($usr)) {
          $text .= "[";
          for ($i = 0; $i < sizeof($usr); $i++) {
            if ($name == $usr[$i]) {
              ligneCoor($index);
              //$text .= '['.$long.', '.$lat.'], ';
            }
            $index++;
            $text .= "],";
          }
          $text = substr_replace($text, '', -2);

        }*/
        //pas de tableau
        if ($name == $usr) {
            
            $text .= '['.$long.', '.$lat.'], ';
        }
    }
}

fclose($fichier);

$text = substr_replace($text, '', -2); // to get rid of extra comma
$text .= "]}";
echo $text;




function ligneCoor($index) {
  $text .= '['.$long.', '.$lat.'], ';
}
