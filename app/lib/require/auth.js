module.exports = (function() {
	var self = {};
	
	var TiTouchId;
	var cache = require('require/cache');
	if( OS_IOS ) TiTouchId = require('ti.touchid');
	
	self.REASON_CANCEL				= -1;
	self.REASON_EASY 				= 0; 
	self.REASON_SECONDEPASSWORD 	= 1;
	self.REASON_PASSWORD 			= 2;
	self.REASON_TOUCHID 			= 3;
	
	self.checkPasscode = function( params ){
		function input_password(){
			var util = require('require/util');
			var info = globals.datas;
			if( info.easypass != null ){
				var easyInput = util.createEasyInput({
					type: 'change',
					callback: function( number ){
						params.callback({ success: true, reason: self.REASON_EASY, inputText: number });
					},
					cancel: function(){
						params.callback({ success: false, reason: self.REASON_CANCEL });
					}
				});
				easyInput.open();
			}
			else{
				function input(){
					var message = L('text_inputpass');
					var dialog = util.createInputDialog({
						title: params.title,
						message: message,
						passwordMask: true,
						buttonNames: [L('label_cancel'), L('label_ok')]
					});
					dialog.origin.addEventListener('click', function(e){
						var inputText = (OS_ANDROID)?dialog.androidField.value: e.text;
					  	if( e.index != e.source.cancel ){
					  		if( cache.data.password === inputText ){
								params.callback({ success: true, reason: self.REASON_PASSWORD, inputText: inputText });
							}
							else{
								var dialog2 = util.createDialog({
									message: L('text_wrongpass'),
									buttonNames: [L('label_close')]
								});
								dialog2.addEventListener('click', function(e){
									input();
								});
								dialog2.show();
							}
						}
						else{
							params.callback({ success: false, reason: self.REASON_CANCEL });
						}
					});
					dialog.origin.show();
				}
				input();
			}
		}
		
		if( OS_ANDROID ) input_password();
		else{
			if( cache.data.isTouchId != null ){
				var done = function(params2){
					Ti.App.removeEventListener('auth', done);
					if( params2.e.success ) params.callback({ success: true, reason: self.REASON_TOUCHID });
					else{
						if( params2.e.code == TiTouchId.ERROR_USER_CANCEL ) params.callback({ success: false, reason: self.REASON_CANCEL });
						else input_password();
					}
				};
				Ti.App.addEventListener('auth', done);
				
				TiTouchId.authenticate({
			        reason: L('text_pleasefingerprint'),
			        callback: function(e){ Ti.App.fireEvent('auth', { e: e }); }
			    });
			}
			else input_password();
		}
	};
	
	self.check = function( params ){
		function input_password(){
			var util = require('require/util');
			var info = globals.datas;
			if( info.easypass != null ){
				var easyInput = util.createEasyInput({
					type: 'confirm',
					callback: function( number ){
						params.callback({ success: true, reason: self.REASON_EASY, inputText: number });
					},
					cancel: function(){
						params.callback({ success: false, reason: self.REASON_CANCEL });
					}
				});
				easyInput.open();
			}
			else{
				function input(){
					var message = L('text_inputpass');
					var dialog = util.createInputDialog({
						title: params.title,
						message: message,
						passwordMask: true,
						buttonNames: [L('label_cancel'), L('label_ok')]
					});
					dialog.origin.addEventListener('click', function(e){
						var inputText = (OS_ANDROID)?dialog.androidField.value: e.text;
					  	if( e.index != e.source.cancel ){
					  		if( cache.data.password === inputText ){
								params.callback({ success: true, reason: self.REASON_PASSWORD, inputText: inputText });
							}
							else{
								var dialog2 = util.createDialog({
									message: L('text_wrongpass'),
									buttonNames: [L('label_close')]
								});
								dialog2.addEventListener('click', function(e){
									input();
								});
								dialog2.show();
							}
						}
						else{
							params.callback({ success: false, reason: self.REASON_CANCEL });
						}
					});
					dialog.origin.show();
				}
				input();
			}
		}
		
		if( OS_ANDROID ) input_password();
		else{
			if( cache.data.isTouchId != null ){
				var done = function(params2){
					Ti.App.removeEventListener('auth', done);
					if( params2.e.success ) params.callback({ success: true, reason: self.REASON_TOUCHID });
					else{
						if( params2.e.code == TiTouchId.ERROR_USER_CANCEL ) params.callback({ success: false, reason: self.REASON_CANCEL });
						else input_password();
					}
				};
				Ti.App.addEventListener('auth', done);
				
				TiTouchId.authenticate({
			        reason: L('text_pleasefingerprint'),
			        callback: function(e){ Ti.App.fireEvent('auth', { e: e }); }
			    });
			}
			else input_password();
		}
	};
	
	self.useTouchID = function(params){
		var done = function(params2){
			Ti.App.removeEventListener('usetouchid', done);
			if( params2.e.success ) params.callback({ success: true });
			else params.callback({ success: false });
		};
		Ti.App.addEventListener('usetouchid', done);
		
		TiTouchId.authenticate({
	        reason: L('text_pleasefingerprint'),
	        callback: function(e){ Ti.App.fireEvent('usetouchid', { e: e }); }
	    });
	};
	
    return self;
}());