$(function(){
	var url = null;
	var stringBuilder = null;
	$('a.menuLink').on('click',function(){
		url = $(this).attr('href');
		/*stringBuilder = $.get('doc/' + url + '.html',function(data){
			console.log($(data));	
		});*/
		$.ajax({
			type: 'GET',
			url:'doc/' + url + '.html',
			cache:true,
			dataType: 'html',
			success:function(result){
				$('aside.rightContent').empty().html(result);
				SyntaxHighlighter.highlight();
			}
		});
		return false;
	});
});