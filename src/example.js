var map;
var mapPolygon;
var draw;

function initialize () {
  map = new google.maps.Map(
          document.getElementById("map"), {
            zoom: 14,
            center: new google.maps.LatLng(50.909528, 34.811726),
            mapTypeId: google.maps.MapTypeId.ROADMAP
          }
        );
  
  mapPolygon = new google.maps.Polygon({
                  map           : map,
                  fillColor: "#FF0000",
                  fillOpacity: .15,
                  strokeColor   : '#787878',
                  strokeOpacity : .8,
                  strokeWeight  : 4,
                  path          : [
                    new google.maps.LatLng(50.91607609098315,34.80485954492187),
                    new google.maps.LatLng(50.91753710953153,34.80485954492187),
                    new google.maps.LatLng(50.91759122044873,34.815159227539056),
                    new google.maps.LatLng(50.9159678655622,34.815159227539056),
                    new google.maps.LatLng(50.91044803534999,34.81258430688476),
                    new google.maps.LatLng(50.91044803534999,34.81584587304687),
                    new google.maps.LatLng(50.90931151845126,34.81533088891601),
                    new google.maps.LatLng(50.90931151845126,34.811897661376946),
                    new google.maps.LatLng(50.90395327929007,34.8094944020996),
                    new google.maps.LatLng(50.9040074060014,34.80700531213378),
                    new google.maps.LatLng(50.90914915662899,34.809666063476556),
                    new google.maps.LatLng(50.90920327729935,34.8065761586914),
                    new google.maps.LatLng(50.91033979684091,34.80700531213378),
                    new google.maps.LatLng(50.910285677492006,34.81035270898437),
                    new google.maps.LatLng(50.91607609098315,34.81301346032714)
                  ]
                });
  draw = new polygonDrawer(mapPolygon, true);
  
  google.maps.event.addListener(mapPolygon, 'mousemove', function(point) {
    mapPolygon.setOptions({ 
      fillColor: "#FF0000",
      fillOpacity: .35
      });
  });
  google.maps.event.addListener(mapPolygon, 'mouseout', function(point) {
    mapPolygon.setOptions({ 
      fillColor: "#FF0000",
      fillOpacity: .15
      });
  });
  draw.initControl();
}
