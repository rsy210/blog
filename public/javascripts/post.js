$(document).ready(function(){
	//打开上传图片dialog
	$("#uploadImg").click(function(){
		$("#uploadImg_dialog").css("display","block");
		autoCenter();
		console.log($("#updImg"));
		if($("#updImg").val() != undefined){
			$("#updImg").val('');
		}
	});
	//关闭上传图片dialog
	$(".upImg_close,.upImg_cancel").click(function(){
		$("#uploadImg_dialog").css("display","none");
		$(".mask").css("display","none");
	});

	$('#upForm').submit(function() {
    // 提交表单
    $('#upForm').ajaxSubmit({
    	type: 'POST',
			url: '/upload',
			dataType: 'JSON',
			success: function(data){
				console.log(data.data);
				var url = pathFormatCon(data.data);
				$(".upImg_show img").attr("src",url);
				$(".upImg_show img").css("display","block");
				autoCenter();
			},
			error: function(XmlHttpRequest, textStatus, errorThrown){
				alert("err"+XmlHttpRequest, textStatus, errorThrown);
			}
    });
    // 为了防止普通浏览器进行表单提交和产生页面导航（防止页面刷新？）返回false
    return false;
   });
	$('.upImg_confirm').click(function(){
		var src = $('.upImg_show img').attr("src");
		if(src != undefined){
			src = "![]("+src+")";
			inserText($('.post_text'), src);
			hideDialog();
		}

	});
});
	//居中
	function autoCenter(){
		var bodyH = $(window).height();
		var bodyW = $(window).width();

		var objH = $("#uploadImg_dialog")[0].offsetHeight;
		var objW = $("#uploadImg_dialog")[0].offsetWidth;

		var width = (bodyW - objW)/2 + 'px';
		var height = (bodyH - objH)/2 + 'px';
		$("#uploadImg_dialog").css({"top": height, "left": width});

		$(document.body).append('<div class="mask"></div>');
	}
	//
	function hideDialog(){
		$("#uploadImg_dialog").css("display","none");
		$(".mask").css("display","none");
	}
//图片路径格式斜杠和反斜杠的转换
function pathFormatCon(url){
	var reg = /\\/g;
	url = url.replace(reg,"\/");
	if(url.indexOf("/") != -1){
		url = url.substr(url.indexOf("/"));
	}
	return url;
}
//在光标位置插入内容
function inserText(obj, str){
	if(document.selection){
		var sel = document.selection.createRange();
		sel.text = str;
		obj.focus();
		sel.moveStart('character', -str.length);
		sel.moveEnd('character', -str.length);
	}else if(typeof obj[0].selectionStart === 'number' && typeof obj[0].selectionEnd === 'number'){
		var start = obj[0].selectionStart;
		var end = obj[0].selectionEnd;
		var cursorT = start;
		var nVal = obj.val();
		nVal = nVal.substring(0, start) + str + nVal.substring(end, nVal.length);
		obj.val(nVal);
		obj.focus();
		cursorT += str.length;
		obj[0].selectionStart = obj[0].selectionEnd = cursorT;
	}else{
		var nVal = obj.val();
		if (nVal === undefined) {
			nVal = '';
		}
		nVal = nVal + str;
		obj.val(nVal);
		obj.focus();
	}
}