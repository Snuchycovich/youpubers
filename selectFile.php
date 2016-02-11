<?php

$dir = "data";
$files = [];
// Open a directory, and read its contents
if (is_dir($dir)){
  if ($dh = opendir($dir)){
    while (($file = readdir($dh)) !== false){
      if( $file == '.' || $file == '..')
                continue;
      array_push($files, $file);

      //$fileName = fopen("data/".$file,"r");
      //var_dump($fileName);

      /*$lines = file("data/".$file);
      $last = sizeof($lines) - 1 ;
      var_dump($last);
      $index = 0;
      while (! feof($fileName)) {
          $ligne = trim(fgets($fileName));
          if ($ligne != "") {
            $ligne = preg_replace('!\s+!', ' ', $ligne);
            list($name, $date, $lat, $long) = split(" ", $ligne);*/
            /*var_dump($name);
            var_dump(date('Y-m-d H:i:s', $date/1000));
            var_dump($lat);
            var_dump($long);*/

            /*$geoJson = fopen("geoJson/".$file.".json", "w");
            var_dump($index);
            if($index == $last) {
              $text .= '['.$long.', '.$lat.']]}';
            } else {
              $text .= '['.$long.','.$lat.'], ';
            }
            $index++;
            fwrite($geoJson, $text);
            fclose($geoJson);
          }
      }

      fclose($fileName);*/
      }
    $files = json_encode($files);
    print_r($files);
    closedir($dh);
  }
} else {
  echo "Not dir";
}
/*$lines = file('filename.txt');
$last = sizeof($lines) - 1 ;
unset($lines[$last]);

// write the new data to the file
$fp = fopen('filename.txt', 'w');
fwrite($fp, implode('', $lines));
fclose($fp);*/
