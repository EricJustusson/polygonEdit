function initialize () {
	var COLORS = [["red", "#ff0000"], ["orange", "#ff8800"], ["green","#008000"],
 	["blue", "#000080"], ["purple", "#800080"]];
  var map = new google.maps.Map(document.getElementById("map"),{zoom: 14,
                                                                 center: new google.maps.LatLng(50.909528, 34.811726),
                                                                 mapTypeId: google.maps.MapTypeId.ROADMAP
                                                                });
  var mapPolygon = new google.maps.Polygon({map : map,
                                       strokeColor   : '#ff0000',
                                       strokeOpacity : 0.6,
                                       strokeWeight  : 4,
                                       path:[new google.maps.LatLng(50.91607609098315,34.80485954492187),new google.maps.LatLng(50.91753710953153,34.80485954492187),new google.maps.LatLng(50.91759122044873,34.815159227539056),new google.maps.LatLng(50.9159678655622,34.815159227539056),new google.maps.LatLng(50.91044803534999,34.81258430688476),new google.maps.LatLng(50.91044803534999,34.81584587304687),new google.maps.LatLng(50.90931151845126,34.81533088891601),new google.maps.LatLng(50.90931151845126,34.811897661376946),new google.maps.LatLng(50.90395327929007,34.8094944020996),new google.maps.LatLng(50.9040074060014,34.80700531213378),new google.maps.LatLng(50.90914915662899,34.809666063476556),new google.maps.LatLng(50.90920327729935,34.8065761586914),new google.maps.LatLng(50.91033979684091,34.80700531213378),new google.maps.LatLng(50.910285677492006,34.81035270898437),new google.maps.LatLng(50.91607609098315,34.81301346032714)]
                                      });
  var followLine;
																			
  mapPolygon.runEdit(true);
  document.getElementById("newPolygon").onclick = function () {
    mapPolygon.stopEdit();
    //remove overlay from map
    mapPolygon.setMap(null);
   	mapPolygon = null;
   	google.maps.event.clearListeners(map, "click");
  	google.maps.event.clearListeners(map, "mousemove");
   	mapPolygon = new google.maps.Polygon({map : map,
                                       strokeColor   : '#ff0000',
                                       strokeOpacity : 0.6,
                                       strokeWeight  : 4,
                                       path:[]
                                      });	
		followLine = new google.maps.Polyline({
	  	path: [],
	  	strokeColor: "#787878",
	  	strokeOpacity: 1,
	  	strokeWeight: 4
	  });
		map.setOptions({ draggableCursor: 'crosshair' });
		
		google.maps.event.addListener(map, 'click', function(point) {
			console.log('click');
			if (!typeof(followLine) === "undefined") {
				followLine.setMap(null);
				followLine = null;
			
			}	
			/* keep below */
			mapPolygon.stopEdit();
	    mapPolygon.getPath().push(point.latLng);
	    mapPolygon.runEdit(true);
			/* keep above */
			
    });
		
		google.maps.event.addListener(map, 'mousemove', function(point) {
   		
			/*
   		mapPolygon.stopEdit();
     	mapPolygon.getPath().push(point.latLng);
     	mapPolygon.runEdit(true);
   		*/
 			
			//map.setOptions({ draggableCursor: 'crosshair' });
			
			var pathLength = mapPolygon.getPath().getLength();
   		if(pathLength >= 1) {
				console.log('move');
				var startingPoint = mapPolygon.getPath().getAt(pathLength - 1);
     		var startPoint = new google.maps.LatLng(startingPoint.lat(), startingPoint.lng());
				
				var followCoordinates = [startPoint, point.latLng];
     		followLine.setPath(followCoordinates);
            followLine.setMap(map);
				
			}
 			// end if length > 1
 		});
		
 		// end mousmove listener
 	}
}
