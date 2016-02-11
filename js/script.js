/*============================================
================ INIT MAP ====================
============================================*/

var map = L.map('map').setView([49.1659277, -0.2948727], 11);
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; ' + mapLink,
    maxZoom: 18,
}).addTo(map);

/*var routeControl = L.Routing.control({waypoints: []
}).addTo(map);


var routingControl1 = L.Routing.control({
    waypoints: [
        L.latLng(49.2268483,	-0.3732036),
        L.latLng(49.226677,	-0.3732356),
    ],
    routeWhileDragging: false,
}).addTo(map);
routingControl1.hide();*/


/*============================================
============== LEAFLET DRAW ==================
============================================*/

// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
    draw: {
      polyline: false,
      marker:false
    },
    edit: {
        featureGroup: drawnItems,
        edit: false
    }
});
//drawControl.removeFrom(map);
/*$('.leaflet-draw').is(':visible') ? drawControl.removeFrom(map) :*/ drawControl.addTo(map);


// create draw
map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'rectangle') {
        //var area = L.GeometryUtil.geodesicArea(layer.getLatLngs());
        var rectangle = layer.getLatLngs();
        alert(rectangle);
        alert(layer.getBounds().toBBoxString());
        //$.each(rectangle, )
    }
    if (type === 'circle') {
        alert(layer.getBounds().toBBoxString());
    }
    if (type === 'polygon') {
        alert(layer.getBounds().toBBoxString());
    }
    // Do whatever else you need to. (save to db, add to map etc)
    drawnItems.addLayer(layer);
});

/*============================================
=============== FILE CHOICE ==================
============================================*/

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

  /*============================================
  ========= GENERATE YOUPUBERS MENU ============
  ============================================*/
  var html = "";
  $.post('getMenuUsr.php', {file: fileName}, function(data){
      html = '<div class="youpubers-menu">'
      +'<div class="yprs">';
      for(k in data){
        html += '<div class="checkbox"><label><input type="checkbox" value="'+data[k]+'">'+data[k]+'</label></div>';
      }
      html += '</div>'
      +'<div class="control-yprs"><a type="button" class="btn btn-default" id="afficher">Tout afficher</a> '
      +'<a type="button" class="btn btn-default" id="nettoyer">Tout nettoyer</a></div>'
      +'</div>';

      clearMap();
      /*if ($(".leaflet-control-container").children('.leaflet-top').children("div:nth-child(2)")) {
        alert('ok');
        $(".leaflet-control-container").children('.leaflet-top').children("div:nth-child(2)").css({"display":"none"});
        //control.removeFrom(map);
      }*/
      /*if (map.hasLayer(drawControl)) {
       map.removeLayer(drawControl);
      }
      else{
         map.addLayer(drawControl);
      } ;*/

      $('.youpubers-menu').remove();
      $(".menu").append(html);

  },'JSON');
});
/*============================================
================ GEOJSON ====================
============================================*/

var mapLayerGroups = []

function onEachFeature(feature, featureLayer) {
  var layerGroup = mapLayerGroups[feature.properties.name];
  if(layerGroup === undefined) {
    layerGroup = new L.layerGroup();
    layerGroup.addTo(map);
    mapLayerGroups[feature.properties.name] = layerGroup;
  }
  layerGroup.addLayer(featureLayer);
}


//var controlLayers = L.control.layers().addTo(map);

var myStyle = {
  "color": "#ff7800",
  "weight": 5,
  "opacity": 0.65
};

/*============================================
Récuperation de trace on click des youpubers
===========================================*/
var geoJson = "";
var name = "";

var geoJsonLayer = L.geoJson(false, {
  style: myStyle,
  onEachFeature: onEachFeature
}).addTo(map);

  $(".menu").on('change', '.checkbox', function() {
      name = $(this).text();
      $(this).children('label').children('input').toggleClass("checked");
      if($(this).children('label').children('input').hasClass("checked")){

        $.post('toGeoJson.php', {file: fileName, name: name}, function(data){
          geoJsonLayer.addData(data);
        },'JSON');
      } else {
        console.log(name);
        hideLayer(name);
      }
  });


$(".menu").on('click', '#nettoyer', function(){
    $('.checkbox').children('label').children('input').removeClass("checked");
    $('input[type="checkbox"]').prop('checked', false);
    clearMap();
})

$(".menu").on('click', '#afficher', function(){
    $('.checkbox').children('label').children('input').addClass("checked");
    $('input[type="checkbox"]').prop('checked', true);
    //showTraces();
})

/*============================================
=============== FUNCTIONS ====================
============================================*/

var showLayer = function(id) {
    var lg = mapLayerGroups[id];
    map.addLayer(lg);
}
var hideLayer = function(id) {
    var lg = mapLayerGroups[id];
    map.removeLayer(lg);
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
          L.latLng(49.2761408,	-0.7016768)
      ],
      routeWhileDragging: false,
  }).addTo(map);
  routingControl.hide();
}
