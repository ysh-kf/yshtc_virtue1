/**
 * Created by Administrator on 2016/4/5.
 */

    var tplurl="http://p.yshfresh.com/api/tpl/";
    var yshurl="http://api.yshfresh.com/api/ysh/";
    var datas={};
    var  f2c={};//数据字典
    datas.cache={};//初始化
    datas.cache.tpls={};
    datas.cache.ds={};
    datas.cache.cmds={};
    datas.usecache=false;

    function postform(v){
        var indatas={};
        v.find("textarea").each(function(){
            console.log(this.name);
            indatas[this.name]=this.value;
        });
        getDataList(apiurl+"/api/ysh/"+v.attr("api"),indatas,function(rt){
            console.log(rt);
        });
        console.log(indatas);
    }
    function loadmain1(params){
        //检查缓存
        if('object' !=typeof params ){
            alert("params error");
            return;
        }

        var maindata={page:0,pnum:10};
        var tpl=datas.cache.tpls[params.action];
        var d=datas.cache.ds[params.action];

        //	$('#top').html(params.title);
        if(tpl!=null && d!=null ){
            renderMain(tpl,d);
            if(!datas.usecache){
                delete datas.cache.tpls[params.action];
                delete datas.cache.ds[params.action];
            }
            return;
        }
        if(!tpl){
            datas.cache.tpls[params.action]=0;
            getDataList(tplurl+params.action,params.upd,function(rdata){

    //		 if(rdata.tpl)
        //通过本地服务访问本地模板文件

                var url = window.location.href;
                console.log(url);
                    if(url.indexOf("index_local")!=-1){
                        htmlobj=$.ajax({url:"http://127.0.0.1:9001/s/"+params.action+".html",async:false});
                        datas.cache.tpls[params.action]=htmlobj.responseText;
                        datas.cache.cmds[params.action]=rdata.cmd;
                        loadmain1(params);

                    }else {
                        datas.cache.tpls[params.action] = rdata.tpl;
                        datas.cache.cmds[params.action] = rdata.cmd;
                        loadmain1(params);
                    }
            });
        } else if(!d){
            datas.cache.ds[params.action]=0;
            getDataList(yshurl+datas.cache.cmds[params.action],params.upd,function(rdata){
                if(rdata.aaData){
                    datas.cache.ds[params.action]=rdata;
                    loadmain1(params);
                }else{
                    console.error('654737 没有返回数据');
                }
            });
        }
    }

    function renderMain(tpl,data){
        $("#tpls").html(tpl);
		tpl=$("#main").html();
        laytpl(tpl).render(data,function(html){
            //		console.log(html);
            $("#main-page").html(html);
        });
    }

    $(document).ready(function() {
        init();
    });
    //初始化方法
    function init() {
        getDataList(yshurl+'get_f2c',{},function (d){
            for(var k in d.aaData){
                f2c[d.aaData[k]['field_name']]=d.aaData[k]['cname'];
            }
            console.log(f2c);
        });
        var homePageAction = "yshtc_virtue1";//首页
        var page = (window.location.hash).replace("#","");
//			如果只输入index.html不加#后缀的话，让其默认加载首页
        if(!page){
            page = homePageAction;
        }
        loadmain1({action:page,upd:{}});
    }
    /**
     * 页面ajax跳转，并塞入history对象 此方法绑定在标签上
     * @param action 跳转路径
     */
    var changePage = function (action) {
        loadmain1({action:action,upd:{}});
        history.pushState({action:action},document.title,"index.html#"+action);
    };
    /**
     * 兼听历史操作状态（比如前进后退操作）并加载对应的页面
     */
    window.addEventListener('popstate', function(e){
        if (history.state){
            var state = e.state;
            loadmain1({action:state.action,upd:{}});
        }
    }, false);


    // 获取数据方法
    var getDataList = function(url, param, fcs, is_check) {
//		showLoding();
        $.ajax({
            type: "post",
            url: url,
            async: false,

            data: param,
            success: function(ret) {

                if(typeof a === "function") {
                    a(ret);
                }


//				console.log(ret);
//				closeLoding()
                if(ret.log!=""){
                    console.info(ret.log);
                }
                if(ret.state!=0){
                    console.log('错误码：'+ret.state+'\n'+JSON.stringify(ret.msg));
                }
                var str = ret;
                if (Object.prototype.toString.call(str) === "[object String]") {
                    try {
                        ret = JSON.parse(ret)
                    } catch (e) {
//						toastr.error("无法解析服务器返回数据")
                        console.log("捕获异常为：  " + e)
                    }
                }

                //校验数据
                if (is_check == true) {
                    if (ret) {
                        if (ret.aaData && ret.aaData instanceof Array) {
                            fcs && fcs(ret);
                        } else {
//							toastr.error("数据异常")
                        }
                    } else {
//						toastr.error("服务器无响应，请稍后再试");
                    }
                } else {
                    fcs && fcs(ret);
                }
            },
            error: function() {
//				closeLoding()
//				toastr.error("服务器出错")
            }
        });
    };
