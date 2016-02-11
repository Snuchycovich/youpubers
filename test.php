<?php

//$ligne = "	1453275069764	49.2003516	-0.36005";
//$ligne = "PrincessMag	1452882907581	49.1992523	-0.3358424";
//$ligne = "castlo    84548  -54545  -455646";

//if(preg_match('#^[a-zA-Z]!\s+!.+!\s+!.+!\s+!.+#', $ligne)){
/*if(preg_match('#^[a-zA-Z0-9].*\s[0-9].*\s-?[0-9].*\s-?[0-9]#', $ligne)){
  echo "true";
} else {
  echo "false";
}*/
$fichier = fopen("data/20160118", "r");
while (!feof($fichier)) {
    $ligne = trim(fgets($fichier));
    $lineRight = preg_match('#^[a-zA-Z0-9].*\s[0-9].*\s-?[0-9].*\s-?[0-9]#', $ligne);
    $index = "0";
    if ($lineRight == false) {
      echo $ligne;
      echo $index;
    }
}

fclose($fichier);
