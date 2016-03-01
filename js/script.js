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
        L.latLng(49.2266851, -0.3732473),
        L.latLng(49.3133918, -0.3548033),
        L.latLng(49.3133155, -0.3537108),
        L.latLng(48.4534015, -2.0445218)
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

/*============================================
=============== GET DATA ==================
============================================*/


var fileName = "";
$(".menu").on("change", "#file", function(){
  fileName = $("#file option:selected").attr("value");
  console.log(fileName);
  $('#menuYoupubers').remove();

  $.post('toJsonArray.php', {file: fileName}, function(data){

    /*========= GENERATE YOUPUBERS MENU ===========*/

    var html = "";
    html = '<div class="youpubers-menu">'
    +'<div class="yprs">';
    $.each(data, function(index, value){
      html += '<div class="checkbox"><label><input type="checkbox" value="'+data[index].name+'">'+data[index].name+'</label></div>';
    });
    html += '</div>'
    +'<div class="control-yprs"><a type="button" class="btn btn-default" id="afficher">Tout afficher</a> '
    +'<a type="button" class="btn btn-default" id="nettoyer">Tout nettoyer</a></div>'
    +'</div>';

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

    clearMap();
    $('.youpubers-menu').remove();
    $(".menu").append(html);

    /*================ GEOJSON ====================*/

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
      //console.log(name);
      $(this).children('label').children('input').toggleClass("checked");
      if($(this).children('label').children('input').hasClass("checked")){
        
          getGeoJson(name);

      } else {
        hideLayer(name);
      }
    });

    /*=======*/

    $(".menu").on('click', '#nettoyer', function(){
      $('.checkbox').children('label').children('input').removeClass("checked");
      $('input[type="checkbox"]').prop('checked', false);
      clearMap();
    })

    $(".menu").on('click', '#afficher', function(){
      $('.checkbox').children('label').children('input').addClass("checked");
      $('input[type="checkbox"]').prop('checked', true);
      $('.yprs .checkbox').each(function(index){
          var name = $('.checkbox label').text();
          console.log(name);
          getGeoJson(name);
      })
    });

    // Generate GeoJson file
    var getGeoJson = function(name){
        var geoJson = {"type": "LineString"};
        var currentName = "";
        $.each(data, function(index, value) {
            if (data[index].name == name) {
                currentName = data[index].name;
                geoJson.properties = {"name": currentName}
                geoJson.coordinates = [];
                $(data[index].details).each(function(i){
                  geoJson.coordinates.push([data[index].details[i].longitud, data[index].details[i].latitud])       
                });
            }
            
        });
        console.log(geoJsonLayer);
        console.log(geoJson);

        geoJsonLayer.addData(geoJson);
        console.log(mapLayerGroups)
    }
    
    // Delete layer from map
    var hideLayer = function(id) {
        var lg = mapLayerGroups[id];
        //console.log(lg._layers);
        for (i in lg._layers){
            //console.log(lg._layers[i]._leaflet_id)
            map.removeLayer(lg._layers[i]);
        }
    }

  }, 'JSON');
});
/*============================================
=============== FUNCTIONS ====================
============================================*/
//console.log(mapLayerGroups)
var showLayer = function(id) {
    var lg = mapLayerGroups[id];
    map.addLayer(31);
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

/*var addRoutes = function() {

  var routingControl = L.Routing.control({
      waypoints: [
          L.latLng(49.2153508,	-0.5894552),
          L.latLng(49.2761408,	-0.7016768)
      ],
      routeWhileDragging: false,
  }).addTo(map);
  routingControl.hide();
}*/
