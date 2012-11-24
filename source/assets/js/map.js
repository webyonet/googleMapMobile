/*
 * TurkcellMap Javascript Plugin v1.2.2
 * Author G.Burak Demirezen
 * Edit Date 11.23.2012
 */
var publicStatic = function () {
    this.$map = null;
    this.$mapOptions;
    this.$point;
    this.$mylocationinterval;
    this.$mylocation;
    this.$json;
    this.$markerArray = [];
    this.$myMarkerArray = [];
    this.$directionArray = [];
    this.$directionsService;
    this.$position;
    this.$myLatitude;
    this.$myLongitude;
    this.$directionsDisplay = null;
    this.$zoom = null;
    this.$updateLocation = true;
    this.options = {
        $colorPicker: ['#4419c1', '#05584d', '#000000'],
        $opacityArray: ['0.7', '0.6', '0.5'],
        $dropStart: '#start',
        $dropFinish: '#finish',
        $switch: '#locationOnOf',
        $roadOne: '.road1',
        $roadTwo: '.road2',
        $roadTree: '.road3',
        $direction: '.directions',
        $singleDirection: '.goToDirection',
        $distanceInfo: '.distanceInfo',
        $distanceText: '.distance',
        $distanceMinutes: '.minutes',
		$data : 'mapModel'
    }
}

var $static = new publicStatic();

