/**
 * 选择测试卷
 */
function onSelectPaper(node, listview) {
	$("body").addClass("eyeColor");
	$("#home").hide();
	$("#paper").show();
}

/**
 * 初始化
 */
Metro.init()