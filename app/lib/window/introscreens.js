module.exports = (function() {
	var _requires = globals.requires;
	var intro_scroll = null;
	
	function introscreens(){}
	
	introscreens.prototype.createView = function(){
		var self = this;
		var view_success = Ti.UI.createView({
			backgroundColor : '#79af7e',
			width : '100%',
			height : Ti.UI.FILL
		});
		
		var center_view_success = Ti.UI.createView({
			backgroundColor : 'transparent',
			width : '100%',
			height : 160
		});
		
		var topicon_success = _requires['util'].makeImage({
			image : '/images/check_image.png',
			top:30,
			width : 90,
			height : 90
		});
		
		var label1_success = _requires['util'].makeLabel({
			text :L('label_success_intro_1'),
			textAlign : 'center',
			color : 'white',
			width: '80%',
			font : {
				fontFamily : 'HelveticaNeue-Bold',
				fontSize : 20,
				fontWeight : 'bold'
			},
			top : 0
		});
		
		var label2_success = _requires['util'].makeLabel({
			text :L('label_success_intro_2'),
			textAlign : 'center',
			color : 'white',
			width: '80%',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 16,
				fontWeight : 'light'
			},
			top : 70
		});
		
		var nextButtonSuccess = Ti.UI.createButton({
			backgroundColor : '#48FFFFFF',
			title : L('text_success_intro_button'),
			color : 'white',
			width : '90%',
			height : 50,
			bottom : 20,
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 20,
				fontWeight : 'normal'
			}
		});
		
		nextButtonSuccess.addEventListener('click', function(e) {
			self.intro_scroll.scrollToView(view_passphrase);
		});
		
		view_success.add(topicon_success);
		center_view_success.add(label1_success);
		center_view_success.add(label2_success);
		view_success.add(nextButtonSuccess);
		
		view_success.add(center_view_success);
		
		var view_passphrase = Ti.UI.createView({
			backgroundColor : '#d58645',
			width : '100%',
			height : Ti.UI.FILL
		});
		
		var center_view_passphrase = Ti.UI.createView({
			backgroundColor : 'transparent',
			width : '100%',
			height : 285
		});
		
		var topicon_passphrase = _requires['util'].makeImage({
			image : '/images/pencil_image.png',
			top:40,
			width : 70,
			height : 70
		});
		
		var label1_passphrase = _requires['util'].makeLabel({
			text :L('label_pass_intro_1'),
			textAlign : 'center',
			color : 'white',
			width: '98%',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 14,
				fontWeight : 'light'
			},
			top : 15
		});
		
		var label2_passphrase = _requires['util'].makeLabel({
			text : _requires['cache'].data.passphrase,
			textAlign : 'center',
			color : 'white',
			width: '100%',
			height:'100',
			color:'white',
			backgroundColor : '#48FFFFFF',
			font : {
				fontFamily : 'HelveticaNeue-BoldItalic',
				fontSize : 18,
				fontWeight : 'bold italic'
			},
			top : 45
		});
		
		var label3_passphrase = _requires['util'].makeLabel({
			text : L('label_pass_intro_3'),
			textAlign : 'center',
			color : 'white',
			width: '80%',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 12,
				fontWeight : 'light'
			},
			top : 155
		});
		
		var label4_passphrase = _requires['util'].makeLabel({
			text : L('label_pass_intro_4'),
			textAlign : 'center',
			color : 'white',
			width: '80%',
			font : {
				fontFamily : 'HelveticaNeue-Bold',
				fontSize : 16,
				fontWeight : 'bold'
			},
			top : 210
		});
		
		var label5_passphrase = _requires['util'].makeLabel({
			text : L('label_pass_intro_5'),
			textAlign : 'center',
			color : 'white',
			width: '80%',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 12,
				fontWeight : 'light'
			},
			top : 240
		});
		
		var nextButtonPassphrase = Ti.UI.createButton({
			backgroundColor : '#48FFFFFF',
			title : L('text_pass_intro_button'),
			color : 'white',
			width : '90%',
			height : 50,
			bottom : 20,
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 20,
				fontWeight : 'normal'
			},
			opacity: 0.2
		});
		
		var t_slider = _requires['util'].createSlider({
			init: false,
			on: function(){
				nextButtonPassphrase.opacity = 1.0;
			},
			off: function(){
				nextButtonPassphrase.opacity = 0.2;
			}
		});
		
		var slider_group = _requires['util'].group({
			slider: t_slider.origin,
			text: _requires['util'].makeLabel({
				text: L('text_pass_intro_slider'),
				textAlign: 'left',
				color: 'white',
				font: {
					fontFamily: 'HelveticaNeue-Light',
					fontSize: 15,
					fontWeight: 'light'
				},
				left: 10
			})
		}, 'horizontal');
		slider_group.bottom = 80;
		
		nextButtonPassphrase.addEventListener('click', function(e) {
			if( t_slider.is ) self.intro_scroll.scrollToView(view_passcode);
		});
		
		view_passphrase.add(topicon_passphrase);
		center_view_passphrase.add(label1_passphrase);
		center_view_passphrase.add(label2_passphrase);
		center_view_passphrase.add(label3_passphrase);
		center_view_passphrase.add(label4_passphrase);
		center_view_passphrase.add(label5_passphrase);
		view_passphrase.add(slider_group);
		view_passphrase.add(nextButtonPassphrase);
		view_passphrase.add(center_view_passphrase);
		
		var view_passcode = Ti.UI.createView({
			backgroundColor : '#6a84bf',
			width : '100%',
			height : Ti.UI.FILL
		});
		
		var center_view_passcode = Ti.UI.createView({
			backgroundColor : 'transparent',
			width : '100%',
			height : 130
		});
		
		var topicon_passcode = _requires['util'].makeImage({
			image : '/images/lock_image.png',
			top:40,
			width : 70,
			height : 84
		});
		
		var label1_passcode = _requires['util'].makeLabel({
			text :L('label_passcode_intro_1'),
			textAlign : 'center',
			color : 'white',
			width: '80%',
			font : {
				fontFamily : 'HelveticaNeue-Bold',
				fontSize : 18,
				fontWeight : 'bold'
			},
			top : 10
		});
	
		var label2_passcode = _requires['util'].makeLabel({
			text : L('label_passcode_intro_2'),
			textAlign : 'center',
			color : 'white',
			width: '90%',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 16,
				fontWeight : 'light'
			},
			top : 40
		});
		
		var nextButtonPasscode = Ti.UI.createButton({
			backgroundColor : '#48FFFFFF',
			title : L('text_passcode_intro_button'),
			color : 'white',
			width : '90%',
			height : 50,
			bottom : 20,
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 20,
				fontWeight : 'normal'
			}
		});
		
		
		nextButtonPasscode.addEventListener('click', function(e) {
			regist = null;
			var easyInput = _requires['util'].createEasyInput({
				type : 'reconfirm',
				callback : function(number) {
					_requires['cache'].data.easypass = number;
					_requires['cache'].save();
					if (OS_IOS) {
						self.intro_scroll.scrollToView(view_touchid);
					}
					else{
						self.intro_scroll.scrollToView(view_complete);
					}
				},
				cancel : function() {
					
				}
			});
			easyInput.open();
		});
		
		view_passcode.add(topicon_passcode);
		center_view_passcode.add(label1_passcode);
		center_view_passcode.add(label2_passcode);
		view_passcode.add(nextButtonPasscode);
		view_passcode.add(center_view_passcode);
		
		var view_touchid = Ti.UI.createView({
			backgroundColor : '#9579af',
			width : '100%',
			height : Ti.UI.FILL
		});
		
		var topicon_touchid = _requires['util'].makeImage({
			image : '/images/thumb_image.png',
			top:40,
			width : 70,
			height : 70
		});
			
		var label1_touchid = _requires['util'].makeLabel({
			text :L('label_touchid_intro_1'),
			textAlign : 'center',
			color : 'white',
			width: '80%',
			top:'40%',
			font : {
				fontFamily : 'HelveticaNeue-Bold',
				fontSize : 18,
				fontWeight : 'bold'
			}
		});
			
		var nextButtonTouchid = Ti.UI.createButton({
			backgroundColor : '#48FFFFFF',
			title : L('text_touchid_intro_button'),
			color : 'white',
			width : '90%',
			height : 50,
			bottom : 90,
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 20,
				fontWeight : 'normal'
			}
		});
		
		var skipButtonTouchid = Ti.UI.createButton({
			backgroundColor : '#48FFFFFF',
			title : L('text_touchid_intro_button_skip'),
			color : 'white',
			width : '90%',
			height : 50,
			bottom : 20,
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 20,
				fontWeight : 'normal'
			}
		});
		
		view_touchid.add(topicon_touchid);
		view_touchid.add(label1_touchid);
		view_touchid.add(nextButtonTouchid);
		view_touchid.add(skipButtonTouchid);
		
		skipButtonTouchid.addEventListener('click', function(e) {
			self.intro_scroll.scrollToView(view_complete);
		});
		
		nextButtonTouchid.addEventListener('click', function(e) {
			_requires['auth'].useTouchID({
				callback : function(e) {
					if (e.success) {
					    setIsResumeFalse();
						_requires['cache'].data.isTouchId = true;
						_requires['cache'].save();
						regist = null;
						self.intro_scroll.scrollToView(view_complete);
					} else {
						var dialog = _requires['util'].createDialog({
							title : L('label_adminerror'),
							message : L('text_adminerror'),
							buttonNames : [L('label_close')]
						});
						dialog.addEventListener('click', function(e) {
							self.intro_scroll.scrollToView(view_complete);
								
						});
						dialog.show();
					}
				}
			});
		});
		
		var view_complete = Ti.UI.createView({
			backgroundColor : '#79af7e',
			width : '100%',
			height : Ti.UI.FILL
		});
		
		var center_view_complete = Ti.UI.createView({
			backgroundColor : 'transparent',
			width : '100%',
			height : Ti.UI.SIZE
		});
		
		var center_view_complete2 = Ti.UI.createView({
			backgroundColor : 'transparent',
			width : '100%',
			height : Ti.UI.SIZE,
			opacity: 0
		});
		
		var topicon_complete = _requires['util'].makeImage({
			image : '/images/trophy_image.png',
			top: 40,
			width : 70,
			height : 70
		});
		
		var sendReceiveIcon = _requires['util'].makeImage({
			image : '/images/sendAndReceiveTokens.png',
			top:90,
			left:10,
			width : 50,
			height : 65
		});
		
		var createTokenIcon = _requires['util'].makeImage({
			image : '/images/createTokenIcon.png',
			top:160,
			right:10,
			width : 70,
			height : 70
		});
		
		var tradeTokenIcon = _requires['util'].makeImage({
			image : '/images/tradeTokensIcon.png',
			top:220,
			left:5,
			width : 70,
			height : 70
		});
		
		var buyXCPIcon = _requires['util'].makeImage({
			image : '/images/fiat_xcp_switch.png',
			top:270,
			right:10,
			width : 60,
			height : 55
		});
		
		var label1_complete = _requires['util'].makeLabel({
			text :L('label_complete_intro_1'),
			textAlign : 'center',
			color : 'white',
			width: '90%',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 16,
				fontWeight : 'light'
			},
			top : 20
		});
		
		var label2_complete = _requires['util'].makeLabel({
			text :L('label_complete_intro_2'),
			textAlign : 'left',
			color : 'white',
			width: '80%',
			top : 115,
			left:73,
			font : {
				fontFamily : 'HelveticaNeue-Bold',
				fontSize : 16,
				fontWeight : 'bold'
			}
		});
		
		var label3_complete = _requires['util'].makeLabel({
			text :L('label_complete_intro_3'),
			textAlign : 'right',
			color : 'white',
			width: '80%',
			top : 180,
			right:90,
			font : {
				fontFamily : 'HelveticaNeue-Bold',
				fontSize : 16,
				fontWeight : 'bold'
			}
		});
		
		var label4_complete = _requires['util'].makeLabel({
			text :L('label_complete_intro_4'),
			textAlign : 'left',
			color : 'white',
			width: '80%',
			top : 245,
			left:80,
			font : {
				fontFamily : 'HelveticaNeue-Bold',
				fontSize : 16,
				fontWeight : 'bold'
			}
		});
		
		var label5_complete = _requires['util'].makeLabel({
			text :L('label_complete_intro_5'),
			textAlign : 'right',
			color : 'white',
			width: '80%',
			top : 290,
			right:90,
			font : {
				fontFamily : 'HelveticaNeue-Bold',
				fontSize : 16,
				fontWeight : 'bold'
			}
		});
		
		var labelreview_complete = _requires['util'].makeLabel({
			text :L('label_complete_intro_review'),
			textAlign : 'center',
			color : 'white',
			width: '90%',
			top : 0,
			font : {
				fontFamily : 'HelveticaNeue-Bold',
				fontSize : 16,
				fontWeight : 'bold'
			}
		});
		
		var nextButtonComplete = Ti.UI.createButton({
			backgroundColor : '#48FFFFFF',
			title : L('text_complete_intro_button'),
			color : 'white',
			width : '90%',
			height : 50,
			bottom : 20,
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 20,
				fontWeight : 'normal'
			}
		});
		nextButtonComplete.addEventListener('click', function(e) {
			loadHome();
			self.intro_scroll.animate(
				{
		    		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT, 
		   			opacity: 0.0, 
		    		duration: 1000
				},
				function(){
					self.intro_scroll.setCurrentPage(0);
				}
			);
		});
		
		view_complete.add(topicon_complete);
		
		center_view_complete.add(label1_complete);
		center_view_complete.add(label2_complete);
		center_view_complete.add(label3_complete);
		center_view_complete.add(label4_complete);
		
		center_view_complete.add(sendReceiveIcon);
		center_view_complete.add(createTokenIcon);
		center_view_complete.add(tradeTokenIcon);
		
		center_view_complete2.add(labelreview_complete);
		
		//center_view_complete.add(label5_complete);
		//center_view_complete.add(buyXCPIcon);
		
		view_complete.add(nextButtonComplete);
		view_complete.add(center_view_complete);
		view_complete.add(center_view_complete2);
		
		var views = [view_success, view_passphrase, view_passcode, view_complete];
		if (OS_IOS) {
			views = [view_success, view_passphrase, view_passcode, view_touchid, view_complete];
		}
		
		introscreens.prototype.intro_scroll = Ti.UI.createScrollableView({
			'views': views,
			'showPagingControl': false,
			'scrollingEnabled': false
		});
	};
	
	return new introscreens();
}());