var SA_URL;
if(location.href.indexOf("https") != -1) {
	SA_URL = "https://test.saclass.com/businessService/centerCtrl/routeService.do";
} else {
	SA_URL = "http://test.saclass.com/businessService/centerCtrl/routeService.do";
}

// var SA_URL="http://139.224.46.145:8080";
var SA_URL="http://api.pbic.com";
// var SA_URL="http://192.168.1.233:8080";

// var SA_URL="http://test.saclass.com/businessService/centerCtrl/routeService.do";

var SA_URL2 = "http://test.saclass.com/businessService/centerCtrl/routeService.do";

//var SA_URL2="http://192.168.1.119:8091/SAonline/centerCtrl/routeService.do";
//var SA_URL = "http://192.168.1.119:8091/SAonline/centerCtrl/routeService.do"; //local
//var SA_URL = "http://192.168.1.107:8080/SAonline/centerCtrl/routeService.do"; //local
//var SA_URL = "http://192.168.1.120:8080/SAonline/centerCtrl/routeService.do"; //local
//var SA_URL = "http://192.168.1.110:8080/SAonline/centerCtrl/routeService.do"; //local

//------ 百度统计代码------ 
var _hmt = _hmt || [];

(function() {
	var hm = document.createElement("script");
	hm.src = "https://hm.baidu.com/hm.js?2f91da6fcb60fbec0d497264deee3b8f";
	var s = document.getElementsByTagName("script")[0];
	s.parentNode.insertBefore(hm, s);
})();
//------------------------

var userInfo = null;
var activityId = 12;

if(is_weixn()){
	userID = localStorage.userId;
	token = localStorage.token;
}else{
	userID = getCookie("userId");
	token = getCookie("token");
}

function getNoCodeURL() {
	var search = location.search;
	var noCodeUrl;
	if(search == "") {
		noCodeUrl = location.href;
	} else {
		noCodeUrl = location.href.split("?")[0];
		var param = "";
		search = search.slice(1);
		var arr = search.split("&");
		for(var i = 0; i < arr.length; i++) {
			var tmparr = arr[i].split("=");
			if(tmparr[0] != "code" && tmparr[0] != "state") {
				param += arr[i] + "&";
			}
		}
		param = param.slice(0, -1);
		if(param != "") {
			noCodeUrl += "?" + param;
		}
	}
	return noCodeUrl;
}

function showLoginQR() {
	//内嵌二维码方式：无需页面跳转
	var obj = new WxLogin({
		id: "wxQR",
		appid: "wxe034037e8bb6e1b3",
		scope: "snsapi_login",
		redirect_uri: encodeURIComponent(getNoCodeURL()),
		state: "STATE",
		style: "black", //white
		href: ""
	});
}

//获取用户详情
function getUserInfo(success, fault) {
	if(localStorage.userInfo != undefined) {
		userInfo = JSON.parse(localStorage.userInfo);
	}
	request("FrontUser", "getUserInfo", {
		userId: userID
	}, function(data) {
		if(data.code == 0) {
			userInfo = data;
			localStorage.userInfo = JSON.stringify(userInfo);
			if(success != undefined) {
				success();
			}
			//			try{
			//				NTKF_PARAM.uname = userInfo.userName;
			//			}catch(e){
			//				//TODO handle the exception
			//			}
			//			try{
			//				onUserInfoSuccess();
			//			}catch(e){}
			//			try{
			//				onHeaderUserInfoSuccess();
			//			}catch(e){}
			//			try{
			//				onLeftUserInfoSuccess();
			//			}catch(e){}
			//			try{
			//				onCashUserInfoSuccess();
			//			}catch(e){}
		} else {
			if(fault != undefined) {
				fault(data.msg);
			}
			//			try{
			//				onUserInfoError(data.msg);
			//			}catch(e){}
			//			try{
			//				onHeaderUserInfoError(data.msg);
			//			}catch(e){}
			//			try{
			//				onLeftUserInfoError(data.msg);
			//			}catch(e){}
		}
	})
}

//检测是否为微信浏览器
function is_weixn() {
	var ua = navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i) == "micromessenger") {
		return true;
	} else {
		return false;
	}
}

