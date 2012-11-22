/* LAYOUT JS */
function toggleLiveResizing () {
		$.each('north,south,west,east'.split(','), function (i, pane) {
			var opts = myLayout.options[ pane ];
			opts.resizeWhileDragging = !opts.resizeWhileDragging;
		});
	};
	function toggleStateManagement ( skipAlert ) {
		var enable = !myLayout.options.useStateCookie;
		myLayout.options.useStateCookie = enable;

		if (!enable) {
			myLayout.deleteCookie();
			if (!skipAlert)
				alert( 'This layout will reload as options specify \nwhen the page is refreshed.' );
		}
		else if (!skipAlert)
			alert( 'This layout will save & restore its last state \nwhen the page is refreshed.' );

		// update text on button
		var $Btn = $('#btnToggleState'), text ="";
	};
	var stateResetSettings = {
			north__size:		"null"
		,	north__initClosed:	false
		,	north__initHidden:	false
		,	south__size:		"auto"
		,	south__initClosed:	false
		,	south__initHidden:	false
		,	west__initClosed:	false
		,	west__initHidden:	false
	};
	var myLayout;

	$(document).ready(function () {
		myLayout = $('body').layout({
			west__showOverflowOnHover: true
		,	closable:				true	// pane can open & close
		,	resizable:				true	// when open, pane can be resized 
		,	slidable:				true	// when closed, pane can 'slide' open over other panes - closes on mouse-out
		,	north__slidable:		false	// OVERRIDE the pane-default of 'slidable=true'
		,   north__closable:        false
		,	north__togglerLength_closed: '100%'	// toggle-button is full-width of resizer-bar
		,	north__spacing_closed:	20		// big resizer-bar when open (zero height)
		,	west__minSize:			313
		,	center__minWidth:		100
		,	useStateCookie:			true
		});
		var cookieExists = false;
		for (var key in myLayout.getCookie()) {
			cookieExists = true;
			break
		}
		if (!cookieExists) toggleStateManagement( true );
		if ($.layout.revision && $.layout.revision >= 0.032915)
			$('#btnReset').show();
 	});