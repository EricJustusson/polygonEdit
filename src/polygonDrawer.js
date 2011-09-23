function drawControl() {
  var drawUI = document.createElement('div');
  drawUI.id = 'draw-polygon';
  drawUI.style.backgroundColor = 'white';
  drawUI.style.borderStyle = 'solid';
  drawUI.style.borderWidth = '2px';
  drawUI.style.cursor = 'pointer';
  drawUI.style.textAlign = 'center';
  drawUI.title = 'Click icon to draw a polygon';
  var drawImage = document.createElement('img');
  drawImage.src = "css/polyUp.png";
  drawUI.appendChild(drawImage);
  return drawUI;
}

function clearControl () {
  var clearUI = document.createElement('div');
  clearUI.id = 'clear-polygon';
  clearUI.style.backgroundColor = 'white';
  clearUI.style.borderStyle = 'solid';
  clearUI.style.borderWidth = '2px';
  clearUI.style.cursor = 'pointer';
  clearUI.style.textAlign = 'center';
  clearUI.title = 'Click to clear the polygon';
  var clearText = document.createElement('p');
  clearText.innerHTML = 'Clear Polygon';
  clearUI.appendChild(clearText);
  return clearUI;
}

function polygonDrawer(polygon, ghosts) {
  var self = this;
  this.polygon = polygon;
  this.ghosts = ghosts;
  this.closed = false;
  this.drawUI = new drawControl;
  this.clearUI = new clearControl;
  this.drawing = false;

  var followLine = new google.maps.Polyline({
                      map: polygon.getMap(),
                      path: [],
                      strokeColor: "#787878",
                      strokeOpacity: .6,
                      strokeWeight: 3
                    });

  var imgGhostVertex = new google.maps.MarkerImage(
                          'css/ghostVertex.png', new google.maps.Size(11, 11),
                          new google.maps.Point(0, 0), new google.maps.Point(6, 6)
                        );

  var imgGhostVertexOver = new google.maps.MarkerImage(
                              'css/ghostVertexOver.png', new google.maps.Size(11, 11),
                              new google.maps.Point(0, 0), new google.maps.Point(6, 6)
                            );

  var imgVertex = new google.maps.MarkerImage(
                    'css/vertex.png',
                    new google.maps.Size(11, 11), new google.maps.Point(0, 0),
                    new google.maps.Point(6, 6)
                  );

  var imgVertexOver = new google.maps.MarkerImage(
                        'css/vertexOver.png',
                        new google.maps.Size(11, 11), new google.maps.Point(0, 0),
                        new google.maps.Point(6, 6)
                      );

  var ghostPath = new google.maps.Polygon({
                      map : polygon.getMap(),
                      strokeColor : polygon.strokeColor,
                      strokeOpacity : 0.2,
                      strokeWeight : polygon.strokeWeight
                    });
                              
  var PolAfterCloseOpts =  {
                    fillColor: "#FF0000",
                    fillOpacity: .35
                    };
                           
  var PolBeforeCloseOpts = {
                    fillColor: "#FF0000",
                    fillOpacity: .15
                    };
                      
  var vertexGhostMouseOver = function () {
    this.setIcon(imgGhostVertexOver);
  };

  var vertexGhostMouseOut = function () {
    this.setIcon(imgGhostVertex);
  };

  var vertexGhostDrag = function () {
    polygon.setOptions(PolAfterCloseOpts);  
    if (ghostPath.getPath().getLength() === 0) {
      if (this.marker.inex < polygon.getPath().getLength() - 1) {
        ghostPath.setPath([this.marker.getPosition(), this.getPosition(), polygon.getPath().getAt(this.marker.inex + 1)]);
      }
      else {
        if (this.marker.inex === polygon.getPath().getLength() - 1) {
          ghostPath.setPath([this.marker.getPosition(), this.getPosition(), polygon.getPath().getAt(0)]);
        }
      }
    }
    ghostPath.getPath().setAt(1, this.getPosition());
  };

  var moveGhostMarkers = function (marker) {
    polygon.setOptions(PolAfterCloseOpts);
    var Vertex = polygon.getPath().getAt(marker.inex);
    if (marker.inex === 0) {
      var prevVertex = polygon.getPath().getAt(polygon.getPath().getLength() - 1);
    }
    else {
      var prevVertex = polygon.getPath().getAt(marker.inex - 1);
    }
    if ((typeof(Vertex) !== "undefined") && (typeof(Vertex.ghostMarker) !== "undefined")) {
      if (typeof(google.maps.geometry) === "undefined") {
        if (marker.inex < polygon.getPath().getLength() - 1) {
          Vertex.ghostMarker.setPosition(new google.maps.LatLng(Vertex.lat() + 0.5 * (polygon.getPath().getAt(marker.inex + 1).lat() - Vertex.lat()), Vertex.lng() + 0.5 * (polygon.getPath().getAt(marker.inex + 1).lng() - Vertex.lng())));
        }
        else {
          if (marker.inex === polygon.getPath().getLength() - 1) {
            Vertex.ghostMarker.setPosition(new google.maps.LatLng(Vertex.lat() + 0.5 * (polygon.getPath().getAt(0).lat() - Vertex.lat()), Vertex.lng() + 0.5 * (polygon.getPath().getAt(0).lng() - Vertex.lng())));
          }
        }
      }
      else {
        if (marker.inex < polygon.getPath().getLength() - 1) {
          Vertex.ghostMarker.setPosition(google.maps.geometry.spherical.interpolate(Vertex, polygon.getPath().getAt(marker.inex + 1), 0.5));
        }
        else {
          if (marker.inex === polygon.getPath().getLength() - 1) {
            Vertex.ghostMarker.setPosition(google.maps.geometry.spherical.interpolate(Vertex, polygon.getPath().getAt(0), 0.5));
          }
        }
      }
    } 
    if ((typeof(prevVertex) !== "undefined") && (typeof(prevVertex.ghostMarker) !== "undefined")) {
      if (typeof(google.maps.geometry) === "undefined") {
        prevVertex.ghostMarker.setPosition(new google.maps.LatLng(prevVertex.lat() + 0.5 * (marker.getPosition().lat() - prevVertex.lat()), prevVertex.lng() + 0.5 * (marker.getPosition().lng() - prevVertex.lng())));
      }
      else {
        prevVertex.ghostMarker.setPosition(google.maps.geometry.spherical.interpolate(prevVertex, marker.getPosition(), 0.5));
      }
    }
  };

  var vertexGhostDragEnd = function () {
    polygon.setOptions(PolAfterCloseOpts);
    ghostPath.getPath().forEach(function () {
      ghostPath.getPath().pop();
    });
    polygon.getPath().insertAt(this.marker.inex + 1, this.getPosition());
    createMarkerVertex(polygon.getPath().getAt(this.marker.inex + 1)).inex = this.marker.inex + 1;
    moveGhostMarkers(this.marker);
    createGhostMarkerVertex(polygon.getPath().getAt(this.marker.inex + 1));
    polygon.getPath().forEach(function (vertex, inex) {
      if (vertex.marker) {
        vertex.marker.inex = inex;
      }
    });
  };
  var createGhostMarkerVertex = function (point) {
    if (point.marker.inex < polygon.getPath().getLength() - 1) {
      var markerGhostVertex = new google.maps.Marker({
        position : (typeof(google.maps.geometry) === "undefined") ? new google.maps.LatLng(
                                                                      point.lat() + 0.5 * (polygon.getPath().getAt(point.marker.inex + 1).lat() - point.lat()),
                                                                      point.lng() + 0.5 * (polygon.getPath().getAt(point.marker.inex + 1).lng() - point.lng()))
                   :google.maps.geometry.spherical.interpolate(point, polygon.getPath().getAt(point.marker.inex + 1), 0.5),
        map : polygon.getMap(),
        icon : imgGhostVertex,
        draggable : true,
        raiseOnDrag : false
      });
      google.maps.event.addListener(markerGhostVertex, "mouseover", vertexGhostMouseOver);
      google.maps.event.addListener(markerGhostVertex, "mouseout", vertexGhostMouseOut);
      google.maps.event.addListener(markerGhostVertex, "drag", vertexGhostDrag);
      google.maps.event.addListener(markerGhostVertex, "dragend", vertexGhostDragEnd);
      point.ghostMarker = markerGhostVertex;
      markerGhostVertex.marker = point.marker;
      return markerGhostVertex;
    }
    else {
       if (point.marker.inex === polygon.getPath().getLength() - 1) {
         var markerGhostVertex = new google.maps.Marker({
           position : (typeof(google.maps.geometry) === "undefined") ? new google.maps.LatLng(
                                                                         point.lat() + 0.5 * (polygon.getPath().getAt(0).lat() - point.lat()),
                                                                         point.lng() + 0.5 * (polygon.getPath().getAt(0).lng() - point.lng()))
                      :google.maps.geometry.spherical.interpolate(point, polygon.getPath().getAt(0), 0.5),
           map : polygon.getMap(),
           icon : imgGhostVertex,
           draggable : true,
           raiseOnDrag : false
         });
         google.maps.event.addListener(markerGhostVertex, "mouseover", vertexGhostMouseOver);
         google.maps.event.addListener(markerGhostVertex, "mouseout", vertexGhostMouseOut);
         google.maps.event.addListener(markerGhostVertex, "drag", vertexGhostDrag);
         google.maps.event.addListener(markerGhostVertex, "dragend", vertexGhostDragEnd);
         point.ghostMarker = markerGhostVertex;
         markerGhostVertex.marker = point.marker;
         return markerGhostVertex;
       }
    }
    return null;
  };

  var vertexMouseOver = function () {
    this.setIcon(imgVertexOver);
  };

  var vertexMouseOut = function () {
    this.setIcon(imgVertex);
  };

  var vertexDrag = function () {
    var movedVertex = this.getPosition();
    movedVertex.marker = this;
    movedVertex.ghostMarker = polygon.getPath().getAt(this.inex).ghostMarker;
    polygon.getPath().setAt(this.inex, movedVertex);
    if (self.ghosts || self.closed) {
      moveGhostMarkers(this);
    }
  };

  var vertexRightClick = function () {
    if (self.ghosts || self.closed) {
      var Vertex = polygon.getPath().getAt(this.inex);
      if (this.inex === 0) {
        var prevVertex = polygon.getPath().getAt(polygon.getPath().getLength() - 1);
      }
      else {
        var prevVertex = polygon.getPath().getAt(this.inex - 1);
      }
      if (typeof(Vertex.ghostMarker) !== "undefined") {
        Vertex.ghostMarker.setMap(null);
      }
      polygon.getPath().removeAt(this.inex);
      polygon.getPath().forEach(function (vertex, inex) {
        if (vertex.marker) {
          vertex.marker.inex = inex;
        }
      });
      if (typeof(prevVertex) !== "undefined") {
        if (this.inex <= polygon.getPath().getLength() ) {
          moveGhostMarkers(prevVertex.marker);
        }
        else {
          prevVertex.ghostMarker.setMap(null);
          prevVertex.ghostMarker = undefined;
        }
      }
    }
    else {
      polygon.getPath().removeAt(this.inex);
    }
    this.setMap(null);
    if (polygon.getPath().getLength() === 1) {
      prevVertex.ghostMarker.setMap(null);
      polygon.getPath().pop().marker.setMap(null);
    }
  };

  var vertexClick = function() {
    if(this == polygon.getPath().getAt(0).marker && !self.ghosts) {
      closePoly();
    }
  };

  var closePoly = function() {
    polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].clear();
    polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].push(self.clearUI);
    
    polygon.getMap().setOptions({ draggableCursor: 'pointer' });
    polygon.getPath().forEach(function (vertex, inex) {
      createGhostMarkerVertex(vertex);
    });
    google.maps.event.clearListeners(polygon.getMap(), "click");
    google.maps.event.addListener(polygon, 'mousemove', function (point) {
      polygon.setOptions(PolAfterCloseOpts);
    });
    google.maps.event.addListener(polygon.getMap(), 'mousemove', function(point) {
      polygon.setOptions(PolBeforeCloseOpts);
      console.log("on polygon mousemove");
    });
    /* 
    had to comment for the darker fill on hover of polygon feature
    google.maps.event.clearListeners(polygon.getMap(), "mousemove");
    */
    google.maps.event.trigger(followLine, 'rightclick');
    self.closed = true;
    self.ghosts = true;
    self.drawing = true;
  };
  
  var createMarkerVertex = function (point) {
    var markerVertex = new google.maps.Marker({
      position : point,
      map : polygon.getMap(),
      icon : imgVertex,
      draggable : true,
      raiseOnDrag : false
    });
    google.maps.event.addListener(markerVertex, "mouseover", vertexMouseOver);
    google.maps.event.addListener(markerVertex, "mouseout", vertexMouseOut);
    google.maps.event.addListener(markerVertex, "drag", vertexDrag);
    google.maps.event.addListener(markerVertex, "rightclick", vertexRightClick);
    google.maps.event.addListener(markerVertex, "click", vertexClick);
    point.marker = markerVertex;
    return markerVertex;
  };

  this.initControl = function () {
    polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].push(self.drawUI);
    polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].push(self.clearUI);
    
    console.log(polygon.getMap().controls.pop().toString());
        
    if (polygon.getPath().getLength() > 0) {
      self.drawing = true;
      self.drawShape();
    }
    google.maps.event.addDomListener(self.drawUI, 'click', function() {
      console.log(self.drawing);
      if (!self.drawing){
        self.createShape();
      }
    });
    google.maps.event.addDomListener(self.clearUI, 'click', function() {
      if (self.drawing){
        self.removeShape();
        polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].push(self.drawUI);
      }
    });
  };

  this.drawShape = function () {
    polygon.getPath().forEach(function (vertex, inex) {
      createMarkerVertex(vertex).inex = inex;
      if (self.ghosts) {
        createGhostMarkerVertex(vertex);
      }
    });
  };

  this.removePoints = function() {
    polygon.getPath().forEach(function (vertex, inex) {
      if (vertex.marker) {
        vertex.marker.setMap(null);
        vertex.marker = undefined;
      }
      if (vertex.ghostMarker) {
        vertex.ghostMarker.setMap(null);
        vertex.ghostMarker = undefined;
      }
    });
  };

  this.removeShape = function() {
    this.removePoints();
    polygon.setPath([]);
    self.drawing = false;
  };

  this.createShape = function() {
    self.closed = false;
    self.ghosts = false;
    self.drawing = true;
    self.removeShape();
    polygon.getMap().setOptions({ draggableCursor: 'crosshair' });
    
    google.maps.event.clearListeners(polygon.getMap(), "click");
    google.maps.event.clearListeners(polygon.getMap(), "mousemove");
    google.maps.event.clearListeners(polygon, "mousemove");
    
    google.maps.event.addListener(followLine, 'click', function (point) {
      google.maps.event.trigger(polygon.getMap(), 'click', point);
      followLine.setPath([]);
    });
    
    google.maps.event.addListener(followLine, 'rightclick', function () {
      followLine.setMap(null);
    });
    /*
    //attempting to show/hide icons on bounds_changed and idle
    
    google.maps.event.addListener(polygon.getMap(), 'bounds_changed', function(){
      self.drawUI.style.visibility = 'hidden';
      self.drawUI.style.visibility = 'hidden';
    });
    
    google.maps.event.addListener(polygon, 'bounds_changed', function(){
      self.drawUI.style.visibility = 'hidden';
      self.drawUI.style.visibility = 'hidden';
    });
    
    google.maps.event.addListener(polygon.getMap(), 'idle', function(){
      self.drawUI.style.visibility = 'hidden';
    });
    */
    google.maps.event.addListener(polygon.getMap(), 'click', function(point){
      self.removePoints();
      polygon.getPath().push(point.latLng);
      self.drawShape();
    }); 
    google.maps.event.addListener(polygon.getMap(), 'mousemove', function(point) {
      polygon.setOptions(PolBeforeCloseOpts);
      var pathLength = polygon.getPath().getLength();
      if (pathLength >= 1) {
        var startingPoint = polygon.getPath().getAt(pathLength - 1);
        var followCoordinates = [startingPoint, point.latLng];
        followLine.setPath(followCoordinates);
      }
    });
  };
}
