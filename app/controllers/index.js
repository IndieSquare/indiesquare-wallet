require('init');
require('icons');
var cache = globals.requires['cache'];

if( cache.load() ){
	var network = globals.requires['network'];
	var b = require('crypt/bcrypt');
	bcrypt = new b();
	Ti.App.addEventListener('resumed', function(e) {
		if( OS_IOS ) Ti.UI.iOS.setAppBadge(0);
		if( globals.isReorg ) globals.backgroundfetch();
		
		var url = null;
		if( OS_ANDROID && e.args != null ){
			url = e.args.url;
			if( !url.match(new RegExp('^' + Alloy.CFG.walletapp_uri)) ){
				url = 'indiewallet://' + e.args.url;
			}
		}
		globals._parseArguments(url);
	});
	if( OS_ANDROID ){
		Ti.Android.currentActivity.addEventListener('app:resume', function(e) {
	     	globals.lastUrl = null;
	    	Ti.App.fireEvent('resumed', { args: { url: e.data } });
	    });
	}
	if( OS_IOS ){
		Ti.App.iOS.addEventListener('continueactivity', function(e){
			if( e.activityType === 'NSUserActivityTypeBrowsingWeb' ){
				Ti.API.info('deepLinkURL:' + e.webpageURL);
				globals.lastUrl = null;
				globals._parseArguments(e.webpageURL);
			}
		});
	}
	
	Ti.API.fiat_values = [];
	globals.createTab = function(){
		var tabGroup = Ti.UI.createTabGroup({
		     navBarHidden: true
		});
		tabGroup.addEventListener('android:back',function(e) {
		    var curWin = Ti.UI.currentWindow;
		   	if(curWin != null){
		   	 	if(curWin != Ti.API.home_win){
		   	 		curWin.close();
		   	 	}
		   	}
		});
		var home_tab = Ti.UI.createTab({
		    window: Ti.API.home_win,
		    title:L('label_tab_home'),
		});
		
		tabGroup.addTab(home_tab);
		tabGroup.closeAllTab = function(){
			tabGroup.removeTab(home_tab);
			tabGroup.close();
		};
		tabGroup.open();
		globals.tabGroup = tabGroup;
		
		Ti.API.home_tab = home_tab;
	};
	
	if( cache.data.current_fee == null || cache.data.current_fee.length <= 0 ) cache.data.current_fee = "halfHourFee";
	if( cache.data.id != null ){
		if( cache.data.passphrase === Alloy.Globals.demopassphrase ){
			globals.DEMO = true;
		}
		if( OS_IOS ) globals.createTab();
		globals.windows['home'].run();
	}
	else globals.windows['signin'].run();
}
else{
	alert(L('text_access_deny') + '\nError:1000');
}