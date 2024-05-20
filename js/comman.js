var SA_URL;
if (location.href.indexOf("https") != -1) {
  SA_URL =
    "https://test.saclass.com/businessService/centerCtrl/routeService.do";
} else {
  SA_URL = "http://test.saclass.com/businessService/centerCtrl/routeService.do";
}

var SA_URL = "http://139.224.46.145:8080";
// var SA_URL="http://api.pbic.com";
// var SA_URL="http://192.168.1.233:8080";

// var SA_URL="http://test.saclass.com/businessService/centerCtrl/routeService.do";

var SA_URL2 =
  "http://test.saclass.com/businessService/centerCtrl/routeService.do";

//var SA_URL2="http://192.168.1.119:8091/SAonline/centerCtrl/routeService.do";
//var SA_URL = "http://192.168.1.119:8091/SAonline/centerCtrl/routeService.do"; //local
//var SA_URL = "http://192.168.1.107:8080/SAonline/centerCtrl/routeService.do"; //local
//var SA_URL = "http://192.168.1.120:8080/SAonline/centerCtrl/routeService.do"; //local
//var SA_URL = "http://192.168.1.110:8080/SAonline/centerCtrl/routeService.do"; //local

//------ 百度统计代码------
var _hmt = _hmt || [];

(function () {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?2f91da6fcb60fbec0d497264deee3b8f";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
//------------------------

var userInfo = null;
var activityId = 12;
var projectSwiper = null;
if (is_weixn()) {
  userID = localStorage.userId;
  token = localStorage.token;
} else {
  userID = getCookie("userId");
  token = getCookie("token");
}

function getNoCodeURL() {
  var search = location.search;
  var noCodeUrl;
  if (search == "") {
    noCodeUrl = location.href;
  } else {
    noCodeUrl = location.href.split("?")[0];
    var param = "";
    search = search.slice(1);
    var arr = search.split("&");
    for (var i = 0; i < arr.length; i++) {
      var tmparr = arr[i].split("=");
      if (tmparr[0] != "code" && tmparr[0] != "state") {
        param += arr[i] + "&";
      }
    }
    param = param.slice(0, -1);
    if (param != "") {
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
    href: "",
  });
}

//获取用户详情
function getUserInfo(success, fault) {
  if (localStorage.userInfo != undefined) {
    userInfo = JSON.parse(localStorage.userInfo);
  }
  request(
    "FrontUser",
    "getUserInfo",
    {
      userId: userID,
    },
    function (data) {
      if (data.code == 0) {
        userInfo = data;
        localStorage.userInfo = JSON.stringify(userInfo);
        if (success != undefined) {
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
        if (fault != undefined) {
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
    }
  );
}

//检测是否为微信浏览器
function is_weixn() {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    return true;
  } else {
    return false;
  }
}

var loginModuleContainerID = "login-module-container";

//引入登录悬浮模块
function addLoginModule(loginSuccessFunc) {
  var div = $("#" + loginModuleContainerID);
  if (div.length == 0) {
    div = $('<div id="' + loginModuleContainerID + '"></div>');
    $("body").append(div);
    div.load("loginModule.html", function () {
      initLoginModule(loginSuccessFunc);
    });
  } else {
    div.show();
    initLoginModule(loginSuccessFunc);
  }
}

//发送get请求-基于jquery
function request(
  serviceName,
  methodName,
  otherParam,
  successFunc,
  type,
  order,
  postdata
) {
  // console.log(SA_URL);
  // console.log(serviceName + " : " + methodName);
  // console.log(otherParam);
  var urlStr;
  if (order == 1) {
    urlStr = createURLStr(serviceName, methodName, otherParam, 2);
  } else {
    urlStr = createURLStr(serviceName, methodName, otherParam);
  }

  // console.log(urlStr);
  var ajaxConfig = {
    type: type == undefined ? "get" : type,
    url: urlStr,
    success: function (str) {
      var json = eval("(" + str + ")");
      // console.log(json);
      // console.log("======================================");
      if (json.code == 10099) {
        clearCookie("userId");
        clearCookie("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        userID = null;
        token = null;
        userInfo = null;
        showAlert(
          "当前登录已失效",
          "请您重新登录，给您带来的不便深表歉意",
          "重新登录",
          "",
          function (index) {
            if (index == 1) {
              location.href = "login.html";
            }
          }
        );
      } else {
        if (successFunc != null) {
          successFunc(json);
        }
      }
    },
    error: function () {
      // console.log("ajax请求失败");
    },
  };
  if (postdata != undefined) {
    ajaxConfig.data = postdata;
  }
  var xhr = $.ajax(ajaxConfig);
  return xhr;
}

//创建jsonp请求数据
function jsonp(actionName, param, successFunc) {
  showLoad("加载习题");
  var jsonurl =
    SA_URL + actionName + ".do?callback=callback&" + createVarsStrByObj(param);
  $.ajax({
    type: "get",
    async: false,
    url: jsonurl,
    dataType: "jsonp",
    jsonpCallback: "callback",
    success: function (json) {
      // console.log(json);
      if (successFunc != null) {
        successFunc(json);
      }
    },
    error: function () {
      showAlert("数据加载失败！", "跨域请求，已被浏览器阻止！", "");
    },
  });
}

//创建请求的url
function createURLStr(serviceName, methodName, otherParam, num) {
  var data = {};
  data.sn = serviceName;
  data.mn = methodName;
  if (num != 2) {
    data.token = token;
  }
  if (otherParam != null) {
    for (var key in otherParam) {
      data[key] = otherParam[key];
    }
  }
  data.sign = createMD5Sign(data);
  var str = createVarsStrByObj(data);
  var urlStr = "";
  if (num == 1 || num == 2) {
    //1上传，2下单
    urlStr = SA_URL2 + "?" + str;
  } else {
    urlStr = SA_URL + "?" + str;
  }
  return urlStr;
}

//MD5验证加密
function createMD5Sign(data) {
  var paramArr = [];
  for (var key in data) {
    if (key != "info") {
      paramArr.push({
        key: key,
        value: data[key],
      });
    }
  }
  paramArr.sort(function (a, b) {
    return a.key > b.key ? 1 : -1;
  });
  var md5 = "";
  for (var i = 0; i < paramArr.length; i++) {
    md5 += paramArr[i].value;
  }
  md5 += "6783c950bdbf40aeac52042a9206e0ba";
  md5 = $.md5(md5);
  return md5;
}

//把对象转换为字符串拼接
function createVarsStrByObj(obj) {
  var str = "";
  for (var key in obj) {
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
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

function replaceQuery(para, value) {
  var search = decodeURIComponent(window.location.search);
  if (search == "") {
    search = "?" + para + "=" + value;
  } else if (search.indexOf(para) == -1) {
    search += "&" + para + "=" + value;
  } else {
    var reg = new RegExp(para + "=[^&]*");
    search = search.replace(reg, para + "=" + value);
  }
  return search;
}

//读取cookies
function getCookie(name) {
  var arr,
    reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
  else return null;
}

//写入N小时cookie
function setCookie(name, value, Hours) {
  var exp = new Date();
  exp.setTime(exp.getTime() + Hours * 60 * 60 * 1000);
  document.cookie =
    name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

//清除cookie
function clearCookie(name) {
  setCookie(name, "", -1);
}

//派发事件
var dispatch = function (ele, type) {
  if (document.all) {
    // IE浏览器支持fireEvent方法
    ele.fireEvent("on" + type, evt);
  } else {
    // 其他标准浏览器使用dispatchEvent方法
    var evt = document.createEvent("HTMLEvents");
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
  file.change(function () {
    var filePath = this.value;
    var fileObj = $(this)[0].files[0];
    var fileSizeM = fileObj.size / 1024 / 1024;
    if (extention != undefined && extention != "") {
      var earr = extention.split(",");
      var ext = fileObj.name.slice(fileObj.name.lastIndexOf(".") + 1);
      if (earr.indexOf(ext) == -1) {
        alert("文件格式只能是" + extention);
        return;
      }
    }
    if (fileSizeM > maxSize) {
      alert("文件大小不能超过" + maxSize + "M");
      return;
    }
    fileSizeM = fileSizeM.toFixed(1);
    if (startuploadFunc != null) {
      startuploadFunc();
    }
    formUpload(form[0], function (json) {
      if (json.code == 0) {
        if (successFunc != null) {
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
    signCode: "pbic2018",
  };
  var server_url = createURLStr("File", "upload", obj, 1);
  form.action = server_url;
  showLoad("上传中");
  $(form).ajaxSubmit({
    success: function (str) {
      hideLoad();
      var json = JSON.parse(str);
      // console.log(json.path + json.fileName);
      // console.log(json);
      if (func != null) {
        func(json);
      }
    },
  });
}

function login(cb) {
  var loginmask = $(
    '<div class="login-iframe-mask" id="login-iframe-mask"></div>'
  );
  var iframe = $('<iframe src="login.html?iframe=1" scrolling="yes"></iframe>');
  loginmask.append(iframe);
  $("body").append(loginmask);
  $("body").css("position", "fixed");
  window["frameCloseLogin"] = function () {
    loginmask.remove();
    $("body").css("position", "relative");
  };
  window["frameLoginSuccess"] = function () {
    loginmask.remove();
    $("body").css("position", "relative");
    if (is_weixn()) {
      userID = localStorage.userId;
      token = localStorage.token;
    } else {
      userID = getCookie("userId");
      token = getCookie("token");
    }
    if (cb != undefined) {
      cb();
      if (window.hasloadRight != undefined) {
        // console.log(userID)
        if (userID != null) {
          request(
            "CFVote",
            "getMyTeamInfo",
            { userId: userID },
            function (data) {
              if (data.code == 0) {
                if (data.status == 3) {
                  applays = $(
                    '<div class="IndexApplay">' +
                      '<span class="hideRight"></span>' +
                      '<div class="toApply">' +
                      "<ul>" +
                        // '<li class="noLi firstA onActive noLiLogin"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>' +
                        // '<li class="noLi noLiLogin"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>' +
                        // '<li class="noLi noLiLogin"><a class="tomy" id="toFillProject">我的项目策划书<b></b></a></li>' + 
                        // '<li class="noLi noLiLogin"><a class="tomy" href="teamlist.html">参赛队伍<b></b></a></li>' +
                        // '<li class="myCode">' +
                        //   '<p class="code_p1">扫描关注公众号</p>' +
                        //   '<p class="code_p2">我要投票</p>' + 
                        //   '<p class="code_p3"><img src="img/qrcode_new.png" /></p>' +
                        //   '<p class="xs_file_load">辅导文件下载</p>' +
                        // "</li>" +
                      "</ul>" +
                      "</div>" +
                      "</div>"
                  );
                } else {
                  applays = $(
                    '<div class="IndexApplay">' +
                      '<span class="hideRight"></span>' +
                      '<div class="toApply">' +
                      "<ul>" +
                        // '<li class="noLi firstA onActive"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>' +
                        // '<li class="noLi"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>' +
                        // '<li class="noLi"><a class="tomy" href="teamlist.html">参赛队伍<b></b></a></li>' +
                        // '<li class="myCode">' +
                        //   '<p class="code_p1">扫描关注公众号</p>' +
                        //   '<p class="code_p2">我要投票</p>' + 
                        //   '<p class="code_p3"><img src="img/qrcode_new.png" /></p>' +
                        //   '<p class="xs_file_load">辅导文件下载</p>' +
                        // "</li>" +
                      "</ul>" +
                      "</div>" +
                      "</div>"
                  );
                }
                $("body").append(applays);
              }
            }
          );
        } else {
          applays = $(
            '<div class="IndexApplay">' +
              '<span class="hideRight"></span>' +
              '<div class="toApply">' +
              "<ul>" +
                // '<li class="noLi firstA onActive"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>' +
                // '<li class="noLi"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>' +
                // '<li class="noLi"><a class="tomy" href="teamlist.html">参赛队伍<b></b></a></li>' +
                // '<li class="myCode">' +
                //   '<p class="code_p1">扫码关注公众号</p>' +
                //   '<p class="code_p2">我要投票</p>' + 
                //   '<p class="code_p3"><img src="img/qrcode_new.png" /></p>' +
                //   '<p class="xs_file_load">辅导文件下载</p>' +
                // "</li>" +
              "</ul>" +
              "</div>" +
              "</div>"
          );
          $("body").append(applays);
        }

        // 辅导文件下载
        var downLoadFile = $(
          '<div class="file_load_cover">' +
            '<div class="file_load_con">' +
            '<div class="file_load_close_box"><img src="img/file_load_close.png" class="file_load_close" alt="" /></div>' +
            '<div class="file_load_list">相关文件下载</div>' +
            '<ul class="file_list_ul">' +
            // '<li>1、2021第五届PBIC青少年国际公益创新挑战赛_宣传手册.pdf<a class="file_load_btn" href="source/2021第五届PBIC青少年国际公益创新挑战赛_宣传手册.pdf" target="_blank">点击下载</a></li>' +
            // + '<li>1、PBIC2020宣传册.pdf<a class="file_load_btn" href="source/PBIC2020宣传册.pdf" target="_blank">点击下载</a></li>'
            // + '<li>2、PBIC2020 Brochure.pdf<a class="file_load_btn" href="source/PBIC2020Brochure.pdf" target="_blank">点击下载</a></li>'
            // + '<li>3、PBIC2020分值说明.pdf<a class="file_load_btn" href="source/PBIC2020分值说明.pdf" target="_blank">点击下载</a></li>'
            // + '<li>4、PBIC2020（第四届）青少年公益创新国际挑战赛参赛策划书模板.docx<a class="file_load_btn" href="source/PBIC2020（第四届）青少年公益创新国际挑战赛参赛策划书模板.docx" target="_blank">点击下载</a></li>'
            // + '<li>2、PBIC2019参赛手册.pdf<a class="file_load_btn" href="source/manual.pdf" target="_blank">点击下载</a></li>'
            // + '<li>3、2019（第三届）青少年公益创新国际挑战赛参赛策划书说明.doc<a class="file_load_btn" href="source/prospectus.zip" target="_blank">点击下载</a></li>'
            // + '<li>4、PBIC策划案样例：播种者SOWER策划书.pdf<a class="file_load_btn" href="source/sower.pdf" target="_blank">点击下载</a></li>'
            // + '<li>5、PBIC策划案样例：一支足球队策划书（中文版）.pdf<a class="file_load_btn" href="source/team-zh.pdf" target="_blank">点击下载</a></li>'
            // + '<li>6、PBIC策划案样例：一支足球队策划书（英文版）.pdf<a class="file_load_btn" href="source/team-en.pdf" target="_blank">点击下载</a></li>'
            "</ul>" +
            "</div>" +
            "</div>"
        );

        $("body").append(downLoadFile);

        $("body").on("click", ".hideRight", function () {
          var hasY = $(this).hasClass("addYate");
          if (hasY) {
            applays.animate(
              {
                width: 160,
              },
              "fast"
            );
            $(".toApply").animate(
              {
                width: 160,
              },
              "fast",
              function () {
                $(".toApply .tomy").show();
                $(".myCode p").show();
                $(".hideRight").removeClass("addYate");
              }
            );
          } else {
            applays.animate(
              {
                width: 27,
              },
              "fast"
            );
            $(".toApply").animate(
              {
                width: 10,
              },
              "fast",
              function () {
                $(".hideRight").addClass("addYate");
                $(".toApply .tomy").hide();
                $(".myCode p").hide();
              }
            );
          }
        });

        if (userID != null) {
          getIndexInfo("appNo");
        }
        $("body").on("click", "#toMyapplay", function () {
          showLoad("验证活动");
          if (userID != null) {
            getIndexInfo("app");
          } else {
            login(function () {
              getIndexInfo("app");
            });
          }
          // request("CFVote", "checkJoinAndEditEndTime", {chekType: 0}, function (data) {
          //     hideLoad();
          //     if (data.code == 0) {
          //         if (userID != null) {
          //             getIndexInfo("app");
          //         } else {
          //             login(function () {
          //                 getIndexInfo("app");
          //             });
          //         }
          //     } else {
          //         showAlert("无法报名", data.msg);
          //         //location.href = "http://my.saclass.com/app/landingPBIC.html";
          //     }
          // });
        });
        $("body").on("click", "#toMyMessage", function () {
          if (userID != null) {
            getIndexInfo("message");
          } else {
            login(function () {
              getIndexInfo("message");
            });
          }
        });
        $("body").on("click", "#toFillProject", function () {
          if (userID != null) {
            getIndexInfo("fillProject");
          } else {
            login(function () {
              getIndexInfo("fillProject");
            });
          }
        });

        //		setTimeout(hideRights,5000);
        $(window).scroll(function () {
          var swH = $(".swiper-heard01").height();
          if ($(window).scrollTop() > swH) {
            $(".bannerMenu").css("position", "fixed");
            $(".bannerMenu").css("top", "0");
          } else {
            $(".bannerMenu").css("position", "relative");
          }
        });
      }
    }
  };
}

var voteId = "";

/*网页右侧咨询框*/
function getIndexInfo(str) {
  showLoad("获取信息");
  request("CFVote", "getMyTeamInfo", { userId: userID }, function (data) {
    hideLoad();
    if (data.code == 0) {
      voteId = data.id;
      if (str == "app") {
        if (data.status == 1 || data.status == 3) {
          showAlert(
            "您已经报过名了",
            "请去我的队伍查看",
            "我知道了",
            "我的团队",
            function (index) {
              if (index == 0) {
                location.href = "competationItem.html?ids=5";
              }
            }
          );
          if (data.status == 1) {
            $("#toMyapplay span").text("等待审核…");
          } else {
            $("#toMyapplay span").text("已报名");
          }
          $(".firstA").removeClass("onActive");
          $("#toMyapplay").css("color", "#888888");
          $(".firstA").css("pointer-events", "none");
        } else {
          checkJoinAndEditEndTime();
        }
      } else if (str == "appNo") {
        if (data.status == 1 || data.status == 3) {
          if (data.status == 1) {
            $("#toMyapplay span").text("等待审核…");
          } else {
            $("#toMyapplay span").text("已报名");
          }
          $(".firstA").removeClass("onActive");
          $("#toMyapplay").css("color", "#888888");
          $(".firstA").css("pointer-events", "none");
        }
      } else if (str == "message") {
        if (data.status == 1) {
          showAlert("您的报名信息在审核中，请稍后查看");
        } else if (data.status == 3) {
          location.href = "competationItem.html?ids=5";
        } else if (data.status == 2) {
          showAlert("您的报名信息审核未通过，请重新报名");
        } else {
          showAlert("您还未报名");
        }
      } else if (str == "fillProject") {
        if (data.status == 1) {
          showAlert("您的报名信息在审核中，请稍后查看");
        } else if (data.status == 3) {
          // 此处应该增加逻辑判断是否已经完成先项目策划书的填写
          request(
            "CFVote",
            "showMeVoteInfo",
            { voteId: voteId },
            function (data) {
              if (data.code == 0) {
                if (data.planningLetter) {
                  location.href = "myProject.html";
                } else {
                  location.href = "fillProject.html";
                }
              } else {
                showAlert(data.msg);
              }
            }
          );
        } else if (data.status == 2) {
          showAlert("您的报名信息审核未通过，请重新报名");
        } else {
          showAlert("您还未报名");
        }
      } else if (str == "Registration") {
        if (data.status == 1 || data.status == 3) {
          showAlert(
            "您已经报过名了",
            "请去我的队伍查看",
            "我知道了",
            "我的团队",
            function (index) {
              if (index == 0) {
                location.href = "my_team.html?ids=" + 3;
              }
            }
          );
        } else {
          checkJoinAndEditEndTime();
        }
      } else if (str == "myTeam") {
        if (data.status == 1) {
          showAlert("您的报名信息在审核中，请稍后查看");
        } else if (data.status == 3) {
          window.location.href = "my_team.html?ids=" + 3;
        } else if (data.status == 2) {
          showAlert("您的报名信息审核未通过，请重新报名");
        } else {
          showAlert("您还未报名");
        }
      }
    }
  });
}

function checkJoinAndEditEndTime() {
  showLoad("验证活动");
  window.location.href = "apply.html";
  // request("CFVote", "checkJoinAndEditEndTime", {chekType: 0}, function (data) {
  //     hideLoad();
  //     if (data.code == 0) {
  //         window.location.href = "apply.html";
  //     } else {
  //         showAlert("无法报名", data.msg);
  //         //location.href = "http://my.saclass.com/app/landingPBIC.html";
  //     }
  // });
}

function hideRights() {
  var hasY = $(".hideRight").hasClass("addYate");
  if (!hasY) {
    applays.animate(
      {
        width: 27,
      },
      "fast"
    );
    $(".toApply").animate(
      {
        width: 10,
      },
      "fast",
      function () {
        $(".hideRight").addClass("addYate");
        $(".toApply .tomy").hide();
        $(".myCode p").hide();
      }
    );
  }
}

var timeID;

// 项目策划书中学队伍排名
function getSecondaryArrList() {
  let teamRankSecondaryArr = [
    {
      id: 209,
      name: "WATERFAIRY",
      score: 98.7,
      index: 1,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/06/02/1559475408026.png",
        teamDes:
          "我们是WATERFAIRY。据统计，全世界70%-80%的传染病是由水污染引起的。我们积极响应联合国2030年可持续发展目标中的第3项良好健康和福祉和第6项清洁饮水与卫生设施。2010年7月28日联合国大会宣布：享有清洁饮水和卫生设施是一项必不可少的人权。我们项目的目标是为赞比亚城郊及乡村地区的学生和居民提供分布式净水设备，使当地学生和居民能够拥有清洁的饮用水，以减少他们因水质患病的几率。",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/06/09/1560091369472.jpg",
        ],
        teamPartner: [
          {
            userNameZh: "纪维宣",
            userNameEn: "Vincent",
            school: "北京市八一学校",
            gender: "1",
            age: 17,
            tel: "13581879959",
            email: "wasonjee@126.com",
            parentName: "纪军",
            parentTel: "13910728199",
          },
          {
            userNameZh: "郑寒璐",
            userNameEn: "Loren",
            school: "北京市八一学校",
            gender: "0",
            age: 16,
            tel: "15311178687",
            email: "15311178687@163.com",
            parentName: "李微",
            parentTel: "13521491721",
          },
          {
            userNameZh: "李依萌",
            userNameEn: "Lilac",
            school: "北京市八一学校",
            gender: "0",
            age: 16,
            tel: "18610677200",
            email: "liyimeng20020921@163.com",
            parentName: "李新松",
            parentTel: "13601127113",
          },
          {
            userNameZh: "任俊嘉",
            userNameEn: "John",
            school: "北京市八一学校",
            gender: "1",
            age: 17,
            tel: "15701561165",
            parentName: "陈永智",
            parentTel: "13601175632",
            email: "1720562632@qq.com",
          },
          {
            userNameZh: "张馨心",
            userNameEn: "Amanda",
            school: "北京市八一学校",
            gender: "0",
            age: 17,
            tel: "13126991515",
            parentName: "张刚",
            parentTel: "18500782069",
            email: "1440542762@qq.com",
          },
          {
            userNameZh: "沈明骏",
            userNameEn: "Shen Mingjun",
            school: "中央美术学院附属实验学校",
            gender: "1",
            age: 17,
            tel: "15601001449",
            parentName: "沈一扬",
            parentTel: "13671063878",
            email: "2802363481@qq.com",
          },
        ],
      },
    },
    {
      id: 217,
      name: "CUBIC SUGAR",
      score: 96.8,
      index: 2,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/07/11/1562800994899.png",
        teamDes:
          "我们是六位来自北京二中国际部的高中生。我们有着同一个梦想，为着同一个目标，借助我们国家的无人机技术，帮助非洲受疾病困扰的人们即时获得药物和相应的预防。就像方糖加入到苦涩的咖啡中时，那沁人心脾的甜意。虽然那一两架无人机所带来的力量是微小的，但它却成为我们梦想与他们希望的纽带！",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/11/1562801442880.jpeg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/11/1562840250970.jpeg",
        ],
        teamMedia: [],
        teamPartner: [
          {
            userNameZh: "杨宇晨",
            userNameEn: "Jason",
            school: "",
            gender: "",
            age: "16",
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "张力元",
            userNameEn: "David Zhang",
            school: "",
            gender: "",
            age: "16",
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "窦天麒",
            userNameEn: "Bruce",
            school: "",
            gender: "",
            age: "15",
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "俞博聪",
            userNameEn: "Steven Yu",
            school: "",
            gender: "",
            age: "16",
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "吕金轩",
            userNameEn: "Selina",
            school: "",
            gender: "",
            age: "15",
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "王文睿",
            userNameEn: "Eric",
            school: "",
            gender: "",
            age: "15",
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
        ],
      },
    },
    {
      id: 216,
      name: "Digital Library Africa",
      score: 93.1,
      index: 3,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/07/08/1562556692953.png",
        teamDes:
          "大家好，我们是DLA组织。我们远大的目标是抑制罕见病在非洲的发展，通过录制经典故事获得资助并且将筹款、书籍以及故事录音一同捐赠至非洲，为当地的罕见病患儿献上我们的一份爱心。队长张家畅，加拿大籍华人，全面发展的理科生、慈善经验丰富、小朋友的大哥哥。滕韦羚，来自台湾，艺术类工作及公众关系负责人、出众的领导者。姚翔，加拿大籍华人，调研及组织者、有条有理的学习爱好者。刘珈函，来自中国，财务管理者、能歌善舞、短视频拍剪专家。当然还有我们的Thembi， 来自南非的朋友，国际关系负责人。这就是我们的团队，由来自全球各地的人组成。我们拥有国际化的思考方式，希望能够连接、启发、挑战、并且改变世界。\n",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/13/1563022288718.jpg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/08/1562587238023.png",
        ],
        teamMedia: [],
        teamPartner: [
          {
            userNameZh: "张家畅",
            userNameEn: "Bruce Zhang",
            school: "",
            gender: "",
            age: 16,
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "姚翔",
            userNameEn: "Matthew Yao",
            school: "",
            gender: "",
            age: 16,
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "刘珈函",
            userNameEn: "Rayna Liu",
            school: "",
            gender: "",
            age: 16,
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "滕韦羚",
            userNameEn: "Winnie Teng",
            school: "",
            gender: "",
            age: 16,
            tel: "",
            parentName: "",
            parentTel: "",
            email: "",
          },
          {
            userNameZh: "Thembekile Lumwata Mphuthi",
            userNameEn: "Thembekile Lumwata Mphuthi",
            school: "",
            gender: "",
            age: 16,
            tel: "",
            parentName: "",
            parentTel: "",
            email: "",
          },
        ],
      },
    },
    {
      id: 210,
      name: "167CLUB",
      score: 89.8,
      index: 4,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/06/11/1560220551561.png",
        teamDes:
          "167CLUB是一个由三个人组成的组合。我们三个来自不同的学校却有着相同梦想，都想通过自己的力量为社会带来一些改变。如今，有一个机会使我们能够为非洲孩子们的健康做出贡献，这也是我们成立167CLUB的初衷。我们的力量虽然渺小，但我相信会有更多有爱心的人加入我们，和我们一起完成这个看似渺小却很伟大的愿望！",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/11/1562857985297.jpg",
        ],
        teamMedia: [],
        teamPartner: [
          {
            userNameZh: "高田田",
            userNameEn: "Sasha",
            school: "中国人民大学附属中学",
            gender: "0",
            age: 16,
            tel: "18211030978",
            email: "gaotiantian0722@sina.com",
            parentName: "田瑗",
            parentTel: "13701063164",
          },
          {
            userNameZh: "刘欣程",
            userNameEn: "Lisa",
            school: "Calvary Day School",
            gender: "0",
            age: 16,
            tel: "13511087566",
            email: "13511087566@163.com",
            parentName: "李艳萍",
            parentTel: "13930813718",
          },
          {
            userNameZh: "赵予心",
            userNameEn: "Cloris",
            school: "EF Academy",
            gender: "0",
            age: 15,
            tel: "13522269508",
            email: "cloriszhao0926@outlook.com",
            parentName: "李军",
            parentTel: "13901049181",
          },
        ],
      },
    },
    {
      id: 218,
      name: "WELFARE",
      score: 86.6,
      index: 5,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/07/12/1562891492924.png",
        teamDes:
          "我们是来自北京市三帆中学初一（8）班的宋绵宇、王若涵、刘思齐、付雨鑫、李英石、高锦程。我们活泼开朗、热情善良、包容多元，具有社会责任意识和同理心。我们希望通过参加此次比赛帮助非洲贫困国家和地区的女性，满足她们的基本生活需要和人权保障，获得信心、勇气和自由，因此我们的项目名称是“飞鸟计划”。",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/12/1562861529110.jpg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/12/1562861646300.jpg",
        ],
        teamMedia: [],
        teamPartner: [
          {
            userNameZh: "宋绵宇",
            userNameEn: "Emily",
            school: "北京市三帆中学",
            gender: "0",
            age: 13,
            tel: "15710024903",
            email: "yulan_yulan@163.com",
            parentName: "余蓝",
            parentTel: "13911993335",
          },
          {
            userNameZh: "李英石",
            userNameEn: "Stone",
            school: "北京市三帆中学",
            gender: "1",
            age: 13,
            tel: "18810315325",
            email: "lihongyu@bupt.edu.cn",
            parentName: "李红玉",
            parentTel: "18518638532",
          },
          {
            userNameZh: "王若涵",
            userNameEn: "Grace",
            school: "北京市三帆中学",
            gender: "0",
            age: 13,
            tel: "18511801979",
            email: "wangruohan810@163.com",
            parentName: "陈艳仿",
            parentTel: "15911083215",
          },
          {
            userNameZh: "付雨鑫",
            userNameEn: "Flora",
            school: "北京市三帆中学",
            gender: "0",
            age: 13,
            tel: "13718369827",
            parentName: "高银鹰",
            parentTel: "13671337970",
            email: "12095585@qq.com",
          },
          {
            userNameZh: "刘思齐",
            userNameEn: "Lucy",
            school: "北京市三帆中学",
            gender: "0",
            age: 13,
            tel: "15910651130",
            parentName: "薄纯芝",
            parentTel: "15811501936",
            email: "bochunzhi@bun.edu.cn",
          },
          {
            userNameZh: "高锦程",
            userNameEn: "Peter",
            school: "北京市三帆中学",
            gender: "1",
            age: 13,
            tel: "15611394237",
            parentName: "陈艳蓉",
            parentTel: "13699177652",
            email: "chenyanrong@stategrid.com.cn",
          },
        ],
      },
    },
    {
      id: 226,
      name: "Malaria Taker",
      score: 86.5,
      index: 6,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/07/15/1563190788799.png",
        teamDes:
          "非洲兼做世界上第二大洲与人口第二大洲，在这片充满潜力的土地上的文化在不断地繁荣。在非洲前进的道路上，以蚊虫为主导的疾病向非洲人民不断地提出挑战。据世界卫生组织报道，多数疟疾病例和死亡发生在撒哈拉沙漠以南非洲。我们队伍计划向马拉维的人民提供药浸蚊帐，为马拉维的防疟疾建设做出贡献。",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/15/1563191002106.jpg",
        ],
        teamPartner: [
          {
            userNameZh: "邹昊桐",
            userNameEn: "13",
            school: "",
            gender: "",
            age: 16,
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "代玉阳",
            userNameEn: "Rick",
            school: "",
            gender: "",
            age: 16,
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "刘欢实",
            userNameEn: "David",
            school: "",
            gender: "",
            age: "16",
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "赵睿禛",
            userNameEn: "Steven",
            school: "",
            gender: "",
            age: "17",
            tel: "",
            parentName: "",
            parentTel: "",
            email: "",
          },
          {
            userNameZh: "关丁弋",
            userNameEn: "Ethan",
            school: "",
            gender: "",
            age: "16",
            tel: "",
            parentName: "",
            parentTel: "",
            email: "",
          },
          {
            userNameZh: "徐芾怡",
            userNameEn: "Fuyi Xu",
            school: "",
            gender: "",
            age: "16",
            tel: "",
            parentName: "",
            parentTel: "",
            email: "",
          },
        ],
      },
    },
    {
      id: 219,
      name: "ENLIGHTEN",
      score: 84.1,
      index: 7,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/07/14/1563066381483.png",
        teamDes:
          "大家好，我们是来自北京的19届高三毕业生们。作为本次活动十七八岁的哥哥姐姐们，希望和大家一起，为改善非洲贫困和疾病贡献力量。\n众所周知，非洲的孩子们迫切希望通过接受教育走出贫困。但因为经济落后、物资匮乏等限制因素，他们学业梦想的实现一直停留在初步阶段。为此，我们重点关注本次比赛的“优质教育”议题，旨在帮助非洲学生提前体验中国优质教育，助推他们实现学业梦想。我们计划通过与各大机构、名校一起，通过邮寄方式，捐赠我们录制中英文双语课程，以邀请非洲的孩子们与我们一起学习、成长。\n正如队名”ENLIGHTEN”，我们会将自己的特长、能力发挥到极致，进而启发更多非洲孩子们，启发更多身边人关注非洲教育。",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/14/1563068270389.jpg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/14/1563068273907.jpg",
        ],
        teamMedia: [],
        teamPartner: [
          {
            userNameZh: "王梓骁",
            userNameEn: "Steven",
            school: "北京市第一七一中学",
            gender: "1",
            age: "18",
            tel: "18515210216",
            email: "1848237060@qq.com",
            parentName: "张蓬勃",
            parentTel: "13810685145",
          },
          {
            userNameZh: "袁若寒",
            userNameEn: "Jennifer",
            school: "北京市第一七一中学",
            gender: "0",
            age: "18",
            tel: "13810840356",
            email: "yrhyuanruohan@163.com",
            parentName: "张林林",
            parentTel: "13681356662",
          },
          {
            userNameZh: "周湛彬",
            userNameEn: "Andy",
            school: "北京市第一七一中学",
            gender: "1",
            age: "18",
            tel: "13910138323",
            email: "13910138323@163.com",
            parentName: "古玉平",
            parentTel: "13601053030",
          },
          {
            userNameZh: "李宇琪",
            userNameEn: "Eta",
            school: "北京八中",
            gender: "0",
            age: 17,
            tel: "13720061989",
            parentName: "张燕",
            parentTel: "13911917285",
            email: "750269456@qq.com",
          },
          {
            userNameZh: "崔谱化",
            userNameEn: "Lydia",
            school: "北京市第一七一中学",
            gender: "0",
            age: "17",
            tel: "18612179092",
            parentName: "张婉莹",
            parentTel: "13901376797",
            email: "1403243906@qq.com",
          },
        ],
      },
    },
    {
      id: 238,
      name: "SDLP",
      score: 83.4,
      index: 8,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/07/16/1563268350971.png",
        teamDes:
          "大家好，我们是SDLP（Soul.Dream.Life.Power）团队。我们团队由来自中国北京的四名高中生组成。我们从相遇、相识到相知，思想与灵魂的触碰，共同怀揣着为需要帮助的地方做力所能及解决贫苦和贫穷的梦想而相聚。我们通过大量的访谈、调研和资料查阅，聚焦了非洲面临的可饮用水健康的问题。在此，我们团队建议以募集形式，向非洲部分地区捐赠净化水装置设备，从源头上切入，中端组织协调，到终端有效解决，力争一定范围内减少因饮用污染水质而患各种疾病的问题发生。希望在我们的共同努力下，让生活在同一个地球上的非洲孩子也能喝上清洁、健康的水。同在地球一个家，生命一起欢笑，一起悦动！",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/16/1563268573054.jpg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/16/1563267651733.jpg",
        ],
        teamMedia: [],
        teamPartner: [
          {
            userNameZh: "李启月",
            userNameEn: "Anny",
            school: "北京市第十九中学",
            gender: "0",
            age: 17,
            tel: "15210118487",
            email: "1397918484@qq.com",
            parentName: "李烽",
            parentTel: "13901352982",
          },
          {
            userNameZh: "刘通伯",
            userNameEn: "Steven ",
            school: " 北京市第六十六中学",
            gender: "1",
            age: 16,
            tel: "13718930258",
            email: "2898026193@qq.com ",
            parentName: "法景涛 ",
            parentTel: "13671031571",
          },
          {
            userNameZh: "于悦",
            userNameEn: "Vivian",
            school: "北京市育才中学",
            gender: "0",
            age: 17,
            tel: "18611754784",
            email: "yuguoxiaoai@126.com ",
            parentName: "国淑宁 ",
            parentTel: "18911991622",
          },
          {
            userNameZh: "李盈",
            userNameEn: "Echo ",
            school: "Trinity College School  ",
            gender: "0",
            age: 17,
            tel: " 1880019866",
            parentName: "郑小萍 ",
            parentTel: "13511012976",
            email: "liying2629@163.com ",
          },
        ],
      },
    },
    {
      id: 239,
      name: "sHE 4 she",
      score: 82.5,
      index: 9,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/07/11/1562858468286.png",
        teamDes:
          'WE ARE "sHE 4 she"!\n我们团队是由5名在校初中生组成，我们都怀着一颗为遭受不平等待遇或者身处贫苦的人群发声并给予实际帮助的炽热的心。女性人群在度过生理期的时候会遭到同时身体上和心理上的“折磨”，而非洲津巴布韦部分地区的女性并没有条件使用安全卫生的生理期用品，导致他们的染病率和死亡率大大增加。我们便想通过捐助卫生巾来起到一个不仅对非洲女性的帮助，更是向社会上的好心人士进行号召，关注世界上的每一个角落。',
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/16/1563271528586.jpg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/16/1563273255603.jpg",
        ],
        teamPartner: [
          {
            userNameZh: "贾喆",
            userNameEn: "Coco",
            school: "北京理工大学附属中学",
            gender: "0",
            age: 14,
            tel: "18501126271",
            email: "coconutcake8@163.com",
            parentName: "郭利华",
            parentTel: "13699280829",
          },
          {
            userNameZh: "马恺艺",
            userNameEn: "Olivia",
            school: "北京市十一学校",
            gender: "0",
            age: 14,
            tel: "13520976980",
            email: "2968621920@qq.com",
            parentName: "罗琦",
            parentTel: "13521089007",
          },
          {
            userNameZh: "俞智扬",
            userNameEn: "Mike",
            school: "北京市十一学校",
            gender: "1",
            age: 14,
            tel: "18614022247",
            email: "3423497561@qq.com",
            parentName: "费丽雅",
            parentTel: "13301110387",
          },
          {
            userNameZh: "郭子奇",
            userNameEn: "Ziqi",
            school: "北京八中",
            gender: "1",
            age: 15,
            tel: "15101129880",
            parentName: "孟红玉",
            parentTel: "13671075778",
            email: "mmhhyy555@126.com",
          },
          {
            userNameZh: "魏胜新",
            userNameEn: "Shengxin",
            school: "北京市育英学校",
            gender: "1",
            age: 13,
            tel: "15201440525",
            parentName: "王莉",
            parentTel: "13651112106",
            email: "3059740040@qq.com",
          },
        ],
      },
    },
    {
      id: 242,
      name: "equal opportunity",
      score: 80.5,
      index: 10,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/07/16/1563271819894.png",
        teamDes:
          "2018年暑假，余雅婧前往非洲肯尼亚参加非洲女性割礼救援的研究项目。田野调查中采访到在非洲有无数青年女孩子要接受残忍的割礼手术，并被强迫放弃学业，结婚生子。在回到中国后她为一位马赛女孩Agnes筹集了大学四年学费，并举办了十一学校首届肯尼亚文化日，其中的压轴节目为号召大众关注女性割礼与平等教育的原创话剧。本组希望通过我们的作品，让世界上更多人关注女性割礼，号召大家施以援手帮助那些女孩子脱离困境。本组选择性别平等这一主题，望通过作品，真正帮助那些想要逃离割礼的女孩子，找到一个可持续的解决方案，帮助他们拒绝割礼带来的身心伤害，生活在一个健康而平等的环境下，有机会与男性平等地分享生活资源与教育资源。",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/16/1563289714005.jpeg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/16/1563289719030.jpeg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/16/1563289862389.jpeg",
        ],
        teamPartner: [
          {
            userNameZh: "余雅婧",
            userNameEn: "Teresa",
            school: "",
            gender: "",
            age: 17,
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "索斯琦",
            userNameEn: "Sophie",
            school: "",
            gender: "",
            age: 15,
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
          {
            userNameZh: "黄治华",
            userNameEn: "Andy",
            school: "",
            gender: "",
            age: 16,
            tel: "",
            email: "",
            parentName: "",
            parentTel: "",
          },
        ],
      },
    },

    // {
    // 	id: 233,
    // 	name: "星之所在",
    // 	score: 40.5,
    // 	index: 5,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/04/1562240409338.png","teamDes":"星星之火，可以燎原。\n我们是5位中学生，都是年轻的志愿者，从事志愿服务多年，我们如同天上的星星，终将放光发热。\n作为一支志愿服务团队，我们愿以志愿之爱，感动世界，我们坚信爱之花开放的地方，生命便能欣欣向荣。找寻自己的星星之火，灌注不竭的生命能量。\n我们在爱中成长，也希望用爱去温暖和照耀世界，公益是传递爱的星星之火，我们愿用一颗颗闪闪的爱心，汇聚成星火，照亮世界。\n让我们一起携手，让世界多一点爱，让“星辉”照耀非洲大地。\n","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/16/1563252248006.jpg","http://files.specialaedu.com/files/pbic2018/2019/07/16/1563271679297.jpg","http://files.specialaedu.com/files/pbic2018/2019/07/17/1563332442867.png"],"teamMedia":[],"teamPartner":[{"userNameZh":"李思衡","userNameEn":"KEVIN","school":"","gender":"","age":13,"tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"丛如焓","userNameEn":"Tiamo","school":"","gender":"","age":13,"tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"马赫阳","userNameEn":"Newstar","school":"","gender":"","age":13,"tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"朱羽墨","userNameEn":"Yvonne","school":"","gender":"","age":13,"tel":"","parentName":"","parentTel":"","email":""},{"userNameZh":"王姝凝","userNameEn":"Lucy","school":"","gender":"","age":"12","tel":"","parentName":"","parentTel":"","email":""}]}
    // },
    // {
    // 	id: 215,
    // 	name: "蓝天下的方舟",
    // 	score: 40.0,
    // 	index: 6,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/02/1562064223010.png","teamDes":"我们是“蓝天下的方舟”。我们关注受艾滋病影响的家庭的现状，在力所能及的范围内提供对患者后代的支持，呼吁社会的接纳，助力他们的发展和成长，带给他们一片灿烂的天空。","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/05/1562291443760.jpg"],"teamMedia":[],"teamPartner":[{"userNameZh":"李睿豪","userNameEn":"Daniel","school":"复旦大学附属中学","gender":"1","age":17,"tel":"15121055521","email":"challenge1908@163.com","parentName":"王健华","parentTel":"13916335632"},{"userNameZh":"林竞初","userNameEn":"Tony","school":"中国人民大学附属中学","gender":"1","age":17,"tel":"18519535788","email":"jingchulin@126.com","parentName":"崔玉清","parentTel":"18610890609"},{"userNameZh":"李清扬","userNameEn":"Quincy","school":"昆明市第一中学","gender":"1","age":17,"tel":"13529430564","email":"2572993461@qq.com","parentName":"杨芳","parentTel":"13518782298"},{"userNameZh":"季诗旖","userNameEn":"Suzy","school":"Moreau Catholic High School","gender":"0","age":19,"tel":"13906286398","parentName":"陈姝姝","parentTel":"13584734868","email":"suzy.shiyi.ji@gmail.com"}]}
    // },

    // {
    // 	id: 214,
    // 	name: "Youth4ever",
    // 	score: 37.9,
    // 	index: 11,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/06/28/1561689548814.png","teamDes":"来自首师大附中中美国际部准十一年级的优秀团队。\n四位成员各司其职，默契配合，不畏困难。\n我们，集美貌和智慧于一身。","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/06/28/1561689910160.jpeg"],"teamPartner":[{"userNameZh":"刘瑞凝","userNameEn":"Rayna","school":"首都师范大学附属中学","gender":"0","age":"16","tel":"18612280526","email":"liuruining2021@163.co m","parentName":"刘宇","parentTel":"13801077197"},{"userNameZh":"刘致柔","userNameEn":"Lynne","school":"首都师范大学附属中学","gender":"0","age":"16","tel":"15652721122","email":"liuzhirou2021@163.com","parentName":"赵璟","parentTel":"18601088046"},{"userNameZh":"唐雪莹","userNameEn":"Andrea","school":"首师大附中","gender":"0","age":"16","tel":"15601112051","email":"tangxueying2102@163.com","parentName":"唐伟","parentTel":"18610291973"},{"userNameZh":"叶佳骝","userNameEn":"Leo","school":"首都师大附中","gender":"1","age":"16","tel":"18801199027","email":"yejialiu2021@163.com","parentName":"刘京","parentTel":"13511022260"}]}
    // },

    // {
    // 	id: 228,
    // 	name: "ATCW creative group",
    // 	score: 36.8,
    // 	index: 13,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/15/1563195240847.png","teamDes":"我们是由4名中国学生组建的公益团队。利用涂敷胶体银的多孔过滤陶罐净化污染水，改善非洲摩洛哥地区的水质。希望通过多方面筹款购买涂银陶罐，捐助非洲摩洛哥地区，帮助人们喝上纯净的水，从而减少患病率，挽救生命，让他们拥有更加健康幸福的生活！","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/15/1563195432573.jpg","http://files.specialaedu.com/files/pbic2018/2019/07/16/1563277058138.jpg"],"teamMedia":[],"teamPartner":[{"userNameZh":"王芊烨","userNameEn":"Fiona","school":"北京师范大学附属中学","gender":"0","age":16,"tel":"18612861677","email":"791247422@qq.com","parentName":"马辉","parentTel":"18611805795"},{"userNameZh":"于宸飞","userNameEn":"Fairy","school":"北京市大兴区第七中学","gender":"0","age":"12","tel":"13522076095","email":"angel78129@126.com","parentName":"王巍","parentTel":"13522076095"},{"userNameZh":"喻博衍","userNameEn":"Michael","school":"北京市回民学校","gender":"1","age":15,"tel":"13910317280","email":"zfx@vip.sina.com","parentName":"张飞雪","parentTel":"13910317280"},{"userNameZh":"周中旭","userNameEn":"James","school":"首都师范大学附属苹果园中学","gender":"1","age":16,"tel":"13621089377","parentName":"张艳娜","parentTel":"13811204193","email":"1367894240@qq.com"}]}
    // },
    // {
    // 	id: 237,
    // 	name: "微课特瑞",
    // 	score: 36.2,
    // 	index: 14,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/16/1563270479080.png","teamDes":"  我们团队共6人，我们分工合作，致力于帮助非洲的小朋友懂得更多科学知识，提高动手能力。","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/16/1563269520339.jpg","http://files.specialaedu.com/files/pbic2018/2019/07/17/1563331391144.jpg"],"teamMedia":[],"teamPartner":[{"userNameZh":"王雨润","userNameEn":"Anna","school":"北京四中","gender":"0","age":15,"tel":"1560133868","email":"986801777@qq.com","parentName":"单静丹","parentTel":"18611239823"},{"userNameZh":"姜紫涵","userNameEn":"Andy","school":"北京四中","gender":"0","age":14,"tel":"15510286905","email":"jiangzihan0626@126.com","parentName":"姜玉涛","parentTel":"15600667118"},{"userNameZh":"金田昊","userNameEn":"Nancy","school":"大兴一中","gender":"0","age":"15","tel":"13810438156","email":"2083987795@qq.com","parentName":"李洪影","parentTel":"13716635681"},{"userNameZh":"王子豪","userNameEn":"Moon","school":"国家教育行政学院附属实验学校","gender":"1","age":14,"tel":"18800137137","parentName":"姚红颖","parentTel":"13681278858","email":"1072858658 @qq.com"},{"userNameZh":"张梓鑫","userNameEn":"Siegfried","school":"国家教育行政学院附属实验学校","gender":"1","age":14,"tel":"13522121231","parentName":"张春龙","parentTel":"13671297848","email":"942361332@qq.com"},{"userNameZh":"王佳一","userNameEn":"Edith","school":"北京市大兴区采育中学","gender":"0","age":14,"tel":"15910695480","parentName":"吕雪莲","parentTel":"15901390749","email":"3078007178@qq.com"}]}
    // },
    // {
    // 	id: 234,
    // 	name: "精之光",
    // 	score: 36.2,
    // 	index: 14,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/16/1563263945003.png","teamDes":"我们的团队名称为The light of the essential baml中文为精之光。\n精是取自风油精的精字，以突出我们的项目主题，同时，光可以温暖人们，我们的爱心也像光一样，可以温暖非洲人民的心灵\n我们团队中包括三名中学生。我们虽然年龄不大，到我们希望，我们可以用我们的爱心来帮助非洲的人们。\n我们将要携手您为非洲捐助相当数量的风油精，解决他们的燃眉之急。\n据网络数据统计，每30秒就有一个非洲儿童死于疟疾\n我们希望，您可以和我们携手一起，拯救非洲的孩子们，让他们过上，幸福快乐的日子.我们相信，我们一定能做好这项工作，为非洲人民带去大家的爱心，让他们感受到人世的美好。","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/16/1563263586470.jpg","http://files.specialaedu.com/files/pbic2018/2019/07/16/1563264390444.jpg","http://files.specialaedu.com/files/pbic2018/2019/07/16/1563264399132.jpg","http://files.specialaedu.com/files/pbic2018/2019/07/16/1563264404458.jpg","http://files.specialaedu.com/files/pbic2018/2019/07/16/1563264409471.jpg"],"teamPartner":[{"userNameZh":"刘旭辉","userNameEn":"Ricky","school":"牛栏山一中实验学校","gender":"1","age":"14","tel":"13241009480","email":"15601346812@163.com","parentName":"胡广英","parentTel":"15910325460"},{"userNameZh":"刘旭辉","userNameEn":"Ricky","school":"牛栏山一中实验学校","gender":"1","age":"14","tel":"13241009480","email":"15601346182@163.com","parentName":"胡广英","parentTel":"15910325460"},{"userNameZh":"秦宇非","userNameEn":"ROnson","school":"牛栏山一中实验学校","gender":"1","age":"14","tel":"13146301022","email":"zhouxueduan2006@126.com","parentName":"周雪娜","parentTel":"13426117827"},{"userNameZh":"王睿涵","userNameEn":"Suzy","school":"北京大学附属中学石景山学校","gender":"0","age":"13","tel":"13681241860","email":"383391786@qq.com","parentName":"王亚梅","parentTel":"15811309908"}]}
    // },
    // {
    // 	id: 252,
    // 	name: "EveryPad",
    // 	score: 35.8,
    // 	index: 16,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/22/1563763638966.png","teamDes":"EveryPad团队，赞！","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/22/1563762612497.png","http://files.specialaedu.com/files/pbic2018/2019/07/22/1563762615601.png"],"teamPartner":[{"userNameZh":"张之行","userNameEn":"张之行","school":"","gender":"","age":17,"tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"倪雪彤","userNameEn":"倪雪彤","school":"","gender":"","age":17,"tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"赵中泽","userNameEn":"赵中泽","school":"","gender":"","age":17,"tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"谢昊朋","userNameEn":"谢昊朋","school":"","gender":"","age":17,"tel":"","parentName":"","parentTel":"","email":""}]}
    // },

    // {
    // 	id: 224,
    // 	name: "EveryPad",
    // 	score: 35.1,
    // 	index: 18,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/15/1563190725688.png","teamDes":"四名队员都非常热心公益，经常参加一些支教、敬老等活动。我们将用自己的优势和知识，发动全校师生利用微信、微博、一起捐等平台，宣传公益项目，让更多的人了解非洲、关注并奉献爱心。活动收入所得将全部捐赠给太阳能教育系统项目，为非洲的教育做一些微薄的贡献，利用太阳能发电技术供电，促进现代化教学发展以及村民卫生事业提高。我们的队名Tryfighters-奋斗者，为优质非洲教育而奋斗，如果您能奉献一片爱心，或者将信息转发给您的朋友，我们将非常感谢，我们将创造更多的奇迹…","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/15/1563191178960.jpeg"],"teamMedia":[],"teamPartner":[{"userNameZh":"张子梁","userNameEn":"Peter","school":"","gender":"","age":"14","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"张瑞佳","userNameEn":"Wendy","school":"","gender":"","age":"15","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"李宇庭","userNameEn":"Jack","school":"","gender":"","age":"16","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"卢怡静","userNameEn":"Ciara","school":"","gender":"","age":"15","tel":"","email":"","parentName":"","parentTel":""}]}
    // },
    // {
    // 	id: 235,
    // 	name: "Dream Team",
    // 	score: 33.8,
    // 	index: 19,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/15/1563196329079.png","teamDes":"Our team will plan and create a project which solves the issue of hunger in specific areas of Kenya.","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/16/1563263797563.jpg"],"teamPartner":[{"userNameZh":"侯建伊","userNameEn":"Jacky","school":"","gender":"","age":16,"tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"周正阳","userNameEn":"Jack","school":"","gender":"","age":15,"tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"侯慧竺","userNameEn":"Alice","school":"","gender":"","age":17,"tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"姜欣雨","userNameEn":"Catherine","school":"","gender":"","age":17,"tel":"","parentName":"","parentTel":"","email":""},{"userNameZh":"郑诺彬","userNameEn":"Britney","school":"","gender":"","age":17,"tel":"","parentName":"","parentTel":"","email":""}]}
    // },
    // {
    // 	id: 227,
    // 	name: "EWBF",
    // 	score: 33.6,
    // 	index: 20,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/15/1563192073636.png","teamDes":"我们，一群因热爱与奉献而相聚的队伍，致力于共同的目标：支援非洲。听闻远在千里之外的非洲同胞身处艰难贫乏，我们心中默默祈祷：Everything will be fine.我们的心由着非洲同胞的一举一动而牵动。如此，我们——EWBF应运而生，热忱期望着我们可以将手中星星之火燃烧到非洲大陆。或许，看似幼弱的我们可以竭尽绵薄之力，从每一件关乎生活的小事做起，使非洲由“沙漠”变“绿洲”。\n我们的团队由六名成员组成：分别是：杨婧妍，高三，来自大兴一中。张弈涵，高三，来自大兴一中。王玥，高三，来自大兴一中。宋桐语，高三，来自大兴一中。范司奇，高一，来自北京八中大兴分校。吕骁航，初一，来自亦庄实验学校。\n","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/15/1563194465344.jpg"],"teamPartner":[{"userNameZh":"杨婧妍","userNameEn":"Claire","school":"大兴一中","gender":"0","age":"18","tel":"18310914505","email":"1552164724@qq.com","parentName":"杨雪","parentTel":"13681416485"},{"userNameZh":"张弈涵","userNameEn":"Antonella","school":"大兴一中","gender":"0","age":"17","tel":"15011082877","email":"1007857106@qq.com","parentName":"李立红","parentTel":"13683686678"},{"userNameZh":"王玥","userNameEn":"Thinair","school":"大兴一中","gender":"0","age":"17","tel":"13641141562","email":"1067837652@qq.com","parentName":"王朝光","parentTel":"15910392465"},{"userNameZh":"宋桐语","userNameEn":"William","school":"大兴一中","gender":"1","age":"17","tel":"13269057790","parentName":"宋润彬","parentTel":"18201522066","email":"1129091393@qq.com"},{"userNameZh":"范司奇","userNameEn":"Bryce","school":"北京八中大兴分校","gender":"1","age":"17","tel":"13260058268","parentName":"杨倩","parentTel":"13641140287","email":"3037180895@qq.com"},{"userNameZh":"吕骁航","userNameEn":"Henry","school":"北京亦庄实验学校","gender":"1","age":"12","tel":"18611453753","parentName":"王守洁","parentTel":"18813001882","email":"13716210701@163.com"}]}
    // },
    // {
    // 	id: 211,
    // 	name: "L.E.A.F",
    // 	score: 33.0,
    // 	index: 21,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/06/12/1560308680247.png","teamDes":"大家好～我们是L.E.A.F team (Love Environment for Africa’s Future)我们伟大的目标是帮助非洲减少污染并预防疾病,通过我们的可降解塑料（烂水果为原料）来收集排泄物并用之于肥料,来实现目标\n队长：罗翊嘉\n万能！极高行动力！ 组织能力！主要负责琐事规划\n艺术总监：陈依闻 \n人美！声音甜！画功一流！ 主要负责产品美工\n营销总监：顾钰晨\n样样精通！技多不压身！主要负责产品行销\n技术总监*3：张浩政,史峻玮,竹中治\n长着理工科的脸,怀着理工科的心,有着理工科的灵魂,更拥有理工科的实力！专业知识找他们,包你样样一百分。主要负责产品研发及理论搏斗","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/06/12/1560309679970.jpeg"],"teamPartner":[{"userNameZh":"罗翊嘉","userNameEn":"I-CHIA LO","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"史峻玮","userNameEn":"Daniel Shi","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"张浩政","userNameEn":"HoChing Cheung","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"竹中治","userNameEn":"Osamu Takenaka","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"陈依闻","userNameEn":"Eve","school":"","gender":"","age":"16","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"顾钰晨","userNameEn":"Gu Yuchen","school":"","gender":"","age":"16","tel":"","email":"","parentName":"","parentTel":""}]}
    // },
    // {
    // 	id: 208,
    // 	name: "afri-uture",
    // 	score: 31.7,
    // 	index: 22,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/06/06/1559778695483.png","teamDes":".","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/06/06/1559779528393.jpeg"],"teamPartner":[{"userNameZh":"郑筑云","userNameEn":"Julianne Cheng","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"蒋仁俊","userNameEn":"JIANG，RENJUN","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"李天骏","userNameEn":"LI TIANJUN","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"刘静雅","userNameEn":"LIOU CHING-YA","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"马明浓","userNameEn":"Ming-Nung Natasha Maa","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""},{"userNameZh":"李倩芃","userNameEn":"LEE, CHIEN-PENG","school":"","gender":"","age":"17","tel":"","email":"","parentName":"","parentTel":""}]}
    // },
  ];
  let str = "";
  teamRankSecondaryArr.forEach((element) => {
    let item = element.info;
    let index = element.index;
    let imgStr = "";
    if (index < 4) {
      imgStr =
        '<div class="project_complete_project"><img src="img/project0' +
        index +
        '.png"/></div>';
    } else {
      imgStr =
        '<div class="project_complete_project">' +
        (index < 10 ? "0" + index : index) +
        "</div>";
    }
    // console.log(imgStr)
    str +=
      '<li class="swiper-slide">' +
      imgStr +
      '<div class="project_complete_underline"><div class="project_complete_img"><img src=' +
      item.teamPhoto[0] +
      '></div><div class="project_complete_right"><div class="project_complete_right_title">编号: ' +
      element.id +
      '</div><div class="project_complete_right_code">' +
      element.name +
      "</div></div></div></li>";
  });
  $(".project_complete_team").remove();
  var projectCompleteTeam;
  projectCompleteTeam = $(
    '<div class="project_complete_team">' +
      '<span class="hideLeft"></span>' +
      '<div class="project_complete_team_box">' +
      '<div class="project_complete_title">PBIC2019十强队伍</div>' +
      '<div class="project_complete_tab"><div class="project_complete_tab_box"><div class="project_complete_tab_btn active">中学组</div><div class="project_complete_tab_btn">小学组</div></div></div>' +
      // +'<div class="project_complete_title">已提交策划书队伍</div>'
      '<div class="swiper-container project_complete_list swiper-container-vertical"><div class="swiper-wrapper">' +
      str +
      "</div></div></div>" +
      "</div>"
  );
  $("body").append(projectCompleteTeam);
  // console.log(Swiper)
  projectSwiper = new Swiper(".project_complete_list", {
    direction: "vertical", //纵向分布
    slidesPerView: 5, //最多5个
    loop: true, //无限滚动
    // autoplay : 1000,
    autoplay: {
      delay: 3000,
      stopOnLastSlide: false,
      disableOnInteraction: false,
    },
  });
  console.log(projectSwiper);

  // request("CFVote","showMeVoteList",{page:0,size:50,type:1},function(data) {
  // 	console.log(data)
  // 	if(data.code == 0){
  // 		let str = ''
  // 		data.rank.forEach((element,index) => {
  // 			let item = JSON.parse(element.info)
  // 			let imgStr = ''
  // 			if(index < 3){
  // 				imgStr = '<div class="project_complete_project"><img src="img/project0'+(index+1)+'.png"/></div>'
  // 			}else{
  // 				imgStr = '<div class="project_complete_project">'+((index+1)<10?('0'+(index+1)):(index+1))+'</div>'
  // 			}
  // 			// console.log(imgStr)
  // 			str += '<li class="swiper-slide">'+imgStr+'<div class="project_complete_underline"><div class="project_complete_img"><img src='+item.teamPhoto[0]+'></div><div class="project_complete_right"><div class="project_complete_right_title">编号: '+ element.id+'</div><div class="project_complete_right_code">'+element.name +'</div></div></div></li>'
  // 		});
  // 		$('.project_complete_team').remove()
  // 		var projectCompleteTeam
  // 		if(data.rank.length > 6){
  // 			projectCompleteTeam = $('<div class="project_complete_team">'
  // 				+'<span class="hideLeft"></span>'
  // 				+'<div class="project_complete_team_box">'
  // 				+'<div class="project_complete_title">PBIC2019十强队伍</div>'
  // 				// +'<div class="project_complete_title">已提交策划书队伍</div>'
  // 				+'<div class="swiper-container project_complete_list"><div class="swiper-wrapper">'
  // 					+str
  // 				+'</div></div></div>'
  // 			+'</div>');
  // 			$("body").append(projectCompleteTeam);
  // 			// console.log(Swiper)
  // 			var swiper = new Swiper('.project_complete_list', {
  // 				direction: 'vertical',//纵向分布
  // 				slidesPerView: 5,//最多5个
  // 				loop: true,//无限滚动
  // 				// autoplay : 1000,
  // 				autoplay: {
  // 					delay: 3000,
  // 					stopOnLastSlide: false,
  // 					disableOnInteraction: false,
  // 				},
  // 			});
  // 		}else{
  // 			projectCompleteTeam = $('<div class="project_complete_team">'
  // 				+'<span class="hideLeft"></span>'
  // 				+'<div class="project_complete_team_box">'
  // 					+'<div class="project_complete_title">PBIC2019十强队伍</div>'
  // 					+'<ul class="project_complete_list">'
  // 						+str
  // 					+'</ul>'
  // 				+'</div></div>');
  // 			$("body").append(projectCompleteTeam);
  // 		}
  // 		$('body').on('click', ".hideLeft", function(){
  // 			var hasY=$(this).hasClass("addYate");
  // 			if(hasY){

  // 				projectCompleteTeam.animate({
  // 					width:256
  // 				},"fast");
  // 				$(".project_complete_team_box").animate({
  // 					width:256
  // 				},"fast",function(){
  // 					$(".project_complete_list").show();
  // 					$(".project_complete_title").show();
  // 					$(".hideLeft").removeClass("addYate");
  // 					var swiper = new Swiper('.project_complete_list', {
  // 						direction: 'vertical',//纵向分布
  // 						slidesPerView: 5,//最多5个
  // 						loop: true,//无限滚动
  // 						// autoplay : 1000,
  // 						// autoplay:true,
  // 						autoplay: {
  // 							delay: 5000,
  // 							stopOnLastSlide: false,
  // 							disableOnInteraction: false,
  // 						},
  // 					});
  // 				});
  // 			}else{
  // 				swiper.destroy(false);
  // 				projectCompleteTeam.animate({
  // 					width:27
  // 				},"fast");
  // 				// $(".project_complete_title").animate({
  // 				// 	width:10
  // 				// },"fast");
  // 				$(".project_complete_team_box").animate({
  // 					width:10
  // 				},"fast",function(){
  // 					$(".project_complete_list").hide();
  // 					$(".project_complete_title").hide();
  // 					$(".hideLeft").addClass("addYate");
  // 					// $(".project_complete_list").addClass("project_complete_list_nopadding");
  // 					// $(".project_complete_title").addClass("project_complete_title_hidden");
  // 				});

  // 			}
  // 		})
  // 		timeID = setTimeout(getVoteList,1000*60*60*1)
  // 	}
  // })
}