var loginModuleContainerID = "login-module-container";

//引入登录悬浮模块
function addLoginModule(loginSuccessFunc) {
	var div = $("#" + loginModuleContainerID);
	if(div.length == 0) {
		div = $('<div id="' + loginModuleContainerID + '"></div>');
		$("body").append(div);
		div.load("loginModule.html", function() {
			initLoginModule(loginSuccessFunc);
		});
	} else {
		div.show();
		initLoginModule(loginSuccessFunc);
	}
}

//发送get请求-基于jquery
function request(serviceName, methodName, otherParam, successFunc,type,order,postdata) {
	// console.log(SA_URL);
	// console.log(serviceName + " : " + methodName);
	// console.log(otherParam);
	var urlStr;
	if(order==1){
		urlStr= createURLStr(serviceName, methodName, otherParam,2);
	}else{
		urlStr= createURLStr(serviceName, methodName, otherParam);
	}

	// console.log(urlStr);
	var ajaxConfig = {
		type: type == undefined ? "get" : type,
		url: urlStr,
		success: function(str) {
			var json = eval("(" + str + ")");
			// console.log(json);
			// console.log("======================================");
			if(json.code == 10099) {
				clearCookie("userId");
				clearCookie("token");
				localStorage.removeItem("userId");
            	localStorage.removeItem("token");
				userID = null;
				token = null;
				userInfo = null;
				showAlert("当前登录已失效", "请您重新登录，给您带来的不便深表歉意", "重新登录", "", function(index) {
					if(index == 1) {
						location.href = "login.html";
					}
				});
			} else {
				if(successFunc != null) {
					successFunc(json);
				}
			}
		},
		error: function() {
			// console.log("ajax请求失败");
		}
	};
	if(postdata != undefined) {
		ajaxConfig.data = postdata;
	}
	var xhr = $.ajax(ajaxConfig);
	return xhr;
}

//创建jsonp请求数据
function jsonp(actionName, param, successFunc) {
	showLoad("加载习题");
	var jsonurl = SA_URL + actionName + ".do?callback=callback&" + createVarsStrByObj(param);
	$.ajax({
		type: "get",
		async: false,
		url: jsonurl,
		dataType: "jsonp",
		jsonpCallback: "callback",
		success: function(json) {
			// console.log(json);
			if(successFunc != null) {
				successFunc(json);
			}
		},
		error: function() {
			showAlert("数据加载失败！", "跨域请求，已被浏览器阻止！", "");
		}
	});
}

//创建请求的url
function createURLStr(serviceName, methodName, otherParam,num) {
	var data = {};
	data.sn = serviceName;
	data.mn = methodName;
	if(num!=2){
		data.token = token;
	}
	if(otherParam != null) {
		for(var key in otherParam) {
			data[key] = otherParam[key];
		}
	}
	data.sign = createMD5Sign(data);
	var str = createVarsStrByObj(data);
	var urlStr="";
	if(num==1 || num==2){ //1上传，2下单
		urlStr = SA_URL2 + "?" + str;
	}else{
		urlStr = SA_URL + "?" + str;
	}
	return urlStr;
}

//MD5验证加密
function createMD5Sign(data) {
	var paramArr = [];
	for(var key in data) {
		if(key != "info") {
			paramArr.push({
				key: key,
				value: data[key]
			});
		}
	}
	paramArr.sort(function(a, b) {
		return a.key > b.key ? 1 : -1;
	});
	var md5 = "";
	for(var i = 0; i < paramArr.length; i++) {
		md5 += paramArr[i].value;
	}
	md5 += "6783c950bdbf40aeac52042a9206e0ba";
	md5 = $.md5(md5);
	return md5;
}

//把对象转换为字符串拼接
function createVarsStrByObj(obj) {
	var str = "";
	for(var key in obj) {
		var encodeKeyValue = encodeURIComponent(obj[key]);
		str += key + "=" + encodeKeyValue + "&";
	}
	str = str.slice(0, str.length - 1);
	return str;
}

//js获取location.href的参数的方法
function getQuery(para) {
	var reg = new RegExp("(^|&)" + para + "=([^&]*)(&|$)");
	var search = decodeURIComponent(window.location.search);
	var r = search.substr(1).match(reg);
	if(r != null) {
		return unescape(r[2]);
	}
	return null;
}

