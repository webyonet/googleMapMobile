/*
	author = Burak Demirezen
	version = 1.0.0
	edit date = 15.11.2012
*/
var $map = null;
var $mapOptions;
var $point;
var $mylocationinterval;
var $mylocation;
var $json;
var $markerArray = [];
var $myMarkerArray = [];
var $directionArray = [];
var $directionsService;
var $position;
var $myLatitude;
var $myLongitude;
var $directionsDisplay = null;
var $zoom = null;
var $updateLocation = true;
var $colorPicker = ['#4419c1', '#05584d', '#000000'];
var $opacityArray = ['0.7', '0.6', '0.5'];

var $googleMap = {
    init: function ($this) {
        $map = null;
		$updateLocation = true;
        google.maps.event.addDomListener(window, 'load', this.createMapObject($this));
        this.dropDownChange();
        this.goToLineOfTheRoad();
        this.mapResize();
		this.singleGotoDirection();
    },
    createMapObject: function ($this) {
        $googleMap.forceClearToPublicStaticObject();
        $point = new google.maps.LatLng(41.005280, 28.976321);
        mapOptions = {
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: $point,
            mapTypeControl: true,
            zoomControl: true
        };
        $map = new google.maps.Map($this, mapOptions);
        $googleMap.getGeoLocation();
        $googleMap.createDirectionObject();
        $googleMap.controlToUpdateLocation();
    },
    createDirectionObject: function () {
        $directionsService = new google.maps.DirectionsService();
    },
    mapResize: function () {
        setTimeout(function () {
            google.maps.event.trigger($map, "resize");
            $map.setCenter($position);
        }, 1000);
    },
    forceClearToPublicStaticObject: function () {
        $map = null;
        $mapOptions = null;
        $point = null;
        $mylocationinterval = null;
        $mylocation = null;
        $json = null;
        $markerArray.length = 0;
        $myMarkerArray.length = 0;
        $directionArray.length = 0;
        $directionsService = null;
        $directionsDisplay = null;
        $zoom = null;
        $position = null;
		$myLatitude = null;
		$myLongitude = null;
    },
    markerClear: function () {
        for (var i = 0; i < $markerArray.length; i++) {
            $markerArray[i].setMap(null);
        };
    },
    getGeoLocation: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                $myLatitude = position.coords.latitude;
                $myLongitude = position.coords.longitude;
                $map.setCenter($position);
                if ($zoom == null) {
                    $map.setZoom(10);
                } else {
                    $map.setZoom($zoom);
                }
                $googleMap.addToMyMarker($map.center);
                $googleMap.dropDownFill();
            }, function () {
                alert('Geolocation Service Failed');
                $googleMap.dropDownFill();
            }, {
                timeout: 10000
            });
        } else {
            alert('Your browser doesn\'t support geolocation');
            $googleMap.dropDownFill();
        };
    },
    dropDownFill: function () {
        try {
            $json = JSON.parse(document.getElementById('mapModel').value);
            $('#start').empty();
            $('#finish').empty();
            var tempPoint;
            var tempStart = '<option>Kalkış</option>';
            var tempFinish = '<option>Varış</option>';
            tempStart += '<option lat="' + $myLatitude + '" lng="' + $myLongitude + '">Konumum</option>';
            tempFinish += '<option lat="' + $myLatitude + '" lng="' + $myLongitude + '">Konumum</option>';
            for (var i = 0; i < $json["mapData"].length; i++) {
                tempPoint = new google.maps.LatLng($json["mapData"][i].lat, $json["mapData"][i].lng);
                $googleMap.addToOtherMarker(tempPoint, $json["mapData"][i].id);
                tempStart += '<option lat="' + $json["mapData"][i].lat + '" lng="' + $json["mapData"][i].lng + '">' + $json["mapData"][i].id + '</option>';
                tempFinish += '<option lat="' + $json["mapData"][i].lat + '" lng="' + $json["mapData"][i].lng + '">' + $json["mapData"][i].id + '</option>';
            };
            $('#start').append(tempStart).selectmenu('refresh', true);
            $('#finish').append(tempFinish).selectmenu('refresh', true);
            this.updateToMyLocation();
        } catch (error) {
            console.error(error);
        }
    },
    updateToMyLocation: function () {
        $mylocationinterval = setInterval(function () {
            if ($updateLocation) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        $myLatitude = position.coords.latitude;
                        $myLongitude = position.coords.longitude;
                        $('#start').find("option:contains('Konumum')").attr("lat", $myLatitude);
                        $('#start').find("option:contains('Konumum')").attr("lng", $myLongitude);
                        $('#finish').find("option:contains('Konumum')").attr("lat", $myLatitude);
                        $('#finish').find("option:contains('Konumum')").attr("lng", $myLongitude);
                        $map.setCenter(pos);
                        $googleMap.addToMyMarker($map.center);
                        if ($zoom == null) {
                            $map.setZoom(15);
                        } else {
                            $map.setZoom($zoom);
                        }
                        $googleMap.zoomChange();
                    });
                }
            } else {
                clearInterval($mylocationinterval);
            }
        }, 30000);
    },
    controlToUpdateLocation: function () {
        $('select#locationOnOf').live('change', function () {
            if (this.value == 'true') {
                $updateLocation = true;
                $googleMap.updateToMyLocation();
            } else {
                $updateLocation = false;
            }
        });
    },
    markerUpdate: function ($this) {
        //back-end fonksiyonu gelecek
        $googleMap.init($this);
    },
    zoomChange: function () {
        google.maps.event.addListener($map, 'zoom_changed', function () {
            $zoom = $map.zoom;
        });
    },
    createToLineOfTheRoad: function (_start, _end, _type) {
        this.clearDirection();
        var request = {
            origin: _start,
            destination: _end,
            provideRouteAlternatives: true,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        $directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                for (var i = 0; i < response.routes.length; i++) {
                    $googleMap.directionsRender(response, i);
					if(i == 0){
						$googleMap.fullCalculateDistances(response.routes);
					}
                }
            }
        });
		/*if(_type){
        	this.calculateDistances(_start, _end);
		}*/
    },
	fullCalculateDistances:function(response){
		$('span.road1, span.road2, span.road3, span.noDecode, span.noDecode1').hide();
		$('div.distanceInfo').show();
		for (var i = 0; i < response.length; i++) {
			$googleMap.responseFullCalculate(i,response[i].legs[0].distance,response[i].legs[0].duration);
		}	
	},
	responseFullCalculate:function(count,distance,duration){
		duration = parseInt(duration.value / 60) + ' dk';
		switch (count){
			case 0:
				$('span.road1').children('span.distance').text(distance.text);
            	$('span.road1').children('span.minutes').text(duration);
				$('span.road1').show();
			break;
			case 1:
				$('span.road2').children('span.distance').text(distance.text);
            	$('span.road2').children('span.minutes').text(duration);
				$('span.road2').show();
				$('span.noDecode').show();
			break;
			case 2:
				$('span.road3').children('span.distance').text(distance.text);
            	$('span.road3').children('span.minutes').text(duration);
				$('span.road3').show();
				$('span.noDecode1').show();
			break;
			default:
				console.log('3 Den Fazla Alternatif Yol Var.');
			break;
		}
	},
	singleCenter:function(position){
		var posArray = position.split(',');
		var center = new google.maps.LatLng(posArray[0],posArray[1]);
		$map.setCenter(center);
	},
    directionsRender: function (response, count) {
        $directionsDisplay = new google.maps.DirectionsRenderer({
            map: $map,
            suppressMarkers: true,
            draggable: false,
            preserveViewport: false,
            polylineOptions: {
                strokeColor: (count > $colorPicker.length - 1) ? $colorPicker[2] : $colorPicker[count],
                strokeOpacity: (count > $colorPicker.length - 1) ? $opacityArray[2] : $opacityArray[count]
            }
        });
        $directionsDisplay.setMap($map);
        $directionsDisplay.setDirections(response);
        $directionsDisplay.setRouteIndex(count);
        $directionArray.push($directionsDisplay);
    },
    clearDirection: function () {
        if ($directionsDisplay != null) {
            for (var i = 0; i < $directionArray.length; i++) {
                $directionArray[i].setMap(null);
            }
            $directionsDisplay.setMap(null);
            $directionsDisplay = null;
        }
    },
    calculateDistances: function (start, end) {
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [start],
            destinations: [end],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, $googleMap.responseDistances);
    },
    responseDistances: function (response, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
        } else {
            var distance = response.rows[0].elements[0].distance.text;
            var minutes = parseInt(response.rows[0].elements[0].duration.value / 60) + ' Dk';
            $('span.distance').text(distance);
            $('span.minutes').text(minutes);
        }
    },
    goToLineOfTheRoad: function () {
        $('a.directions').live('click', function () {
            var start = new google.maps.LatLng($("#start option:selected").attr('lat'), $("#start option:selected").attr('lng'));
            var end = new google.maps.LatLng($("#finish option:selected").attr('lat'), $("#finish option:selected").attr('lng'));
            $googleMap.createToLineOfTheRoad(start, end, true);
            return false;
        });
    },
	singleGotoDirection:function(){
		$('a.goToDirection').live('click',function(){
			var start = new google.maps.LatLng($myLatitude,$myLongitude);
            var end = new google.maps.LatLng($json["mapData"][0].lat, $json["mapData"][0].lng);
            $googleMap.createToLineOfTheRoad(start, end, false);
            return false;
		});
	},
    addToMyMarker: function (obj) {
        for (var i = 0; i < $myMarkerArray.length; i++) {
            $myMarkerArray[i].setMap(null);
        };
        var mymarker = new google.maps.Marker({
            position: obj,
            map: $map,
            icon: 'assets/imgs/my.png'
        });
        $myMarkerArray.push(mymarker);
    },
    addToOtherMarker: function (obj, id) {
        var marker = new google.maps.Marker({
            position: obj,
            map: $map,
            icon: 'assets/imgs/' + id + '.png'
        });
        $markerArray.push(marker);
    },
    dropDownChange: function () {
        $('body').delegate('#start', 'change', function () {
            $googleMap.chooseGenerator(this.options[this.selectedIndex].text);
        });
    },
    chooseGenerator: function (distinct) {
        var temp = '';
        if (distinct != 'Konumum') {
            temp += '<option lat="' + $myLatitude + '" lng="' + $myLongitude + '">Konumum</option>';
        }
        for (var i = 0; i < $json["mapData"].length; i++) {
            if (distinct != $json["mapData"][i].id.toString()) {
                temp += '<option lat="' + $json["mapData"][i].lat + '" lng="' + $json["mapData"][i].lng + '" >' + $json["mapData"][i].id + '</option>';
            }
        };
        $('select#finish').empty();
        $('select#finish').append(temp).selectmenu('refresh', true);
    }
};