var openId;
var unionId;
var jsapiTicket;
var accessToken;
var wxName;
var wxPicurl;
var wxIsReady = false; //微信是否配置完成

var AppId = "wx208c001297a2f701"; //微信订阅号开发APP_ID


//启动微信初始化
function useWX(realpath, scope){
	if(openId==null){
		var realurl = encodeURIComponent(realpath);
		var oauth = wxGetOAuthURL("app/openid.html?realurl="+realurl, scope);
		location.href = oauth;
	}else{
		_wxConfig();
	}
}
//微信初始化授权
function wxInit(code, success, fault){
	showLoad("微信授权");
	request("FrontUser", "login2", {code:code, platform:"wxphone", appid:AppId}, function(data){
		hideLoad();
		if(data.code==0){
			openId = data.openId;
			unionId = data.unionId;
			jsapiTicket = data.jsapiTicket;
			accessToken = data.accessToken;
			wxName = data.wxName;
			wxPicurl = data.wxPicurl;
			_wxConfig();
			if(success!=undefined){
				success(data);
			}
		}else{
			if(fault!=undefined){
				fault(data.msg);
			}else{
				showAlert("微信授权失败", data.msg);
			}
		}
	})
}

function wxInit2(code, success, fault){
	showLoad("微信授权");
	request("WxBase", "getOpenId", {code:code, type:0, appid:AppId}, function(data){
		hideLoad();
		if(data.code==0){
			openId = data.openId;
			unionId = data.unionId;
			jsapiTicket = data.jsapiTicket;
			accessToken = data.accessToken;
			if(success!=undefined){
				success();
			}
			_wxConfig();
		}else{
			if(fault!=undefined){
				fault(data.msg);
			}else{
				showAlert("微信授权失败", data.msg);
			}
		}
	})
}

function _wxConfig(){
	var wx_nonceStr = Math.ceil(Math.random()*10000).toString();
	var now = new Date();
	var timestamp = Math.round(now.getTime()/1000).toString();
	var holeUrl = location.href;
	var arr = holeUrl.split('#');
	var pre_url = arr[0];
	var signObj = {
		noncestr: wx_nonceStr,
		jsapi_ticket: jsapiTicket,
		timestamp: timestamp,
		url: pre_url
	}
	var paramArr = [];
    for(var key in signObj){
    	paramArr.push({key:key, value:signObj[key]});
    }
    paramArr.sort(function(a,b){
     	return a.key > b.key ? 1 : -1;
    });
    var str = "";
    for(var i=0; i<paramArr.length; i++){
     	str += (paramArr[i].key+"="+paramArr[i].value+'&');
    }
    str = str.slice(0,str.length-1);
	var sign = hex_sha1(str).toString();
	wx.config({
		debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		appId: AppId, // 必填，公众号的唯一标识
		timestamp: timestamp, // 必填，生成签名的时间戳
		nonceStr: wx_nonceStr, // 必填，生成签名的随机串
		signature: sign,// 必填，签名，见附录1
		jsApiList: ['checkJsApi','onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo',
	        'hideMenuItems','showMenuItems','hideAllNonBaseMenuItem','showAllNonBaseMenuItem','translateVoice',
	        'startRecord','stopRecord','onRecordEnd','playVoice','pauseVoice','stopVoice','uploadVoice','downloadVoice',
	        'chooseImage','previewImage','uploadImage','downloadImage','getNetworkType','openLocation',
	        'getLocation','hideOptionMenu','showOptionMenu','closeWindow','scanQRCode','chooseWXPay',
	        'openProductSpecificView','addCard','chooseCard','openCard']// 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	});
}

wx.ready(function(){
    wxIsReady = true;
    wx.hideOptionMenu(); //隐藏右上角菜单项
    try{
    	onWXReady();
    }catch(e){}
});

wx.error(function(res){
	wxIsReady = false;
});

//微信分享 mode:0-同时开启好友和朋友圈（default）1-只开启朋友圈 2-只开启好友
function wxShare(wxLinkURL, wxImgURL, wxTitle, wxDes, timelineSuccess, chatSuccess, mode){
	var menuList = ['menuItem:favorite'];
	if(mode==1){
		menuList.push('menuItem:share:timeline');
	}else if(mode==2){
		menuList.push('menuItem:share:appMessage');
	}else{
		menuList.push('menuItem:share:timeline');
		menuList.push('menuItem:share:appMessage');
	}
	console.log(menuList)
	wx.showMenuItems({
      menuList: menuList
    });
    wx.onMenuShareAppMessage({
      title: wxTitle,
      desc: wxDes,
      link: wxLinkURL,
      imgUrl: wxImgURL,
      success: function(){
      	if(chatSuccess != undefined){
      		chatSuccess();
      	}
      }
    });
    wx.onMenuShareTimeline({
      title: wxTitle,
      link: wxLinkURL,
      imgUrl: wxImgURL,
      success: function(){
      	if(timelineSuccess != undefined){
      		timelineSuccess();
      	}
      }
    });
}

// baseShareURL = "http://www.saclass.com/ca/";
baseShareURL = "http://www.pbic.com/";


//获取可微信授权的页面URL   0-普通授权   1-高级授权
function wxGetOAuthURL(pageName, scope){
	if(scope==undefined) scope = 0;
	var scopestr = scope==0 ? "snsapi_base" : "snsapi_userinfo";
	var redirect_uri = encodeURIComponent(baseShareURL+pageName);
	var wxAuthURL = "https://open.weixin.qq.com/connect/oauth2/authorize"+
					"?appid="+AppId+
					"&redirect_uri="+redirect_uri+
					"&response_type=code&scope="+scopestr+
					"&state=STATE"+
					"#wechat_redirect";
	return wxAuthURL;
}

//微信支付
function wxPay(prepay_id, successfunc, errorfunc){
	if(!wxIsReady){
		showAlert('微信没有初始化');
		return;
	}
	var wx_nonceStr = Math.ceil(Math.random()*10000).toString();
	var now = new Date();
	var timestamp = Math.round(now.getTime()/1000).toString();
	var packege = 'prepay_id='+prepay_id;
	var signType = 'MD5';
	var signObj = {
		appId:AppId,
		timeStamp:timestamp,
		nonceStr:wx_nonceStr,
		package:packege,
		signType:signType
	};
	showLoad("正在支付");
	request("WXPaySign", "sign", signObj, function(data){
		hideLoad();
		if(data.code == 0){
			var sign = data.sign;
			wx.chooseWXPay({
				timestamp: timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
				nonceStr: wx_nonceStr, // 支付签名随机串，不长于 32 位
				package: packege, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
				signType: signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
				paySign: sign, // 支付签名
				success: function (res) {
	 				if(successfunc!=undefined) successfunc();
				},
				fail: function(res){
					if(errorfunc!=undefined) errorfunc();
				},
				cancel: function(res){
					//
				}
			});
		}else{
			showAlert("微信支付失败，获取签名失败", data.msg);
		}
	});
}