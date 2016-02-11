
// Init Map
var map = L.map('map').setView([49.1659277, -0.2948727], 11);
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; ' + mapLink,
    maxZoom: 18,
}).addTo(map);

/*var routeControl = L.Routing.control({waypoints: []
}).addTo(map);*/


/*var routingControl1 = L.Routing.control({
    waypoints: [
        L.latLng(49.2268483,	-0.3732036),
        L.latLng(49.226677,	-0.3732356),
    ],
    routeWhileDragging: false,
}).addTo(map);
routingControl1.hide();*/



// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    }
});
map.addControl(drawControl);

$(document).ready(function(){

  //Choix du fichier
  var file = "";
  var select = '<div class="form-group">'
                + '<label for="file">Sélectionnez un fichier:</label>'     ;
  $.post('selectFile.php', function(data){
    select += '<select class="form-control" id="file">'
              + '<option value="">Sélectionnez un fichier</option>';
      for(k in data){
        select += '<option value="'+data[k]+'">'+data[k]+'</option>';
      }
      select += "</select>"
      $(".menu").append(select);
  }, 'JSON');
  var fileName = "";
  $(".menu").on("change", "#file", function(){
    fileName = $("#file option:selected").attr("value");
    console.log(fileName);
    $('#menuYoupubers').remove();
    //géneration du menu youpubers
    var html = "";
    $.post('getMenuUsr.php', {file: fileName}, function(data){
        html = '<div id="menuYoupubers">';
        for(k in data){
          html += '<div class="item-menu"><a class="btn btn-default youpuber">'+data[k]+'</a></div>';
        }
        html += '</div>';

        $(".menu").append(html);


    },'JSON');
  });


  /*============================================
  Récuperation de trace on click des youpubers
  ===========================================*/
  var geoJson = "";
  var name = "";
  $(".menu").on("click", "a.youpuber", function(){
    name = $(this).text();
    console.log(name);
    /*addRoutes();
    $.post('toRouteFile.php', {file: fileName, name: name}, function(data){*/

        /*$.each(data, function(key, value){
          //alert(key+' '+value);
          var newLatLng = new L.LatLng(data[key].latitud, data[key].longitude);
          routeControl.spliceWaypoints(0, 0, newLatLng);
        });*/

    //},'JSON');

    $.post('toGeoJson.php', {file: fileName, name: name}, function(geoJson){
        console.log(geoJson)
        clearMap();
        addGeoJson(geoJson);
    },'JSON');
  });

});

//add trace
var addGeoJson = function(data) {
  L.geoJson(data, {
    style: {
      color: '#ff0000',
      weight: 5,
      opacity: 1
    }
  }).addTo(map);
}
// clear traces
var clearMap = function() {
    for(i in map._layers) {
        if(map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
}

// waypoints function

var addRoutes = function() {

  var routingControl = L.Routing.control({
      waypoints: [
          L.latLng(49.2153508,	-0.5894552),
          L.latLng(49.2761408,	-0.7016768),
      ],
      routeWhileDragging: false,
  }).addTo(map);
  routingControl.hide();
}