// 项目策划书中学队伍排名
function getPrimaryArrList() {
  let teamRankPrimaryArr = [
    {
      id: 243,
      name: "STAR",
      score: 34.0,
      index: 1,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/07/03/1562122290497.png",
        teamDes:
          "%20%20%20%20%20%20%20%20%E6%88%91%E4%BB%AC%E6%9D%A5%E8%87%AA%E5%8C%97%E5%A4%A7%E9%99%84%E5%B0%8F%E7%9F%B3%E6%99%AF%E5%B1%B1%E5%AD%A6%E6%A0%A1%EF%BC%8C%E6%88%91%E4%BB%AC%E9%83%BD%E6%9C%89%E4%B8%80%E4%B8%AA%E5%85%B1%E5%90%8C%E7%9A%84%E7%88%B1%E5%A5%BD%E2%80%94%E2%80%94%E5%9B%B4%E6%A3%8B%E3%80%82%E5%9B%B4%E6%A3%8B%EF%BC%8C%E5%8F%AF%E7%BF%BB%E8%AF%91%E6%88%90Weiqi%EF%BC%8C%E4%B9%9F%E5%8F%AF%E4%BB%A5%E7%BF%BB%E8%AF%91%E6%88%90Go%EF%BC%8C%E8%BF%98%E5%8F%AB%E4%BD%9C%E6%98%9F%E9%98%B5%EF%BC%8C%E5%8D%B3Star%20Array%E3%80%82%E5%9B%B4%E6%A3%8B%E6%98%AF%E4%B8%80%E7%A7%8D%E9%9B%86%E7%A7%91%E5%AD%A6%E3%80%81%E8%89%BA%E6%9C%AF%E5%92%8C%E7%AB%9E%E6%8A%80%E4%B8%89%E8%80%85%E4%B8%80%E4%BD%93%E7%9A%84%E5%9B%BD%E9%99%85%E6%96%87%E5%8C%96%E7%AB%9E%E6%8A%80%E6%B4%BB%E5%8A%A8%EF%BC%8C%E4%B9%9F%E8%A2%AB%E8%AA%89%E4%B8%BA%E2%80%9C%E5%A4%A7%E8%84%91%E4%BD%93%E6%93%8D%E2%80%9D%E3%80%82%E6%88%91%E4%BB%AC%E7%9A%84%E5%9B%A2%E9%98%9F%E5%90%8D%E5%AD%97%E6%98%AFSTAR%EF%BC%8C%E5%8F%96%E8%87%AA%E6%98%9F%E9%98%B5Star%20Array%E3%80%82%E6%88%91%E4%BB%AC%E5%BE%88%E5%BE%AE%E5%B0%8F%EF%BC%8C%E5%83%8F%E5%A4%A9%E4%B8%8A%E7%9A%84%E6%98%9F%E6%98%9F%E4%B8%80%E6%A0%B7%E3%80%82%E4%BD%86%E6%88%91%E4%BB%AC%E5%8F%AF%E4%BB%A5%E9%9B%86%E8%81%9A%E5%8A%9B%E9%87%8F%EF%BC%8C%E5%83%8F%E6%BB%A1%E5%A4%A9%E7%B9%81%E6%98%9F%E7%85%A7%E4%BA%AE%E5%A4%9C%E7%A9%BA%EF%BC%8C%E7%94%A8%E6%A3%8B%E5%AD%90%E5%B8%83%E6%BB%A1%E6%A3%8B%E7%9B%98%E3%80%82%E6%88%91%E4%BB%AC%E4%BA%BA%E5%B0%8F%E5%BF%97%E6%B0%94%E5%A4%A7%EF%BC%8C%E6%88%91%E4%BB%AC%E8%A6%81%E9%80%9A%E8%BF%87%E5%8A%AA%E5%8A%9B%E5%BD%B1%E5%93%8D%E6%9B%B4%E5%A4%9A%E7%9A%84%E4%BA%BA%EF%BC%8C%E8%AE%A9%E5%9B%B4%E6%A3%8B%E5%9F%B9%E8%AE%AD%E5%85%AC%E7%9B%8A%E8%AE%A1%E5%88%92%E7%82%B9%E4%BA%AE%E9%9D%9E%E6%B4%B2%E5%B0%8F%E6%9C%8B%E5%8F%8B%E7%9A%84%E4%BA%BA%E7%94%9F%E3%80%82",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/18/1563417545538.JPG",
          "http://files.specialaedu.com/files/pbic2018/2019/07/18/1563417584559.JPG",
          "http://files.specialaedu.com/files/pbic2018/2019/07/17/1563322958013.JPG",
        ],
        teamMedia: [],
        teamPartner: [
          {
            userNameZh: "窦允谦",
            userNameEn: "Dingding",
            school: "北大附小石景山学校",
            gender: "1",
            age: "8",
            tel: "13381358469",
            email: "276355806@qq.com",
            parentName: "李彦雪",
            parentTel: "13381358469",
          },
          {
            userNameZh: "杨博元",
            userNameEn: "Owen",
            school: "北大附小石景山学校",
            gender: "1",
            age: 8,
            tel: "18518051786",
            email: "13311076009@qq.com",
            parentName: "刘靖儒",
            parentTel: "18518051786",
          },
          {
            userNameZh: "杨钰熙",
            userNameEn: "Mary",
            school: "北大附小石景山学校",
            gender: "0",
            age: 10,
            tel: "18518051786",
            email: "16946999717",
            parentName: "杨志强",
            parentTel: "18518051786",
          },
          {
            userNameZh: "焦翔",
            userNameEn: "John",
            school: "北大附小石景山学校",
            gender: "1",
            age: 8,
            tel: "18618483817",
            parentName: "贺妍菲",
            parentTel: "18618483817",
            email: "58145441@qq.com",
          },
          {
            userNameZh: "张熙智",
            userNameEn: "McQueen",
            school: "北大附小石景山学校",
            gender: "1",
            age: 8,
            tel: "13911000613",
            parentName: "鲁烨",
            parentTel: "13911000613",
            email: "3430324@qq.com",
          },
        ],
      },
    },
    // {
    // 	id: 213,
    // 	name: "凤凰农场",
    // 	score: 30.6,
    // 	index: 2,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/06/23/1561293450972.png","teamDes":"同一片天空，共享未来","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/06/23/1561293846041.jpeg","http://files.specialaedu.com/files/pbic2018/2019/06/23/1561293852545.jpeg"],"teamPartner":[{"userNameZh":"李欣焰","userNameEn":"Lily","school":"海淀区台头小学","gender":"0","age":12,"tel":"150107","email":"1918211001@qq.com","parentName":"王雪梅","parentTel":"13661061667"},{"userNameZh":"张征宇","userNameEn":"Annie","school":"海淀区台头小学","gender":"0","age":"12","tel":"13718983935","email":"1918211001@qq.com","parentName":"张晶","parentTel":"13718983935"},{"userNameZh":"王思源","userNameEn":"Leo","school":"海淀区101中学","gender":"0","age":14,"tel":"15601012798","email":"1918211001@qq.com","parentName":"王雪峰","parentTel":"13810479580"}]}
    // },
    // {
    // 	id: 230,
    // 	name: "传递",
    // 	score: 30.0,
    // 	index: 3,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/16/1563241250960.png","teamDes":" 我们的团队名叫“传递”，由6位成员组成，我们都来自同一所小学“小汤山中心小学”。我们团队分工合理，各有所长，我们相互学习，共同进步。我们的口号是“团结凝聚力量、信心源自实力。”","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/16/1563244073765.jpg","http://files.specialaedu.com/files/pbic2018/2019/07/16/1563246054685.jpg"],"teamPartner":[{"userNameZh":"米文浩","userNameEn":"Jack","school":"小汤山中心小学","gender":"1","age":10,"tel":"13661351850","email":"1125198276@qq.com","parentName":"张海燕","parentTel":"13661351850"},{"userNameZh":"宋雨萱","userNameEn":"Jenny","school":"小汤山中心小学","gender":"0","age":9,"tel":"13621109381","email":"9683421@qq.com","parentName":"王莉","parentTel":"13621109381"},{"userNameZh":"郑铭宇","userNameEn":"Jaden  ","school":"小汤山中心小学","gender":"1","age":10,"tel":"13521902605","email":"375789042@qq.com","parentName":"耿春阳","parentTel":"13521902605"},{"userNameZh":"吕司宇","userNameEn":"Tom","school":"小汤山中心小学","gender":"1","age":10,"tel":"13691597019","parentName":"姚淼","parentTel":"13691597019","email":"31668248@qq.com"},{"userNameZh":"刘浩铭","userNameEn":"Mark","school":"小汤山中心小学","gender":"1","age":10,"tel":"18710213990","parentName":"赵晓利","parentTel":"18710213990","email":"dieche0223@qq.com"},{"userNameZh":"刘柠语","userNameEn":"Amy","school":"小汤山中心小学","gender":"0","age":9,"tel":"15201331058","parentName":"刘莉辉","parentTel":"15201331058","email":"547420741@qq.com "}]}
    // },
    {
      id: 221,
      name: "希望之光",
      score: 30.0,
      index: 2,
      info: {
        agreeBookurl:
          "http://files.specialaedu.com/files/2019/06/14/1560475325249.png",
        teamDes:
          "%E7%BD%97%E6%9B%BC%E7%BD%97%E5%85%B0%E6%9B%BE%E7%BB%8F%E8%AF%B4%E8%BF%87%E2%80%9C%E7%88%B1%E6%98%AF%E7%94%9F%E5%91%BD%E7%9A%84%E7%81%AB%E7%84%B0%EF%BC%8C%E6%B2%A1%E6%9C%89%E5%AE%83%EF%BC%8C%E4%B8%80%E5%88%87%E5%8F%98%E6%88%90%E9%BB%91%E5%A4%9C%E2%80%9D%E3%80%82%E6%88%91%E4%BB%AC%E6%98%AF4%E5%90%8D9%E5%B2%81%E7%9A%84%E5%B0%8F%E5%AD%A6%E7%94%9F%EF%BC%8C%E6%88%91%E4%BB%AC%E5%9C%A8%E7%88%B1%E4%B8%AD%E6%88%90%E9%95%BF%EF%BC%8C%E4%B9%9F%E5%B8%8C%E6%9C%9B%E7%94%A8%E7%88%B1%E5%8E%BB%E6%B8%A9%E6%9A%96%E5%92%8C%E7%85%A7%E8%80%80%E4%B8%96%E7%95%8C%EF%BC%8C%E5%85%AC%E7%9B%8A%E6%98%AF%E4%BC%A0%E9%80%92%E7%88%B1%E7%9A%84%E6%98%9F%E6%98%9F%E4%B9%8B%E7%81%AB%EF%BC%8C%E5%B9%B6%E5%B0%86%E6%88%90%E7%87%8E%E5%8E%9F%E4%B9%8B%E7%88%B1%E7%85%A7%E4%BA%AE%E4%B8%96%E7%95%8C%E3%80%82%E6%88%91%E4%BB%AC%E5%92%8C%E9%9D%9E%E6%B4%B2%E7%9A%84%E5%B0%8F%E6%9C%8B%E5%8F%8B%E8%BF%9C%E9%9A%94%E9%87%8D%E6%B4%8B%EF%BC%8C%E4%BD%86%E6%88%91%E4%BB%AC%E7%9F%A5%E9%81%93%E4%BB%96%E4%BB%AC%E5%92%8C%E6%88%91%E4%BB%AC%E4%B8%80%E6%A0%B7%E6%9C%89%E7%9D%80%E7%BA%AF%E7%9C%9F%E7%9A%84%E5%BE%AE%E7%AC%91%EF%BC%8C%E6%9C%89%E7%9D%80%E5%90%8C%E6%A0%B7%E5%AF%B9%E7%88%B1%E3%80%81%E5%AF%B9%E5%81%A5%E5%BA%B7%E3%80%81%E5%AF%B9%E5%BF%AB%E4%B9%90%E3%80%81%E5%AF%B9%E7%9F%A5%E8%AF%86%E7%9A%84%E6%B8%B4%E6%9C%9B%EF%BC%8C%E6%88%91%E4%BB%AC%E4%B9%9F%E7%9F%A5%E9%81%93%E4%BB%96%E4%BB%AC%E4%B9%9F%E6%9C%89%E4%BA%9B%E8%BF%98%E8%BF%87%E7%9D%80%E8%89%B0%E8%8B%A6%E7%9A%84%E7%94%9F%E6%B4%BB%EF%BC%8C%E7%BC%BA%E5%B0%91%E5%9F%BA%E6%9C%AC%E7%9A%84%E6%95%99%E8%82%B2%E5%92%8C%E5%8C%BB%E7%96%97%EF%BC%8C%E6%89%80%E4%BB%A5%E6%88%91%E4%BB%AC%E7%9A%84%E7%9B%AE%E6%A0%87%E6%98%AF%E4%B8%BA%E9%9D%9E%E6%B4%B2%E5%B0%8F%E6%9C%8B%E5%8F%8B%E5%87%86%E5%A4%87%E4%B8%80%E4%B8%AA%E5%A4%9A%E5%8A%9F%E8%83%BD%E9%98%85%E8%AF%BB%E5%AE%A4%EF%BC%8C%E4%B8%8D%E4%BB%85%E5%8F%AF%E4%BB%A5%E8%AF%BB%E4%B9%A6%EF%BC%8C%E8%BF%98%E5%8F%AF%E4%BB%A5%E7%94%A8%E7%94%BB%E7%AC%94%E7%94%BB%E5%87%BA%E5%BF%83%E4%B8%AD%E7%9A%84%E6%95%85%E4%BA%8B%E5%92%8C%E4%B8%96%E7%95%8C%EF%BC%8C%E5%A2%9E%E9%95%BF%E8%A7%81%E8%AF%86%EF%BC%8C%E4%BA%86%E8%A7%A3%E4%B8%96%E7%95%8C%EF%BC%8C%E5%92%8C%E6%88%91%E4%BB%AC%E4%B8%80%E8%B5%B7%E6%84%9F%E5%8F%97%E7%9D%80%E4%B8%96%E7%95%8C%E7%9A%84%E4%B8%8D%E5%90%8C%E4%B8%8E%E4%B8%B0%E5%AF%8C%E3%80%82%E3%80%82%E3%80%82%E3%80%82%E3%80%82%E3%80%82%0A",
        teamPhoto: [
          "http://files.specialaedu.com/files/pbic2018/2019/07/15/1563155287439.jpg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/15/1563155287439.jpg",
          "http://files.specialaedu.com/files/pbic2018/2019/07/19/1563505302509.png",
        ],
        teamMedia: [],
        teamPartner: [
          {
            userNameZh: "郭竹涛",
            userNameEn: "Tina",
            school: "北京市光明小学",
            gender: "0",
            age: 9,
            tel: "13426368360",
            email: "zhihui225@sina.com",
            parentName: "母亲智慧",
            parentTel: "13426368360",
          },
          {
            userNameZh: "于卓然",
            userNameEn: "Linda",
            school: "北京市光明小学",
            gender: "0",
            age: 9,
            tel: "18810142280",
            email: "zhihui225@sina.com",
            parentName: "母亲李洋",
            parentTel: "18610075690",
          },
          {
            userNameZh: "王弘毅",
            userNameEn: "Jason",
            school: "北京市光明小学",
            gender: "1",
            age: 9,
            tel: "17778121053",
            email: "42422256@qq.com",
            parentName: "母亲康文静",
            parentTel: "17778121053",
          },
          {
            userNameZh: "史哲语",
            userNameEn: "Chris",
            school: "北京市光明小学",
            gender: "1",
            age: 9,
            tel: "18511600085",
            parentName: "母亲陈洁",
            parentTel: "13910000972",
            email: "105871212@qq.com",
          },
        ],
      },
    },
    // {
    // 	id: 232,
    // 	name: "L&W",
    // 	score: 28.5,
    // 	index: 5,
    // 	info: {"agreeBookurl":"http://files.specialaedu.com/files/2019/07/16/1563251745504.png","teamDes":"L-Life%26Love%E5%8D%B3%E4%BB%A3%E8%A1%A8%E7%94%9F%E5%91%BD%E5%92%8C%E7%88%B1%E2%80%94%E2%80%94%E6%84%8F%E4%B9%89%E5%8F%8C%E9%87%8D%EF%BC%8C%E7%AC%AC%E4%B8%80%E4%B8%AA%E6%84%8F%E6%80%9D%E6%98%AF%E2%80%9C%E4%BA%BA%E6%9C%80%E5%AE%9D%E8%B4%B5%E7%9A%84%E6%98%AF%E7%94%9F%E5%91%BD%EF%BC%8C%E7%94%9F%E5%91%BD%E5%AF%B9%E6%AF%8F%E4%B8%AA%E4%BA%BA%E5%8F%AA%E6%9C%89%E4%B8%80%E6%AC%A1%E2%80%A6%E2%80%A6%E2%80%9D%20%3B%E7%AC%AC%E4%BA%8C%E4%B8%AA%E6%84%8F%E6%80%9D%EF%BC%8C%E4%BB%A3%E8%A1%A8%E6%88%91%E4%BB%AC%E5%AF%B9%E5%85%AC%E7%9B%8A%E4%BA%8B%E4%B8%9A%E7%9A%84%E2%80%9C%E7%88%B1%E2%80%9D%EF%BC%8C%E5%AF%B9%E6%B4%A5%E5%B7%B4%E5%B8%83%E9%9F%A6%E4%BA%BA%E6%B0%91%E7%9A%84%E2%80%9C%E7%88%B1%E2%80%9D%E5%92%8C%E5%AF%B9%E7%94%9F%E5%91%BD%E7%9A%84%E7%83%AD%E7%88%B1%E3%80%82W-Water%E6%B0%B4%E2%80%94%E2%80%94%E6%B0%B4%EF%BC%8C%E4%B8%80%E5%88%87%E7%94%9F%E5%91%BD%E7%9A%84%E6%BA%90%E6%B3%89%EF%BC%8C%E4%BA%BA%E7%A6%BB%E4%B8%8D%E5%BC%80%E6%B0%B4%EF%BC%8C%E6%9C%89%E4%BA%86%E5%AE%83%E6%95%B4%E4%B8%AA%E4%B8%96%E7%95%8C%E6%89%8D%E8%83%BD%E7%94%9F%E7%94%9F%E4%B8%8D%E6%81%AF%EF%BC%8C%E6%B2%A1%E6%9C%89%E4%BA%86%E5%AE%83%EF%BC%8C%E4%BA%BA%E7%B1%BB%E4%B9%9F%E5%B0%86%E4%BC%9A%E9%9D%A2%E4%B8%B4%E7%81%AD%E7%BB%9D%E3%80%82","teamPhoto":["http://files.specialaedu.com/files/pbic2018/2019/07/15/1563160696565.jpeg"],"teamMedia":[],"teamPartner":[{"userNameZh":"张瑞泽","userNameEn":"Jerry","school":"北京市朝阳区垂杨柳中心小学杨柳校区五年级6班","gender":"1","age":11,"tel":"13910887505","email":"qinger071206@sina.com","parentName":"张鹏","parentTel":"13911050960"},{"userNameZh":"卢锦松","userNameEn":"Jack","school":"北京市建华实验学校","gender":"1","age":11,"tel":"18610330619","email":"3450598138@qq.com","parentName":"朱艳丽","parentTel":"13366286262"},{"userNameZh":"赵泽之","userNameEn":"Henry","school":"北京第二实验小学五年级九班","gender":"1","age":11,"tel":"13701294166","email":"henryzzc@126.com","parentName":"郑佳","parentTel":"13701294166"},{"userNameZh":"赵泽文","userNameEn":"Michael","school":"北京第二实验小学二年级六班","gender":"1","age":7,"tel":"13910744268","parentName":"郑佳","parentTel":"13801037276","email":"connie1949@126.com"},{"userNameZh":"李昊霖","userNameEn":"Tiger","school":"北京石景山区第二实验小学三年级一班","gender":"1","age":9,"tel":"16601151386","parentName":"张冰","parentTel":"16601151386","email":"50378956@qq.com"},{"userNameZh":"李政侨","userNameEn":"Cavin","school":"北京市第八中学京西附属小学","gender":"0","age":8,"tel":"13488818151","parentName":"马兆菊","parentTel":"13488818151","email":"389302192@qq.com"}]}
    // },
  ];
  let str = "";
  teamRankPrimaryArr.forEach((element) => {
    let item = element.info;
    let index = element.index;
    let imgStr = "";
    if (index < 4) {
      imgStr =
        '<div class="project_complete_project"><img src="img/project0' +
        index +
        '.png"/></div>';
    } else {
      imgStr =
        '<div class="project_complete_project">' +
        (index < 10 ? "0" + index : index) +
        "</div>";
    }
    // console.log(imgStr)
    str +=
      '<li class="swiper-slide">' +
      imgStr +
      '<div class="project_complete_underline"><div class="project_complete_img"><img src=' +
      item.teamPhoto[0] +
      '></div><div class="project_complete_right"><div class="project_complete_right_title">编号: ' +
      element.id +
      '</div><div class="project_complete_right_code">' +
      element.name +
      "</div></div></div></li>";
  });
  $(".project_complete_team").remove();
  var projectCompleteTeam;
  projectCompleteTeam = $(
    '<div class="project_complete_team">' +
      '<span class="hideLeft"></span>' +
      '<div class="project_complete_team_box">' +
      '<div class="project_complete_title">PBIC2019十强队伍</div>' +
      '<div class="project_complete_tab"><div class="project_complete_tab_box"><div class="project_complete_tab_btn">中学组</div><div class="project_complete_tab_btn active">小学组</div></div></div>' +
      // +'<div class="project_complete_title">已提交策划书队伍</div>'
      '<div class="swiper-container project_complete_list swiper-container-vertical"><div class="swiper-wrapper">' +
      str +
      "</div></div></div>" +
      "</div>"
  );
  $("body").append(projectCompleteTeam);
  // console.log(Swiper)
  // projectSwiper = new Swiper('.project_complete_list', {
  // 	direction: 'vertical',//纵向分布
  // 	slidesPerView: 5,//最多5个
  // 	loop: true,//无限滚动
  // 	// autoplay : 1000,
  // 	autoplay: {
  // 		delay: 3000,
  // 		stopOnLastSlide: false,
  // 		disableOnInteraction: false,
  // 	},
  // });
  // console.log(projectSwiper)

  // request("CFVote","showMeVoteList",{page:0,size:50,type:1},function(data) {
  // 	console.log(data)
  // 	if(data.code == 0){
  // 		let str = ''
  // 		data.rank.forEach((element,index) => {
  // 			let item = JSON.parse(element.info)
  // 			let imgStr = ''
  // 			if(index < 3){
  // 				imgStr = '<div class="project_complete_project"><img src="img/project0'+(index+1)+'.png"/></div>'
  // 			}else{
  // 				imgStr = '<div class="project_complete_project">'+((index+1)<10?('0'+(index+1)):(index+1))+'</div>'
  // 			}
  // 			// console.log(imgStr)
  // 			str += '<li class="swiper-slide">'+imgStr+'<div class="project_complete_underline"><div class="project_complete_img"><img src='+item.teamPhoto[0]+'></div><div class="project_complete_right"><div class="project_complete_right_title">编号: '+ element.id+'</div><div class="project_complete_right_code">'+element.name +'</div></div></div></li>'
  // 		});
  // 		$('.project_complete_team').remove()
  // 		var projectCompleteTeam
  // 		if(data.rank.length > 6){
  // 			projectCompleteTeam = $('<div class="project_complete_team">'
  // 				+'<span class="hideLeft"></span>'
  // 				+'<div class="project_complete_team_box">'
  // 				+'<div class="project_complete_title">策划案排名</div>'
  // 				// +'<div class="project_complete_title">已提交策划书队伍</div>'
  // 				+'<div class="swiper-container project_complete_list"><div class="swiper-wrapper">'
  // 					+str
  // 				+'</div></div></div>'
  // 			+'</div>');
  // 			$("body").append(projectCompleteTeam);
  // 			// console.log(Swiper)
  // 			var swiper = new Swiper('.project_complete_list', {
  // 				direction: 'vertical',//纵向分布
  // 				slidesPerView: 5,//最多5个
  // 				loop: true,//无限滚动
  // 				// autoplay : 1000,
  // 				autoplay: {
  // 					delay: 3000,
  // 					stopOnLastSlide: false,
  // 					disableOnInteraction: false,
  // 				},
  // 			});
  // 		}else{
  // 			projectCompleteTeam = $('<div class="project_complete_team">'
  // 				+'<span class="hideLeft"></span>'
  // 				+'<div class="project_complete_team_box">'
  // 					+'<div class="project_complete_title">策划案排名</div>'
  // 					+'<ul class="project_complete_list">'
  // 						+str
  // 					+'</ul>'
  // 				+'</div></div>');
  // 			$("body").append(projectCompleteTeam);
  // 		}
  // 		$('body').on('click', ".hideLeft", function(){
  // 			var hasY=$(this).hasClass("addYate");
  // 			if(hasY){

  // 				projectCompleteTeam.animate({
  // 					width:256
  // 				},"fast");
  // 				$(".project_complete_team_box").animate({
  // 					width:256
  // 				},"fast",function(){
  // 					$(".project_complete_list").show();
  // 					$(".project_complete_title").show();
  // 					$(".hideLeft").removeClass("addYate");
  // 					var swiper = new Swiper('.project_complete_list', {
  // 						direction: 'vertical',//纵向分布
  // 						slidesPerView: 5,//最多5个
  // 						loop: true,//无限滚动
  // 						// autoplay : 1000,
  // 						// autoplay:true,
  // 						autoplay: {
  // 							delay: 5000,
  // 							stopOnLastSlide: false,
  // 							disableOnInteraction: false,
  // 						},
  // 					});
  // 				});
  // 			}else{
  // 				swiper.destroy(false);
  // 				projectCompleteTeam.animate({
  // 					width:27
  // 				},"fast");
  // 				// $(".project_complete_title").animate({
  // 				// 	width:10
  // 				// },"fast");
  // 				$(".project_complete_team_box").animate({
  // 					width:10
  // 				},"fast",function(){
  // 					$(".project_complete_list").hide();
  // 					$(".project_complete_title").hide();
  // 					$(".hideLeft").addClass("addYate");
  // 					// $(".project_complete_list").addClass("project_complete_list_nopadding");
  // 					// $(".project_complete_title").addClass("project_complete_title_hidden");
  // 				});

  // 			}
  // 		})
  // 		timeID = setTimeout(getVoteList,1000*60*60*1)
  // 	}
  // })
}

