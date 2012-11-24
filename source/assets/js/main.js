$(function(){
	var url = null;
	//var stringBuilder = null;
	/*$('a.menuLink').on('click',function(){
		url = $(this).attr('href');
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
	});*/
	
	$('a.menuLink').on('click',function(){
		url = $(this).attr('href');
		$('aside.rightContent').empty().html($(url).html());
		$('ul.ui-listview li').removeClass('active');
		$(this).closest('li.ui-btn').addClass('active');
		return false;
	});
	
});