var TurkcellMap = {
    init: function ($this, options) {
        $static.$map = null;
        this.changeProperty(options);
        google.maps.event.addDomListener(window, 'load', this.createMapObject($this));
        this.dropDownChange();
        this.goToLineOfTheRoad();
        this.mapResize();
        this.singleGotoDirection();
    },
    changeProperty: function (options) {
		if (typeof options != 'undefined') {
        	$.extend($static.options, options);
		}
    },
    createMapObject: function ($this) {
        TurkcellMap.forceClearToPublicStaticObject();
        $static.$point = new google.maps.LatLng(41.005280, 28.976321);
        mapOptions = {
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: $static.$point,
            mapTypeControl: true,
            zoomControl: true
        };
        $static.$map = new google.maps.Map($this, mapOptions);
        TurkcellMap.getGeoLocation();
        TurkcellMap.createDirectionObject();
        TurkcellMap.controlToUpdateLocation();
    },
    createDirectionObject: function () {
        $static.$directionsService = new google.maps.DirectionsService();
    },
    mapResize: function () {
        setTimeout(function () {
            google.maps.event.trigger($static.$map, "resize");
            $static.$map.setCenter($static.$position);
        }, 1000);
    },
    forceClearToPublicStaticObject: function () {
        $static.$map = null;
        $static.$mapOptions = null;
        $static.$point = null;
        $static.$mylocationinterval = null;
        $static.$mylocation = null;
        $static.$json = null;
        $static.$markerArray.length = 0;
        $static.$myMarkerArray.length = 0;
        $static.$directionArray.length = 0;
        $static.$directionsService = null;
        $static.$directionsDisplay = null;
        $static.$zoom = null;
        $static.$position = null;
        $static.$myLatitude = null;
        $static.$myLongitude = null;
    },
    markerClear: function () {
        for (var i = 0; i < $static.$markerArray.length; i++) {
            $static.$markerArray[i].setMap(null);
        };
    },
    getGeoLocation: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $static.$position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                $static.$myLatitude = position.coords.latitude;
                $static.$myLongitude = position.coords.longitude;
                $static.$map.setCenter($static.$position);
                if ($static.$zoom == null) {
                    $static.$map.setZoom(10);
                } else {
                    $static.$map.setZoom($static.$zoom);
                }
                TurkcellMap.addToMyMarker($static.$map.center);
                TurkcellMap.dropDownFill();
            }, function () {
                alert('Geolocation Service Failed');
                TurkcellMap.dropDownFill();
            }, {
                timeout: 10000
            });
        } else {
            alert('Your browser doesn\'t support geolocation');
            TurkcellMap.dropDownFill();
        };
    },
    dropDownFill: function () {
        try {
            $static.$json = JSON.parse(document.getElementById($static.options.$data).value);
            $($static.options.$dropStart).empty();
            $($static.options.$dropFinish).empty();
            var tempPoint;
            var tempStart = '<option>Kalkış</option>';
            var tempFinish = '<option>Varış</option>';
            tempStart += '<option lat="' + $static.$myLatitude + '" lng="' + $static.$myLongitude + '">Konumum</option>';
            tempFinish += '<option lat="' + $static.$myLatitude + '" lng="' + $static.$myLongitude + '">Konumum</option>';
            for (var i = 0; i < $static.$json["mapData"].length; i++) {
                tempPoint = new google.maps.LatLng($static.$json["mapData"][i].lat, $static.$json["mapData"][i].lng);
                TurkcellMap.addToOtherMarker(tempPoint, $static.$json["mapData"][i].id);
                tempStart += '<option lat="' + $static.$json["mapData"][i].lat + '" lng="' + $static.$json["mapData"][i].lng + '">' + $static.$json["mapData"][i].id + '</option>';
                tempFinish += '<option lat="' + $static.$json["mapData"][i].lat + '" lng="' + $static.$json["mapData"][i].lng + '">' + $static.$json["mapData"][i].id + '</option>';
            };
            $($static.options.$dropStart).append(tempStart).selectmenu('refresh', true);
            $($static.options.$dropFinish).append(tempFinish).selectmenu('refresh', true);
            this.updateToMyLocation();
        } catch (error) {
            console.error(error);
        }
    },
    updateToMyLocation: function () {
        $static.$mylocationinterval = setInterval(function () {
            if ($static.$updateLocation) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        $static.$myLatitude = position.coords.latitude;
                        $static.$myLongitude = position.coords.longitude;
                        $($static.options.$dropStart).find("option:contains('Konumum')").attr("lat", $static.$myLatitude);
                        $($static.options.$dropStart).find("option:contains('Konumum')").attr("lng", $static.$myLongitude);
                        $($static.options.$dropFinish).find("option:contains('Konumum')").attr("lat", $static.$myLatitude);
                        $($static.options.$dropFinish).find("option:contains('Konumum')").attr("lng", $static.$myLongitude);
                        $static.$map.setCenter(pos);
                        TurkcellMap.addToMyMarker($static.$map.center);
                        if ($static.$zoom == null) {
                            $static.$map.setZoom(15);
                        } else {
                            $static.$map.setZoom($static.$zoom);
                        }
                        TurkcellMap.zoomChange();
                    });
                }
            } else {
                clearInterval($static.$mylocationinterval);
            }
        }, 30000);
    },
    controlToUpdateLocation: function () {
        $($static.options.$switch).on('change', function () {
            if (this.value == 'true') {
                $static.$updateLocation = true;
                TurkcellMap.updateToMyLocation();
            } else {
                $static.$updateLocation = false;
            }
        });
    },
    markerUpdate: function ($this,$onStart) {
		$callback;
        TurkcellMap.init($this);
    },
    zoomChange: function () {
        google.maps.event.addListener($static.$map, 'zoom_changed', function () {
            $static.$zoom = $static.$map.zoom;
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
        $static.$directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                for (var i = 0; i < response.routes.length; i++) {
                    TurkcellMap.directionsRender(response, i);
                    if (i == 0) {
                        TurkcellMap.fullCalculateDistances(response.routes);
                    }
                }
            }
        });
    },
    fullCalculateDistances: function (response) {
        $($static.options.$roadOne + ',' + $static.options.$roadTwo + ',' + $static.options.$roadTree + ', span.noDecode, span.noDecode1').hide();
        $($static.options.$distanceInfo).show();
        for (var i = 0; i < response.length; i++) {
            TurkcellMap.responseFullCalculate(i, response[i].legs[0].distance, response[i].legs[0].duration);
        }
    },
    responseFullCalculate: function (count, distance, duration) {
        duration = parseInt(duration.value / 60) + ' dk';
        switch (count) {
            case 0:
                $($static.options.$roadOne).children($static.options.$distanceText).text(distance.text);
                $($static.options.$roadOne).children($static.options.$distanceMinutes).text(duration);
                $($static.options.$roadOne).show();
                break;
            case 1:
                $($static.options.$roadTwo).children($static.options.$distanceText).text(distance.text);
                $($static.options.$roadTwo).children($static.options.$distanceMinutes).text(duration);
                $($static.options.$roadTwo).show();
                $('span.noDecode').show();
                break;
            case 2:
                $($static.options.$roadTree).children($static.options.$distanceText).text(distance.text);
                $($static.options.$roadTree).children($static.options.$distanceMinutes).text(duration);
                $($static.options.$roadTree).show();
                $('span.noDecode1').show();
                break;
            default:
                console.log('3 Den Fazla Alternatif Yol Var.');
                break;
        }
    },
    singleCenter: function (position) {
        var posArray = position.split(',');
        var center = new google.maps.LatLng(posArray[0], posArray[1]);
        $static.$map.setCenter(center);
        $static.$map.setZoom(15);
    },
    directionsRender: function (response, count) {
        $static.$directionsDisplay = new google.maps.DirectionsRenderer({
            map: $static.$map,
            suppressMarkers: true,
            draggable: false,
            preserveViewport: false,
            polylineOptions: {
                strokeColor: (count > $static.options.$colorPicker.length - 1) ? $static.options.$colorPicker[2] : $static.options.$colorPicker[count],
                strokeOpacity: (count > $static.options.$colorPicker.length - 1) ? $static.options.$opacityArray[2] : $static.options.$opacityArray[count]
            }
        });
        $static.$directionsDisplay.setMap($static.$map);
        $static.$directionsDisplay.setDirections(response);
        $static.$directionsDisplay.setRouteIndex(count);
        $static.$directionArray.push($static.$directionsDisplay);
    },
    clearDirection: function () {
        if ($static.$directionsDisplay != null) {
            for (var i = 0; i < $static.$directionArray.length; i++) {
                $static.$directionArray[i].setMap(null);
            }
            $static.$directionsDisplay.setMap(null);
            $static.$directionsDisplay = null;
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
        }, TurkcellMap.responseDistances);
    },
    responseDistances: function (response, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
        } else {
            var distance = response.rows[0].elements[0].distance.text;
            var minutes = parseInt(response.rows[0].elements[0].duration.value / 60) + ' Dk';
            $($static.options.$distanceText).text(distance);
            $($static.options.$distanceMinutes).text(minutes);
        }
    },
    goToLineOfTheRoad: function () {
        $($static.options.$direction).on('click', function () {
            var start = new google.maps.LatLng($($static.options.$dropStart + " option:selected").attr('lat'), $($static.options.$dropStart + " option:selected").attr('lng'));
            var end = new google.maps.LatLng($($static.options.$dropFinish + " option:selected").attr('lat'), $($static.options.$dropFinish + " option:selected").attr('lng'));
            TurkcellMap.createToLineOfTheRoad(start, end, true);
            return false;
        });
    },
    singleGotoDirection: function () {
        $($static.options.$singleDirection).on('click', function () {
            var start = new google.maps.LatLng($myLatitude, $myLongitude);
            var end = new google.maps.LatLng($json["mapData"][0].lat, $json["mapData"][0].lng);
            TurkcellMap.createToLineOfTheRoad(start, end, false);
            return false;
        });
    },
    addToMyMarker: function (obj) {
        for (var i = 0; i < $static.$myMarkerArray.length; i++) {
            $static.$myMarkerArray[i].setMap(null);
        };
        var mymarker = new google.maps.Marker({
            position: obj,
            map: $static.$map,
            icon: 'assets/imgs/my.png'
        });
        $static.$myMarkerArray.push(mymarker);
    },
    addToOtherMarker: function (obj, id) {
        var marker = new google.maps.Marker({
            position: obj,
            map: $static.$map,
            icon: 'assets/imgs/' + id + '.png'
        });
        $static.$markerArray.push(marker);
    },
    dropDownChange: function () {
        $('body').on('change', $static.options.$dropStart, function () {
            TurkcellMap.chooseGenerator(this.options[this.selectedIndex].text);
        });
    },
    chooseGenerator: function (distinct) {
        var temp = '';
        if (distinct != 'Konumum') {
            temp += '<option lat="' + $static.$myLatitude + '" lng="' + $static.$myLongitude + '">Konumum</option>';
        }
        for (var i = 0; i < $static.$json["mapData"].length; i++) {
            if (distinct != $static.$json["mapData"][i].id.toString()) {
                temp += '<option lat="' + $static.$json["mapData"][i].lat + '" lng="' + $static.$json["mapData"][i].lng + '" >' + $static.$json["mapData"][i].id + '</option>';
            }
        };
        $($static.options.$dropFinish).empty();
        $($static.options.$dropFinish).append(temp).selectmenu('refresh', true);
    }
};