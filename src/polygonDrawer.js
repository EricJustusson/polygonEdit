function drawControl() {
  var self = this;
  this.drawUI = document.createElement('div');
  this.drawUI.id = 'draw-polygon';
  this.drawUI.style.backgroundColor = 'white';
  this.drawUI.style.borderStyle = 'solid';
  this.drawUI.style.borderWidth = '2px';
  this.drawUI.style.cursor = 'pointer';
  this.drawUI.style.textAlign = 'center';
  this.drawUI.style.padding = "2px";     
  this.drawUI.title = 'Click icon to draw a polygon';
  this.drawImage = document.createElement('img');
  this.drawImage.src = "css/polyUp.png";
  this.drawUI.appendChild(this.drawImage);

  this.tooltip = document.createElement('div');
  this.tooltip.id = 'tooltip';
  this.tooltip.style.backgroundColor = 'white';
  this.tooltip.style.borderStyle = 'solid';
  this.tooltip.style.borderWidth = '2px';
  this.tooltip.style.cursor = 'pointer';
  this.tooltip.style.textAlign = 'center';
  this.tooltip.style.padding = "2px";
  this.tooltip.style.fontsize = "10px"; 
  var text = document.createElement('p');
  text.innerHTML = 'Click the first point again<br />to finish drawing the shape.';
  text.style.marginTop = "-10px";
  this.tooltip.appendChild(text);
  return self;
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
  this.drawControl = new drawControl;
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
      if (self.closed == true) {
        markerGhostVertex.setCursor('move');
      }
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
         if (self.closed == true) {
           markerGhostVertex.setCursor('move');
         }
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
    google.maps.event.addListener(polygon, 'mousemove', function () {
      polygon.setOptions(PolAfterCloseOpts);
    });
    google.maps.event.addListener(polygon, 'mouseout', function () {
      polygon.setOptions(PolBeforeCloseOpts);
    });
    google.maps.event.clearListeners(polygon.getMap(), "mousemove");
    google.maps.event.trigger(followLine, 'rightclick');
    google.maps.event.clearListeners(followLine, "click");
    google.maps.event.clearListeners(followLine, "rightclick");
    self.closed = true;
    self.ghosts = true;
    self.drawing = true;
    polygon.getPath().forEach(function (vertex, inex) {
      vertex.marker.setCursor('move');
      if (self.ghosts) {
        vertex.ghostMarker.setCursor('move');
      }
    });
  };

  var createMarkerVertex = function (point) {
    var markerVertex = new google.maps.Marker({
      position : point,
      map : polygon.getMap(),
      icon : imgVertex,
      draggable : true,
      raiseOnDrag : false
    });
    if (self.closed == true) {
      markerVertex.setCursor('move');
    }
    if (polygon.getPath().getLength() == 1){
      polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].push(self.drawControl.tooltip);
    }
    
    google.maps.event.addListener(markerVertex, "mouseover", vertexMouseOver);
    google.maps.event.addListener(markerVertex, "mouseout", vertexMouseOut);
    google.maps.event.addListener(markerVertex, "drag", vertexDrag);
    google.maps.event.addListener(markerVertex, "rightclick", vertexRightClick);
    google.maps.event.addListener(markerVertex, "click", vertexClick);
    point.marker = markerVertex;
    return markerVertex;
  };

  this.initControl = function () {
    if (polygon.getPath().getLength() > 0) {
      polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].push(self.clearUI);
      self.drawing = true;
      self.closed =true;
      self.drawShape();
    }
    else {
      polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].push(self.drawControl.drawUI);
    }
    google.maps.event.addDomListener(self.drawControl.drawUI, 'click', function() {
      if (!self.drawing) {
       self.drawControl.drawImage.src = "css/polyDown.png";
       self.drawControl.drawUI.style.padding = "2px";     
       self.createShape();
      }
    });
    google.maps.event.addDomListener(self.clearUI, 'click', function() {
      if (self.drawing) {
        self.removeShape();
        polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].clear();
        polygon.getMap().controls[google.maps.ControlPosition.TOP_RIGHT].push(self.drawControl.drawUI);
        self.drawControl.drawImage.src = "css/polyUp.png";
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
    self.closed = false;
    self.ghosts = false;
  };

  this.createShape = function() {
    self.removeShape();
    self.closed = false;
    self.ghosts = false;
    self.drawing = true;
    polygon.getMap().setOptions({ draggableCursor: 'url(css/crosshairs.png),crosshair'});
    
    google.maps.event.clearListeners(polygon.getMap(), "click");
    google.maps.event.clearListeners(polygon.getMap(), "mousemove");
    google.maps.event.clearListeners(polygon, "mousemove");
    
    google.maps.event.addListener(polygon.getMap(), 'click', function(point) {
      console.log("On Map click.");
      self.removePoints();
      polygon.getPath().push(point.latLng);
      self.drawShape();
    });
    
    google.maps.event.addListener(followLine, 'click', function (point) {
      console.log("On followline click.");
      google.maps.event.trigger(polygon.getMap(), 'click', point);
      followLine.setPath([]);
    });
    
    google.maps.event.addListener(followLine, 'rightclick', function () {
      followLine.setPath([]);
    });
    
    
    google.maps.event.addListener(followLine, 'mouseover', function () {
      console.log("On followline mouseover.");
      polygon.getMap().setOptions({ draggableCursor: 'url(css/crosshairs.png),crosshair'});
    });
    
    google.maps.event.addListener(followLine, 'mousemove', function () {
      console.log("On on followLine mousemove.");
      polygon.getMap().setOptions({ draggableCursor: 'url(css/crosshairs.png),crosshair'});
    });
    
    google.maps.event.addListener(followLine, 'mouseout', function () {
      console.log("On followline mouseout.");
      polygon.getMap().setOptions({ draggableCursor: 'url(css/crosshairs.png),crosshair'});
    });
    
    google.maps.event.addListener(polygon.getMap(), 'mousemove', function(point) {
      polygon.getMap().setOptions({ draggableCursor: 'url(css/crosshairs.png),crosshair' });
      console.log("On Map mousemove.");
      if (self.closed != true) {
        polygon.setOptions(PolBeforeCloseOpts);
        var pathLength = polygon.getPath().getLength();
        
        if (pathLength >= 1) {
          var startingPoint = polygon.getPath().getAt(pathLength - 1);
          var followCoordinates = [startingPoint, point.latLng];
          followLine.setPath(followCoordinates);
        }
      }
    });
  };
}
