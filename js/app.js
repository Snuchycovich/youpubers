var mapApp = angular.module('mapApp',[]).controller('mapController', function($scope, $http) {
	
	// Nom du ficher selectionné
	$scope.file = "";
	//Tableau de fichiers
	$scope.filesByDate = [];
	//Liste de voitures par campagne
	$scope.ypByCampagne = []; 
	// Nombre de voitures dans une campagne
	$scope.nbYP = null;
	//
	$scope.selectedYP = []; 
	//
	$scope.nbSelectedYP = $scope.selectedYP.length;


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
		$scope.cleanMap();
		$scope.file = obj.target.attributes.data.value;
		var data = {file: $scope.file};
		console.log(data);
		if($scope.ypByCampagne.length > 0){
			$scope.ypByCampagne = [];
		}
		$http.post('toJsonArray.php', data).then(function succes(response){
			console.log(response.data);
			var wayPoints = [];
			for(i in response.data){
				$scope.ypByCampagne.push(response.data[i].name);
			}
			for(i in $scope.ypByCampagne){
				$scope.getAllTraces($scope.file, $scope.ypByCampagne[i]);
			}
			$scope.nbYP = $scope.ypByCampagne.length;
			$scope.nbSelectedYP = $scope.ypByCampagne.length;/* a corriger*/
			$('.youpuber input[type="checkbox"]').prop('checked', true);
		}, function error(response){
			console.log('Error pendant le chargement des donnes par fichier...');
		});
	}
	
	//Get the trace for each youpuber
	$scope.getIndividualTrace = function(obj){
		console.log(obj.target.getAttribute("checked"));
		if(obj.target.getAttribute("checked") == "checked"){
			obj.target.setAttribute("checked", false);	
			$scope.cleanMap(); /*faire revome individuel*/
		} else {
			obj.target.setAttribute("checked", "checked");
			var name =  obj.target.attributes.value.value;
			// Waypoint array
			var wayPoints = [];
			var data = {file: $scope.file, name: name}
			
			$http.post('toJsonName.php', data).then(function succes(response){
				
				//console.log(response.data);
				var routingControl = L.Routing.control({
			        waypoints: [
			            ],
			        routeWhileDragging: false,
			        draggableWaypoints: false,
			        createMarker: function() { return null; },
			        geocodersClassName: name
		        }).addTo(map);
		        routingControl.hide();
		        
		        for(i in response.data){
		        	console.log(response.data[i]);
		        	for(x in response.data[i].details) {
		        		//console.log(response.data[i].details[x]);
		        		var latLng = L.latLng(response.data[i].details[x].latitud, response.data[i].details[x].longitud);
		        		wayPoints.push(latLng);
		        	}
		        }
		        routingControl.setWaypoints(wayPoints);
	   
			}, function error(response){
				console.log('Error pendant le chargement des donnes par fichier...');
			});
		}
	}
	
	$scope.getAllTraces = function(file, name){
		var name =  name;
		console.log(name)
		console.log(file)
		// Waypoint array
		var wayPoints = [];
		var data = {file: file, name: name}
		console.log(data);
		
		$http.post('toJsonName.php', data).then(function succes(response){
			
			//console.log(response.data);
			var routingControl = L.Routing.control({
		        waypoints: [
		            ],
		        routeWhileDragging: false,
		        draggableWaypoints: false,
		        createMarker: function() { return null; },
		        geocodersClassName: name
	        }).addTo(map);
	        routingControl.hide();
	        
	        for(i in response.data){
	        	for(x in response.data[i].details) {
	        		var latLng = L.latLng(response.data[i].details[x].latitud, response.data[i].details[x].longitud);
	        		wayPoints.push(latLng);
	        	}
	        }
	        routingControl.setWaypoints(wayPoints);
	    });
	}
	
	// Check all checkboxes and show all traces
	$scope.showAll = function() {
		$('.cb-yp').addClass("checked");
        $('.youpuber input[type="checkbox"]').prop('checked', true);
        for(i in $scope.ypByCampagne){
			$scope.getAllTraces($scope.file, $scope.ypByCampagne[i]);
		}
	}
	// Clean traces form one campagne
	$scope.cleanAll = function(){
		$('.youpuber input[type="checkbox"]').prop('checked', false);
		$scope.cleanMap();
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


/*================
=== DIRECTIVES ===
================*/

	mapApp.directive('toggleClass', function() {
	    return {
	        restrict: 'A',
	        link: function(scope, element, attrs) {
	            element.bind('click', function() {
	                element.toggleClass(attrs.toggleClass);
	            });
	        }
	    };
	});		
});