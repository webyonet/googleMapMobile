/*custom javascript v = 1.0.0 /// edit date => 7.11.2012*/
var $dropMenu = {
    init: function () {
        $('a.openMenu').live('click', function () {
            if ($(this).closest('h3.mainHeader').next('div.hiddenMenu').is(':hidden')) {
				$dropMenu.disabledFixed();
                $(this).closest('h3.mainHeader').next('div.hiddenMenu').slideDown('fast');
                $(this).parent('div.menuFrame').addClass('active');
            } else {
                $(this).closest('h3.mainHeader').next('div.hiddenMenu').slideUp('fast');
                $(this).parent('div.menuFrame').removeClass('active');
				$dropMenu.clearFixed();
            }
        });
        this.close();
        //this.resize();
        //this.computation();
    },
    close: function () {
        $(document).mouseup(function (e) {
            if ($('div.hiddenMenu').is(':visible')) {
                if (!$(e.target).closest('li.nonActive').hasClass('nonActive')) {
					$('div.hiddenMenu').slideUp('fast', function () {
						$(this).prev('h3.mainHeader').children('div.menuFrame').removeClass('active');
					});
					$dropMenu.clearFixed();
                }
            }
        });
    },
    resize: function () {
        $(window).resize(function () {
            $dropMenu.computation();
        });
    },
    computation: function () {
        $('div.menuFrame').height($('h3.mainHeader').height() + 20);
    },
	disabledFixed:function(){
		var dom = $('ul.ui-listview').find('span.ui-state-disabled');
		$(dom.parent('li')).addClass('nonActive');
	},
	clearFixed:function(){
		$('li.nonActive').removeClass('nonActive');
	}
};

$(function () {
    $dropMenu.init();
});




$.extend($.mobile, {

    pageLoadErrorMessage: 'Sayfa yüklenemedi.',
    showPageLoadingMsg: function () {
        if ($.mobile.loadingMessage) {
            var activeBtn = $("." + $.mobile.activeBtnClass).first(),
                $loader = $('.ui-loader').length ? $('.ui-loader') : $("<div class='ui-loader ui-body-a ui-corner-all'><span class='ui-icon ui-icon-loading spin'></span><h1></h1></div>"),
                $window = $(window),
                $html = $("html"),
                $active_page = $("div.ui-page-active"),
                $active_page_height = $active_page.height(),
                $top_page = $.support.scrollTop && $window.scrollTop() + $window.height() / 2;

            $loader.find("h1")
                .text($.mobile.loadingMessage)
                .css({
                top: $top_page + 30
            })
                .end()
                .find(".ui-icon")
                .css({
                top: $top_page
            })
                .end()
                .appendTo($.mobile.pageContainer)
            // position at y center (if scrollTop supported), above the activeBtn (if defined), or just 100px from top
            .css({
                height: $active_page_height,
                top: $top_page || activeBtn.length && activeBtn.offset().top || 100
            });
        }

        $html.addClass("ui-loading");
    }
});

function setFocus(id) {
    var element = document.getElementById(id);

    element.focus();
}

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

//Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

function getCurrentDay() {

    var now = new Date();

    return now.format("yyyy-mm-dd");

}

function getCurrentTime() {

    var now = new Date();

    return now.format("HH:MM");

}

function findMe() {

    if (navigator.geolocation) {
        var timeoutVal = 10 * 1000 * 1000;
        navigator.geolocation.getCurrentPosition(displayPosition, displayError, {
            enableHighAccuracy: true,
            timeout: timeoutVal,
            maximumAge: 0
        });
    } else {
        alert("Geolocation is not supported by this browser");
    }

    return true;
}

function displayPosition(position) {
    var lat = document.getElementById('cord:lat');
    lat.value = position.coords.latitude;
    var lon = document.getElementById('cord:lng');
    lon.value = position.coords.longitude;
}

function formatCurrency(num) {
    num = num.toString().replace(/\./g, "");
    num = num.toString().replace(",", ".");
    if (isNaN(num)) num = "0";
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10) cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
    num = num.substring(0, num.length - (4 * i + 3)) + '.' + num.substring(num.length - (4 * i + 3));
    return (((sign) ? '' : '-') + num + ',' + cents);
}

function findMeOnMap(assetsPath) {
    if (navigator.geolocation !== null) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var map = gmap.getMap(),
                latlng = new google.maps.LatLng(
                position.coords.latitude, position.coords.longitude);

            map.setCenter(latlng);

            startPosition = latlng;

            var marker = new google.maps.Marker({
                position: latlng,
                icon: assetsPath + '/images/neredeyim.png'
            });

            marker.setMap(map);
        }, function (error) {
            alert('Küresel konum bilginiz alınamamıştır. Lütfen daha sonra tekrar deneyiniz.');
        }, {
            enableHighAccuracy: false
        });
    } else {
        alert("HTML5 geolocation is not supported.");
    }
}

function displayError(error) {
    var errors = {
        1: 'Kullandığınız cihazın küresel konumlandirma servisi (GPS) kapalıdır. Lütfen kontrol ediniz.',
        2: 'Küresel konum bilginiz alınamamıştır. Lütfen daha sonra tekrar deneyiniz.',
        3: 'Küresel konum bilginiz alınamamıştır. Lütfen daha sonra tekrar deneyiniz.'
    };
    alert(errors[error.code]);
}

function goLocation(lat, lon) {
    var map = gmap.getMap();
    latlng = new google.maps.LatLng(lat, lon);
    map.setCenter(latlng);
}

var lat;
var lng;
var prewLat;
var prewLng;
var latUnput;
var lngUnput;

function updateCoordinate(latId, lngId) {
    if (navigator.geolocation) {
        latUnput = $(document.getElementById(latId));

        lngUnput = $(document.getElementById(lngId));
        prewLat = latUnput.val();
        prewLng = lngUnput.val();
        //var button=$(document.getElementById(buttonId));
        navigator.geolocation.getCurrentPosition(

        function (position) {
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            latUnput.val(lat);
            lngUnput.val(lng);
            updateCord.jq.click();

        });
    } else {
        alert("Geolocation is not supported by this browser");
    }
}

function unUpdateCoordinate() {
    latUnput.val(prewLat);
    lngUnput.val(prewLng);
}

function lockUpdateCoordinate() {
    prewLat = latUnput.val();
    prewLng = lngUnput.val();
}