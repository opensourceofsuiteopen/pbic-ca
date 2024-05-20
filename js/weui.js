
/** 检测是否为移动系统 **/
var isMobile;
function checkMobile() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    var bIsWP = sUserAgent.match(/windows phone/i) == "windows phone";
    if (bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM || bIsWP) {
        isMobile = true;
    }else{
    	isMobile = false;
    }
}
checkMobile();

/** 自定义tap手势 **/
function addTapEvent(element,func){
	var isTouchStart = false;
	var startX;
	var startY;
	var startTime;
	if(isMobile){
		element.addEventListener("touchstart",function(evt){
			isTouchStart = true;
			var date = new Date();
			startTime = date.getTime();
			startX = evt.touches[0].pageX;
			startY = evt.touches[0].pageY;
		});
		element.addEventListener("click", function(evt){
			evt.preventDefault();
		});
		element.addEventListener("touchend",function(evt){
			evt.preventDefault();
			if(isTouchStart){
				isTouchStart = false;
				var date = new Date();
				var endTime = date.getTime();
				var endX = evt.changedTouches[0].pageX;
				var endY = evt.changedTouches[0].pageY;
				if(endTime-startTime<250){
					if(Math.abs(endX-startX)<10 && Math.abs(endY-startY)<10){
						if(func!=null){
							func(element);
						}
					}
				}
			}
		});
	}else{
		element.addEventListener("click", function(evt){
			if(func!=null){
				func(element);
			}
		});
	}
}
			
			
//显示ActionSheet
function showActionSheet(labels, callback){
	var div = $('<div id="actionSheet_wrap"></div>');
	var mask = $('<div class="weui_mask_transition"></div>');
	var panel = $('<div class="weui_actionsheet">');
	var list = $('<div class="weui_actionsheet_menu"></div>');
	for(var i=0; i<labels.length; i++){
		var item = $('<div class="weui_actionsheet_cell"></div>');
		item.html(labels[i]);
		list.append(item);
	}
	var btns = $('<div class="weui_actionsheet_action"></div>');
	var btncancel = $('<div class="weui_actionsheet_cell">取消</div>');
	btns.append(btncancel);
	div.append(mask);
	panel.append(list);
	panel.append(btns);
	div.append(panel);
	$("body").append(div);
	//show
	mask.show();
	mask.css("background-color", "rgba(0,0,0,0.6)");
	panel.css("transform", "translateY(0%)");
	panel.css("-webkit-transform", "translateY(0%)");
	//addeventListener
	addTapEvent(btncancel[0], function(element){
		hideActionSheet();
		if(callback!=null){
			callback(-1);
		}
	});
	addTapEvent(mask[0], function(element){
		hideActionSheet();
		if(callback!=null){
			callback(-1);
		}
	});
	list.children().each(function(){
		addTapEvent(this, function(element){
			hideActionSheet();
			if(callback!=null){
				callback($(element).index());
			}
		});
	})
}
//隐藏ActionSheet
function hideActionSheet(){
	$(".weui_mask_transition").css("background-color", "transparent");
	$(".weui_actionsheet").css("transform", "translateY(100%)");
	$(".weui_actionsheet").css("-webkit-transform", "translateY(100%)");
	setTimeout(function(){
		$('#actionSheet_wrap').remove();
	},300);
}

//显示提示文字
function showToast(msg){
	var div = $('<div id="toast"></div>');
	var mask = $('<div class="weui_mask_transition"></div>');
	var toast = $('<div class="weui_toast"></div>');
	var icon = $('<div class="weui_icon_toast"></div>');
	var content = $('<p class="weui_toast_content"></p>');
	content.text(msg);
	toast.append(icon);
	toast.append(content);
	div.append(mask);
	div.append(toast);
	$("body").append(div);
	mask.show();
	setTimeout(function(){
		div.remove();
	},1500);
}


//显示loading
function showLoad(msg){
	var div = $('<div id="toast" class="weui_loading_toast"></div>');
	var mask = $('<div class="weui_mask_transition"></div>');
	var toast = $('<div class="weui_toast"></div>');
	var icon = $('<div class="weui_loading"></div>');
	for(var i=0; i<12; i++){
		var leaf = $('<div class="weui_loading_leaf weui_loading_leaf_'+i+'"></div>');
		icon.append(leaf);
	}
	var content = $('<p class="weui_toast_content"></p>');
	content.text(msg);
	toast.append(icon);
	toast.append(content);
	div.append(mask);
	div.append(toast);
	$("body").append(div);
	mask.show();
}
//隐藏loading
function hideLoad(msg){
	$(".weui_loading_toast").remove();
}

//显示弹窗
function showAlert(title, content, confirmLabel, cancelLabel, callback){
	var div = $('<div class="weui_dialog_confirm"></div>');
	var mask = $('<div class="weui_mask"></div>');
	var dialog = $('<div class="weui_dialog"></div>');
	var alt=$("<span class='per_no'></span>");
	var head = $('<div class="weui_dialog_hd"><strong class="weui_dialog_hd">'+title+'</strong></div>');
	if(content==undefined) content="";
	var content = $('<div class="weui_dialog_bd">'+content+'</div>');
	var footer = $('<div class="weui_dialog_ft"></div>');
	var btnCancel;
	if(cancelLabel!=undefined && cancelLabel!=""){
		btnCancel = $('<a class="weui_btn_dialog default">'+cancelLabel+'</a>');
		footer.append(btnCancel);
	}
	if(confirmLabel==undefined) confirmLabel="我知道了";
	var btnOK = $('<a class="weui_btn_dialog primary">'+confirmLabel+'</a>');
	footer.append(btnOK);
	dialog.append(alt);
	dialog.append(head);
	dialog.append(content);
	dialog.append(footer);
	div.append(mask);
	div.append(dialog);
	$("body").append(div);
	//addeventlistener
	if(btnCancel){
		addTapEvent(btnCancel[0], function(element){
			if(callback!=null){
				callback(0);
			}
			div.remove();
		});
	}
	addTapEvent(btnOK[0], function(element){
		if(callback!=null){
			callback(1);
		}
		div.remove();
	});
}





