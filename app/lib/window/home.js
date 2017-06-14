var theWindow = Ti.UI.createWindow({
	backgroundColor : '#FFFFFF',
	orientationModes : [Ti.UI.PORTRAIT],
	navBarHidden : true,
	titleControl : false,
	tabBarHidden : true,
});

if (OS_ANDROID) theWindow.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_ADJUST_PAN;
if (OS_IOS) theWindow.statusBarStyle = Ti.UI.iOS.StatusBar.LIGHT_CONTENT;
globals.main_window = theWindow;

function numberWithCommas(x) {
	var res = x.toString().split(".");
	var firstString = res[0];
	var endString  = "";
	var foundEnd = false;
	
	for (var i = 0; i < res.length; i++) {
		var val = res[i];
		if(i > 0){
			foundEnd = true;
			endString = endString + val.toString();	
		}
	}
	if(foundEnd == true){
	 	return firstString.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.' + endString.toString();	
	}
	else{
		return firstString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
}
exports.run = function() {
	var _windows = globals.windows;
	var _requires = globals.requires;
	didGoToPage1 = false;
		
	var webapps = globals.webapps = require('/window/webapps.js');
	
	globals.requires['analytics'].setUser({
		name: 'user_identifier',
		value: _requires["cache"].data.id
	});
	
	function continueHome(){
		_requires['bitcore'].init(_requires['cache'].data.passphrase);
	
		var defaultAddress = globals.requires['bitcore'].createHDAddress(0);
		if( Ti.App.Properties.getString("current_address") != null){
			_requires['cache'].data.address = Ti.App.Properties.getString("current_address");
			_requires['cache'].save();
		}
		
		function getWallets( isbalanceupdate ) {
			var loading = _requires['util'].showLoading(theWindow, {
				width : Ti.UI.FILL,
				height : Ti.UI.FILL
			});
			_requires['network'].connectGETv2({
				'method' : 'users/' + _requires['cache'].data.id + '/addresses',
				'callback' : function(results) {
					if (results != null) walletsArray = results;
	
					var counter = 0;
					for (var key in walletsArray) {
						var anObject = walletsArray[key];
						if( anObject.address == _requires['cache'].data.address ){
							globals.requires['bitcore'].changeHD(counter);
							if(typeof anObject.tag !== 'undefined'){
								home_title_center.text = anObject.tag;
								walletButton.wallet_button.text = anObject.tag;
							}
							break;
						}
						counter++;
					}
					for (var key in walletsArray) {
						var anObject = walletsArray[key];
						if(typeof anObject.tag !== 'undefined'){
					   		 Ti.App.Properties.setString(anObject.address,anObject.tag);
					   	}
						
					}
					globals.address_num = walletsArray.length;
					addWallets();
					view_receive.setImageQR();
					if( isbalanceupdate ) globals.loadBalance(true);
				},
				'onError' : function(error) {
					if( error.code == 100009 ){
						var dialog = _requires['util'].createDialog({
							'title': error.type,
							'message': error.message,
							'buttonNames': [L('label_close')]
						}).show();
					}
					else if( isbalanceupdate ) globals.loadBalance(true);
				},
				'always' : function() {
					if( loading != null ) loading.removeSelf();
				}
			});
		}
		getWallets(true);
		
		var currenciesArray = [];
		var walletsArray = [];
		var display_height = _requires['util'].getDisplayHeight();
		var win = {};
		win.origin = theWindow;
	
		var view = Ti.UI.createView({
			backgroundColor : '#FFFFFF',
			width : '100%',
			height : Ti.UI.FILL
		});
		
		var home_view = Ti.UI.createView({
			backgroundColor : '#FFFFFF',
			width : '100%',
			height : Ti.UI.FILL
		});
		
		var middle_view = Ti.UI.createView({
			backgroundColor : '#FFFFFF',
			width : '100%',
			height : Ti.UI.FILL
		});
		
		//for paging
		var currentBalances = [];
		var currentBalanceIndex = 0;
		var offsetHeight = 0;
		var currentOffset = 0;
		var amountToAdd = 0;
		///
						
		var view_receive = require('/window/receive.js');
		var view_dex = require('/window/dex.js');
		var view_history = require('/window/history.js');
		
		var top_bar = Ti.UI.createView({
			backgroundColor : '#e54353',
			width : Ti.UI.FILL,
			height : 60
		});
		top_bar.top = 0;
		
		function addWallets() {
			wallet_view.height = 50 + (walletsArray.length * 90);
			if(wallet_view.height > display_height - 141){
				wallet_view.height = display_height - 141;
			}
			addWallet.bottom = 5;
				
			var counter = 0;
			wallets.setRowDesign(walletsArray, function(row, val) {
				var an_address = val.address;
				var walletName = Ti.UI.createLabel({
					text :getTagForAddress(an_address),
					font : {
						fontFamily : 'HelveticaNeue-Light',
						fontSize : 20,
						fontWeight : 'normal'
					},
					color : 'black',
					width : 'auto',
					height : 'auto',
					top : 10,
					left : 10
				});
				row.add(walletName);
				walletAddressLab = Ti.UI.createLabel({
					text : an_address,
					font : {
						fontFamily : 'HelveticaNeue-Light',
						fontSize : 10,
						fontWeight : 'normal'
					},
					color : 'black',
					width : 'auto',
					height : 'auto',
					top : 40,
					left : 10
				});
				row.add(walletAddressLab);
				var select_button = Ti.UI.createButton({
					id:counter,
					backgroundColor : "transparent",
						width : '100%',
						height : 40
				});
				select_button.right = 20;
				row.add(select_button);
				
				select_button.addEventListener('click', function(e) {
					var valObject = walletsArray[e.source.id];
					if( _requires['cache'].data.address !== valObject.address ){
						walletButton.wallet_button.text = getTagForAddress(valObject.address);
						home_title_center.text = getTagForAddress(valObject.address);
						_requires['cache'].data.address = valObject.address;
						Ti.App.Properties.setString("current_address", valObject.address);
						globals.requires['bitcore'].changeHD(e.source.id);
						
						wallet_address.text = valObject.address;
						view_history.loadHistory(true);
						globals.loadBalance(true);
						view_receive.setImageQR();
					}
					walletViewOpen = false;
					wallet_view.animate(closeWalletAnimation);
					wallet_arrow.animate(rightArrowAnimation);
				});
				
				var rename_button = Ti.UI.createButton({
					id:counter,
					backgroundColor : "gray",
					title : L('title_rename'),
					color : 'white',
					width : 60,
					height : 25,
					textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
					font : {
						fontFamily : 'HelveticaNeue',
						fontSize : 10,
						fontWeight : 'light'
					},
				});
				rename_button.left = 10;
				rename_button.bottom = 5;
				row.add(rename_button);
				
				rename_button.addEventListener('click', function(e) {
					var valObject = walletsArray[e.source.id];
					var dialog = _requires['util'].createInputDialog({
						title : L('label_rename'),
						message : L('text_wallet_rename'),
						value : '',
						buttonNames : [L('label_close'), L('label_apply')]
					});
					
					dialog.origin.addEventListener('click', function(e) {
						var inputText = (OS_ANDROID) ? dialog.androidField.getValue() : e.text;
						if (e.index != e.source.cancel) {
							if (inputText.length > 0) {
								
								var loading = _requires['util'].showLoading(theWindow, {
									width : Ti.UI.FILL,
									height : Ti.UI.FILL
								});
	
								_requires['network'].connectPUTv2({
									'method' : 'tags/'+ valObject.id,
									'post' : {
										user_id : _requires['cache'].data.id,
										address : valObject.address,
										tag : inputText
									},
									'callback' : function(result) {
										getWallets(false);
										if(wallet_address.text == valObject.address){
											walletButton.wallet_button.text = inputText;
											home_title_center.text = inputText;
										}
										Ti.App.Properties.setString(valObject.address, inputText);
									},
									'onError' : function(error) {
										Ti.API.log('error tags' + error);
									},
									'always' : function() {
										if( loading != null ) loading.removeSelf();
										
									}
								});
	
							}
						}
					});
					dialog.origin.show();
				});
				
				var hide_button = Ti.UI.createButton({
					id:counter,
					backgroundColor : "gray",
					title : L('label_hide'),
					color : 'white',
					width : 60,
					height : 25,
					textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
					font : {
						fontFamily : 'HelveticaNeue',
						fontSize : 10,
						fontWeight : 'light'
					},
				});
				hide_button.left = 80;
				hide_button.bottom = 5;
				
				if(val.address !== defaultAddress && counter == globals.address_num - 1){
					row.add(hide_button);
				}
				
				hide_button.addEventListener('click', function(e) {
					var valObject = walletsArray[e.source.id];
					var dialog = _requires['util'].createDialog({
						title : L('label_hide'),
						message : L('label_hide_text'),
						buttonNames : [L('label_close'), L('label_ok')]
					});
					dialog.addEventListener('click', function(e) {
						if (e.index != e.source.cancel) {
							var loading = _requires['util'].showLoading(theWindow, {
								width : Ti.UI.FILL,
								height : Ti.UI.FILL
							});
	
							_requires['network'].connectDELETEv2({
								'method' : 'tags/'+ valObject.id,
								'post' : {},
								'callback' : function(result) {
									_requires['network'].connectPUTv2({
										'method' : 'users/' + _requires['cache'].data.id + '/preference/update',
										'post' : {
											num_addresses_used : walletsArray.length - 1
										},
										'callback' : function() {
											if( valObject.address === wallet_address.text ){
												walletButton.wallet_button.text = getTagForAddress(defaultAddress);
												home_title_center.text = getTagForAddress(defaultAddress);
												Ti.App.Properties.setString("current_address", defaultAddress);
												wallet_address.text = defaultAddress;
												_requires['cache'].data.address = defaultAddress;
												_requires['cache'].save();
												globals.loadBalance(true);
												view_receive.setImageQR();
											}
											getWallets(false);
										},
										'onError' : function(error) {
											// Failed or Cancel
											//globals.requires['bitcore'].changeHD(num_hd_address - 1);
										},
										'always' : function() {
											if( loading != null ) loading.removeSelf();
										}
									});
								},
								'onError' : function(error) {
									Ti.API.log('error remove' + error);
								},
								'always' : function() {
									if( loading != null ) loading.removeSelf();
								}
							});
						}
					});
					dialog.show();
				});
				counter++;
				return row;
			});
		}
	
		var rightArrowTransformation = Ti.UI.create2DMatrix();
	    rightArrowTransformation = rightArrowTransformation.rotate(0); // this does not work
	    var rightArrowAnimation = Ti.UI.createAnimation({
	      transform : rightArrowTransformation,
	      duration: 200
	 	});
	 	
	 	var downArrowTransformation = Ti.UI.create2DMatrix();
	    downArrowTransformation = downArrowTransformation.rotate(90); // this does not work
	    var downArrowAnimation = Ti.UI.createAnimation({
	    	transform : downArrowTransformation,
	    	duration: 200
	 	});
		
		function addCurrencies() {
			var tikers = globals.tiker;
			currenciesArray = [];
			currencies.setRowDesign(tikers, function(row, val) {//why is key visible here?
				if (key !== 'XCP') {
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
						left : 10
					});
					row.add(label);
					return row;
				}
			});
		};
		
		_requires['fcm'].start();
		_requires['network'].connectGETv2({
			'method' : 'users/' + _requires['cache'].data.id + '/username',
			'callback' : function(result) {
				globals.user_name = result.username;
			},
			'onError' : function(error) {
				globals.user_name = '';
			}
		});
		
		var home_title_center = _requires['util'].makeLabel({
			text : L('label_tab_home'),
			color : "white",
			font : {
				fontSize : 20,
				fontWeight : 'normal'
			},
			textAlign : 'center',
			top : 28,
			center : 0
		});
		
		home_title_center.text = getTagForAddress(_requires['cache'].data.address);
		
		top_bar.add(home_title_center);
		if (OS_ANDROID) home_title_center.top = 20;
	
		var menu_view_back = Ti.UI.createView({
			backgroundColor : '#660000',
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			opacity : 1
		});
		var menu_view = Ti.UI.createView({
			backgroundColor : '#ebebeb',
			width : 280,
			height : Ti.UI.FILL,
			opacity : 1
		});
		var menu_left = Ti.UI.createView({
			backgroundColor : 'transparent',
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			opacity : 1
		});
		var wallet_view = Ti.UI.createView({
			backgroundColor : 'transparent',
			width : 280,
			height : display_height - 141,
			opacity : 1
		});
		wallet_view.top = display_height * -1;
		
		var balance_view = Ti.UI.createScrollView({
			scrollType : 'vertical',
			layout : 'vertical',
			width : Ti.UI.FILL,
			height : display_height - 110,
			backgroundColor : 'white',
			showVerticalScrollIndicator : true
		});
		if(OS_ANDROID){
			balance_view.height = display_height - 118;
		}
		balance_view.top = 60;
		balance_view.addEventListener('scroll', function(e) {
			if(balance_view.contentOffset.y > currentOffset){
				currentBalances = globals.balances.slice(currentBalanceIndex,currentBalanceIndex+amountToAdd);
				currentBalanceIndex += amountToAdd;
				currentOffset = balance_view.contentOffset.y + offsetHeight;
				addRowsToBalances();
			}
		});
						
		var shadow = Ti.UI.createView({
			width : Ti.UI.FILL,
			opacity : 0.1,
			backgroundColor : 'black'
		});
		shadow.left = -2;
		menu_view.right = menu_view.width;
		menu_left.addEventListener('click', function(e) {
			closeMenu();
		});
		menu_left.right = 280;
		menu_view_back.add(menu_left);
		var menu_top_box = Ti.UI.createView({
			backgroundColor : 'white',
			width : 280,
			height : 141,
			opacity : 1
		});
		menu_top_box.top = 0;
		
		var wallets = _requires['util'].createTableList({
			backgroundColor : 'white',
			width : '100%',
			height : display_height - menu_top_box.height - 40,
			top : 0,
			rowHeight : 90,
			allowsSelection: false
		});
		
		wallet_view.add(wallets);
		function getUsername(){
			if(globals.user_name != null && globals.user_name != ''){
				return globals.user_name;
			}
			else{
				return L('text_noregisted');
			}
		}
		var username = Ti.UI.createButton({
			backgroundColor : "transparent",
			title :getUsername(),
			color : 'black',
			textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
			left : 10,
			top : 15,
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 20,
				fontWeight : 'normal'
			},
		});
		var info = globals.datas;
		username.addEventListener('click', function() {
			var dialog = _requires['util'].createInputDialog({
				title : L('label_rename'),
				message : L('text_rename'),
				value : (username.title != null ) ? username.title : '',
				buttonNames : [L('label_close'), L('label_ok')]
			});
			dialog.origin.addEventListener('click', function(e) {
				var inputText = (OS_ANDROID) ? dialog.androidField.getValue() : e.text;
				if (e.index != e.source.cancel) {
					if (inputText.length > 0 && inputText !== info.user_name) {
						_requires['auth'].check({
							title : L('text_confirmsend'),
							callback : function(e) {
								if (e.success) {
									var loading = _requires['util'].showLoading(theWindow, {
										width : Ti.UI.FILL,
										height : Ti.UI.FILL
									});
									_requires['network'].connectPUTv2({
										'method' : 'users/' + _requires['cache'].data.id + '/info/update',
										'post' : {
											updates : JSON.stringify([{
												column : 'username',
												value : inputText
											}])
										},
										'callback' : function(result) {
											username.title = globals.user_name = inputText;
										},
										'onError' : function(error) {
											_requires['util'].createDialog({
												'title': error.type,
												'message': error.message,
												'buttonNames': [L('label_close')]
											}).show();
										},
										'always' : function() {
											if( loading != null ) loading.removeSelf();
										}
									});
								}
							}
						});
					}
				}
			});
			dialog.origin.show();
		});
	
		username.setTextAlign(Ti.UI.TEXT_ALIGNMENT_CENTER);
		menu_top_box.add(username);
	
		var border = Ti.UI.createView({
			'width' : '100%',
			height : 1,
			backgroundColor : 'black',
			top : 69,
			opacity : 0.2
		});
		menu_top_box.add(border);
	
		var walletButton = _requires['util'].group({
			'wallet_icon' : _requires['util'].makeImage({
				image : '/images/icon_wallet_red.png',
				width : 30,
				height : 28
			}),
			'wallet_button' : _requires['util'].makeLabel({
				text : getTagForAddress(_requires['cache'].data.address),
				color : 'black',
				textAlign : 'left',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 15,
					fontWeight : 'normal'
				}
			})
		}, 'horizontal');
		walletButton.wallet_button.left = 10;
		walletButton.left = 10;
		walletButton.top = 80;
		
		var wallet_arrow = _requires['util'].makeImage({
			image : '/images/img_settings_arrow.png',
			right:10,
			width : 15,
			height : 20
		});
		
		wallet_arrow.top = 100;
		menu_top_box.add(wallet_arrow);
		var wallet_address = _requires['util'].makeLabel({
			text : _requires['cache'].data.address,
			textAlign : 'left',
			color : 'gray',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 10,
				fontWeight : 'light'
			},
			top : 120,
			left : 45
		});
		walletButton.width = '100%';
		
		var _walletButton = _requires['util'].group();
		_walletButton.width = Ti.UI.FILL;
		_walletButton.height = 70;
		_walletButton.top = 70;
		_walletButton.addEventListener('click', function(e) {
			showWalletMenu();
		});
	
		var addWallet = Ti.UI.createButton({
			backgroundColor : '#e54353',
			title : L('label_add_wallet'),
			color : 'white',
			width : '90%',
			height : 32,
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 15,
				fontWeight : 'normal'
			},
			borderRadius : 5
		});
		Ti.App.Properties.setString("current_address", _requires['cache'].data.address);
		globals.addWallet = function( callback ){
			var time = (OS_ANDROID)? 1000: 1;
			setTimeout(function(){
				var dialog = _requires['util'].createInputDialog({
					title : L('label_add_wallet'),
					message : L('text_wallet_add'),
					value : '',
					buttonNames : [L('label_close'), L('label_ok')]
				});
				dialog.origin.addEventListener('click', function(e) {
					var inputText = (OS_ANDROID) ? dialog.androidField.getValue() : e.text;
					if (e.index != e.source.cancel) {
						if (inputText.length > 0) {
		
							var loading = _requires['util'].showLoading(theWindow, {
								width : Ti.UI.FILL,
								height : Ti.UI.FILL
							});
		
							_requires['network'].connectGETv2({
								'method' : 'users/' + _requires['cache'].data.id + '/preference',
								'callback' : function(result) {
									// Get a new address
									var num_hd_address =  Number(result.num_addresses_used);
									var new_address = globals.requires['bitcore'].createHDAddress(num_hd_address);
									
									// Setting address label and send to the server or cancel.
									_requires['network'].connectPOSTv2({
										'method' : 'tags',
										'post' : {
											user_id : _requires['cache'].data.id,
											address : new_address,
											tag : inputText
										},
										'callback' : function(result) {
											// Success
											// invoke edit_preference to edit a current address number.
											_requires['network'].connectPUTv2({
												'method' : 'users/' + _requires['cache'].data.id + '/preference/update',
												'post' : {
													num_addresses_used : num_hd_address + 1
												},
												'callback' : function() {
													Ti.App.Properties.setString(new_address, inputText);
													globals.address_num = num_hd_address;
													getWallets(false);
													if( typeof callback === 'function' ) callback({ status: true, 'address': new_address });
												},
												'onError' : function(error) {
													// Failed or Cancel
													globals.requires['bitcore'].changeHD(num_hd_address - 1);
													
													if( typeof callback === 'function' ) callback({ status: false, 'action': 'error' });
												},
												'always' : function() {
													if( loading != null ) loading.removeSelf();
												}
											});
		
										},
										'onError' : function(error) {
											if( loading != null ) loading.removeSelf();
											// Failed or Cancel
											globals.requires['bitcore'].changeHD(result.num_addresses_used - 1);
											
											if( typeof callback === 'function' ) callback({ status: false, 'action': 'error' });
										}
									});
		
								}
							});
		
						}
					}
					else{
						if( typeof callback === 'function' ) callback({ status: false, 'action': 'cancel' });
					}
				});
				dialog.origin.show();
			}, time);
		};
		addWallet.addEventListener('click', function() {
			globals.addWallet();
		});
		wallet_view.add(addWallet);
	
		menu_top_box.add(walletButton);
		menu_top_box.add(wallet_address);
		menu_top_box.add(_walletButton);
	
		var border2 = Ti.UI.createView({
			'width' : '100%',
			height : 1,
			backgroundColor : 'black',
			top : 140,
			opacity : 0.2
		});
		menu_top_box.add(border2);
		function getTagForAddress(address){
			var tag =  Ti.App.Properties.getString(address);
			if(tag != null && tag != 'NULL' ){
				return tag;
			}else{
				return L('label_no_tag');
			}
			
		}
			
		var current_fee = _requires['cache'].data.current_fee;
		globals.fee_text = {
			'fastestFee': L('title_settings_high_fee'),
			'halfHourFee': L('title_settings_med_fee'),
			'lowFee': L('title_settings_low_fee'),
		};
		if( isFinite(current_fee) ){
			current_fee = L('label_fee') + ' ' + current_fee;
		}
		else current_fee = globals.fee_text[current_fee];
		
		var feeButton = _requires['util'].group({
			'fee_icon' : _requires['util'].makeImage({
				image : '/images/icon_settings_send.png',
				width : 30,
				height : 30
			}),
			'fee_button' : Ti.UI.createButton({
				backgroundColor : "transparent",
				title : current_fee,
				color : 'black',
				left : 10,
				textAlign : 'left',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 15,
					fontWeight : 'light'
				},
			})
		}, 'horizontal');
		feeButton.left = 10;
		feeButton.top = 256;
		globals.feeButton = feeButton;
		
		var picker_fee = _requires['util'].createFeeSelector(function(type){
			if( isFinite(type) ){
				feeButton.fee_button.title = L('label_fee') + ' ' + type;
				if( globals.label_dexfee != null ) globals.label_dexfee.text = L('label_fee') + ' ' + _requires['cache'].data.current_fee + 'BTC ▼';
			}
			else{
				feeButton.fee_button.title = L('title_settings_' + type);
				if( globals.label_dexfee != null ) globals.label_dexfee.text = L('label_fee') + ' ' + globals.fee_text[_requires['cache'].data.current_fee] + ' ▼';
			}
		});
		feeButton.addEventListener('click', function(e) {
			picker_fee.open();
		});
		menu_view.add(feeButton);
		globals.picker_fee = picker_fee;
			
		var settingsButton = _requires['util'].group({
			'settings_icon' : _requires['util'].makeImage({
				image : '/images/icon_settings.png',
				width : 30,
				height : 30
			}),
			'settings_button' : Ti.UI.createButton({
				backgroundColor : "transparent",
				title : L('label_tab_settings'),
				color : 'black',
				left : 10,
				textAlign : 'left',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 15,
					fontWeight : 'light'
				},
			})
		}, 'horizontal');
		settingsButton.left = 10;
		settingsButton.top = 307;
	
		settingsButton.addEventListener('click', function(e) {
			closeMenu();
			walletViewOpen = false;
			wallet_view.animate(closeWalletAnimation);
			wallet_arrow.animate(rightArrowAnimation);
			globals.windows['settings'].run();
		});
		menu_view.add(settingsButton);
	
		var helpButton = _requires['util'].group({
	
			'help_icon' : _requires['util'].makeImage({
				image : '/images/icon_settings_about.png',
				width : 35,
				height : 35
			}),
			'help_button' : Ti.UI.createButton({
				backgroundColor : "transparent",
				title : L('label_tab_help'),
				color : 'black',
				left : 5,
				textAlign : 'left',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 15,
					fontWeight : 'light'
				},
			})
		}, 'horizontal');
		helpButton.left = 10;
		helpButton.top = 150;
	
		helpButton.addEventListener('click', function(e) {
			_windows['weblink'].run({
	            'path': Alloy.CFG.dashboard_uri + 'faqs/wallet',
	            'barColor': '#e54353'
	        });
		});
		menu_view.add(helpButton);
		
		var border3 = Ti.UI.createView({
			'width' : '100%',
			height : 1,
			backgroundColor : 'black',
			bottom : 45,
			opacity : 0.2
		});
		menu_view.add(border3);
		
		var boardbutton_view = Ti.UI.createView({
			backgroundColor : '#e54353',
			width : 280,
			height : 45,
			bottom: 0,
			opacity : 1
		});
		menu_view.add(boardbutton_view);
		
		var indieBoardButton = _requires['util'].group({
			/*
			'ib_icon' : _requires['util'].makeImage({
				image : '/images/icon_settings_indieboard.png',
				width : 35,
				height : 35
			}),
			*/
			'ib_button' : Ti.UI.createLabel({
				text : L('label_tab_indieboard'),
				color : 'white',
				left : 0,
				font : {
					fontSize : 18,
					fontFamily : 'HelveticaNeue-Bold'
				}
			})
		}, 'horizontal');
		indieBoardButton.bottom = 13;
		
		var indieboard = function( path ){
			var message = "";
		    for (var i = 0; 12 > i; i++) {
		        var random = 16 * Math.random() | 0;
		        message += (12 == i ? 4 : 16 == i ? 3 & random | 8 : random).toString(16);
		    }
		    
		    var main_address = _requires['bitcore'].changeHD(0);
			var sig = _requires['bitcore'].signMessage(message);
			_requires['bitcore'].changeHD(globals.currentHD);
			
			if( OS_ANDROID ){
				_windows['weblink'].run({
		            'path': Alloy.CFG.dashboard_uri + 'tokens/dashboard' + path,
		            'redirect_path': path,
		            'message': message,
		            'signature': sig,
		            'barColor': '#e54353'
		        });
			}
			else{
				var loading = _requires['util'].showLoading(theWindow, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('loading_confirm')});
				_requires['network'].connectPOSTtoIndieboard({
					'method' : 'verify',
					'post': {
						'id': _requires['cache'].data.id,
						'message': message,
						'signature': sig
					},
					'callback': function( result ){
						Ti.API.info({
							'id': _requires['cache'].data.id,
							'message': message,
							'signature': sig
						});
						Ti.API.info(result);
						if( result.validity ){
							_windows['weblink'].run({
					            'path': Alloy.CFG.dashboard_uri + 'tokens/dashboard' + path,
					            'barColor': '#e54353'
					        });
					    }
					},
					'onError': function(error){
						var dialog = _requires['util'].createDialog({
							'title': error.type,
							'message': error.message,
							'buttonNames': [L('label_close')]
						}).show();
					},
					'always': function(){
						if( loading != null ) loading.removeSelf();
					}
				});
			}
		};
		indieBoardButton.addEventListener('touchend', function(e){ indieboard('/'); });
		menu_view.add(indieBoardButton);
		
		var icon_new = _requires['util'].makeImage({
			image : '/images/icon_new.png',
			height : 40,
			left: 20,
			bottom: 20
		});
		menu_view.add(icon_new);
		
		var linkageButton = _requires['util'].group({
			'linkage_icon' : _requires['util'].makeImage({
				image : '/images/icon_settings_linkage.png',
				width : 40,
				height : 40
			}),
			'linkage_button' : Ti.UI.createButton({
				backgroundColor : "transparent",
				title : L('label_linkage'),
				color : 'black',
				textAlign : 'left',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 15,
					fontWeight : 'light'
				},
			})
		}, 'horizontal');
		linkageButton.left = 10;
		linkageButton.top = 200;
	
		linkageButton.addEventListener('click', function(e) {
			function doScan(){
				_requires['util'].openScanner({
					'callback' : function(e) {
						var str = e.barcode;
						globals._parseArguments(str, true);
					}
				});
				closeMenu();
			}
			
			if( Ti.App.Properties.getString('shows_linkage_change') !== 'FALSE'){
				var dialog = _requires['util'].createDialog({
		   			title:L('label_linkage_change'),
					message:L('text_linkage_change'),
					buttonNames: [L('text_dont_show'), L('label_close')]
				});
				dialog.addEventListener('click', function(e){
					if( e.index == e.source.cancel ){
						Ti.App.Properties.setString('shows_linkage_change', 'FALSE');
					}
					doScan();
				});
				dialog.show();
			}
			else doScan();
		});
	
		menu_view.add(linkageButton);
		home_view.add(shadow);
		home_view.add(balance_view);
		
		home_view.add(top_bar);
		
		middle_view_scroll = Ti.UI.createScrollableView({
			views:[home_view,view_receive.getView(),view_dex.getView(),view_history.getView()],
	  		showPagingControl:false
		});
		function setPage(){
			if(middle_view_scroll.currentPage == 0){
				didGoToPage1 = true;
		   	 	homeTab.button.image = '/images/icon_home_active.png';
				exchangeTab.button.image = '/images/icon_exchange.png';
				historyTab.button.image = '/images/icon_history.png';
				receiveTab.button.image = '/images/icon_receive.png';
		
				homeTab.label.color = '#e54353';
				exchangeTab.label.color = '#929292';
				historyTab.label.color = '#929292';
				receiveTab.label.color = '#929292';
	    	}
	    	else if(middle_view_scroll.currentPage == 1){
	    		homeTab.button.image = '/images/icon_home.png';
				exchangeTab.button.image = '/images/icon_exchange.png';
				historyTab.button.image = '/images/icon_history.png';
				receiveTab.button.image = '/images/icon_receive_active.png';
		
				homeTab.label.color = '#929292';
				exchangeTab.label.color = '#929292';
				historyTab.label.color = '#929292';
				receiveTab.label.color = '#e54353';
	    	}
	    	else if(middle_view_scroll.currentPage == 2){
	    		homeTab.button.image = '/images/icon_home.png';
				exchangeTab.button.image = '/images/icon_exchange_active.png';
				historyTab.button.image = '/images/icon_history.png';
				receiveTab.button.image = '/images/icon_receive.png';
		
				homeTab.label.color = '#929292';
				exchangeTab.label.color = '#e54353';
				historyTab.label.color = '#929292';
				receiveTab.label.color = '#929292';
				
				view_dex.startDex();	    		
	    	}
	    	else if(middle_view_scroll.currentPage == 3){
	    		homeTab.button.image = '/images/icon_home.png';
				exchangeTab.button.image = '/images/icon_exchange.png';
				historyTab.button.image = '/images/icon_history_active.png';
				receiveTab.button.image = '/images/icon_receive.png';
		
				homeTab.label.color = '#929292';
				exchangeTab.label.color = '#929292';
				historyTab.label.color = '#e54353';
				receiveTab.label.color = '#929292';
				
				if( !Ti.API.isHistoryloaded ){
					Ti.API.isHistoryloaded = true;
					view_history.loadHistory(true);
				}
			}
			if( middle_view_scroll.currentPage != 2 ) globals.webapps.buttonShow();
			else if( view_dex.getViewType() == 0 ) globals.webapps.buttonHide();
		}
		middle_view_scroll.addEventListener('scrollEnd', function() {
	    	setPage();
		});
		
		middle_view.add(middle_view_scroll);
		
		menu_view_back.add(menu_view);
		menu_view.add(wallet_view);
		menu_view.add(menu_top_box);
		menu_view.right = 0;
		wallet_view.right = 0;
		menu_view_back.addEventListener('swipe', function(e) {
			if (e.direction == 'right') {
				if (wallet_view.top == display_height * -1) {
					closeMenu();
				}
			}
		});
		
		var fade_in = Ti.UI.createAnimation();
		fade_in.opacity = 1;
		fade_in.duration = 400;
	
		var fade_out = Ti.UI.createAnimation();
		fade_out.opacity = 0;
		fade_out.duration = 400;
	
		function createBox(params) {
			var box = _requires['util'].group();
			box.height = params.height;
			box.width = '100%';
			box.backgroundColor = 'transparent';
	
			return box;
		}
	
		var assets_info = [];
		
		_requires['tiker'].getTiker({
			'callback' : function() {
				Ti.API.info('get ticker');
			}
		});
	
		var balance_error = null;
		var isAddExtra = true;
		function addRowsToBalances(){
			for (var i = 0; i < currentBalances.length; i++) {
				var val = currentBalances[i];
				var box = createBox({ height : 90 });
				
				box.top = 10;
				if (i == 0) box.top = 20;
					
				var display_asset = val.token;
				if( val.token.length >= 13 ){
					display_asset = val.token.substr(0, 13) + '...';
				}
				var asset_name = _requires['util'].makeLabel({
					text : display_asset,
					textAlign : 'left',
					font : {
						fontFamily : 'HelveticaNeue-Light',
						fontSize : 18,
						fontWeight : 'light'
					},
					top : 10,
					left : 65,
					width : 150,
				});
				asset_name.asset = val.token;
				box.add(asset_name);
				
				var item_name = asset_name.text;
				var balanceString = val.balance.toString();
				
				var comps = balanceString.split('.');
				if(comps.length > 1){
					var afterDecimal = comps[1];
			
					if(afterDecimal.length > 5){
						afterDecimal = afterDecimal.substring(0, 5);
					}
					
					balanceString = comps[0] + '.' + afterDecimal;
				}
				var unconf = ((val.unconfirmed_balance != 0) ? val.unconfirmed_balance : '');
				if( unconf > 0 ) unconf = '+' + unconf;
				unconf = unconf.toString();
				
				var comps2 = unconf.split('.');
				if(comps2.length > 1){
					var afterDecimal2 = comps2[1];
			
					if(afterDecimal2.length > 5){
						afterDecimal2 = afterDecimal2.substring(0, 5);
					}
				
					unconf = comps2[0] + '.' + afterDecimal2;
				}
				balanceString = numberWithCommas(balanceString);
				balanceString = balanceString + unconf;
				
				var atrib = Ti.UI.createAttributedString({
	 				text: balanceString,
					attributes: [{
			 			type: Ti.UI.ATTRIBUTE_FONT,	
			 			value: { fontSize:10, fontWeight:'normal'},
			 			range: [balanceString.indexOf(unconf), (unconf).length]
					}]
				});
				var balance = _requires['util'].makeLabel({
					text : balanceString,
					font : {
						fontSize : 18,
						fontWeight : 'normal'
					},
					width:150,
					height:40,
					textAlign : 'right',
					top : 4,
					right : 10,
					minimumFontSize : 8
				});
				balance.attributedString = atrib;
				box.add(balance);

				var item_balance = balance.text;
				var border = Ti.UI.createView({
					'width' : '95%',
					height : 1,
					backgroundColor : '#ececec',
					bottom : 0,
					opacity : 1
				});
				box.add(border);

				var info_button = _requires['util'].group({
					'info_icon' : _requires['util'].makeImage({
						image : '/images/icon_info.png',
						width : 25,
						height : 25
					})
				});
				info_button.width = 60;
				info_button.height = 60;
				info_button.left = 45;
				info_button.top = 20;
				
				var send_button = _requires['util'].group({
					'send_icon' : _requires['util'].makeImage({
						image : '/images/icon_send.png',
						width : 28,
						height : 28
					})
				});
				send_button.width = 60;
				send_button.height = 50;
				send_button.right = 10;
				send_button.bottom = -5;

				var asset_array = new Array();
				asset_array.balance = val.balance;
				asset_array.fiat_balance = _requires['util'].makeLabel({
					text : '',
					font : {
						fontFamily : 'Helvetica Neue',
						fontSize : 12,
						fontWeight : 'normal'
					},
					textAlign : 'right',
					top : 36,
					right : 10
				});
				box.add(asset_array.fiat_balance);
				assets_info[val.token] = asset_array;
				
				(function(val, assets_info, box) {
					var timer = setInterval(function() {
						if( globals.tiker ){
							clearInterval(timer);
							var key = val.token;
							if (assets_info.hasOwnProperty(key)) {
								var asset_object = assets_info[key];
								if (key === 'BTC' || key === 'XCP') {
									if (key === 'XCP' && !isFinite(asset_object.balance)) globals.reorg_occured();
									asset_object.fiat_balance.text = _requires['tiker'].to(key, asset_object.balance, _requires['cache'].data.currncy);
								} else {
									_requires['network'].connectGETv2({
										'method' : 'market/' + key + '/price',
										'callback' : function(result) {
											var the_asset_object = assets_info[key];
											if (result.XCP.price > 0) {
												var xcpval = result.XCP.price * the_asset_object.balance;
												the_asset_object.fiat_balance.text = _requires['tiker'].to('XCP', xcpval, _requires['cache'].data.currncy, 4);
											} else {
												the_asset_object.fiat_balance.text = '-';
											}
										}
									});
								}
							}
						}
					}, 500);
				})(val, assets_info, box);
				
				if( val.token === 'BTC' ) image = '/images/asset_bitcoin.png';
				else if( val.token === 'XCP' ) image = '/images/asset_xcp.png';
				else image = Alloy.CFG.api_uri + 'v2/tokens/'+val.token+'/image?width=100&X-Api-Key=' + Alloy.Globals.api_key;
				var token_image = Ti.UI.createImageView({
					defaultImage: '/images/blankPlaceholder.png',
					image: image,
					width: 48, height: 48,
					top: 7, left: 7
				});
				box.add(token_image);
				
				info_button.is = true;
				(function(info_button) {
					info_button.addEventListener('touchend', function(e) {
						if (info_button.is) {
							info_button.is = false;
							var token = info_button.parent.children[0].asset;
							if (token !== 'BTC') {
								info_button.opacity = 0.1;
								info_button.animate({
									opacity : 1.0,
									duration : 200
								}, function() {
									if (!globals.is_scrolling){
										_windows['weblink'].run({
								            'path': Alloy.CFG.walletapp_uri + 'explorer/#/tokens/' + token,
								            'barColor': '#009688'
								        });
									}
									/*
										_windows['assetinfo'].run({
											'asset' : token
										});
									*/
									info_button.is = true;
								});
							}
						}
					});
				})(info_button);

				send_button.is = true;
				(function(send_button, val, asset_array) {
					send_button.addEventListener('touchend', function(e) {
						if (send_button.is) {
							send_button.is = false;
							var asset = val.token;
							var balance = val.balance;
							
							send_button.opacity = 0.1;
							send_button.animate({
								opacity : 1.0,
								duration : 100
							}, function() {
								if (!globals.is_scrolling){
									_windows['send'].run({
										'asset': asset,
										'balance': balance,
										'asset_array': asset_array
									});
								}
								send_button.is = true;
							});
						}
					});
				})(send_button, val, asset_array);

				if (val.token !== 'BTC' && val.token !== 'XCP') box.add(info_button);
				box.add(send_button, val.balance);
		
				globals.balancesContentHeight += box.height;
				balance_view.add(box);
			}
			if( OS_ANDROID && isAddExtra && globals.balances.length == globals.balancesContentHeight / 90 ){
				balance_view.add(createBox({ height : 90 }));
				isAddExtra = false;
			}
		}
		globals.loadBalance = function(bool, l) {
			if(OS_IOS){
				balance_view.bubbleParent = false;
				balance_view.canCancelEvents = false;
			}
			globals.balancesContentHeight = 0;
			var loading = l;
			if(bool){
				loading = _requires['util'].showLoading(home_view, {
					width : Ti.UI.FILL,
					height : Ti.UI.FILL,
					message : L('label_load_tokens')
				});
			}
			if( balance_error != null ){
				home_view.remove(balance_error);
				balance_error = null;
			}
			_requires['network'].connectGETv2({
				'method' : 'addresses/' + _requires['cache'].data.address + '/balances',
				'callback' : function(result) {
					globals.balances = result;
					if( OS_IOS ) balance_view.contentHeight = result.length * 100 + 150;
					
					if( globals.dex_init != null ) globals.dex_init();
					home_title_center.opacity = 1;
					balance_view.removeAllChildren();
					
					amountToAdd = 10;
					currentBalances = result;
					currentBalanceIndex = amountToAdd;
					
					currentBalances = result.slice(0,currentBalanceIndex);
					addRowsToBalances();
					
					offsetHeight = (100 * amountToAdd) - balance_view.height;
					currentOffset = offsetHeight;
					if (bool) {
						_requires['layer'].addPullEvent(balance_view, {
							parent : view,
							scrollableView : balance_view,
							margin_top : 80,
							callback : function(l) {
								globals.loadBalance(false, l);
							}
						});
					}
				},
				'onError' : function(error) {
					var dialog = _requires['util'].createDialog({
						'title': error.type,
						'message': error.message,
						'buttonNames': [L('label_close')]
					}).show();
					
					if (balance_error == null) {
						balance_error = _requires['util'].group({
							'text' : _requires['util'].makeLabel({
								text : L('text_balance_error'),
								font : {
									fontSize : 15
								},
								color : '#ffffff'
							})
						});
						balance_error.backgroundColor = 'E43E44';
						balance_error.opacity = 0.8;
						balance_error.height = 50;
						balance_error.width = '100%';
	
						balance_error.addEventListener('touchstart', function() {
							globals.loadBalance(true);
						});
						home_view.add(balance_error);
					}
				},
				'always' : function() {
					if (loading != null) loading.removeSelf();
					
				}
			});
		};
		
		
		var t = Ti.UI.create2DMatrix();
		t = t.rotate(180);
		var t2 = Ti.UI.create2DMatrix();
		t2 = t2.rotate(0);
		var refreshAnimate2 = Ti.UI.createAnimation({
			transform : t2,
			duration : 0,
			repeat : 1
		});
		var refreshAnimate = Ti.UI.createAnimation({
			transform : t,
			duration : 200,
			repeat : 10
		});
				
		var refresh_button = _requires['util'].makeImageButton({
			image : '/images/icon_refresh.png',
			width : 25,
			height : 25,
			right : 10,
			top : 28,
			listener : function() {
				refresh_button.animate(refreshAnimate);
				
				setTimeout(function() { refresh_button.animate(refreshAnimate2); }, 2100);
				//loadHistory(true);
				globals.loadBalance(true);
			}
		});
		top_bar.add(refresh_button);
		
		var createTokenFontSize = 10;
		var createTokenHeight = 8;
		if(OS_ANDROID){
			createTokenFontSize ="7sp";
			createTokenHeight = 9;
		}
		var createTokenButton = _requires['util'].group({
			'plus_icon' : _requires['util'].makeImage({
							image : '/images/icon_plus.png',
							width : 33,
							height : 33
						}),
						'create_button' : Ti.UI.createButton({
							backgroundColor : "transparent",
							title : L('label_createtoken'),
							height:createTokenHeight,
							top:0,
							color : 'white',
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : createTokenFontSize ,
								fontWeight : 'normal'
							},
						})
					}, 'vertical');
					
				   if(OS_IOS){
					createTokenButton.bottom = 3;
				    createTokenButton.left = 5;
				   }
				   else{
				   	 createTokenButton.left = 0;
				   	 createTokenButton.width = 70;
				   }
				    
					createTokenButton.addEventListener('click', function() {
						if (!globals.is_scrolling){
							var dialog = _requires['util'].createDialog({
								title : L('label_createatindieboard'),
								message : L('text_createatindieboard'),
								buttonNames : [L('label_cancel'), L('label_createatindieboard_yes')]
							});
							dialog.addEventListener('click', function(e) {
								if (e.index != e.source.cancel) {
									indieboard('/createtoken');
								}
							});
							dialog.show();
						}
					});
					top_bar.add(createTokenButton);
	
		if (OS_ANDROID) {
			refresh_button.top = 20;
		}
	
		var regist = null,
		    isResume = true;
	
		function closeMenu() {
			setTimeout(function() {
				menu_view_back.hide();
			}, 300);
			walletViewOpen = false;
			wallet_view.animate(closeWalletAnimation);
			wallet_arrow.animate(rightArrowAnimation);
			menu_view.animate(closeMenuAnimation);
			menu_view_back.animate(closeMenuBackAnimation);
		}
	
		function check_passcode() {
			if (regist != null) {
				if (globals.keepRegister) {
					var timer = setInterval(function() {
						if (globals.keepRegisterStart) {
							clearInterval(timer);
							globals.keepRegisterStart = false;
							
							regist();
						}
					}, 500);
				} else{
					
					regist();
				}
			}
		}
		check_passcode();
	
		if (OS_ANDROID) {
			theWindow.addEventListener('android:back', function() {
				var activity = Ti.Android.currentActivity;
				activity.finish();
			});
		}
		if (OS_IOS) {
			Ti.App.addEventListener('resumed', function() {
				if (isResume) {
					globals.keepRegister = false;
					check_passcode();
				} else
					isResume = true;
			});
		}
	
		tab_bar_home = Ti.UI.createView({
			backgroundColor : '#ececec',
			width : '100%',
			height : 50
		});
		tab_bar_home.bottom = 0;
		var tabBorder = Ti.UI.createView({
			'width' : '100%',
			height : 1,
			backgroundColor : 'black',
			top : 0,
			opacity : 0.2
		});
		tab_bar_home.add(tabBorder);
	
		if (OS_ANDROID) tab_bar_home.height = 60;
		
		var homeTab = _requires['util'].group({
			button : _requires['util'].makeImageButton({
				image : '/images/icon_home_active.png',
				width : 30,
				height : 30,
	
			}),
			label : _requires['util'].makeLabel({
				text : L('label_tab_home'),
				textAlign : 'center',
				color : '#e54353',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'light'
				},
			})
		}, 'vertical');
		homeTab.top = 5;
		homeTab.left = 15;
		
		var white_view = Ti.UI.createView({
			backgroundColor : '#FFFFFF',
			width : '100%',
			height : Ti.UI.FILL
		});
		
		var top_bar_placeholder = Ti.UI.createView({
			backgroundColor : '#e54353',
			width : Ti.UI.FILL,
			height : 60
		});
		top_bar_placeholder.top = 0;
		white_view.add(top_bar_placeholder);
		
		homeTab.addEventListener('touchstart', function(e) {
			showHome('none');
		});
		tab_bar_home.add(homeTab);
	
		var receiveTab = _requires['util'].group({
			button : _requires['util'].makeImageButton({
				image : '/images/icon_receive.png',
				width : 30,
				height : 30,
			}),
			label : _requires['util'].makeLabel({
				text : L('label_tab_receive'),
				textAlign : 'center',
				color : '#929292',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'light'
				},
			})
		}, 'vertical');
		receiveTab.top = 5;
		receiveTab.left = '25%';
		receiveTab.addEventListener('touchstart', function(e) {
			showReceive('none');
		});
		tab_bar_home.add(receiveTab);
	
		var exchangeTab = _requires['util'].group({
			button : _requires['util'].makeImageButton({
				image : '/images/icon_exchange.png',
				width : 30,
				height : 30,
			}),
			label : _requires['util'].makeLabel({
				text : L('label_tab_exchange'),
				textAlign : 'center',
				color : '#929292',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'light'
				},
			})
		}, 'vertical');
		exchangeTab.top = 5;
		exchangeTab.center = '50%';
		exchangeTab.addEventListener('touchstart', function(e) {
			showExchange('none');
		});
		tab_bar_home.add(exchangeTab);
	
		var historyTab = _requires['util'].group({
			button : _requires['util'].makeImageButton({
				image : '/images/icon_history.png',
				width : 30,
				height : 30,
			}),
			label : _requires['util'].makeLabel({
				text : L('label_tab_history'),
				textAlign : 'center',
				color : '#929292',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'light'
				},
			})
		}, 'vertical');
		historyTab.top = 5;
		historyTab.right = '24%';
		
		Ti.API.isHistoryloaded = false;
		historyTab.addEventListener('touchstart', function(e) {
			showHistory('none');
		});
		
		function showHome(animation){
			middle_view_scroll.setCurrentPage(0);
			setPage();
		}
		function showReceive(animation){
			middle_view_scroll.setCurrentPage(1);
			setPage();
		}
		function showExchange(animation){
			middle_view_scroll.setCurrentPage(2);
			setPage();
		}
		globals.showExchange = showExchange;
		
		function showHistory(animation){
				middle_view_scroll.setCurrentPage(3);
				setPage();
		}
		var walletViewOpen = false;
		function showWalletMenu() {
			if (walletViewOpen == false) {
				walletViewOpen = true;
				wallet_view.animate(openWalletAnimation);
				wallet_arrow.animate(downArrowAnimation);
			}
			else {
				walletViewOpen = false;
				wallet_view.animate(closeWalletAnimation);
				wallet_arrow.animate(rightArrowAnimation);
			}
		}
		tab_bar_home.add(historyTab);
		var slideViewFromRight = Ti.UI.createAnimation({
			left : 0,
			duration : 100
		});
		var slideViewFromLeft = Ti.UI.createAnimation({
			left : 0,
			duration : 100
		});
		
		var slideViewOutRight = Ti.UI.createAnimation({
			left : (_requires['util'].getDisplayWidth() * -1),
			duration : 100
		});
		var slideViewOutLeft = Ti.UI.createAnimation({
			left : _requires['util'].getDisplayWidth(),
			duration : 100
		});
	
		var openMenuAnimation = Ti.UI.createAnimation({
			right : 0,
			duration : 200
		});
		var openMenuBackAnimation = Ti.UI.createAnimation({
			backgroundColor : '#66000000',
			duration : 200
		});
	
		var closeMenuAnimation = Ti.UI.createAnimation({
			right : menu_view.width * -1,
			duration : 200
		});
		var closeMenuBackAnimation = Ti.UI.createAnimation({
			backgroundColor : 'transparent',
			duration : 200
		});
	
		var openWalletAnimation = Ti.UI.createAnimation({
			top : menu_top_box.height,
			duration : 200
		});
		var closeWalletAnimation = Ti.UI.createAnimation({
			top : display_height * -1,
			duration : 200
		});
	
		var menuTab = _requires['util'].group({
			button : _requires['util'].makeImageButton({
				image : '/images/icon_menu_active.png',
				width : 30,
				height : 30,
	
			}),
			label : _requires['util'].makeLabel({
				text : L('label_tab_menu'),
				textAlign : 'center',
				color : '#e54353',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'light'
				},
			})
		}, 'vertical');
		menuTab.top = 5;
		menuTab.right = 15;
		menuTab.addEventListener('touchstart', function(e) {
			menu_view_back.show();
			username.title = getUsername();
			menu_view.animate(openMenuAnimation);
			menu_view_back.animate(openMenuBackAnimation);
		});
		tab_bar_home.add(menuTab);
		
		menu_view.right = menu_view.width * -1;
		menu_view_back.hide();
		menu_view_back.backgroundColor = 'transparent';
		
		view.add(middle_view);
		theWindow.add(view);
		theWindow.add(webapps.createView());
		theWindow.add(menu_view_back);
		view.add(webapps.createButton());
		view.add(tab_bar_home);
		
		if( _requires['cache'].data.easypass == null && _requires['cache'].data.isTouchId == null ){
			if( globals.introscreens == null ){
				globals.introscreens = require('/window/introscreens.js');
				globals.introscreens.createView();
			}
			
			view_dex.clear();
			view_history.clear();
			
			view.opacity = 0;
			globals.introscreens.intro_scroll.opacity = 0;
			theWindow.add(globals.introscreens.intro_scroll);
			
			globals.introscreens.intro_scroll.animate({
	    		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT, 
	   			opacity: 1.0, 
	    		duration: 200
			});
		}
		
		setIsResumeFalse = function(){
			isResume = false;
		};
		loadHome = function(){
		 	messageCount = 0;
		 	messageBoxViews = Ti.UI.createView({
				width : '100%',
				height : '100%',
				backgroundColor : 'transparent',
				opacity : 1
			});
		 	
		 	messageBox1 = Ti.UI.createView({
				width : 200,
				height : 120,
				backgroundColor : 'transparent',
				top : 270,
				left: 50,
				opacity : 1
			});
			
			var boxImage1 = _requires['util'].makeImage({
				image : '/images/message_box1.png',
				width : 200,
				height : 120
			});
			
			var box_label1 = _requires['util'].makeLabel({
			text :L('label_box_1'),
			top:10,
			textAlign : 'center',
			color : 'white',
			width: '90%',
			height: '90%',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 14,
				fontWeight : 'light'
			}
			});
			
			messageBox1.add(boxImage1);
			messageBox1.add(box_label1);
			
			messageBox2 = Ti.UI.createView({
				width : 200,
				height : 100,
				backgroundColor : 'transparent',
				top : 170,
				right: 30,
				opacity : 1
			});
			
			var boxImage2 = _requires['util'].makeImage({
				image : '/images/message_box2.png',
				width : 200,
				height : 100
			});
			
			var box_label2 = _requires['util'].makeLabel({
				text :L('label_box_2'),
				textAlign : 'center',
				top:10,
				color : 'white',
				width: '90%',
				height: '90%',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 14,
					fontWeight : 'light'
				}
			});
			
			setTimeout(function() { theWindow.remove(globals.introscreens.intro_scroll);},1100);
			
			messageBox2.add(boxImage2);
			
			messageBox2.add(box_label2);
			
			messageBox3 = Ti.UI.createView({
				width : 200,
				height : 100,
				backgroundColor : 'transparent',
				bottom : 60,
				left: 90,
				opacity : 1
			});
			
			var boxImage3 = _requires['util'].makeImage({
				image : '/images/message_box3.png',
				width : 200,
				height : 100
			});
			
			var box_label3 = _requires['util'].makeLabel({
				text :L('label_box_3'),
				textAlign : 'center',
				color : 'white',
			    top:-10,
				width: '90%',
				height: '90%',
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 14,
					fontWeight : 'light'
				}
			});
			
			messageBox3.add(boxImage3);
			
			messageBox3.add(box_label3);
			
			messageBoxViews.add(messageBox1);
			setTimeout(function() { view.add(messageBoxViews); }, 500);
			
			view.opacity = 1;
			
			messageBox1.addEventListener('touchstart', function(e) {
				messageBoxViews.remove(messageBox1);
				setTimeout(function() {  messageBoxViews.add(messageBox2); messageCount = 1; }, 100);
			});
			messageBox2.addEventListener('touchstart', function(e) {
				messageBoxViews.remove(messageBox2);
				setTimeout(function() {  messageBoxViews.add(messageBox3); messageCount = 2; }, 100);
			});
			messageBox3.addEventListener('touchstart', function(e) {
				view.remove(messageBoxViews);
			});
			messageBoxViews.addEventListener('touchstart', function(e) {
				if(messageCount == 0){
					 messageBoxViews.remove(messageBox1);
					 setTimeout(function() { messageCount = 1; messageBoxViews.add(messageBox2); },100);
				}
				else if(messageCount == 1){
					messageBoxViews.remove(messageBox2);
					setTimeout(function() {
						messageCount = 2;
						messageBoxViews.add(messageBox3);
					},100);
				}
				else {
					view.remove(messageBoxViews);
				}
			});
		};
		
		if (OS_ANDROID) theWindow.open();
		
		globals._parseArguments();
		
		theWindow.add(picker_fee.picker);
	}
	
	continueHome();

};
Ti.API.home_win = theWindow;
if (OS_ANDROID) {
	theWindow.addEventListener("open", function() {
		globals.main_window.activity.addEventListener('resume', function(e) {
			globals._parseArguments();
		});
	});
}
