//加载分类
// loadCategory();
// console.log(CCH5Uploader)
// console.log($("body").find("input[type='file']"))
// console.log($("#fileupload").find("input[type='file']"))


/*******************************************************************************
 * 加载分类
 */
function loadCategory() {
	$.getJSON('http://192.168.1.74:5551/api/ccvideo/vod/getCategory?t=' + Math.random(), function(data) {
		if (data.error) {
			errorMsgHandler('加载分类失败');
			return;
		}
		var categoryDatas = data.category;
		// 构造分类树
		var categoryTree = initCategoryTree({
			datas : categoryDatas,
			inputId : 'selectCategoryInput',
			outerBox : $("#selectCategoryInput").parent(),
			needEnsure : false,
			hasDefault : true,
			defaultName : '默认分类',
			defaultVal : $("#uploadCategory").val(),
			selectItem : function(categoryId, name, shortName) {
				$("#uploadCategory").val(categoryId);
			},
			setDeaultName : function(name, shortName) {
				$("#selectCategoryInput").val(shortName);
			}
		});
	});
}

window.onbeforeunload = function(e) {
	if ($('.progress.progress-striped.active.mb0.tc_rel').length) {
		return '视频上传中，离开页面将无法继续上传？';
	} else {
		if (!window.event) {
			return null;
		}
	}
};

function getShortStr(str,maxLen){
	if(typeof str != 'string' || str.length <= maxLen){
		return str;
	}
	return str.substr(0,maxLen) + '...';
}

function errorMsgHandler(msg) {
	alert(msg);
}