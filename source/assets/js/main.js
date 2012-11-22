$(function(){
	$('header.header').on('click','a.home',function(){
	  $.mobile.changePage( "#mapPage", {
		  transition: "flip",
		  reverse: true,
		  changeHash: true
	  });
	});
	
	/*$('a.mapLink').on('click', function(){
	  $.mobile.changePage( "map.html", {
		  transition: "flow",
		  reverse: true,
		  changeHash: true
	  });
	});*/
});