function replaceQuery(para, value) {
	var search = decodeURIComponent(window.location.search);
	if(search == "") {
		search = "?" + para + "=" + value;
	} else if(search.indexOf(para) == -1) {
		search += "&" + para + "=" + value
	} else {
		var reg = new RegExp(para + "=[^&]*");
		search = search.replace(reg, para + "=" + value);
	}
	return search;
}

//读取cookies
function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if(arr = document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
}

//写入N小时cookie
function setCookie(name, value, Hours) {
	var exp = new Date();
	exp.setTime(exp.getTime() + Hours * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

//清除cookie  
function clearCookie(name) {
	setCookie(name, "", -1);
}

//派发事件
var dispatch = function(ele, type) {
	if(document.all) {
		// IE浏览器支持fireEvent方法
		ele.fireEvent('on' + type, evt)
	} else {
		// 其他标准浏览器使用dispatchEvent方法
		var evt = document.createEvent('HTMLEvents');
		// initEvent接受3个参数：
		// 事件类型，是否冒泡，是否阻止浏览器的默认行为
		evt.initEvent(type, true, true);
		ele.dispatchEvent(evt);
	}
};

//上传文件
function uploadFile(maxSize, successFunc, startuploadFunc, extention) {
	var form = $('<form method="post" enctype="multipart/form-data"></form>');
	var file = $('<input type="file" name="file" />');
	form.append(file);
	file.click();
	file.change(function() {
		var filePath = this.value;
		var fileObj = $(this)[0].files[0];
		var fileSizeM = fileObj.size / 1024 / 1024;
		if(extention != undefined && extention != "") {
			var earr = extention.split(",");
			var ext = fileObj.name.slice(fileObj.name.lastIndexOf(".") + 1);
			if(earr.indexOf(ext) == -1) {
				alert("文件格式只能是" + extention);
				return;
			}
		}
		if(fileSizeM > maxSize) {
			alert("文件大小不能超过" + maxSize + "M");
			return;
		}
		fileSizeM = fileSizeM.toFixed(1);
		if(startuploadFunc != null) {
			startuploadFunc();
		}
		formUpload(form[0], function(json) {
			if(json.code == 0) {
				if(successFunc != null) {
					successFunc(json.fileName, json.url, fileObj.name);
				}
			} else {
				showAlert(json.msg);
			}
		});
	});
}

function formUpload(form, func) {
	var obj = {
		md5: "true",
		signCode:'pbic2018',
	};
	var server_url = createURLStr("File", "upload", obj,1);
	form.action = server_url;
	showLoad("上传中");
	$(form).ajaxSubmit({
		success: function(str) {
			hideLoad();
			var json = JSON.parse(str);
			// console.log(json.path + json.fileName);
			// console.log(json);
			if(func != null) {
				func(json);
			}
		}
	});
}

function login(cb){
	var loginmask = $('<div class="login-iframe-mask" id="login-iframe-mask"></div>');
	var iframe = $('<iframe src="login.html?iframe=1" scrolling="yes"></iframe>');
	loginmask.append(iframe);
	$("body").append(loginmask);
	$("body").css("position","fixed");
	window["frameCloseLogin"] = function(){
		loginmask.remove();
		$("body").css("position","relative");
	}
	window["frameLoginSuccess"] = function(){
		loginmask.remove();
		$("body").css("position","relative");
		if(is_weixn()){
			userID = localStorage.userId;
			token = localStorage.token;
		}else{
			userID = getCookie("userId");
			token = getCookie("token");
		}
		if(cb!=undefined){
			cb();
			if(window.hasloadRight!=undefined){
				// console.log(userID)
				if(userID!=null){
					request("CFVote","getMyTeamInfo",{userId:userID},function(data) {
						if(data.code == 0){
							if(data.status == 3){
								applays=$('<div class="IndexApplay">'
									+'<span class="hideRight"></span>'
									+'<div class="toApply">'
										+'<ul>'
											// +'<li class="noLi firstA onActive noLiLogin"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>'
											// +'<li class="noLi noLiLogin"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>'
											// +'<li class="noLi noLiLogin"><a class="tomy" id="toFillProject">我的项目策划书<b></b></a></li>'
											// +'<li class="noLi noLiLogin"><a class="tomy" href="listItem.html">参赛队伍<b></b></a></li>'
											// +'<li class="myCode">'
											// 	+'<p class="code_p1">扫描关注公众号</p>'
											// 	+'<p class="code_p2">我要投票</p>'
											// 	+'<p class="code_p3"><img src="img/qrcode_new.png" /></p>'
											// 	+'<p class="xs_file_load">辅导文件下载</p>'
											// +'</li>'

										+'</ul>'
									+'</div>'
								+'</div>');
							}else{
								applays=$('<div class="IndexApplay">'
									+'<span class="hideRight"></span>'
									+'<div class="toApply">'
										+'<ul>'
											// +'<li class="noLi firstA onActive"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>'
											// +'<li class="noLi"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>'
											// +'<li class="noLi"><a class="tomy" href="listItem.html">参赛队伍<b></b></a></li>'
											// +'<li class="myCode">'
											// 	+'<p class="code_p1">扫描关注公众号</p>'
											// 	+'<p class="code_p2">我要投票</p>'
											// 	+'<p class="code_p3"><img src="img/qrcode_new.png" /></p>'
											// 	+'<p class="xs_file_load">辅导文件下载</p>'
											// +'</li>'

										+'</ul>'
									+'</div>'
								+'</div>');
							}
							$("body").append(applays);
						}
					})

				}else{
					applays=$('<div class="IndexApplay">'
						+'<span class="hideRight"></span>'
						+'<div class="toApply">'
							+'<ul>'
								// +'<li class="noLi firstA onActive"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>'
								// +'<li class="noLi"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>'
								// +'<li class="noLi"><a class="tomy" href="listItem.html">参赛队伍<b></b></a></li>'
								// +'<li class="myCode">'
								// 	+'<p class="code_p1">扫描关注公众号</p>'
								// 	+'<p class="code_p2">我要投票</p>'
								// 	+'<p class="code_p3"><img src="img/qrcode_new.png" /></p>'
								// 	+'<p class="xs_file_load">辅导文件下载</p>'
								// +'</li>'

							+'</ul>'
						+'</div>'
					+'</div>');
					$("body").append(applays);
				}

				// 辅导文件下载
				var downLoadFile= $('<div class="file_load_cover">'
					+'<div class="file_load_con">'
						+'<div class="file_load_close_box"><img src="img/file_load_close.png" class="file_load_close" alt="" /></div>'
						+'<div class="file_load_list">相关文件下载</div>'
						+'<ul class="file_list_ul">'
							+'<li>1、PBIC2019宣传册.pdf<a class="file_load_btn" href="source/brochure.pdf" target="_blank">点击下载</a></li>'
							+'<li>2、PBIC2019参赛手册.pdf<a class="file_load_btn" href="source/manual.pdf" target="_blank">点击下载</a></li>'
							+'<li>3、2019（第三届）青少年公益创新国际挑战赛参赛策划书说明.doc<a class="file_load_btn" href="source/prospectus.zip" target="_blank">点击下载</a></li>'
							+'<li>4、PBIC策划案样例：播种者SOWER策划书.pdf<a class="file_load_btn" href="source/sower.pdf" target="_blank">点击下载</a></li>'
							+'<li>5、PBIC策划案样例：一支足球队策划书（中文版）.pdf<a class="file_load_btn" href="source/team-zh.pdf" target="_blank">点击下载</a></li>'
							+'<li>6、PBIC策划案样例：一支足球队策划书（英文版）.pdf<a class="file_load_btn" href="source/team-en.pdf" target="_blank">点击下载</a></li>'
						+'</ul>'
					+'</div>'
				+'</div>');

				$("body").append(downLoadFile);
				$('body').on('click', ".hideRight", function(){
					var hasY=$(this).hasClass("addYate");
					if(hasY){
						applays.animate({
							width:160
						},"fast");
						$(".toApply").animate({
							width:160
						},"fast",function(){
							$(".toApply .tomy").show();
							$(".myCode p").show();
							$(".hideRight").removeClass("addYate");
						});
					}else{
						applays.animate({
							width:27
						},"fast");
						$(".toApply").animate({
							width:10
						},"fast",function(){
							$(".hideRight").addClass("addYate");
							$(".toApply .tomy").hide();
							$(".myCode p").hide();
						});
					}
				})

				if(userID!=null){
					getIndexInfo("appNo");
				}
				$('body').on('click', "#toMyapplay", function(){
					showLoad("验证活动");
					request("CFVote", "checkJoinAndEditEndTime", {chekType:0}, function(data) {
						hideLoad();
						if(data.code==0){
							if(userID!=null){
								getIndexInfo("app");
							}else{
								login(function(){
									getIndexInfo("app");
								});
							}
						}else{
							showAlert("无法报名", data.msg);
							//location.href = "http://my.saclass.com/app/landingPBIC.html";
						}
					});
				});
				$('body').on('click', "#toMyMessage", function(){
					if(userID!=null){
						getIndexInfo("message");
					}else{
						login(function(){
							getIndexInfo("message");
						});
					}
				});
				$('body').on('click', "#toFillProject", function(){
					if(userID!=null){
						getIndexInfo("fillProject");
					}else{
						login(function(){
							getIndexInfo("fillProject");
						});
					}
				});

		//		setTimeout(hideRights,5000);
				$(window).scroll(function() {
					var swH=$(".swiper-heard01").height();
					if($(window).scrollTop() > swH) {
						$(".bannerMenu").css("position","fixed");
						$(".bannerMenu").css("top","0");
					} else {
						$(".bannerMenu").css("position","relative");
					}
				});
			}
		}
	}
}
var voteId="";
/*网页右侧咨询框*/
function getIndexInfo(str) {
	showLoad("获取信息");
	request("CFVote","getMyTeamInfo",{userId:userID},function(data) {
		hideLoad();
		if(data.code==0){
			voteId = data.id;
				if(str=="app"){
					if(data.status==1 || data.status==3){
						showAlert("您已经报过名了", "请去我的队伍查看", "我知道了", "我的团队", function(index) {
							if(index == 0) {
								location.href="competationItem.html?ids=5";
							}
						});
						if(data.status==1){
							$("#toMyapplay span").text("等待审核…");
						}else{
							$("#toMyapplay span").text("已报名");
						}
						$(".firstA").removeClass("onActive");
						$("#toMyapplay").css("color","#888888");
						$(".firstA").css("pointer-events","none");
					}else{
						checkJoinAndEditEndTime();
					}
				}else if(str=="appNo"){
					if(data.status==1 || data.status==3){
						if(data.status==1){
							$("#toMyapplay span").text("等待审核…");
						}else{
							$("#toMyapplay span").text("已报名");
						}
						$(".firstA").removeClass("onActive");
						$("#toMyapplay").css("color","#888888");
						$(".firstA").css("pointer-events","none");
					}
				}else if(str=="message"){
					if(data.status==1){
						showAlert("您的报名信息在审核中，请稍后查看");
					}else if(data.status==3){
						location.href="competationItem.html?ids=5";
					}else if(data.status==2){
						showAlert("您的报名信息审核未通过，请重新报名");
					}else{
						showAlert("您还未报名");
					}
				}else if(str=="fillProject"){
					if(data.status==1){
						showAlert("您的报名信息在审核中，请稍后查看");
					}else if(data.status==3){
						// 此处应该增加逻辑判断是否已经完成先项目策划书的填写
						request("CFVote","showMeVoteInfo",{voteId:voteId},function(data) {
							if(data.code==0){
								if(data.planningLetter){
									location.href="myProject.html";
								}else{
									location.href="fillProject.html";
								}
							}else{
								showAlert(data.msg);
							}
						})
					}else if(data.status==2){
						showAlert("您的报名信息审核未通过，请重新报名");
					}else{
						showAlert("您还未报名");
					}
				}else if(str=="Registration"){
					if(data.status==1 || data.status==3){
						showAlert("您已经报过名了", "请去我的队伍查看", "我知道了", "我的团队", function(index) {
							if(index == 0) {
								location.href='my_team.html?ids='+3;
							}
						});
					}else{
						checkJoinAndEditEndTime();
					}
				}else if(str=="myTeam"){
					if(data.status==1){
						showAlert("您的报名信息在审核中，请稍后查看");
					}else if(data.status==3){
						window.location.href='my_team.html?ids='+3;
					}else if(data.status==2){
						showAlert("您的报名信息审核未通过，请重新报名");
					}else{
						showAlert("您还未报名");
					}
				}


		}
	})
}

function checkJoinAndEditEndTime(){
	showLoad("验证活动");
	request("CFVote", "checkJoinAndEditEndTime", {chekType:0}, function(data) {
		hideLoad();
		if(data.code==0){
			window.location.href="apply.html";
		}else{
			showAlert("无法报名", data.msg);
			//location.href = "http://my.saclass.com/app/landingPBIC.html";
		}
	});
}

function hideRights(){
	var hasY=$(".hideRight").hasClass("addYate");
	if(!hasY){
		applays.animate({
			width:27
		},"fast");
		$(".toApply").animate({
			width:10
		},"fast",function(){
			$(".hideRight").addClass("addYate");
			$(".toApply .tomy").hide();
			$(".myCode p").hide();
		});
	}
}
var timeID;
// 已填写项目策划书队伍
function getVoteList(){
	request("CFVote","showMeVoteList",{page:0,size:50,type:1},function(data) {
		// console.log(data)
		if(data.code == 0){
			let str = ''
			data.rank.forEach(element => {
				let item = JSON.parse(element.info)
				str += '<li class="swiper-slide"><div class="project_complete_img"><img src='+item.teamPhoto[0]+'></div><div class="project_complete_right"><div class="project_complete_right_title">编号: '+ element.id+'</div><div class="project_complete_right_code">'+element.name +'</div></div></li>'
			});
			$('.project_complete_team').remove()
			var projectCompleteTeam
			if(data.rank.length > 6){
				projectCompleteTeam = $('<div class="project_complete_team">'
					+'<span class="hideLeft"></span>'
					+'<div class="project_complete_team_box">'
					+'<div class="project_complete_title">提交策划案队伍</div>'
					+'<div class="swiper-container project_complete_list"><div class="swiper-wrapper">'
						+str
					+'</div></div></div>'
				+'</div>');
				$("body").append(projectCompleteTeam);
				// console.log(Swiper)
				var swiper = new Swiper('.project_complete_list', {
					direction: 'vertical',//纵向分布
					slidesPerView: 6,//最多六个
					loop: true,//无限滚动
					// autoplay : 1000,
					autoplay: {
						delay: 3000,
						stopOnLastSlide: false,
						disableOnInteraction: false,
					},
				});
			}else{
				projectCompleteTeam = $('<div class="project_complete_team">'
					+'<span class="hideLeft"></span>'
					+'<div class="project_complete_team_box">'
						+'<div class="project_complete_title">策划案排名</div>'
						+'<ul class="project_complete_list">'
							+str
						+'</ul>'
					+'</div></div>');
				$("body").append(projectCompleteTeam);
			}
			$('body').on('click', ".hideLeft", function(){
				var hasY=$(this).hasClass("addYate");
				if(hasY){

					projectCompleteTeam.animate({
						width:256
					},"fast");
					$(".project_complete_team_box").animate({
						width:256
					},"fast",function(){
						$(".project_complete_list").show();
						$(".project_complete_title").show();
						$(".hideLeft").removeClass("addYate");
						var swiper = new Swiper('.project_complete_list', {
							direction: 'vertical',//纵向分布
							slidesPerView: 6,//最多六个
							loop: true,//无限滚动
							// autoplay : 1000,
							// autoplay:true,
							autoplay: {
								delay: 5000,
								stopOnLastSlide: false,
								disableOnInteraction: false,
							},
						});
					});
				}else{
					swiper.destroy(false);
					projectCompleteTeam.animate({
						width:27
					},"fast");
					// $(".project_complete_title").animate({
					// 	width:10
					// },"fast");
					$(".project_complete_team_box").animate({
						width:10
					},"fast",function(){
						$(".project_complete_list").hide();
						$(".project_complete_title").hide();
						$(".hideLeft").addClass("addYate");
						// $(".project_complete_list").addClass("project_complete_list_nopadding");
						// $(".project_complete_title").addClass("project_complete_title_hidden");
					});

				}
			})
			timeID = setTimeout(getVoteList,1000*60*60*1)
		}
	})
}
$(function() {
	var icoBox = $('<link rel="icon" href="img/favicon.ico" type="img/x-ico" />'); //head添加头部图标
	$("head").append(icoBox);
	if(window.hasloadRight!=undefined){
		// console.log(userID)
		if(userID!=null){
			request("CFVote","getMyTeamInfo",{userId:userID},function(data) {
				if(data.code == 0){
					if(data.status == 3){
						applays=$('<div class="IndexApplay">'
							+'<span class="hideRight"></span>'
							+'<div class="toApply">'
								+'<ul>'
									// +'<li class="noLi firstA onActive noLiLogin"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>'
									// +'<li class="noLi noLiLogin"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>'
									// +'<li class="noLi noLiLogin"><a class="tomy" id="toFillProject">我的项目策划书<b></b></a></li>'
									// +'<li class="noLi noLiLogin"><a class="tomy" href="listItem.html">参赛队伍<b></b></a></li>'
									// +'<li class="myCode">'
									// 	+'<p class="code_p1">扫描关注公众号</p>'
									// 	+'<p class="code_p2">我要投票</p>'
									// 	+'<p class="code_p3"><img src="img/qrcode_new.png" /></p>'
									// 	+'<p class="xs_file_load">辅导文件下载</p>'
									// +'</li>'

								+'</ul>'
							+'</div>'
						+'</div>');
					}else{
						applays=$('<div class="IndexApplay">'
							+'<span class="hideRight"></span>'
							+'<div class="toApply">'
								+'<ul>'
									// +'<li class="noLi firstA onActive"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>'
									// +'<li class="noLi"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>'
									// +'<li class="noLi"><a class="tomy" href="listItem.html">参赛队伍<b></b></a></li>'
									// +'<li class="myCode">'
									// 	+'<p class="code_p1">扫描关注公众号</p>'
									// 	+'<p class="code_p2">我要投票</p>'
									// 	+'<p class="code_p3"><img src="img/qrcode_new.png" /></p>'
									// 	+'<p class="xs_file_load">辅导文件下载</p>'
									// +'</li>'

								+'</ul>'
							+'</div>'
						+'</div>');
					}
					$("body").append(applays);
				}
			})

		}else{
			applays=$('<div class="IndexApplay">'
				+'<span class="hideRight"></span>'
				+'<div class="toApply">'
					+'<ul>'
						// +'<li class="noLi firstA onActive"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>'
						// +'<li class="noLi"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>'
						// +'<li class="noLi"><a class="tomy" href="listItem.html">参赛队伍<b></b></a></li>'
						// +'<li class="myCode">'
						// 	+'<p class="code_p1">扫描关注公众号</p>'
						// 	+'<p class="code_p2">我要投票</p>'
						// 	+'<p class="code_p3"><img src="img/qrcode_new.png" /></p>'
						// 	+'<p class="xs_file_load">辅导文件下载</p>'
						// +'</li>'

					+'</ul>'
				+'</div>'
			+'</div>');
			$("body").append(applays);
		}
		// 已填写项目策划书队伍
		getVoteList()
		var downLoadFile= $('<div class="file_load_cover">'
							+'<div class="file_load_con">'
								+'<div class="file_load_close_box"><img src="img/file_load_close.png" class="file_load_close" alt="" /></div>'
								+'<div class="file_load_list">相关文件下载</div>'
								+'<ul class="file_list_ul">'
									+'<li>1、PBIC2019宣传册.pdf<a class="file_load_btn" href="source/brochure.pdf" target="_blank">点击下载</a></li>'
									+'<li>2、PBIC2019参赛手册.pdf<a class="file_load_btn" href="source/manual.pdf" target="_blank">点击下载</a></li>'
									+'<li>3、2019（第三届）青少年公益创新国际挑战赛参赛策划书说明.doc<a class="file_load_btn" href="source/prospectus.zip" target="_blank">点击下载</a></li>'
									+'<li>4、PBIC策划案样例：播种者SOWER策划书.pdf<a class="file_load_btn" href="source/sower.pdf" target="_blank">点击下载</a></li>'
									+'<li>5、PBIC策划案样例：一支足球队策划书（中文版）.pdf<a class="file_load_btn" href="source/team-zh.pdf" target="_blank">点击下载</a></li>'
									+'<li>6、PBIC策划案样例：一支足球队策划书（英文版）.pdf<a class="file_load_btn" href="source/team-en.pdf" target="_blank">点击下载</a></li>'
								+'</ul>'
							+'</div>'
						+'</div>');


		$("body").append(downLoadFile);

		$('body').on('click', ".hideRight", function(){
			var hasY=$(this).hasClass("addYate");
			if(hasY){
				applays.animate({
					width:160
				},"fast");
				$(".toApply").animate({
					width:160
				},"fast",function(){
					$(".toApply .tomy").show();
					$(".myCode p").show();
					$(".hideRight").removeClass("addYate");
				});
			}else{
				applays.animate({
					width:27
				},"fast");
		$(".toApply").animate({
			width:10
		},"fast",function(){
			$(".hideRight").addClass("addYate");
			$(".toApply .tomy").hide();
			$(".myCode p").hide();
		});
	}
})
if(userID!=null){
	getIndexInfo("appNo");
}
$('body').on('click', "#toMyapplay", function(){
	showLoad("验证活动");
	request("CFVote", "checkJoinAndEditEndTime", {chekType:0}, function(data) {
		hideLoad();
		if(data.code==0){
			if(userID!=null){
				getIndexInfo("app");
			}else{
				login(function(){
					getIndexInfo("app");
				});
					}
				}else{
					showAlert("无法报名", data.msg);
					//location.href = "http://my.saclass.com/app/landingPBIC.html";
				}
			});
		});
		$('body').on('click', "#toMyMessage", function(){
			if(userID!=null){
				getIndexInfo("message");
			}else{
				login(function(){
					getIndexInfo("message");
				});
			}
		});
		$('body').on('click', "#toFillProject", function(){
			if(userID!=null){
				getIndexInfo("fillProject");
			}else{
				login(function(){
					getIndexInfo("fillProject");
				});
			}
		});

//		setTimeout(hideRights,5000);
		$(window).scroll(function() {
			var swH=$(".swiper-heard01").height();
			if($(window).scrollTop() > swH) {
				$(".bannerMenu").css("position","fixed");
				$(".bannerMenu").css("top","0");
			} else {
				$(".bannerMenu").css("position","relative");
			}
		});
	}
	if(window.noloadxn == undefined) {
		var box = $('<div class="consult">' +
			'<ul>' +
			'<li class="conLi04" title="回到顶部"></li>' +
			'</ul>' +
			'</div>'); //创建页面元素

		$("body").append(box); //在body中添加标签元素
		if(isMobile) {
			$(".conLi04").css({
				"width": "30px",
				"height": "35px",
				"background-size": "100%"
			});
		}
		//鼠标悬停效果
		$(window).scroll(function() {
			if($(window).scrollTop() == 0) {
				$(".conLi04").css({
					"top": "260px",
					"opacity": 0
				});
			} else {
				$(".conLi04").css({
					"top": "150px",
					"opacity": 1
				});
			}
		});
		//点击回滚到顶部
		$(".conLi04").click(function() {
			$("html,body").animate({
				scrollTop: 0
			}, 600);
		});
		//点击登录也关闭按钮
		$(document).on('click','.js_colose_icon',function(){

			var curHref=parent.location.href.split('?')[0]
			parent.location.href=curHref

		})


	}
	// $('.xs_file_load').click(function(){
	// 	$(".file_load_cover").css('display','block');

	// })
	// $('.file_load_close').click(function(){
	// 	$(".file_load_cover").css('display','none');
	// })
	$('body').on('click', ".xs_file_load", function(){
		$(".file_load_cover").css('display','block');
	});
	$('body').on('click', ".file_load_close", function(){
		$(".file_load_cover").css('display','none');
	});
});