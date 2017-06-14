exports.run = function(){
	var _windows = globals.windows;
    var _requires = globals.requires;
    
	var win = _requires['layer'].createWindow();
	if( OS_IOS ) win.statusBarStyle = Ti.UI.iOS.StatusBar.LIGHT_CONTENT;
    
    var currenciesArray = [];
    var main_view = Ti.UI.createScrollView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	main_view.top = 15;
	win.origin.add(main_view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 55 });
	top_bar.top = 0;
	win.origin.add(top_bar);
	
	var back_home = _requires['util'].makeLabel({
		text:L('label_back'),
		color:"white",
		font:{ fontSize:15, fontWeight:'normal'},
		textAlign: 'right',
		top: 25, left:10
	});
	top_bar.add( back_home );
	
	back_home.addEventListener('touchstart', function(){
		win.close();
	});
	
	var settings_title_center = _requires['util'].makeLabel({
		text:L('label_tab_settings'),
		color:"white",
		font:{ fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 25, center: 0
	});
	top_bar.add( settings_title_center );
	
	var view = _requires['util'].group(null, 'vertical');
	main_view.add(view);
	
	var info = globals.datas;
	function createDescBox(text){
		var box = _requires['util'].group();
		box.width = '95%';
		box.top = 3;
		box.left = 5;
		
		var label = _requires['util'].makeLabel({
			text: text,
			color: '#999999',
			font:{ fontSize: 10 },
			textAlign: 'left',
			left: 0
		});
		box.add(label);
		
		return box;
	}
	
	function createBox( params ){
		var box = _requires['util'].group({
			icon: _requires['util'].makeImage({
			    image: '/images/'+params.icon,
			    height: 40,
			    left: 6
			})
		});
		
		if( params.arrow == null || params.arrow == true ){
			box.add( _requires['util'].makeImage({
			    image: '/images/img_settings_arrow.png',
			    height: 15,
			    right: 20
			}));
		}
		
		box.height = params.height;
		box.width = '100%';
		box.backgroundColor = 'white';
		
		return box;
	}
	
	var section = _requires['util'].makeLabel({
		text: L('text_section_basic'),
		font:{ fontSize: 13 },
		top: 50
	});
	view.add(section);
	
	var box_passphrase = createBox({ icon: 'icon_settings_password.png', height: 45 });
	box_passphrase.top = 10;
	view.add(box_passphrase);
	view.add(createDescBox(L('text_desc_passphrase')));
	
	var passphrase_group = _requires['util'].group();
	var label_passphrase = _requires['util'].makeLabel({
		text: L('label_passphrase'),
		font:{ fontSize: 14 },
		textAlign: 'left', left: 0
	});
	passphrase_group.left = 60;
	passphrase_group.width = '60%';
	passphrase_group.add(label_passphrase);
	
	box_passphrase.add(passphrase_group);
	box_passphrase.addEventListener('click', function(){
		var dialog = _requires['util'].createDialog({
			title: 'Passphrase',
			message: L('text_passphrase_q'),
			buttonNames: [L('label_close'), L('label_show')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index != e.source.cancel ){
				_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
					if( e.success ){
						var time = (OS_ANDROID)? 1000: 1;
						setTimeout(function(){
							var dialog2 = _requires['util'].createDialog({
								title: L('label_passphrase'),
								message: L('text_passphrase').format({'passphrase': _requires['cache'].data.passphrase}),
								buttonNames: [L('label_close')]
							});
							
							dialog2.show();
						}, time);
					}
				}});
			}
		});
		dialog.show();
	});
	
	var box_pin = createBox({ icon: 'icon_settings_easypass.png', height: 45 });
	box_pin.top = 10;
	view.add(box_pin);
	var box_description = createDescBox(L('text_desc_passcode'));
	view.add(box_description);
	var pin_group = _requires['util'].group();
	var label_pin = _requires['util'].makeLabel({
		text: L('label_passcode'),
		font:{ fontSize: 14 },
		textAlign: 'left', left: 0
	});
	pin_group.left = 60;
	pin_group.width = '60%';
	pin_group.add(label_pin);
	
	box_pin.add(pin_group);
	box_pin.addEventListener('click', function(){
		if( !_requires['cache'].data.isTouchId ){
			var dialog = _requires['util'].createDialog({
				title: L('label_easypass_change'),
				message: L('text_easypass_change'),
				buttonNames: [L('label_cancel'), L('label_ok')]
			});
			dialog.addEventListener('click', function(e){
				
				if( e.index != e.source.cancel){
					_requires['auth'].checkPasscode({
						title : L('label_confirmorder'),
						callback : function(e) {
							if (e.success) {
								regist = null;
								var easyInput = _requires['util'].createEasyInput({
									type: 'reconfirm',
									callback: function( number ){
										_requires['cache'].data.easypass = number;
										_requires['cache'].save();
										var dialog = _requires['util'].createDialog({
											title: L('label_setting_completed'),
											message: L('text_easypass_changed'),
											buttonNames: [L('label_ok')]
										}).show();
									},	
									cancel: function(){}
								});
								easyInput.open();
							}
						}
					});
				}
			});
			dialog.show();
		}
	});
	
	function pin_off(){
		box_pin.opacity = 0.1;
		box_description.opacity = 0.3;
	}
	function pin_on(){
		box_pin.opacity = 1.0;
		box_description.opacity = 1.0;
	}
	var display_height = _requires['util'].getDisplayHeight();
	
	var close = _requires['util'].makeLabel({
		text : 'close',
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		},
		height : 30,
		right : 10
	});
	var picker_toolbar = Ti.UI.createView({
		width: '100%',
		height: (OS_ANDROID)? 50: 40,
		backgroundColor: '#e54353'
	});
	picker_toolbar.add(close);
	var currencies = _requires['util'].createTableList({
		backgroundColor: 'white',
		width: '100%', height: 350,
		top:0,
		rowHeight: 50
	});
	currencies.addEventListener('click', setCurrency);
	var picker1 = _requires['util'].group({
		"toolbar": picker_toolbar,
		"picker": currencies
	}, 'vertical');
	if(OS_ANDROID) picker1.top = display_height;
	else picker1.bottom = -390;
	
	close.addEventListener('click',function() {
		picker1.animate(slide_out);
	});
	win.origin.add(picker1);
	
	function addCurrencies() {
		var tikers = globals.tiker;
		currenciesArray = [];
		currencies.setRowDesign(tikers, function(row, val) { //why is key visible here?
			if( key !== 'XCP' ) {
				currenciesArray.push(key);
				var label = Ti.UI.createLabel({
					text : key,
					font : {
						fontFamily : 'HelveticaNeue-Light',
						fontSize : 20,
						fontWeight : 'normal'
					},
					color : 'black',
					width : 'auto',
					height : 'auto',
					left :10
				});
				row.add(label);
				return row;
			}
		});
	};
	
	addCurrencies();
	var slide_in;
	var slide_out;
	if( OS_ANDROID ){
		
		slide_in = Ti.UI.createAnimation({top: display_height - 400, duration:200});
		slide_out = Ti.UI.createAnimation({top: display_height, duration:200});
	}
	else {
		
		slide_in = Ti.UI.createAnimation({bottom: 0, duration:200});
		slide_out = Ti.UI.createAnimation({bottom: -390, duration:200});
	}

	var box_currency = createBox({ icon: 'icon_settings_currency.png', height: 45 });
	box_currency.top = 10;
	view.add(box_currency);
	view.add(createDescBox(L('text_desc_fiat')));
	
	var current_currency = _requires['cache'].data.currncy;
	var label_current_currency = _requires['util'].makeLabel({
		text: current_currency,
		font:{ fontSize: 15 },
		left: 60
	});
	box_currency.add(label_current_currency);

	box_currency.addEventListener('click', function(){
		addCurrencies();
		picker1.animate(slide_in);
	
	});
	
	function setCurrency(e) {
		var selected_currency = currenciesArray[e.index];
		label_current_currency.text = _requires['cache'].data.currncy = selected_currency;
		globals.loadBalance(true);
		if( globals.getOrders != null ) globals.getOrders();
		_requires['cache'].save();
		picker1.animate(slide_out);
	}
	
	if( _requires['cache'].data.isTouchId ) pin_off();
	
	if( OS_IOS ){
		var box_touchid = createBox({ icon: 'icon_settings_touchid.png', height: 50, arrow: false });
		box_touchid.top = 10;
		
		var label_touchid = _requires['util'].makeLabel({
			text: L('label_fingerprint'),
			font:{ fontSize: 14 },
			left: 60
		});
		box_touchid.add(label_touchid);
		
		var t_slider = _requires['util'].createSlider({
			init: (_requires['cache'].data.isTouchId != null)? true: false,
			on: function(){
				function conn(){
					_requires['cache'].data.isTouchId = true;
					_requires['cache'].data.easypass = null;
					_requires['cache'].save();
					pin_off();
				}
				_requires['auth'].useTouchID({ callback: function(e){
					if( e.success ) conn();
					else{
						_requires['util'].createDialog({
							title: L('label_adminerror'),
							message: L('text_adminerror'),
							buttonNames: [L('label_close')]
						}).show();
						if( t_slider.is ) t_slider.off();
						else t_slider.on();
					}
				}});
			},
			off: function(){
				_requires['auth'].useTouchID({ callback: function(e){
					if( e.success ){
						var easyInput = _requires['util'].createEasyInput({
							win: win.origin,
							type: 'reconfirm',
							callback: function( number ){
								_requires['cache'].data.easypass = number;
								_requires['cache'].data.isTouchId = null;
								_requires['cache'].save();
								pin_on();
							},
							cancel: function(){
								if( slider.is ) slider.off();
								else slider.on();
							}
						});
						easyInput.open();
					}
					else{
						if( t_slider.is ) t_slider.off();
						else t_slider.on();
					}
				}});
			}
		});
		t_slider.origin.right = 10;
		box_touchid.add(t_slider.origin);
		view.add(box_touchid);
		
		view.add(createDescBox(L('text_desc_fingerprint')));
	}
	
	var box_review = createBox({ icon: 'icon_settings_review.png', height: 45 });
	box_review.top = 10;
	var label_review = _requires['util'].makeLabel({
		text: L('label_review'),
		font:{ fontSize: 14 },
		left: 60
	});
	box_review.add(label_review);
	view.add(box_review);
	view.add(createDescBox(L('text_desc_review')));
	box_review.addEventListener('click', function(){
		
		var dialog = _requires['util'].createDialog({
			title: L('text_support_title'),
			message: L('text_support'),
			buttonNames: [L('text_support_like'), L('text_support_faq'), L('text_review_no')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index == 0 ){
				var dialog2 = _requires['util'].createDialog({
					title: L('text_review_title'),
					message: L('text_review'),
					buttonNames: [L('text_review_no'), L('text_review_yes')]
				});
				dialog2.addEventListener('click', function(e){
					if( e.index != e.source.cancel ){
						var url = (OS_IOS)? 'itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?type=Purple+Software&id=977972108': 'market://details?id=inc.lireneosoft.counterparty';
						Ti.Platform.openURL(url);
					}
				});
				dialog2.show();
			}
			else if( e.index == 1 ){
				_windows['weblink'].run({
		            'path': Alloy.CFG.dashboard_uri + 'faqs/wallet'
		        });
			}
		});
		dialog.show();
	});
	
	var section = _requires['util'].makeLabel({
		text: L('text_section_account'),
		font:{ fontSize: 13 },
		top: 20
	});
	view.add(section);
	
	var box_identifier = createBox({ icon: 'icon_settings_identifier.png', height: 50 });
	box_identifier.top = 15;
	view.add(box_identifier);
	view.add(createDescBox(L('text_desc_identifier')));
	
	var identifier_group = _requires['util'].group();
	var label_identifier = _requires['util'].makeLabel({
		text: _requires['cache'].data.id,
		font:{ fontSize: 12 },
		textAlign: 'left', left: 0
	});
	identifier_group.left = 60;
	identifier_group.width = '60%';
	identifier_group.add(label_identifier);
	
	box_identifier.add(identifier_group);
	box_identifier.addEventListener('click', function(){
		var dialog = _requires['util'].createDialog({
			title: 'Identifier',
			message: L('text_identifier'),
			buttonNames: [L('label_close'), L('label_copy')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index != e.source.cancel ){
				Ti.UI.Clipboard.setText( _requires['cache'].data.id );
				_requires['util'].createDialog({
					title: L('label_copied'),
					message: L('text_copied'),
					buttonNames: [L('label_close')]
				}).show();
			}
		});
		dialog.show();
	});
	
	var section = _requires['util'].makeLabel({
		text: L('text_section_other'),
		font:{ fontSize: 13 },
		top: 20
	});
	view.add(section);
	
	var box_about = createBox({ icon: 'icon_settings_about.png', height: 45 });
	box_about.top = 10;
	var label_about = _requires['util'].makeLabel({
		text: L('label_about'),
		font:{ fontSize: 14 },
		left: 60
	});
	box_about.add(label_about);
	view.add(box_about);
	box_about.addEventListener('click', function(){
		var showVersion = Ti.App.version;
		if( !Alloy.CFG.isDevelopment ){
			var v = Ti.App.version.split('.');
			var major = v[0];
			var minor = v[1];
			var patch = v[2];
			showVersion = major + '.' + minor + '.' + patch;
		}
		
		var dialog = _requires['util'].createDialog({
			title: L('appname'),
			message: 'ver' + showVersion + '\n\n' + globals.copyright + ((Alloy.CFG.isDevelopment)? '\nDevelopment':''),
			buttonNames: [L('label_close')]
		}).show();
	});
	
	var box_signout = createBox({ icon: 'icon_settings_signout.png', height: 45 });
	box_signout.top = 10;
	var label_signout = _requires['util'].makeLabel({
		text: L('label_signout'),
		font:{ fontSize: 14 },
		left: 60
	});
	box_signout.add(label_signout);
	view.add(box_signout);
	box_signout.addEventListener('click', function(){
		var dialog = _requires['util'].createDialog({
			title: L('label_signout'),
			message: L('text_signout'),
			buttonNames: [L('label_cancel'), L('label_ok')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index != e.source.cancel ){
				_requires['network'].connectDELETEv2({
					'method' : 'users/' +  _requires['cache'].data.id + '/signout?device_token=' + globals.deviceToken,
					'post' : {},
					'callback' : function(result) {
						Ti.API.info(result);
					},
					'onError' : function(error) {
						Ti.API.info('error remove:' + error);
					}
				});
				
				_requires['cache'].init();
				_requires['cache'].load();
				if( globals.timer_shapshiftupdate != null ) clearInterval(globals.timer_shapshiftupdate);
				win.close();
				_windows['signin'].run();
			}
		});
		dialog.show();
	});
	
	if(OS_IOS) Ti.API.home_tab.open(win.origin,{ animated:true });
	if(OS_ANDROID) win.origin.open({ animated:true });
	return win.origin;
};