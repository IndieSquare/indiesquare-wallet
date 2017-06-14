module.exports = (function() {
	var self = {};
	
	
	var barcodereader = undefined;
	var barcodeCodeWindow = undefined;
	var barcodeCodeView = undefined;
	var camera_callback = undefined;
	if (Ti.Platform.osname === 'android') {
		barcodereader = require('com.acktie.mobile.android.barcode');
	}

	// All supported Barcode types
	var ALL = ["QRCODE"];
	
	function success_scan(data) {
		if(data != undefined && data.data != undefined) {
			Titanium.Media.vibrate();
			
			var obj = [];
			obj["barcode"] = data.data;
			camera_callback.callback(obj);
			
			barcodeCodeWindow.close();
		}
	};
	
	function cancel_scan() {
		barcodeCodeWindow.close();
	};
	
	function error_scan() {
		barcodeCodeWindow.close();
	};

	function scanBarcodeFromCamera() {
		var options = {
			backgroundColor : 'black',
			width : '100%',
			height : '90%',
			top : 0,
			left : 0,

			overlay : { imageName: "myOverlay.png", 
				alpha: 0.35
			},
			barcodes:ALL,
			success : success_scan,
			cancel : cancel_scan,
			error : error_scan,
		};
	
		barcodeCodeWindow = Ti.UI.createWindow({
			backgroundColor : 'black',
			width : '100%',
			height : '100%',
		});
		barcodeCodeView = barcodereader.createBarcodeView(options);
	
		var closeButton = Ti.UI.createButton({
			title : "close",
			bottom : 0,
			left : 0
		});
		var lightToggle = Ti.UI.createSwitch({
			value : false,
			bottom : 0,
			right : 0
		});
	
		closeButton.addEventListener('click', function() {
			barcodeCodeView.stop();
			barcodeCodeWindow.close();
		});
	
		lightToggle.addEventListener('change', function() {
			barcodeCodeView.toggleLight();
		});
	
		barcodeCodeWindow.add(barcodeCodeView);
		barcodeCodeWindow.add(closeButton);
	
		if (options.userControlLight != undefined && options.userControlLight) {
			barcodeCodeWindow.add(lightToggle);
		}
		
		// NOTE: Do not make the window Modal.  It screws stuff up.  Not sure why
		barcodeCodeWindow.open();
	}

	
	function merge( obj1, obj2 ){
	    if( !obj2 ) obj2 = {};
	    for (var attrname in obj2) {
	        if (obj2.hasOwnProperty(attrname)) obj1[attrname] = obj2[attrname];
	    }
	    return obj1;
	};
	
	function getFont( params ){
		var basic_font = { fontSize: 15, fontFamily:'HelveticaNeue-Light' };
		if( params.font ) basic_font = merge(basic_font, params.font);
		
		return basic_font;
	};
	
	function makeAnimation( directory, num, params ){
		var images = [];
		
		for( var i = 0; i < num; i++ ){
			images.push('/images/'+directory+'/'+i+'.png');
		}
		var basic = {
			 'images': images,
		};
		var animation = Ti.UI.createImageView( merge(basic, params) );
		animation.start();
		
		return animation;
	};
	
	self.makeImage = function( params ){
		var image = Ti.UI.createImageView( params );
		return image;
	};
	
	self.makeImageButton = function( params ){
		var image = Ti.UI.createImageView(params);
		if( params.listener != null ){
			image.addEventListener('click', function(){
				params.listener(image);
			});
		}
		return image;
	};
	
	self.createFeeSelector = function( callback ){
		var slide_in;
		var slide_out;
		var display_height = self.getDisplayHeight();
		if (OS_ANDROID) {
			slide_in = Ti.UI.createAnimation({ top: display_height - 320, duration:200 });
			slide_out = Ti.UI.createAnimation({ top : display_height, duration : 200 });
		} else {
			slide_in = Ti.UI.createAnimation({ bottom: 0, duration:200 });
			slide_out = Ti.UI.createAnimation({ bottom : -390, duration : 200 });
		}
		
		var close_fee = self.makeLabel({
			text : L('label_close'),
			color : 'white',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 15,
				fontWeight : 'bold'
			},
			height : 30,
			right : 10
		});
		close_fee.addEventListener('click',function() {
			picker_fee.animate(slide_out);
		});
		var picker_toolbar_fee = Ti.UI.createView({
			width: '100%',
			height: (OS_ANDROID)? 50: 40,
			backgroundColor: '#e54353'
		});
		picker_toolbar_fee.add(close_fee);
		
		var highBox = self.group({
			"title":Ti.UI.createLabel({
				text : L('title_settings_high_fee'),
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 20,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				left :10,
				textAlign: 'left',
			}),
			"subtitle":Ti.UI.createLabel({
				text : L('subtitle_settings_high_fee'),
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				left :10,
				textAlign: 'left',
			}),
			
		}, 'vertical');
		
		var medBox = self.group({
			"title":Ti.UI.createLabel({
				text : L('title_settings_med_fee'),
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 20,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				left :10,
				textAlign: 'left',
			}),
			"subtitle":Ti.UI.createLabel({
				text : L('subtitle_settings_med_fee'),
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				left :10,
				textAlign: 'left',
			}),
			
		}, 'vertical');
		
		var lowBox = self.group({
			"title":Ti.UI.createLabel({
				text : L('title_settings_low_fee'),
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 20,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				left :10,
				textAlign: 'left',
			}),
			"subtitle":Ti.UI.createLabel({
				text : L('subtitle_settings_low_fee'),
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'normal'
				},
				textAlign: 'left',
				color : 'black',
				width : 'auto',
				height : 'auto',
				left :10
			}),
			
		}, 'vertical');
		
		var customBox = self.group({
			"title":Ti.UI.createLabel({
				text : L('title_settings_custom_fee'),
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 20,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				left :10,
				textAlign: 'left',
			}),
			"subtitle":Ti.UI.createLabel({
				text : L('subtitle_settings_custom_fee'),
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'normal'
				},
				textAlign: 'left',
				color : 'black',
				width : 'auto',
				height : 'auto',
				left :10
			}),
			
		}, 'vertical');
		
		var border = Ti.UI.createView({
			width : '100%',
			height : 1,
			backgroundColor : 'black',
			top : 10,
			opacity : 0.2
		});
		
		highBox.top = 10;
		medBox.top = lowBox.top = 25;
		customBox.top = 10;
		highBox.width = medBox.width = lowBox.width = customBox.width = '100%';
		highBox.left = medBox.left = lowBox.left = customBox.left = 5;
		highBox.addEventListener('click', function(){
			globals.requires['cache'].data.current_fee = "fastestFee";
			globals.requires['cache'].save();
			picker_fee.animate(slide_out);
			callback('high_fee');
		});
		medBox.addEventListener('click', function(){
			globals.requires['cache'].data.current_fee = "halfHourFee";
			globals.requires['cache'].save();
			picker_fee.animate(slide_out);
			callback('med_fee');
		});
		lowBox.addEventListener('click', function(){
			globals.requires['cache'].data.current_fee = "lowFee";
			globals.requires['cache'].save();
			picker_fee.animate(slide_out);
			callback('low_fee');
		});
		customBox.addEventListener('click', function(){
			var dialog = self.createInputDialog({
				title : L('label_input_custom'),
				message : L('text_input_custom'),
				value : '',
				keyboardType : Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD,
				buttonNames : [L('label_close'), L('label_apply')]
			});
			dialog.origin.addEventListener('click', function(e) {
				var inputText = (OS_ANDROID) ? dialog.androidField.getValue() : e.text;
				if (e.index != e.source.cancel) {
					if( isFinite(inputText) ){
						globals.requires['cache'].data.current_fee = inputText;
						globals.requires['cache'].save();
						picker_fee.animate(slide_out);
						callback(inputText);
					}
					else{
						self.createDialog({
							'message': L('label_input_custom_nonumber'),
							'buttonNames': [L('label_close')]
						}).show();
					}
				}
			});
			dialog.origin.show();
		});
		
		var picker_fee = self.group({
			"toolbar": picker_toolbar_fee,
			"high": highBox,
			"medium": medBox,
			"low": lowBox,
			'boarder': border,
			"custom": customBox,
		}, 'vertical');
		
		picker_fee.width = '100%';
		picker_fee.height = (OS_ANDROID)? 350: 280;
		picker_fee.backgroundColor = 'white';
		picker_fee.left = 0;
		
		if(OS_ANDROID) picker_fee.top = display_height;
		else picker_fee.bottom = -280;
		
		return {
			'picker': picker_fee,
			'open': function(){
				picker_fee.animate(slide_in);
			},
			'close': function(){
				picker_fee.animate(slide_out);
			}
		};
	};
	
	self.makeButton = function( params ){
		var view = Ti.UI.createView( params );
		var label = self.makeLabel({
			text: params.label,
			color: params.color || '#ffffff',
			font: params.font
		});
		view.add(label);
		
		if( params.listener != null ){
			if( params.range != null ){
				params.width = params.range.width;
				params.height = params.range.height;
				params.backgroundColor = null;
				params.borderRadius = null;
				params.borderColor = 'transparent';
				var view_range = Ti.UI.createView(params);
				view_range.addEventListener('click', function(){
					params.listener(view);
				});
				view_range.setLabel = function( new_label ){
					label.text = new_label;
				};
				view_range.add(view);
				
				return view_range;
			}
			else{
				view.setLabel = function( new_label ){
					label.text = new_label;
				};
				view.addEventListener('click', function(){
					params.listener(view);
				});
			}
		}
		return view;
	};
	
	self.makeTextField = function( params ){
		var basic = {
			clearButtonMode: Ti.UI.INPUT_BUTTONMODE_ONFOCUS,
			keyboardType: Ti.UI.KEYBOARD_TYPE_DEFAULT,
			returnKeyType: Ti.UI.RETURNKEY_DONE,
			borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			color: '#000000'
		};
		if( params.border === 'hidden' ){
			if( OS_ANDROID ){
				//basic.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
				basic.backgroundColor = 'transparent';
				basic.borderWidth = 0;
				basic.borderColor = 'transparent';
				params.border = null;
			}
			else{
				basic.borderStyle = Ti.UI.INPUT_BORDERSTYLE_NONE;
			}
		}
		else{
			if( OS_ANDROID ){
				basic.backgroundColor = '#ffffff';
				basic.borderWidth = 1;
				basic.borderColor = '#a9a9a9';
				params.border = null;
			}
		}
		params.font = getFont( params );
		
		if( OS_ANDROID ){
			if( params.keyboardType == Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD ){
				params.keyboardType = Ti.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION;
			}
			if( params.height != null ){
				params.height += 5;
			}
		}
		
		var field = Ti.UI.createTextField( merge(basic, params) );
		if( params.keyboardType == Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD ){
			if( OS_IOS ){
				var doneButton = Ti.UI.createButton({ title : L('label_close'), width : 67, height : 32 });
				var flexSpace = Ti.UI.createButton({ systemButton:Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE });
				field.keyboardToolbarHeight = 30;
				field.keyboardToolbar = [flexSpace, flexSpace, doneButton];
				
				(function(field, doneButton) {
					doneButton.addEventListener('click', function(e){
						field.blur();
					});
					field.addEventListener('focus', function(){
						Ti.API.info('focus');
					});
				})(field, doneButton);
			}
		}
		return field;
	};
	
	self.makeCustomTextField = function( params ){
		var basic = {
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE,
		};
		
		var field = Ti.UI.createView(merge(basic, params));
        if( params.hintText ){
	    	var text = self.makeLabel({
				text: params.hintText,
				left: 10,
				color: '#a6a8ab'
			});
			field.text = text;
			field.add(text);
		}
		
		if( params.type === 'native' ){
			params.left = 10;
			params.width = Ti.UI.FILL;
			params.top = null; params.bottom = null;
			
			var textField = self.makeTextField(params);
			textField.addEventListener('blur', function(){
				var text = textField.getValue();
				field.text.visible = true;
				textField.visible = false;
				
				if( text.length > 0 ){
					field.text.text = text;
					field.text.color = '#000000';
				}
				else{
					field.text.text = params.hintText;
					field.text.color = '#a6a8ab';
				}
			});
			textField.visible = false;
			
			field.textField = textField;
			field.add(textField);
		}
		
		field.setValue = function( value ){
			if( value.length > 0 ){
				field.text.text = value;
				field.text.color = '#000000';
			}
			else{
				field.text.text = params.hintText;
				field.text.color = '#a6a8ab';
			}
			if( field.textField != null ) field.textField.setValue( value );
		};
		
		field.getValue = function(){
			return field.text.text;
		};
		
		field.blur = function(){
			if( field.textField != null ){
				textField.visible = false; field.text.visible = true;
				textField.blur();
			}
		};
		
		field.focus = function(){
			if( field.textField != null ){
				textField.visible = true; field.text.visible = false;
				textField.focus();
			}
		};
		
		field.addEventListener('click', function(){
			if( params.type === 'native' ){
				field.text.visible = false;
				if( !field.textField.visible ){
					field.textField.visible = true;
					field.textField.focus();
				}
			}
		});
		
		return field;
	};
	
	self.makeLabel = function( params ){
		var basic = {
			color: '#000000',
		    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		};
		params.font = getFont( params );
		var label = Ti.UI.createLabel( merge(basic, params) );
		
		return label;
	};
	
	self.makeAnimation = makeAnimation;
	
	self.openScanner = function( v ){
		
		function open(){
			
			var scanditsdk = require("com.mirasense.scanditsdk");
			
			if( OS_ANDROID ){
				scanditsdk.appKey = "xKpFXhlXEeSO2ceePbErdDelCupO9KN+wZMNnAMjDQU"; 
				scanditsdk.cameraFacingPreference = 0;
			}
			
			var window = Ti.UI.createWindow({  
				title:'Scan QRcode',
				navBarHidden: true
			});
			
			var picker = scanditsdk.createView({
				width: Ti.UI.FILL,
				height: Ti.UI.FILL
			});
			
			if( OS_ANDROID ) picker.init();
			else picker.init("xKpFXhlXEeSO2ceePbErdDelCupO9KN+wZMNnAMjDQU", 0);
			
			picker.showSearchBar(true);
			picker.showToolBar(true);
			picker.setSuccessCallback(function(e) {
				v.callback(e);
				if (picker != null) {
					picker.stopScanning();
					window.remove(picker);
				}
				window.close();
			});
			
			picker.setCancelCallback(function(e) {
				if (picker != null) {
					picker.stopScanning();
					window.remove(picker);
				}
				window.close();
			});
			
			window.add(picker);
			window.addEventListener('open', function(e) {
				if( OS_IOS ){
		    		picker.setOrientation(Ti.UI.orientation);
				}	
				else {
					picker.setOrientation(window.orientation);
				}
				picker.setSize(Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight);
				picker.startScanning();
			});
			
			window.open();
		}
		if( OS_ANDROID ){
			camera_callback = v;
			var permission = 'android.permission.CAMERA';
			var has = Ti.Android.hasPermission(permission);
			if( !has ){
				Ti.Android.requestPermissions([permission], function(e) {
			    	if( e.success ){
			    		
						scanBarcodeFromCamera(v);
	
			    	}
			    	else{
			    		var dialog = self.createDialog({
							message: L('label_permission_deny_camera'),
							buttonNames: [L('label_close'), L('label_go_settings')]
						});
						dialog.addEventListener('click', function(e) {
							if (e.index != e.source.cancel) {
								var intent = Ti.Android.createIntent({
									action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
									data: 'package:' + Ti.App.id
								});
								intent.addFlags(Ti.Android.FLAG_ACTIVITY_NEW_TASK);
								Ti.Android.currentActivity.startActivity(intent);
							}
						});
						dialog.show();
			    	}
				});
			}
			else scanBarcodeFromCamera(v);
		}
		else open();
	};
	
	self.group = function( params, layout ){
		var basic = {
			width: Ti.UI.SIZE,
        	height: Ti.UI.SIZE
		};
		if( layout != null ) basic.layout = layout;
		
		var group = Ti.UI.createView(basic);
		for( key in params ){
			group.add(params[key]);
			group[key] = params[key];
		}
		
		group.addView = function( params ){
			for( key in params ){
				group.add(params[key]);
				group[key] = params[key];
			}
		};
		
		group.removeView = function( params ){
			for( key in params ){
				group.remove(params[key]);
				group[key] = null;
			}
		};
		
		return group;
	};
	
	self.createDialog = function( params, listener ){
		if( params.title == null ) params.title = '';
		if( params.buttonNames != null && params.buttonNames.length == 2 ){
			if( OS_ANDROID ){
				params.buttonNames.reverse();
				if( params.cancel == null ) params.cancel = 1;
			}
			else if( params.cancel == null ) params.cancel = 0;
		}
		var dialog = Ti.UI.createAlertDialog(params);
		if( listener!= null ) dialog.addEventListener('click', listener);
		
		return dialog;
	};
	
	self.createInputDialog = function( params ){
		var dialog = {};
		if( params.title == null ) params.title = '';
		
		var origin;
		if( OS_ANDROID ){
			var inputView = Ti.UI.createView({ backgroundColor:'#ffffff' });
			var style = {
		        hintText: (params.hintText)? params.hintText: '',
		        height: 45,
		        width: '100%',
		        color: '#000000',
		        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED
			};
			if( params.passwordMask ) style.passwordMask = true;
			if( params.keyboardType ) style.keyboardType = params.keyboardType;
			
		 	dialog.androidField = Ti.UI.createTextField(style);
		    inputView.add( dialog.androidField );
		    if( params.buttonNames.length == 2 ){
		    	params.buttonNames.reverse();
		    	if( params.cancel == null ) params.cancel = 1;
		    }
			origin = Ti.UI.createOptionDialog({
	            title: params.title,
	            message: params.message,
	            androidView: inputView,
	            buttonNames: params.buttonNames,
	            cancel: params.cancel
	        });
	        if( params.value ) dialog.androidField.setValue( params.value );
	   	}
	   	else{
	   		if( params.buttonNames.length == 2 ){
		    	if( params.cancel == null ) params.cancel = 0;
		    }
	   		var style = {
				title: params.title,
				message: params.message,
				style: Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT,
				buttonNames: params.buttonNames,
				cancel: params.cancel
			};
			if( params.passwordMask ) style.style = Ti.UI.iPhone.AlertDialogStyle.SECURE_TEXT_INPUT;
			origin = Ti.UI.createAlertDialog(style);
		}
		dialog.origin = origin;
		
		return dialog;
	};
	
	self.createEasyInput = function( params ){
		var inputView = {};
		
		inputView.view = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			top: self.getDisplayHeight() - 1
		});
		
		var back = Ti.UI.createView({
			backgroundColor: '#ffffff',
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			top: 0,
			opacity: 0.95
		});
		inputView.view.add(back);
		
		function createButton(sign, params, callback ){
			if( sign === L('label_close') || sign === L('label_delete') || sign === L('label_reconfirm_redo') ){
				font = 15;
				opacity = 0.0;
			}
			else{
				font = 25;
				opacity = 1.0;
			}
			var button = self.group({
				image: self.makeImage({
				    image: '/images/img_button_easy_ios.png',
				    width: 60,
				    opacity: opacity
				}),
				text: self.makeLabel({
					text: sign,
					color: '#e54353',
					font:{ fontSize: font },
				}),
			});
			button.top = params.top;
			button.left = params.left;
			
			button.addEventListener('click', function(){
				callback(sign);
			});
			
			return button;
		}
		
		var comp_marks = {
			m0: self.makeImage({
			    image: '/images/img_easyinput_none.png',
			    width: 12,
			    left: 0
			}),
			m1: self.makeImage({
			    image: '/images/img_easyinput_none.png',
			    width: 12,
			    left: 20
			}),
			m2: self.makeImage({
			    image: '/images/img_easyinput_none.png',
			    width: 12,
			    left: 40
			}),
			m3: self.makeImage({
			    image: '/images/img_easyinput_none.png',
			    width: 12,
			    left: 60
			})
		};
		
		var numberArray = new Array();
		var numbers = { reconfirmed: false };
		var callback = function(sign){
			if( sign === L('label_close') ){
				inputView.close();
				if( params.cancel != null ) params.cancel();
			}
			else if( sign === L('label_delete') ){
				if( numberArray.length > 0 ){
					comp_marks['m'+(numberArray.length - 1)].image = '/images/img_easyinput_none.png';
					numberArray.pop();
				}
			}
			else if( sign === L('label_reconfirm_redo') ){
				comp_whole.text.text = L('text_easypass_set');
				numbers = { reconfirmed: false };
				buttons.bc.opacity = 0.0;
				flush();
			}
			else{
				if( numberArray.length < 4 ){
					comp_marks['m'+numberArray.length].image = '/images/img_easyinput_on.png';
					numberArray.push(sign);
					
					if( numberArray.length >= 4 ){
						var number = '';
						for(var i = 0; i < 4; i++) number += numberArray[i];
						
						function flush(){
							for(var i = 0; i < 4; i++){
								comp_marks['m'+i].image = '/images/img_easyinput_none.png';
								numberArray.pop();
							}
						}
						
						var md5 = require('crypt/md5');
						if( params.type === 'reconfirm' ){
							if( numbers.reconfirmed ){
								if( numbers.number === number ){
									params.callback(md5.MD5_hexhash(number));
									inputView.close();
								}
								else{
									flush();
								}
							}
							else{
								comp_whole.text.text = L('text_reconfirm');
								numbers.number = number;
								numbers.reconfirmed = true;
								buttons.bc.opacity = 1.0;
								flush();
							}
						}
						else{
							var cache = require('require/cache');
							var enc_number = md5.MD5_hexhash(number);
							if( enc_number === cache.data.easypass ){
								params.callback(enc_number);
								inputView.close();
							}
							else{
								comp_whole.text.text = L('text_wrongpass');
								flush();
							}
						}
					}
				}
			}
		};
		
		var buttons = self.group({
			b1: createButton('1', {top: 0, left: 0}, callback),
			b2: createButton('2', {top: 0, left: 70}, callback),
			b3: createButton('3', {top: 0, left: 140}, callback),
			b4: createButton('4', {top: 70, left: 0}, callback),
			b5: createButton('5', {top: 70, left: 70}, callback),
			b6: createButton('6', {top: 70, left: 140}, callback),
			b7: createButton('7', {top: 140, left: 0}, callback),
			b8: createButton('8', {top: 140, left: 70}, callback),
			b9: createButton('9', {top: 140, left: 140}, callback),
			b0: createButton('0', {top: 210, left: 70}, callback),
			bc: (params.type === 'reconfirm')? createButton(L('label_reconfirm_redo'), {top: 210, left: -3}, callback): createButton(L('label_close'), {top: 210, left: -3}, callback),
			bd: createButton(L('label_delete'), {top: 210, left: 140}, callback)
		});
		if( params.type === 'reconfirm' ) buttons.bc.opacity = 0.0;
		buttons.top = 120;
		
		var logos = self.group({
			logo: self.makeImage({
			    image: '/images/icon_logo.png',
			    width: 70,
			})
		});
		logos.top = 0;
		
		var marks = self.group(comp_marks);
		marks.top = 80;
		
		var instruction_text = L('text_easypass');
		
		if(params.type === 'reconfirm'){
			instruction_text = L('text_easypass_set');
		}
		else if(params.type === 'change'){
			instruction_text = L('text_easypass_current');
		}
		
		var comp_whole = {
			logos: logos,
			text: self.makeLabel({
				text: instruction_text,
				color: '#e54353',
				font:{ fontSize: 12 },
				top: 95
			}),
			marks: marks,
			buttons: buttons
		};
		var whole_view = self.group(comp_whole);
		inputView.view.add(whole_view);
		
		var inputWindow = null;
		inputView.open = function(){
			inputWindow = Ti.UI.createWindow({ orientationModes: [Ti.UI.PORTRAIT], navBarHidden: true });
			inputWindow.add(inputView.view);
			inputWindow.open();
			
			inputView.view.animate({ top: 0, duration: 500 });
		};
		
		inputView.close = function(){
			inputView.view.animate({ top: self.getDisplayHeight(), duration: 500 }, function(){
				inputWindow.close();
				inputWindow.remove(inputView.view);
				inputView = null;
			});
		};
		
		return inputView;
	};
	
	self.createCustomInput = function( params ){
		var inputView = {};
		
		inputView.view = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: 220,
			bottom: -219
		});
		
		var back = Ti.UI.createView({
			backgroundColor: '#ffffff',
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			top: 0,
			opacity: 0.95
		});
		inputView.view.add(back);
		
		function createButton(sign, params, callback ){
			if( sign === L('label_close') || sign === L('label_delete') || sign === L('label_done') ){
				font = 15;
				opacity = 0.0;
			}
			else{
				font = 25;
				opacity = 1.0;
			}
			var button = self.group({
				image: self.makeImage({
				    image: '/images/img_button_custom.png',
				    width: 70,
				    opacity: opacity
				}),
				text: self.makeLabel({
					text: sign,
					color: '#e54353',
					font:{ fontSize: font },
				}),
			});
			button.bottom = params.bottom;
			button.left = params.left;
			
			button.addEventListener('click', function(){
				callback(sign);
			});
			
			return button;
		}
		
		var text = '';
		var callback = function(sign){
			if( sign === L('label_close') || sign === L('label_done') ){
				inputView.close();
				if( params.cancel != null ) params.cancel();
			}
			else if( sign === '×' ){
				text = text.substr(0, text.length - 1);
				params.textField.setValue(text);
			}
			else{
				if( sign === '.' ){
					if( text.length <= 0 ) text = '0.';
					else if( text.indexOf(sign) == -1 ) text += sign;
				}
				else text += sign;
				
				params.textField.setValue(text);
			}
		};
		
		var buttons = self.group({
			b1: createButton('1', {bottom: 155, left: 0}, callback),
			b2: createButton('2', {bottom: 155, left: 75}, callback),
			b3: createButton('3', {bottom: 155, left: 150}, callback),
			b4: createButton('4', {bottom: 105, left: 0}, callback),
			b5: createButton('5', {bottom: 105, left: 75}, callback),
			b6: createButton('6', {bottom: 105, left: 150}, callback),
			b7: createButton('7', {bottom: 55, left: 0}, callback),
			b8: createButton('8', {bottom: 55, left: 75}, callback),
			b9: createButton('9', {bottom: 55, left: 150}, callback),
			b0: createButton('0', {bottom: 5, left: 75}, callback),
			bd: createButton('×', {bottom: 5, left: 0}, callback),
			be: createButton('.', {bottom: 5, left: 150}, callback),
			bc: createButton(L('label_done'), {bottom: 5, left: 225}, callback)
		});
		buttons.left = 5;
		
		inputView.view.add(buttons);
		
		inputView.open = function(){
			inputView.view.animate({ bottom: 0, duration: 500 });
		};
		
		inputView.close = function(){
			inputView.view.animate({ top: self.getDisplayHeight(), duration: 500 }, function(){ inputView = null; });
		};
		
		return inputView;
	};
	
	self.showLoading = function(parent,  params ){
		params.font = getFont( params );
		params.style = 'dark';
		if( params.width == Ti.UI.FILL && params.height == Ti.UI.FILL ){
			params.backgroundColor = '#ffffff';
			params.opacity = 0.7;
			params.font = { fontSize: 15, fontFamily: 'HelveticaNeue-Light' };
			params.color = '#333333';
		}
		var style = Ti.UI.ActivityIndicatorStyle.PLAIN;
		if( params.style != null ){
			if( params.style === 'dark' ) style = Ti.UI.ActivityIndicatorStyle.DARK;
		}
		params.style = style;
		
		var act = Ti.UI.createActivityIndicator( params );
		act.show();
		
		parent.add(act);
		
		act.removeSelf = function(){
			if( act != null ){
				parent.remove(act);
				act = null;
			}
		};
		
		return act;
	};
	
	self.readQRcode = function( params ){
		self.openScanner({
			'callback': function(e){
				var uri = globals.requires['bitcore'].URI((e.barcode.indexOf('bitcoin:') >= 0)?e.barcode:'bitcoin:'+e.barcode);
				if( uri == null ) uri = globals._parseCip2(e.barcode);
				if( uri == null ){
					if( e.barcode.match(/^indiewallet:\/\//) ){
						globals._parseArguments(e.barcode, true);
					}
					else{
						var matches = e.barcode.match(/[a-zA-Z0-9]{27,34}/);
						var vals = {};
						vals.address = ( matches != null )?matches[0]: null;
						if( e.barcode.indexOf('&') >= 0 ){
							var args = e.barcode.split('&');
							for( var i = 1; i < args.length; i++ ){
								var a = args[i].split('=');
								vals[a[0]] = a[1];
							}
						}
						uri = vals;
					}
				}
				if( uri != null ) params.callback(uri);
			}
		});
	};
	
	self.createSlider = function( params ){
		var slider = {};
		
		slider.is = params.init || false;
		slider.editable = params.editable || true;
		slider.origin = Ti.UI.createView({
			borderRadius: 2,
			backgroundColor: params.init ? '#e54353': '#666666',
			width: 60,
			height: 25
		});
		
		var swit = self.makeImage({
		    image: '/images/settings_slider.png',
		    height: 22.5,
		    width: 64.2
		});
		swit.left = (!params.init)? -18.6 : 16;
		
		slider.origin.add(swit);
		slider.origin.addEventListener('click', function(){
			if( slider.editable ){
				if( slider.is ){
					if( OS_ANDROID ) slider.origin.backgroundColor = '#666666';
					else slider.origin.animate({ backgroundColor: '#666666', duration: 500 });
					
					swit.animate({ left: -18.6, duration: 300}, params.off);
					slider.is = false;
				}
				else{
					if( OS_ANDROID ) slider.origin.backgroundColor = '#e54353';
					else slider.origin.animate({ backgroundColor: '#e54353', duration: 500 });
					swit.animate({ left: 16, duration: 300}, params.on);
					slider.is = true;
				}
			}
		});
		
		slider.on = function(){
			slider.is = true;
			swit.left = 16;
			slider.origin.backgroundColor = '#e54353';
		};
		
		slider.off = function(){
			slider.is = false;
			swit.left = -18.6;
			slider.origin.backgroundColor = '#666666';
		};
		
		return slider;
	};
	
	self.getStatusBarHeight = function(){
		switch ( Ti.Platform.displayCaps.density ) {
			case 160:
			    return 25;
			case 120:
			    return 19;
			case 240:
			    return 38;
			case 320:
			    return 50;
			default:
			    return 25;
		}
	};
	
	self.getDisplayHeight = function(){
		if( OS_ANDROID ){
			return (Ti.Platform.displayCaps.platformHeight / Ti.Platform.displayCaps.logicalDensityFactor) - self.getStatusBarHeight();
		}
		return Ti.Platform.displayCaps.platformHeight;
	};
	
	self.getDisplayWidth = function(){
		if( OS_ANDROID ){
			return (Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor);
		}
		return Ti.Platform.displayCaps.platformWidth;
	};
	
	self.convert_x = function(val){
		return (OS_ANDROID)? (val / Ti.Platform.displayCaps.logicalDensityFactor): val;
	};
	
	self.convert_y = function(val){
		return (OS_ANDROID)? (val / Ti.Platform.displayCaps.logicalDensityFactor): val;
	};
	
	self.isTestAccount = function(){
		return (globals.datas.identifier === 'test' && globals.datas.password === 'test');
	};
	
	self.createTableList = function(params){
		var tableview = Ti.UI.createTableView(params);
		
		tableview.setRowDesign = function(data, func, rowHeight){
			function createRow( key, val ){
				var rowData = {
					height: (params.rowHeight != null)? params.rowHeight: 30
				};
				if( rowHeight != null ) rowData.height = rowHeight;
				if( OS_ANDROID ) rowData.className = 'row';
				
				var row = Ti.UI.createTableViewRow(rowData);
				return func(row, val);
			}
			var table_data = [];
			for( key in data ){
				var row = createRow( key, data[key] );
				if( row != null ){
					row.data = data[key];
					table_data.push(row);
				}
			}
			tableview.setData( table_data );
		};
		
		tableview.addRowDesign = function(data, func){
			function createRow( key, val ){
				var row = Ti.UI.createTableViewRow({ height: (params.rowHeight != null)? params.rowHeight: 30 });
				return func(row, val);
			}
			for( key in data ){
				var row = createRow( key, data[key] );
				if( row != null ){
					row.data = data[key];
					tableview.appendRow(row);
				}
			}
		};
		
		return tableview;
	};
	
	self.createAutocompleteField = function( params ){
		var basic = {
			color: '#333333',
			hintText: L('label_search'),
			borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			width: 150, height: 35,
			bottom: 0
		};
		var textField = self.makeTextField( merge(basic, params) );
		var last_search = null;
		var timer = null;
		
		var autocomplete_view = null;
		textField.addEventListener('change', function(e){
			clearTimeout(timer);
			if(e.value.length >= ((params.over != null)? params.over: 2) && e.value != last_search){
				timer = setTimeout(function(){ auto_complete(e.value); }, 500);
			}
			else{
				if( autocomplete_view != null ) params.parent.remove(autocomplete_view);
			}
			return false;
		});
		textField.addEventListener('blur', function(e){
			if( autocomplete_view != null ) params.parent.remove(autocomplete_view);
		});
		
		function createAutoCompleteView(){
			if( autocomplete_view != null ) params.parent.remove(autocomplete_view);
			
			var a = textField.parent.convertPointToView({
				x: textField.rect.x,
				y: textField.rect.y
			}, params.parent);
			
			view = Ti.UI.createTableView({
				backgroundColor: '#ffffff',
				width: textField.width, height: 100,
				left: self.convert_x(a.x),
				top: self.convert_y(a.y) + ((OS_ANDROID)? 0: params.parent.contentOffset.y) - 100
			});
			view.addEventListener('click', function(e){
				textField.value = last_search = e.row.children[0].text;
				textField.blur();
				if( autocomplete_view != null ) params.parent.remove(autocomplete_view);
				params.callback(e.row.children[0].text);
			});
			
			return view;
		}
		
		var network = require('require/network');
		function auto_complete( text ){
			if( text.length > 0 ){
				function apply( result ){
					function createRow( d ){
						var row = Ti.UI.createTableViewRow({ height: 30 });
						var text = self.makeLabel({
							text: result[i],
							top: 5,
							font:{ fontSize: 15 }
						});
						row.add(text);
						
						return row;
					}
					var data = [];
					for( var i = 0; i < result.length; i++ ){
						var row = createRow( result[i] );
						data.push(row);
					}
					autocomplete_view = createAutoCompleteView();
					autocomplete_view.setData( data );
					params.parent.add(autocomplete_view);
				}
				if( typeof params.method === 'function' ){
					apply( params.method(text) );
				}
				else if( params.method != null ){
					network.connectPOSTv2({
						'method': params.method,
						'post': {
							keyword: text
						},
						'callback': function(result){
							if( params.getResult != null ) params.getResult(result);
							else apply(result);
						},
						'onError': function(error){
							var dialog = self.createDialog({
								'title': error.type,
								'message': error.message,
								'buttonNames': [L('label_close')]
							}).show();
						}
					});
				}
			}
		}
		return textField;
	};
	
	self.createUpScreen = function( params ){
		var layer = require('require/layer');
		var menu = {};
		
		menu.origin = Ti.UI.createView({ top: -100, width: Ti.UI.SIZE, height: Ti.UI.SIZE, opacity: 0.0 });
		
		var menuLayer = null, menuBack = null, whole_menuView = null;
		menu.close = function(){
			menuBack.animate({ opacity: 0.0, duration: 100 });
			whole_menuView.animate({ bottom: -params.height, duration: 500 }, function(){
				if( layer != null ) layer.removeLayer(params.win, menuLayer);
				menuLayer = null;
				menu.isVisible = false;
				menu.origin.fireEvent('close');
			});
			if( params.close != null ) params.close(menuLayer);
		};
		
		menu.open = function(){
			menu.origin.fireEvent('open');
			menuLayer = layer.newLayer(params.win.origin);
			menuBack = Ti.UI.createView({
				width: Ti.UI.FILL,
				height: Ti.UI.FILL,
				backgroundColor: '#ffc07f',
				opacity: 0.0,
			});
			menuLayer.add(menuBack);
			menuBack.addEventListener('click', function(e){
				menu.close();
			});
			
			whole_menuView = Ti.UI[(OS_ANDROID)?'createView': 'createScrollView']({
				width: params.width || '100%',
				height: params.height,
				backgroundColor: params.backgroundColor || '#ffffff',
				bottom: -params.height
			});
			menuLayer.add(whole_menuView);
			if( params.right ) whole_menuView.right = params.right;
			if( params.left ) whole_menuView.left = params.left;
			
			params.open(whole_menuView, menuLayer);
			
			menuBack.animate({ opacity: 0.5, duration: 100 });
			whole_menuView.animate({ bottom: 0, duration: 500 });
			
			menu.isVisible = true;
		};
		
		return menu;
	};
	
	self.createDownScreen = function( params ){
		var layer = require('require/layer');
		var menu = {};
		
		menu.origin = Ti.UI.createView({ top: 0, width: Ti.UI.SIZE, height: Ti.UI.SIZE, opacity: 0.0 });
		
		var menuLayer = null, menuBack = null, whole_menuView = null;
		menu.close = function(){
			menuBack.animate({ opacity: 0.0, duration: 100 });
			whole_menuView.animate({ bottom: params.height, duration: 500 }, function(){
				if( layer != null ) layer.removeLayer(params.win, menuLayer);
				menuLayer = null;
				menu.isVisible = false;
				menu.origin.fireEvent('close');
			});
			if( params.close != null ) params.close(menuLayer);
		};
		
		menu.open = function(){
			menu.origin.fireEvent('open');
			menuLayer = layer.newLayer(params.win.origin);
			menuBack = Ti.UI.createView({
				width: Ti.UI.FILL,
				height: Ti.UI.FILL,
				backgroundColor: 'black',
				opacity: 0.0,
			});
			menuLayer.add(menuBack);
			menuBack.addEventListener('click', function(e){
				menu.close();
			});
			
			whole_menuView = Ti.UI[(OS_ANDROID)?'createView':'createScrollView']({
				width: params.width || '100%',
				height: params.height,
				backgroundColor: params.backgroundColor || '#ffffff',
				top: -50
			});
			menuLayer.add(whole_menuView);
			if( params.right ) whole_menuView.right = params.right;
			if( params.left ) whole_menuView.left = params.left;
			
			params.open(whole_menuView, menuLayer);
			
			menuBack.animate({ opacity: 0.5, duration: 100 });
			whole_menuView.animate({ top: 35, duration: 500 });
			
			menu.isVisible = true;
		};
		
		return menu;
	};
	
	self.putTokenIcon = function( params ){
		(function(params) {
			if( params.info.description != null ){
				if( /.*\.json/.test(params.info.description) ){
					globals.requires['network'].getjson({
						'uri': params.info.description,
						'callback': function(json){
							self.checkAssetImage(params, json.image);
						},
						'onError': function(error){
							self.checkAssetImage(params);
						}
					});
				}
				else self.checkAssetImage(params);
			}
			else self.checkAssetImage(params);
		})(params);
	};
	
	self.checkAssetImage = function( params, uri ){
		var image_url =  uri || '';
		
		if( params.info.token === 'BTC' ){
			image_url = '/images/asset_bitcoin.png';
		}
		else if( params.info.token == 'XCP' ){
			image_url = '/images/asset_xcp.png';
		}
		else if( image_url.length <= 0 ){
			image_url = 'https://counterpartychain.io/content/images/icons/' + params.info.token.toLowerCase() + '.png';
		}
		else{
			if( !image_url.match(/^https?:\/\//) ) image_url = 'https://' + image_url;
		}
		
		var asset_image = Ti.UI.createImageView({
			defaultImage: '/images/blankPlaceholder.png',
			image: image_url,
			width: params.width, height: params.height,
			top: params.top, left: params.left
		});
		
		var blob = asset_image.toBlob();
		var base64encoded = undefined;
		if( blob != null ) base64encoded = Ti.Utils.base64encode(blob);
		
		var icon = asset_image;
		if( OS_IOS && base64encoded == undefined ){
			asset_image.image = 'https://counterpartychain.io/content/images/icons/'+params.info.token.toLowerCase()+'.png';
			blob = asset_image.toBlob();
			base64encoded = Ti.Utils.base64encode(blob);
		}
		
		if( blob == null || base64encoded.toString() == globals.coindaddy_default ){
			asset_image.image = '/images/icon_default.png';
			asset_image.setOpacity(0.8);
			
			icon = self.group({
				'icon': asset_image,
				'char': (params.info.token != null)? self.makeLabel({
					text: (params.info.token == 'XCP')? '': params.info.token.charAt(0),
					color: '#ffffff',
					font:{ fontSize: asset_image.width * 0.5, fontWeight:'normal' },
					textAlign: 'right'
				}): null
			});
			icon.top = asset_image.top; 
			icon.left = asset_image.left;
			icon.bottom = asset_image.bottom;
			icon.right = asset_image.right;
			
			asset_image.top = asset_image.left = asset_image.bottom = asset_image.right = 0;
			icon.is_default = true;
		}
		
		params.parent.add(icon);
		
		return;
	};
	
	self.setReorg = function(parent){
		var params = {};
		
		params.width = params.height = Ti.UI.FILL;
		params.backgroundColor = '#e54353';
		params.opacity = 0.0;
		
		var view = Ti.UI.createView( params );
		var texts = self.group({
			'title': self.makeLabel({
				text: L('label_reorganisation'),
				color: '#ffffff',
				font:{ fontSize:18 },
				top: 0
			}),
			'text': self.makeLabel({
				text: L('text_reorganisation'),
				color: '#ffffff',
				font:{ fontSize:15 },
				top: 10
			}),
			'text2': self.makeLabel({
				text: L('text_reorganisation2'),
				color: '#ffffff',
				font:{ fontSize:12 },
				top: 10
			})
		}, 'vertical');
		texts.width = '90%';
		
		var loading = self.showLoading(texts, {});
		loading.top = 10;
		
		view.add(texts);
		view.animate({ opacity: 0.9, duration: 300 });
		
		parent.add(view);
		
		view.removeSelf = function(){
			parent.remove(view);
			view = null;
		};
		
		return view;
	};
	
	self.getTransactionWillStory = function( val ){
		var cache = require('require/cache');
		var story = null;
		if( val.type === 'order' ){
			if( val.give_asset === 'XCP' || val.get_asset === 'XCP' ){
				if( val.give_asset === 'XCP' ){
					var price = val.give_quantity / val.get_quantity;
					story = L('text_history_order_bought_will').format({ 'price': price, 'price_asset': val.give_asset, 'asset': val.get_asset, 'quantity': val.get_quantity });
				}
				else{
					var price = val.get_quantity / val.give_quantity;
					story = L('text_history_order_sold_will').format({ 'price': price, 'price_asset': val.get_asset, 'asset': val.give_asset, 'quantity': val.give_quantity });
				}
			}
			else {
				story = L('text_history_order_other_will').format({ 'give_asset': val.give_asset, 'give_quantity': val.give_quantity, 'get_asset': val.get_asset, 'get_quantity': val.get_quantity });
			}
		}
		else if( val.type === 'cancel' ){
			if( val.give_asset === 'XCP' || val.get_asset === 'XCP' ){
				if( val.give_asset === 'XCP'){
					var price = val.give_quantity / val.get_quantity;
					story = L('text_history_cancel_buy_will').format({ 'price': price, 'price_asset': val.give_asset, 'asset': val.get_asset, 'quantity': val.get_quantity });
				}
				else{
					var price = val.get_quantity / val.give_quantity;
					story = L('text_history_cancel_sell_will').format({ 'price': price, 'price_asset': val.get_asset, 'asset': val.give_asset, 'quantity': val.give_quantity });
				}
			}
			else {
				story = L('text_history_cancel_other_will').format({ 'give_asset': val.give_asset, 'give_quantity': val.give_quantity, 'get_asset': val.get_asset, 'get_quantity': val.get_quantity });
			}
		}
		else if( val.type === 'send' ){
			story = L('text_history_send_will').format({ 'quantity': Number(val.quantity), 'asset': val.token, "destination": val.destination });
			if(val.category != null && val.category === 'Receive'){
				story = L('text_history_receive_will').format({ 'quantity': Number(val.quantity), 'asset': val.token, "destination": val.destination });
			}
		}
		else if( val.type === 'issuance' ){
			if( val.transfer ){
				if( val.source !== cache.data.address ) story = L('text_history_issuance_transfer_will').format({ 'asset': val.token, 'from': val.source });
				else if( val.issuer !== cache.data.address ) story = L('text_history_issuance_transferto_will').format({ 'asset': val.token, 'to': val.issuer });
			}
			else if( val.locked ) story = L('text_history_locked_will').format({ 'asset': val.token });
			else if( val.reissuance ){
				if( val.quantity > 0 ) story = L('text_history_reissuance_will').format({ 'quantity': val.quantity, 'asset': val.token });
				else story = L('text_history_updated_will').format({ 'asset': val.token });
			}
			else story = L('text_history_issuance_will').format({ 'quantity': val.quantity, 'asset': val.token });
		}
		else if( val.type === 'dividend' ){
			story = L('text_history_dividend_will').format({ 'dividend_asset': val.dividend_token, 'asset': val.token, 'quantity_per_unit': (val.quantity_per_unit * 100) });
		}
		else if( val.type === 'get_dividend' ){
			story = L('text_history_get_dividend_will').format({ 'dividend_asset': val.dividend_token, 'asset': val.token, 'quantity_per_unit': (val.quantity_per_unit * 100) });
		}
		
		return story;
	};
	
	self.getTransactionStory = function(val){
		var cache = require('require/cache');
		var story = null;
		if( val.type === 'order' ){
			if( val.give_asset === 'XCP' || val.get_asset === 'XCP' ){
				if( val.give_asset === 'XCP'){
					var price = val.give_quantity / val.get_quantity;
					story = L('text_history_order_bought').format({ 'price': price, 'price_asset': val.give_asset, 'asset': val.get_asset, 'quantity': val.get_quantity });
				}
				else{
					var price = val.get_quantity / val.give_quantity;
					story = L('text_history_order_sold').format({ 'price': price, 'price_asset': val.get_asset, 'asset': val.give_asset, 'quantity': val.give_quantity });
				}
			}
			else {
				story = L('text_history_order_other').format({ 'give_asset': val.give_asset, 'give_quantity': val.give_quantity, 'get_asset': val.get_asset, 'get_quantity': val.get_quantity });
			}
		}
		else if( val.type === 'cancel' ){
			if( val.give_asset === 'XCP' || val.get_asset === 'XCP' ){
				if( val.give_asset === 'XCP'){
					var price = val.give_quantity / val.get_quantity;
					story = L('text_history_cancel_buy').format({ 'price': price, 'price_asset': val.give_asset, 'asset': val.get_asset, 'quantity': val.get_quantity });
				}
				else{
					var price = val.get_quantity / val.give_quantity;
					story = L('text_history_cancel_sell').format({ 'price': price, 'price_asset': val.get_asset, 'asset': val.give_asset, 'quantity': val.give_quantity });
				}
			}
			else {
				story = L('text_history_cancel_other').format({ 'give_asset': val.give_asset, 'give_quantity': val.give_quantity, 'get_asset': val.get_asset, 'get_quantity': val.get_quantity });
			}
		}
		else if( val.type === 'send' ){
			story = L('text_history_send').format({ 'quantity': Number(val.quantity), 'asset': val.token });
			if(val.category != null && val.category === 'Receive'){
				story = L('text_history_receive').format({ 'quantity': Number(val.quantity), 'asset': val.token });
			}
		}
		else if( val.type === 'issuance' ){
			if( val.transfer ){
				if( val.source !== cache.data.address ) story = L('text_history_issuance_transfer').format({ 'asset': val.token, 'from': val.source });
				else if( val.issuer !== cache.data.address ) story = L('text_history_issuance_transferto').format({ 'asset': val.token, 'to': val.issuer });
			}
			else if( val.locked ) story = L('text_history_locked').format({ 'asset': val.token });
			else if( val.reissuance ){
				if( val.quantity > 0 ) story = L('text_history_reissuance').format({ 'quantity': val.quantity, 'asset': val.token });
				else story = L('text_history_updated').format({ 'asset': val.token });
			}
			else story = L('text_history_issuance').format({ 'quantity': val.quantity, 'asset': val.token });
		}
		else if( val.type === 'dividend' ){
			story = L('text_history_dividend').format({ 'dividend_asset': val.dividend_token, 'asset': val.token, 'quantity_per_unit': (val.quantity_per_unit * 100) });
		}
		else if( val.type === 'get_dividend' ){
			story = L('text_history_get_dividend').format({ 'dividend_asset': val.dividend_token, 'asset': val.token, 'quantity_per_unit': (val.quantity_per_unit * 100) });
		}
		else{}
		
		return story;
	};
	
	return self;
}());