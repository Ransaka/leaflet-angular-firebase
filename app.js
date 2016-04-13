var app = angular.module( "demoapp", [ 'ui-leaflet' ] );
var bofDataRef = new Firebase( 'https://kitb1w34vt8.firebaseio-demo.com/bofs' );
app.controller( 'MarkersEventsAddController', [ '$scope', '$filter', '$timeout', '$log', 'leafletData', function ( $scope, $filter, $timeout, $log, leafletData ) {
  angular.extend( $scope, {
    center: {
      zoom:16,
      autoDiscover: true
    },
    events: {},
    layers: {
      baselayers: {
        mapbox_light: {
          name: 'Mapbox Light',
          url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
          type: 'xyz',
          layerOptions: {
            id: 'gsilver.pk8alhme',
            accessToken: 'pk.eyJ1IjoiZ3NpbHZlciIsImEiOiJjaW1xYmxianowMGZsdXJra2FjbXhpYjE4In0.LL9yfFdOwvatCyCbxBDW_A',
          }
        },
        osm: {
          name: 'OpenStreetMap',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'xyz'
        },
        terrain: {
          name: 'Terrain',
          url: 'http://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png',
          type: 'xyz',
        }
      },
      overlays: {
        bofs: {
          name: "Bofs",
          type: "markercluster",
          visible: true
        }
      }
    }
  } );

  $scope.bofIt = function() {
    leafletData.getMap().then(function(map) {
      map.locate({setView: true, maxZoom: 16});
      function onLocationFound(e) {
          var radius = e.accuracy / 2;
          $( '#bofModal' ).attr( 'data-coords', [ e.latlng.lat, e.latlng.lng ] );
          L.marker(e.latlng).addTo(map)
              .bindPopup('<a href="" data-toggle="modal" data-target="#bofModal">Add an event here?</a>').openPopup();
          L.circle(e.latlng, radius).addTo(map);
      }
      map.on('locationfound', onLocationFound);
    });
  };

  $scope.markers = [];

  bofDataRef.on( 'child_added', function ( snapshot ) {
    var marker = snapshot.val();
    $scope.markers.push( {
      lat: parseFloat( marker.lat ),
      lng: parseFloat( marker.long ),
      message: marker.what,
      layer: 'bofs'//,
      //draggable:marker.draggable
    } );
  } );

  $scope.$on( "leafletDirectiveMap.click", function ( event, args ) {
    var leafEvent = args.leafletEvent;
    $( '#bofModal' ).attr( 'data-coords', [ leafEvent.latlng.lat, leafEvent.latlng.lng ] );
    $( '#bofModal' ).modal();
  } );


  $( '#postBof' ).on( 'click', function () {
    var what = $( '#messageText' ).val();
    var start = $( '#newStartTime' ).val();
    var end = $( '#newEndTime' ).val();
    var coords = $( '#bofModal' ).attr( 'data-coords' ).split( ',' );
    var marker = {
      user: 'user',
      what: what,
      start: start,
      end: end,
      lat: coords[ 0 ],
      long: coords[ 1 ],
      maybe: 0,
      sure: 0,
      draggable:true
    };
    bofDataRef.push( marker );
    $( '#messageText, #newStartTime, #newEndTime' ).val( '' );
  } );

  $scope.$watch("markers", function() {
    $scope.$watch('markerFilter', function (text) {
      $scope.markersFiltered = $filter('filter')($scope.markers, {message:text});
    });
  },true);
} ] );
