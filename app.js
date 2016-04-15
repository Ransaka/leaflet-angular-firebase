var app = angular.module( "bofapp", [ 'ui-leaflet' ] );
//var bofDataRef = new Firebase( 'https://kitb1w34vt8.firebaseio-demo.com/bofs' );
var bofDataRef = new Firebase( 'https://flickering-fire-3313.firebaseio.com/bofs' );
//sOkCRMFlS8UAI5PiV2DDK4qsyI1ecoC3npkxp06O
app.controller( 'mapController', [ '$scope', '$filter', '$timeout', '$log', 'leafletData', function ( $scope, $filter, $timeout, $log, leafletData ) {
  angular.extend( $scope, {
    center: {
      zoom: 16,
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
      },
      awesomeMarkerIcon: {
        type: 'awesomeMarker',
        markerColor: 'blue'
      },
    }
  } );

  $scope.categories = null;

  $scope.bofIt = function () {
    leafletData.getMap().then( function ( map ) {
      map.locate( {
        setView: true,
        maxZoom: 16
      } );

      function onLocationFound( e ) {
        var radius = e.accuracy / 2;
        $( '#bofModal' ).attr( 'data-coords', [ e.latlng.lat, e.latlng.lng ] );
        L.popup()
          .setLatLng( e.latlng )
          .setContent( '<a href="" data-toggle="modal" data-target="#bofModal">Add an event here?</a>' )
          .openOn( map );
      }
      map.on( 'locationfound', onLocationFound );
    } );
  };

  $scope.markers = [];
  $scope.markersAll = [];

  bofDataRef.on( 'child_added', function ( snapshot ) {
    var marker = snapshot.val();
    newMarker = {
      lat: parseFloat( marker.lat ),
      lng: parseFloat( marker.long ),
      category: marker.category,
      //icon:awesomeMarkerIcon,
      message: '<p>' + marker.what + '</p>',
      layer: 'bofs',
      draggable: marker.draggable,
      icon: resolveIcon( marker.category )
    };
    $scope.markersAll.push( newMarker );
    $scope.markers.push( newMarker );
  } );

  $scope.$on( "leafletDirectiveMap.click", function ( event, args ) {
    leafletData.getMap().then( function ( map ) {
      var leafEvent = args.leafletEvent;
      $( '#bofModal' ).attr( 'data-coords', [ leafEvent.latlng.lat, leafEvent.latlng.lng ] );
      L.popup()
        .setLatLng( leafEvent.latlng )
        .setContent( '<a href="" data-toggle="modal" data-target="#bofModal">Add an event here?</a>' )
        .openOn( map );
    } );
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
      category: $scope.categories,
      draggable: true
    };
    bofDataRef.push( marker );
    leafletData.getMap().then( function ( map ) {
      map.closePopup();
    } );
    $( '#messageText, #newStartTime, #newEndTime' ).val( '' );
  } );


  $( '#categories a' ).on( 'click', function ( e ) {
    var category = $( this ).attr( 'id' );
    if ( category === 'all' ) {
      $scope.markers = $scope.markersAll;
    } else {
      $scope.markers = $scope.markersAll;
      $scope.markers = $filter( 'filter' )( $scope.markers, {
        category: category
      } );
    }
  } );


  $scope.$watch( "markers", function () {
    $scope.$watch( 'markerFilter', function ( text ) {
      $scope.markersFiltered = $filter( 'filter' )( $scope.markers, {
        message: text
      } );
    } );
  }, true );

  var resolveIcon = function ( category ) {
    return ( {
      'cat1': {
        type: 'awesomeMarker',
        icon: 'cutlery',
        markerColor: 'green'
      },
      'cat2': {
        type: 'awesomeMarker',
        icon: 'heart',
        markerColor: 'red'
      },
      'cat3': {
        type: 'awesomeMarker',
        icon: 'music',
        markerColor: 'orange'
      }
    }[ String( category ).toLowerCase() ] || {
      type: 'awesomeMarker',
      icon: 'record',
      markerColor: 'blue'
    } );
  };

} ] );
