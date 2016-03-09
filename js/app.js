var mapApp = angular.module('mapApp',[]).controller('mapController', function($scope, $http) {
	
	// Nom du ficher selectionné
	$scope.file = "";
	//Tableau de fichiers
	$scope.filesByDate = [];
	//Liste de voitures par campagne
	$scope.ypByCampagne = []; 
	// Nombre de voitures dans une campagne
	$scope.nbYP = null;
	// nombre de véhicules selectionnes
	$scope.nbSelectedYP = 0;
	//Condition pour afficher l'icone du chargement
	$scope.onloadData = false;/*je n'utilise plus*/
	//Condition pour afficher l'icone du chargement dans la map
	$scope.onloadTrace = false;

	/*=======================*/
	$scope.youpubers = [];
	//Tableau de traces
	$scope.traceArray = [];
	//Layer Groupe pour le traces
	$scope.traces = null;/*L.layerGroupe($scope.traceArray);*/

	//Methode initMap to show the map and the files choice
	$scope.initMap = function(){
		map = L.map('map').setView([49.1659277, -0.2948727], 11);
	    mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'
	    L.tileLayer(
	        '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	        attribution: 'Map data &copy; ' + mapLink,
	        maxZoom: 18,
	    }).addTo(map);
	    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
	    $http.post('selectFile.php').then(function succes(response){
	    	for(i in response.data){
	    		$scope.filesByDate.push(response.data[i]);
	    	}
	    }, function error(response){
	    	console.log('Error pendant le chargement des fichiers...');
	    });
	}
	
	//Method getData to build the youpubers menu  
	$scope.getData = function(obj){
		$scope.initDraw();
		$scope.onloadData = true;
		$scope.onloadTrace = true;
		$scope.cleanMap();
		$scope.file = obj.target.attributes.data.value;
		
		var data = {file: $scope.file};

		if($scope.ypByCampagne.length > 0){
			$scope.ypByCampagne = [];
		}
		$http.post('toJsonArray.php', data).then(function succes(response){
			
			//Tableau des waypoints
			//var wayPoints = [];

			//On rempli le tableau ypByCampagne pour afficher le menu
			for(i in response.data){
				$scope.ypByCampagne.push(response.data[i].name);
			}

			//On reutilise le tableau ypByCampagne pour créer des "variables dynamiques" dans un autre tableau
			// et séparer le trace de chaque youpuber 
			for(i in $scope.ypByCampagne){
				var youpuber = $scope.ypByCampagne[i]
				$scope.youpubers.push(youpuber);
				$scope.youpubers[youpuber] = L.Routing.control({
			        waypoints: [
			            ],
			        routeWhileDragging: false,
			        draggableWaypoints: false,
			        createMarker: function(i, wp, n) {
			        	if (i == (n-1) || i == 0) {
			        		return L.marker(wp.latLng);
			        	}
						
					},
			        geocodersClassName: youpuber
		        });
		        //$scope.youpubers[youpuber].hide();
				$scope.getAllTraces($scope.file, youpuber);
				$scope.traceArray.push($scope.youpubers[youpuber]);
			}

			//On rentre le tracé dans le layer groupe et on l'affiche
			$scope.traces = L.layerGroup($scope.traceArray).addTo(map);

			// Affichage du nombre de véhicules dans la campagne
			$scope.nbYP = $scope.ypByCampagne.length;
			$scope.nbSelectedYP = $scope.ypByCampagne.length;
			
			//On Check toutes les checkboxes
			$('.youpuber input[type="checkbox"]').prop('checked', true);

			// On a fini le chargement (icone chargement)
			$scope.onloadData = false;
			console.log($scope.youpubers['pika']);
		}, function error(response){
			console.log('Error pendant le chargement des donnes par fichier...');
		});
	}
	
	//Get the trace for each youpuber
	$scope.getIndividualTrace = function(obj){
		
		//On récupere l'identifiant du youpuber 
		var name =  obj.target.attributes.value.value;

		if(obj.target.getAttribute("checked") == "checked"){
			
			/*=== Si le checkbox est coché ===*/
			
			//On decoche le checkbox
			obj.target.setAttribute("checked", false);	
			// On decremente le nombre de youpubers affichés
			$scope.nbSelectedYP--;
			// Supprimer le layer du youpuber coché			
			$scope.traces.removeLayer($scope.youpubers[name]);
		
		} else {
			/*=== Si le checkbox est decochée ===*/

			//On increment le nombre de véhicules affiches 
			$scope.nbSelectedYP++;

			//On cheque le checkbox correspondant
			obj.target.setAttribute("checked", "checked");
			
			$scope.youpubers.push(name);
			$scope.youpubers[name] = L.Routing.control({
			        waypoints: [
			            ],
			        routeWhileDragging: false,
			        draggableWaypoints: false,
			        createMarker: function() { return null; },
			        geocodersClassName: name
		        })/*.addTo(map)*/;
		        //routingControl.hide();
			
			// Waypoint array
			var wayPoints = [];
			
			var data = {file: $scope.file, name: name}
			
			$http.post('toJsonName.php', data).then(function succes(response){
				
		        for(i in response.data){
		        	//console.log(response.data[i]);
		        	for(x in response.data[i].details) {
		        		//console.log(response.data[i].details[x]);
		        		var latLng = L.latLng(response.data[i].details[x].latitud, response.data[i].details[x].longitud);
		        		wayPoints.push(latLng);
		        	}
		        }
		        //
		        $scope.youpubers[name].setWaypoints(wayPoints);
	   			//
	   			$scope.traces.addLayer($scope.youpubers[name]);
	   			//
	   			$scope.onloadTrace = false;
			}, function error(response){
				console.log('Error pendant le chargement des donnes par fichier...');
			});
		}
	}
	//Obtenir les données pour crée les traces pour tous les youpubers
	$scope.getAllTraces = function(file, name){
		// Waypoint array
		var wayPoints = [];
		// Tableau de données pour envoyer en post
		var data = {file: file, name: name}

		$http.post('toJsonName.php', data).then(function succes(response){
				        
	        for(i in response.data){
	        	for(x in response.data[i].details) {
	        		var latLng = L.latLng(response.data[i].details[x].latitud, response.data[i].details[x].longitud);
	        		wayPoints.push(latLng);
	        	}
	        }
	        $scope.youpubers[name].setWaypoints(wayPoints);

	    });
	    $scope.onloadTrace = false;
	}
	
	// Check all checkboxes and show all traces
	$scope.showAll = function() {
		$scope.cleanAll();
		$scope.nbSelectedYP = $scope.ypByCampagne.length;
        $('.youpuber input[type="checkbox"]').prop('checked', true)
        
        for(i in $scope.ypByCampagne){
        	document.querySelector('#c-'+ $scope.ypByCampagne[i]).setAttribute("checked", "checked");
			$scope.youpubers.push($scope.ypByCampagne[i]);
        	$scope.youpubers[$scope.ypByCampagne[i]] = L.Routing.control({
		        waypoints: [
		            ],
		        routeWhileDragging: false,
		        draggableWaypoints: false,
		        createMarker: function() { return null; },
		        geocodersClassName: $scope.ypByCampagne[i]
	        })
			$scope.getAllTraces($scope.file, $scope.ypByCampagne[i]);
			
			$scope.traces.addLayer($scope.youpubers[$scope.ypByCampagne[i]]);
		}

		/*$scope.createRoutes = function(){
			$scope.youpubers.push($scope.ypByCampagne[i]);
        	$scope.youpubers[$scope.ypByCampagne[i]] = L.Routing.control({
		        waypoints: [
		            ],
		        routeWhileDragging: false,
		        draggableWaypoints: false,
		        createMarker: function() { return null; },
		        geocodersClassName: $scope.ypByCampagne[i]
	        })
			$scope.getAllTraces($scope.file, $scope.ypByCampagne[i]);
		}*/
		


	}
	// Clean traces form one campagne
	$scope.cleanAll = function(){
		$scope.nbSelectedYP = 0;
		$('.youpuber input[type="checkbox"]').prop('checked', false)
		for(i in $scope.ypByCampagne){
			document.querySelector('#c-'+ $scope.ypByCampagne[i]).setAttribute("checked", "");
			$scope.traces.removeLayer($scope.youpubers[$scope.ypByCampagne[i]]);

		}
	}


	// Clean all traces from the map
	$scope.cleanMap = function(){
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

	//To know if array is not empty 
	$scope.isNotEmpty = function(tab){
		if(tab.length > 0){
			return true;
		} else {
			return false;
		}
	}

	/*===== DRAW AREAS=====*/
	
	$scope.initDraw = function(){ 
		// Initialise the FeatureGroup to store editable layers
		var drawnItems = new L.FeatureGroup();
		  map.addLayer(drawnItems);

		// Initialise the draw control and pass it the FeatureGroup of editable layers
		var drawControl = new L.Control.Draw({
		  	draw: {
			    polyline: false,
			    rectangle: false,
			    circle: false,
			    marker:false
		  	},
		  	edit: {
			      featureGroup: drawnItems,
			      edit: false
		  }
		});
		drawControl.addTo(map)

		// create draw
		map.on('draw:created', function (e) {
	
		  	var type = e.layerType,
		      	layer = e.layer;

		  	/*if (type === 'rectangle') {
			      //var area = L.GeometryUtil.geodesicArea(layer.getLatLngs());
			      var rectangle = layer.getLatLngs();
			      alert(rectangle);
			      alert(layer.getBounds().toBBoxString());
			      //$.each(rectangle, )
		  	}
			if (type === 'circle') {
			  alert(layer.getBounds().toBBoxString());
			}*/
			if (type === 'polygon') {
				$scope.cleanAll();
    			
    			//area en m²
    			var seeArea = L.GeometryUtil.geodesicArea(layer.getLatLngs());
    			console.log(seeArea);

				console.log(layer.getBounds().toBBoxString());
				var boundes = layer.getBounds().toBBoxString();
				var res = boundes.split(",");
				console.log(res);
				var lng1 = res[0];
				var lat1 = res[1];
				var lng2 = res[2];
				var lat2 = res[3];
				console.log(lat1+ " "+ lng2);
			}
			// Do whatever else you need to. (save to db, add to map etc)
			drawnItems.addLayer(layer);
		});
	}
		
});