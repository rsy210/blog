$(document).ready(function(){
	window.onscroll = function(){
		$("header").attr("display", "none");
	}
	itemActive(".catalogue_list", 2);
	itemActive(".cateChi_list", 3);

	//实现分页
	var $pageCount = parseInt($(".pageCount").attr("dataCou"));
	var $pageNum = parseInt($(".pageCount").attr("dataNum"));
	var $pageTm = $(".pageCount").attr("dataTm");
	var pagebutton = '';
	console.log($pageNum);
	if($pageCount <= 10){
		for (var i = 0; i < $pageCount; i++) {
			pagebutton += '<a href="?pg='+(i+1)+'">' + (i+1) + '</a>';
		}
	}else if($pageCount >10 && $pageNum<=$pageCount){
		if($pageNum-5 <= 1 && $pageNum>0){

			for (var i = 0; i < 9; i++) {
				pagebutton += '<a href="?pg='+(i+1)+'">' + (i+1) + '</a>';
			}
			pagebutton += '<a class="disable"> ... </a>';
			pagebutton += '<a href="?pg='+$pageCount+'">' + $pageCount + '</a>';
		}else if($pageCount - $pageNum <= 4 && $pageNum - 4 > 0){
			pagebutton += '<a href="?pg=1">' + 1 + '</a>';
			pagebutton += '<a> ... </a>';
			for (var i = $pageNum - 4; i <= $pageCount; i++) {
				pagebutton += '<a href="?pg='+i+'">' + i + '</a>';
			}
		}else{
			pagebutton += '<a href="?pg=1">' + 1 + '</a>';
			pagebutton += '<a> ... </a>';
			for (var i = $pageNum - 4; i <= $pageNum + 4; i++) {
				pagebutton += '<a href="?pg='+i+'">' + i + '</a>';
			}
			pagebutton += '<a> ... </a>';
			pagebutton += '<a href="?pg='+$pageCount+'">' + $pageCount + '</a>';
		}
	}
		$(".pageCount").append(pagebutton);
		$(".pageCount a").each(function(){
			var $self = $(this);
			var $pg = $self.html();
			console.log($pg == $pageNum);
			if($pg == $pageNum){
				$self.addClass('current');
			}
		});
	/*//异步加载内容
	$(".pageCount a").click(function(){
		var $self = $(this);
		var $pg = $self.html();
		$.ajax({
			type: "GET",
			url: window.location.pathname,
			data: "pg="+$pg+"&tm=$lt:2016342224",
			dataType: "json",
			success: function(){
				console.log("success");
			}
		});
	});*/
	$(".add_post button").bind('click', function(){
		var $self = $(this);
		$.ajax({
			type: 'POST',
			url: '/',
			dataType: 'JSON',
			success: function(data){
				$.each(data.data, function(i,pvn){
					var content = '<div class="post_pv">';
					content += '<div class="pv_title"><a href="/articles/' + pvn.category + '/' + pvn.category_chil + '/' + pvn.id + '">' + pvn.title + '</a></div>';
					content += '<div class="post_desc col_txt_1"><span>发表时间：' + (pvn.time).minute + '&nbsp;&nbsp;&nbsp;访问量:' + pvn.pv + '</span></div>';
					if((pvn.post).indexOf('<img') != -1){
						var img = pvn.post.substring(pvn.post.indexOf('<img'), pvn.post.indexOf('.jpg"/>') + 7);
						content += '<div class="pv_content">';
						content += '<div class="imgf"><a href="/articles/' + pvn.category + '/' + pvn.category_chil + '/' + pvn.id + '">'+ img +'</a></div>';
							/*if((pvn.post).substr(0,120).indexOf('<img') != -1){
							content +='<div class="post_abstr col_txt_2">' + (pvn.post).substring(0,pvn.post.indexOf('<img')) + (pvn.post).substring(pvn.post.indexOf('.jpg"/>') + 7,175) + '<a href="/articles/"' + pvn.category + "/" + pvn.category_chil + "/" + pvn.id + '> 查看全文>> </a></div>';
							}else{*/
							content +='<div class="post_abstr col_txt_2">' + (pvn.post).substr(0,120) + '<a href="/articles/"' + pvn.category + "/" + pvn.category_chil + "/" + pvn.id + '> 查看全文>> </a></div>';
						/*	}*/
						content +='</div>';
						}else{
						content +='<div class="pv_content">';
						content +='<div class="post_abstr col_txt_2">' + (pvn.post).substr(0,500) + '<a href="/articles/"' + pvn.category + "/" + pvn.category_chil + "/" + pvn.id + '> 查看全文>> </a></div>';
						content +='</div>';
						}
					content +='</div>';
					$(".post_top").append(content);
					$(".has_post_num").html($(".has_post_num").html()+1);
				});
			}
		});
	})

	//根据链接路径为对应项设置class=active
	function itemActive(fatherClass, idx){
		var pathname = window.location.pathname;
		console.log(pathname);
		if(idx === 2) {
			pathname = (pathname === '/') ? "首页" : decodeURI(pathname.split(/\//)[idx]);
			console.log(pathname);
		}else if(idx === 3){
			pathname = pathname.split(/\//)[idx];
		}
		$(fatherClass).find("li a").each(function(index, cateChi){
			var $self = $(this);
			console.log(cateChi.innerHTML);
			if(pathname === cateChi.innerHTML){
				$self.parent().addClass("active");
			}
		});
	}

});