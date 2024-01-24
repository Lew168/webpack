export function httpRequest(obj, successfun, errFun){
    return new Promise((resolve, reject) => {
        var xmlHttp = null;
        //创建 XMLHttpRequest 对象，老版本的 Internet Explorer （IE5 和 IE6）使用 ActiveX 对象：xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
        if(window.XMLHttpRequest){
            //code for all new browsers()
            xmlHttp = new XMLHttpRequest;
        }else if(window.ActiveXObject){
            //code for IE5 and IE6
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        //判断是否支持请求
        if(xmlHttp == null){
            alert("浏览器不支持xmlHttp");
            return;
        }
        //请求方式， 转换为大写
        var httpMethod = (obj.method || "Get").toUpperCase();
        //数据类型
        var httpDataType = obj.dataType;
        //url
        var httpUrl = obj.url;
        //异步请求
        var async = true;
        //post请求时参数处理
        if(httpMethod == "POST"){
            //请求体中的参数 post请求参数格式为：param1=test&param2=test2
            if (!httpDataType) {
                var data = obj.data || {};
                var requestData = '';
                for(var key in data){
                    requestData = requestData + key + "=" + data[key] + "&";
                }
                if(requestData == ''){
                    requestData = '';
                }else{
                    requestData = requestData.substring(0, requestData.length - 1);
                }
            } else {
                requestData = obj.data
            }
        }
        //请求接口
        if(httpMethod == 'GET'){
            xmlHttp.open("GET", httpUrl, async);
            xmlHttp.withCredentials = true;
            xmlHttp.send(null);
        }else if(httpMethod == "POST"){
            xmlHttp.open("POST", httpUrl, async);
            xmlHttp.withCredentials = true;
            if (httpDataType) {
                xmlHttp.setRequestHeader("Content-Type", httpDataType);
            } else {
                xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }
            xmlHttp.send(requestData);
        }
        
        //onreadystatechange 是一个事件句柄。它的值 (state_Change) 是一个函数的名称，当 XMLHttpRequest 对象的状态发生改变时，会触发此函数。状态从 0 (uninitialized) 到 4 (complete) 进行变化。仅在状态为 4 时，我们才执行代码
        xmlHttp.onreadystatechange = function(){
            //complete
            if(xmlHttp.readyState == 4){
            	// 此处用了promise替代了请求成功后的回调
                if(xmlHttp.status == 200){
                    let res = JSON.parse(xmlHttp.responseText);
                    if (res && res.statusCode == 200) {
                        resolve(res);
                    } else {
                        reject(res);
                    }
                    //请求成功执行的回调函数
                    // successfun(JSON.parse(xmlHttp.responseText));
                } else {
                	//请求失败的回调函数
                  	errFun;
                }
            }
        }

    })
 
}