$(function () {
  // var icoBox = $('<link rel="icon" href="img/favicon.ico" type="img/x-ico" />'); //head添加头部图标
  // $("head").append(icoBox);
  if (window.hasloadRight != undefined) {
    // console.log(userID)
    if (userID != null) {
      request("CFVote", "getMyTeamInfo", { userId: userID }, function (data) {
        if (data.code == 0) {
          if (data.status == 3) {
            applays = $(
              '<div class="IndexApplay">' +
                '<span class="hideRight"></span>' +
                '<div class="toApply">' +
                "<ul>" +
                // '<li class="noLi firstA onActive noLiLogin"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>' +
                // '<li class="noLi noLiLogin"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>' +
                // '<li class="noLi noLiLogin"><a class="tomy" id="toFillProject">我的项目策划书<b></b></a></li>' + 
                // '<li class="noLi noLiLogin"><a class="tomy" href="teamlist.html">参赛队伍<b></b></a></li>' +
                // '<li class="myCode">' +
                //   '<p class="code_p1">扫码关注公众号</p>' +
                //   '<p class="code_p2"></p>' +
                //   '<p class="code_p3"><img src="img/qrcode_new.png" /></p>' +
                //   '<p class="xs_file_load">辅导文件下载</p>' +
                // "</li>" +
                "</ul>" +
                "</div>" +
                "</div>"
            );
          } else {
            applays = $(
              '<div class="IndexApplay">' +
                '<span class="hideRight"></span>' +
                '<div class="toApply">' +
                "<ul>" +
                // '<li class="noLi firstA onActive"><a class="tomy" id="toMyapplay"><span>我要报名</span><b></b></a></li>' +
                // '<li class="noLi"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>' +
                // '<li class="noLi"><a class="tomy" href="teamlist.html">参赛队伍<b></b></a></li>' +
                // '<li class="myCode">' +
                // '<p class="code_p1">扫码关注公众号</p>' +
                // '<p class="code_p2"></p>' +
                // '<p class="code_p3"><img src="img/qrcode_new.png" /></p>' +
                // '<p class="xs_file_load">辅导文件下载</p>' +
                // "</li>" +
                "</ul>" +
                "</div>" +
                "</div>"
            );
          }
          $("body").append(applays);
        }
      });
    } else {
      applays = $(
        '<div class="IndexApplay">' +
          '<span class="hideRight"></span>' +
          '<div class="toApply">' +
          "<ul>" +
          '<li class="noLi firstA onActive"><a class="tomy"  href="http://match.pbic.com/login"><span>我要报名</span><b></b></a></li>' +
          // '<li class="noLi"><a class="tomy" id="toMyMessage">我的队伍<b></b></a></li>' +
          // '<li class="noLi"><a class="tomy" href="teamlist.html">参赛队伍<b></b></a></li>' + // TODO 暂时隐藏
          // '<li class="noLi"><a class="tomy" href="teamlist.html" style="color: #e11f36">2022 30强<b></b></a></li>' +
          '<li class="noLi"><a class="tomy xs_vedio_link" style="font-size:18px">PBIC2020合集<b></b></a></li>' +
          '<li class="myCode">' +
          '<p class="code_p1" style="font-size:14px">扫码关注公众号</p>' +
          '<p class="code_p2"></p>' +
          '<p class="code_p3"><img src="img/qrcode_new.png" /></p>' +
          '<p class="xs_file_load">辅导文件下载</p>' +
          "</li>" +
          "</ul>" +
          "</div>" +
          "</div>"
      );
      $("body").append(applays);
    }
    // 中学组项目策划书队伍排名
    // getSecondaryArrList()
    // 辅导文件下载
    var downLoadFile = $(
      '<div class="file_load_cover">' +
        '<div class="file_load_con">' +
        '<div class="file_load_close_box"><img src="img/file_load_close.png" class="file_load_close" alt="" /></div>' +
        '<div class="file_load_list">相关文件下载</div>' +
        '<ul class="file_list_ul">' +
        '<li>1、PBIC2023青少年国际公益创新挑战赛-参赛手册.pdf<a class="file_load_btn" href="source/PBIC2023青少年国际公益创新挑战赛-参赛手册.pdf" target="_blank">点击下载</a></li>' +
        // '<li>2、【项目策划书】参考模板-PBIC2023挑战赛.docx<a class="file_load_btn" href="source/【项目策划书】参考模板-PBIC2023挑战赛.docx" target="_blank">点击下载</a></li>' +
        // '<li>1、2021第五届PBIC青少年国际公益创新挑战赛-赛事指南.pdf<a class="file_load_btn" href="source/2021第五届PBIC青少年国际公益创新挑战赛-赛事指南.pdf" target="_blank">点击下载</a></li>' +
        // '<li>2、PBIC2021赛程赛制说明.pdf<a class="file_load_btn" href="source/PBIC2021赛程赛制说明.pdf" target="_blank">点击下载</a></li>' +
        // '<li>3、【项目策划书】参考模板-PBIC2021挑战赛.docx<a class="file_load_btn" href="source/【项目策划书】参考模板-PBIC2021挑战赛.docx" target="_blank">点击下载</a></li>' +
        // '<li>1、PBIC2020宣传册.pdf<a class="file_load_btn" href="source/PBIC2020宣传册.pdf" target="_blank">点击下载</a></li>' +
        // '<li>2、PBIC2020 Brochure.pdf<a class="file_load_btn" href="source/PBIC2020Brochure.pdf" target="_blank">点击下载</a></li>' +
        // '<li>3、PBIC2020分值说明.pdf<a class="file_load_btn" href="source/PBIC2020分值说明.pdf" target="_blank">点击下载</a></li>' +
        // '<li>4、PBIC2020（第四届）青少年公益创新国际挑战赛参赛策划书模板.docx<a class="file_load_btn" href="source/PBIC2020（第四届）青少年公益创新国际挑战赛参赛策划书模板.docx" target="_blank">点击下载</a></li>' +
        // + '<li>2、PBIC2019参赛手册.pdf<a class="file_load_btn" href="source/manual.pdf" target="_blank">点击下载</a></li>'
        // + '<li>3、2019（第三届）青少年公益创新国际挑战赛参赛策划书说明.doc<a class="file_load_btn" href="source/prospectus.zip" target="_blank">点击下载</a></li>'
        // + '<li>4、PBIC策划案样例：播种者SOWER策划书.pdf<a class="file_load_btn" href="source/sower.pdf" target="_blank">点击下载</a></li>'
        // + '<li>5、PBIC策划案样例：一支足球队策划书（中文版）.pdf<a class="file_load_btn" href="source/team-zh.pdf" target="_blank">点击下载</a></li>'
        // + '<li>6、PBIC策划案样例：一支足球队策划书（英文版）.pdf<a class="file_load_btn" href="source/team-en.pdf" target="_blank">点击下载</a></li>'
        "</ul>" +
        "</div>" +
        "</div>"
    );

    $("body").append(downLoadFile);

    // 辅导视频
    var videLink = $(
      '<div class="vedio_link_cover">' +
        '<div class="file_load_con">' +
        '<div class="file_load_close_box"><img src="img/file_load_close.png" class="vedio_link_close" alt="" /></div>' +
        '<div class="file_load_list">PBIC2020合集</div>' +
        '<div style="overflow-y: scroll; height: 397px;">' +
        '<div style="margin: 10px 33px 0px 33px; color: #c7c7c7; line-height: 50px; border-bottom: 1px solid #ebebeb;">总决赛视频</div>' +
          '<ul class="file_list_ul">' +
            '<li>总决赛直播视频<a class="file_load_btn" href="https://news.cgtn.com/news/2020-08-13/Live-Final-round-of-the-2020-Public-Benefit-Int-l-Challenge-for-Youth-SV85puREVW/index.html" target="_blank">查看详情</a></li>' +
          "</ul>" +
          '<div style="margin: 10px 33px 0px 33px; color: #c7c7c7; line-height: 50px; border-bottom: 1px solid #ebebeb;">历次辅导视频</div>' +
          '<ul class="file_list_ul">' +
            '<li>1、打开PBIC的正确方式<a class="file_load_btn" href="http://appt7x4wh8y7998.h5.xiaoeknow.com/v1/course/alive/l_5e97d351a31e1_z5OZVQlj?type=2&app_id=appt7X4Wh8Y7998&available=true&share_user_id=u_5e97d3999167d_DmT8gnT5tj&share_type=100&scene=%E5%88%86%E4%BA%AB&is_redirect=1&entry=2&entry_type=2001" target="_blank">查看详情</a></li>' +
            '<li>2、PBIC策划方案怎么写？<a class="file_load_btn" href="https://appqpvl86b45581.h5.xiaoeknow.com/v1/course/alive/l_5ea67b2715c64_NJTpbKfe?type=2&app_id=appqPvl86b45581&share_user_id=u_5ea6804e4170b_Lg1zcJH5nZ&share_type=5&scene=%E6%B5%B7%E6%8A%A5&is_redirect=1&func_type=1&access_entry=1" target="_blank">查看详情</a></li>' +
            '<li>3、非洲概况与PBIC优秀项目介绍<a class="file_load_btn" href="https://appt7x4wh8y7998.h5.xiaoeknow.com/v1/course/alive/l_5eb24d1309f38_3afHKr6V?type=2&app_id=appt7X4Wh8Y7998&share_user_id=u_5e97d3999167d_DmT8gnT5tj&share_type=5&scene=海报&is_redirect=1&func_type=1&access_entry=1" target="_blank">查看详情</a></li>' +
            '<li>4、如何理解国际视野中的公益？如何为了公益项目开展调研？<a class="file_load_btn" href="https://appt7x4wh8y7998.h5.xiaoeknow.com/v1/course/alive/l_5eb9fbae37817_E7Qz7y1B?type=2&app_id=appt7X4Wh8Y7998&share_user_id=u_5e97d3999167d_DmT8gnT5tj&share_type=5&scene=海报&is_redirect=1&func_type=1&access_entry=1" target="_blank">查看详情</a></li>' +
            '<li>5、学术能力与研究技能<a class="file_load_btn" href="https://appt7x4wh8y7998.h5.xiaoeknow.com/v1/course/alive/l_5ec0ff267fdc2_JUs6vf03?access_entry=1%253Fentry%253D2&app_id=appt7X4Wh8Y7998&entry_type=2008&func_type=1&is_redirect=1&scene=%E6%B5%B7%E6%8A%A5&share_type=5&share_user_id=u_5e97d3999167d_DmT8gnT5tj&type=2" target="_blank">查看详情</a></li>' +
            '<li>6、复赛策划案如何改进提升？什么是可行性项目？<a class="file_load_btn" href="https://appt7x4wh8y7998.h5.xiaoeknow.com/v1/course/alive/l_5ec0ff267fdc2_JUs6vf03?type=2&app_id=appt7X4Wh8Y7998&share_user_id=u_5e97d3999167d_DmT8gnT5tj&share_type=5&scene=%E6%B5%B7%E6%8A%A5&is_redirect=1&func_type=1&access_entry=1" target="_blank">查看详情</a></li>' +
            '<li>7、与UNICEF一起守护非洲儿童成长<a class="file_load_btn" href="https://appt7x4wh8y7998.h5.xiaoeknow.com/v1/course/alive/l_5ed886b7e13b1_hyybqxrT?type=2&app_id=appt7X4Wh8Y7998&is_redirect=1" target="_blank">查看详情</a></li>' +
            // '<li>8、复赛冲刺要点指引<a class="file_load_btn" href="" target="_blank">查看详情</a></li>' +
            // '<li>9、决赛/公益明星排位赛要点指引<a class="file_load_btn" href="" target="_blank">查看详情</a></li>' +
          "</ul>" +
        
        "</div>" +
        "</div>" +
        "</div>"
    );

    $("body").append(videLink);

    $("body").on("click", ".hideRight", function () {
      var hasY = $(this).hasClass("addYate");
      if (hasY) {
        applays.animate(
          {
            width: 160,
          },
          "fast"
        );
        $(".toApply").animate(
          {
            width: 160,
          },
          "fast",
          function () {
            $(".toApply .tomy").show();
            $(".myCode p").show();
            $(".hideRight").removeClass("addYate");
          }
        );
      } else {
        applays.animate(
          {
            width: 27,
          },
          "fast"
        );
        $(".toApply").animate(
          {
            width: 10,
          },
          "fast",
          function () {
            $(".hideRight").addClass("addYate");
            $(".toApply .tomy").hide();
            $(".myCode p").hide();
          }
        );
      }
    });
    if (userID != null) {
      getIndexInfo("appNo");
    }
    $("body").on("click", "#toMyapplay", function () {
      // showLoad("验证活动");
      if (userID != null) {
        getIndexInfo("app");
      } else {
        login(function () {
          getIndexInfo("app");
        });
      }
      // hideLoad();
      // request("CFVote", "checkJoinAndEditEndTime", {chekType: 0}, function (data) {
      //     hideLoad();
      //     if (data.code == 0) {
      //         if (userID != null) {
      //             getIndexInfo("app");
      //         } else {
      //             login(function () {
      //                 getIndexInfo("app");
      //             });
      //         }
      //     } else {
      //         showAlert("无法报名", data.msg);
      //         //location.href = "http://my.saclass.com/app/landingPBIC.html";
      //     }
      // });
    });
    $("body").on("click", "#toMyMessage", function () {
      if (userID != null) {
        getIndexInfo("message");
      } else {
        login(function () {
          getIndexInfo("message");
        });
      }
    });
    $("body").on("click", "#toFillProject", function () {
      if (userID != null) {
        getIndexInfo("fillProject");
      } else {
        login(function () {
          getIndexInfo("fillProject");
        });
      }
    });

    //		setTimeout(hideRights,5000);
    $(window).scroll(function () {
      var swH = $(".swiper-heard01").height();
      if ($(window).scrollTop() > swH) {
        $(".bannerMenu").css("position", "fixed");
        $(".bannerMenu").css("top", "0");
      } else {
        $(".bannerMenu").css("position", "relative");
      }
    });
  }
  if (window.noloadxn == undefined) {
    var box = $(
      '<div class="consult">' +
        "<ul>" +
        '<li class="conLi04" title="回到顶部"></li>' +
        "</ul>" +
        "</div>"
    ); //创建页面元素

    $("body").append(box); //在body中添加标签元素
    if (isMobile) {
      $(".conLi04").css({
        width: "30px",
        height: "35px",
        "background-size": "100%",
      });
    }
    //鼠标悬停效果
    $(window).scroll(function () {
      if ($(window).scrollTop() == 0) {
        $(".conLi04").css({
          top: "260px",
          opacity: 0,
        });
      } else {
        $(".conLi04").css({
          top: "150px",
          opacity: 1,
        });
      }
    });
    //点击回滚到顶部
    $(".conLi04").click(function () {
      $("html,body").animate(
        {
          scrollTop: 0,
        },
        600
      );
    });
    //点击登录也关闭按钮
    $(document).on("click", ".js_colose_icon", function () {
      var curHref = parent.location.href.split("?")[0];
      parent.location.href = curHref;
    });
  }
  // $('.xs_file_load').click(function(){
  // 	$(".file_load_cover").css('display','block');

  // })
  // $('.file_load_close').click(function(){
  // 	$(".file_load_cover").css('display','none');
  // })
  $("body").on("click", ".xs_file_load", function () {
    $(".file_load_cover").css("display", "block");
  });
  $("body").on("click", ".file_load_close", function () {
    $(".file_load_cover").css("display", "none");
  });

  $("body").on("click", ".xs_vedio_link", function () {
    $(".vedio_link_cover").css("display", "block");
  });
  $("body").on("click", ".vedio_link_close", function () {
    $(".vedio_link_cover").css("display", "none");
  });

  // 左侧排名隐藏显示
  $("body").on("click", ".hideLeft", function () {
    var hasY = $(this).hasClass("addYate");
    // console.log(hasY)
    if (hasY) {
      $(".project_complete_team").animate(
        {
          width: 256,
        },
        "fast"
      );
      $(".project_complete_team_box").animate(
        {
          width: 256,
        },
        "fast",
        function () {
          $(".project_complete_list").show();
          $(".project_complete_title").show();
          $(".project_complete_tab").show();
          $(".hideLeft").removeClass("addYate");
          console.log($($(".project_complete_tab_btn")[0]).hasClass("active"));
          let hasActive = $($(".project_complete_tab_btn")[0]).hasClass(
            "active"
          );
          if (hasActive) {
            projectSwiper = new Swiper(".project_complete_list", {
              direction: "vertical", //纵向分布
              slidesPerView: 5, //最多5个
              loop: true, //无限滚动
              // autoplay : 1000,
              // autoplay:true,
              autoplay: {
                delay: 5000,
                stopOnLastSlide: false,
                disableOnInteraction: false,
              },
            });
          }
        }
      );
    } else {
      // console.log(projectSwiper)
      if (projectSwiper) {
        projectSwiper.destroy(false);
      }
      // console.log(projectSwiper)
      $(".project_complete_team").animate(
        {
          width: 27,
        },
        "fast"
      );
      // $(".project_complete_title").animate({
      // 	width:10
      // },"fast");
      $(".project_complete_team_box").animate(
        {
          width: 10,
        },
        "fast",
        function () {
          $(".swiper-container project_complete_list").hide();
          $(".project_complete_title").hide();
          $(".project_complete_tab").hide();
          $(".hideLeft").addClass("addYate");
          // $(".project_complete_list swiper-container-vertical").addClass("project_complete_list swiper-container-vertical");
          // $(".project_complete_title").addClass("project_complete_title_hidden");
        }
      );
    }
  });
  // 左侧排名切换中学小学组
  $("body").on("click", ".project_complete_tab_btn", function () {
    var hasY = $(this).hasClass("active");
    var index = $(this).index();
    // console.log(index)
    // console.log(hasY)
    // console.log(projectSwiper)
    if (index == 0) {
      if (!hasY) {
        // getSecondaryArrList()
      }
    } else {
      if (!hasY) {
        getPrimaryArrList();
      }
    }
  });
});
