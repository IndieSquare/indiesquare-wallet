exports.run = function( params ){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	if( globals.weblink != null ){
		var webview = globals.weblink.webview;
		
		var new_path = params.path.replace(/^https?:\/\//, '');
		new_path = new_path.substring(0, new_path.indexOf('/'));
		
		var old_path = globals.weblink.path.replace(/^https?:\/\//, '');
		old_path = old_path.substring(0, old_path.indexOf('/'));
		
		if( params.path !== globals.weblink.path ){
			if( new_path !== old_path ) webview.fireEvent('setloadings');
			webview.setUrl(params.path);
			globals.weblink.path = params.path;
		}
		if( params.barColor != null ){
			globals.weblink.top_bar.backgroundColor = params.barColor;
			globals.weblink.bottom_bar.backgroundColor = params.barColor;
		}
		globals.weblink.window.show();
		return;
	}
	
	var height = _requires['util'].getDisplayHeight();
	
	var win = _requires['layer'].createWindow();
	var main_view = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: height - 65 });
	main_view.top = 25;
	win.origin.add(main_view);
	
	var top_bar = Ti.UI.createView({ backgroundColor: params.barColor || '#e54353', width: Ti.UI.FILL, height: 25 });
	top_bar.top = 0;
	win.origin.add(top_bar);
	
	var bottom_bar = Ti.UI.createView({ backgroundColor: params.barColor || '#e54353', width: Ti.UI.FILL, height: 40 });
	bottom_bar.bottom = 0;
	win.origin.add(bottom_bar);
	
	var path = params.path;
	if( params.signature != undefined ) path = Alloy.CFG.dashboard_uri + "signin?id=" + _requires['cache'].data.id + '&signature=' + params.signature + '&message=' + params.message + '&redirect=' + params.redirect_path;
	
	var webView;
	if( OS_IOS ){
		var tiagent = require('inc.indiesquare.customuseragent');
		tiagent.setIOSUserAgent('ios/IndieSquareWallet (iPhone; Mobile)');
		webView = Ti.UI.createWebView({width:Ti.UI.FILL,height:Ti.UI.FILL,url: path, borderRadius: 1});
	}
	else{
		var ticrosswalk = require('com.universalavenue.ticrosswalk');
		webView = ticrosswalk.createWebView( {width:Ti.UI.FILL, height:Ti.UI.FILL, url: path, userAgent:'android/IndieSquareWallet (Android; Mobile)'});
  	}
  	main_view.add(webView);
  	
	var evaltimer = null;
	function clearEvalTimer(){
		if( evaltimer != null ){
            clearInterval(evaltimer);
            evaltimer = null;
        }
	}
	
	var loading = null;
	webView.addEventListener('setloadings', function(e) {
		loading = _requires['util'].showLoading(main_view, { width: Ti.UI.FILL, height: Ti.UI.FILL});
	});
	webView.addEventListener('load', function(e) {
		if( loading != null ) loading.removeSelf();
		
		if( evaltimer == null ){
			evaltimer = setInterval(function () {
				function evaluateJS(result){
					if( result != null && result.length > 0 && result !== 'null' ){
		    			if( OS_ANDROID ){
		    				result = result.substr(1).substr(0, result.length - 2).replace(/\\/g, '');
		    			}
		    			if( result.match(/screen_to/) ){
		    				if( OS_ANDROID ) win.close();
		    				else win.hide();
		    			}
		    			globals._parseArguments(result, false);
		    		}
				}
				
				var code = 'if(weblink!=undefined&&typeof weblink=="function"){weblink();}';
				if(OS_ANDROID) webView.evalAsync(code, evaluateJS);
				else evaluateJS(webView.evalJS(code));
				
		    }, 500);
		}
		
		if( webView.canGoBack() ){
			button_back.enabled = true;
			button_back.opacity = 1.0;
		}
		else {
			button_back.enabled = false;
			button_back.opacity = 0.3;
		}
	});
	
	webView.addEventListener('error', function(e) {
		if( loading != null ) loading.removeSelf();
		clearEvalTimer();
		webView.hide();
		
		var text_notransactions = _requires['util'].makeLabel({
			text: L('text_webfailed'),
			font: { fontSize: 12 },
			color: '#2b4771'
		});
		main_view.add(text_notransactions);
	});
	
	var button_close = _requires['util'].makeImage({
		image : '/images/icon_weblink_close.png',
		width : 25,
		height : 25,
		right: 10
	});
	button_close.addEventListener('touchend', function() {
		var dialog = _requires['util'].createDialog({
			title : L('label_weblink_close'),
			message : L('text_weblink_close'),
			buttonNames : [L('label_weblink_close_no'), L('label_weblink_close_yes')]
		});
		dialog.addEventListener('click', function(e) {
			if (e.index != e.source.cancel) {
				if( loading != null ) loading.removeSelf();
				if( OS_ANDROID ) win.close();
		    	else win.hide();
			} 
		});
		dialog.show();
	});
	bottom_bar.add(button_close);
	
	var button_back = _requires['util'].makeImage({
		image : '/images/icon_weblink_back.png',
		width : 25,
		height : 25,
		left: 10
	});
	button_back.addEventListener('touchend', function() {
   		if( button_back.enabled ) webView.goBack();
	});
	bottom_bar.add(button_back);
	button_back.enabled = false;
	button_back.opacity = 0.3;
	
	var button_reload = _requires['util'].makeImage({
		image : '/images/icon_refresh.png',
		width : 22,
		height : 22,
		left: 50
	});
	button_reload.addEventListener('touchend', function() {
		webView.reload();
	});
	bottom_bar.add(button_reload);
	
	win.origin.addEventListener('close', function(e) {
		globals.weblink = null;
		if( loading != null ) loading.removeSelf();
		clearEvalTimer();
	});
	win.open();
	
	globals.weblink = {
		'window': win,
		'webview': webView,
		'main_view': main_view,
		'path': params.path,
		'top_bar': top_bar,
		'bottom_bar': bottom_bar
	};
	
	webView.fireEvent('setloadings');
	return win;
};