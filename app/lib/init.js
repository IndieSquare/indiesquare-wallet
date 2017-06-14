// Initiallize
globals = Alloy.Globals;
globals.is_scrolling = false;
globals.Accelerometer = 0;
globals.reorg_views = {};
globals.windows = new Array();
globals.requires = new Array();

/*
On iOS, all relative paths are currently interpreted as relative to the Resources directory,
not to the current context. This is a known issue that will be addressed in a future release.
http://docs.appcelerator.com/titanium/3.0/#!/api/Ti.Filesystem
*/
/*
var w = Ti.Filesystem.getFile('window').getDirectoryListing();
for( var i = 0; i < w.length; i++ ){
	var file = w[i].substr(0, w[i].indexOf('.'));
	globals.windows[file] = require('window/' + file);
}

var r = Ti.Filesystem.getFile('require').getDirectoryListing();
for( var i = 0; i < r.length; i++ ){
	var file = r[i].substr(0, r[i].indexOf('.'));
	globals.requires[file] = require('require/' + file);
}
*/

Ti.API.fin = "no";
var w = new Array(
	'signin.js',
	'home.js',
	'settings.js',
	'send.js',
	'weblink.js'
);

for( var i = 0; i < w.length; i++ ){
	var file = w[i].substr(0, w[i].indexOf('.'));
	globals.windows[file] = require('window/' + file);
}
var r = new Array(
	'analytics.js',
	'auth.js',
	'bitcore.js',
	'cache.js',
	'fcm.js',
	'inputverify.js',
	'layer.js',
	'network.js',
	'pubsub.js',
	'tiker.js',
	'util.js'
);
for( var i = 0; i < r.length; i++ ){
	var file = r[i].substr(0, r[i].indexOf('.'));
	globals.requires[file] = require('require/' + file);
}

var _requires = globals.requires;

String.prototype.format = function(arg){
    var rep_fn = null;
    if( typeof arg == 'object' ) rep_fn = function(m, k) { return arg[k]; }; else { var args = arguments; rep_fn = function(m, k) { return args[ parseInt(k) ]; }; }
    return this.replace( /\{(\w+)\}/g, rep_fn );
};

Number.prototype.toFixed2 = function(digit){
	if( digit == null ) digit = 8;
	return this.toFixed(digit).replace(/0+$/, '').replace(/\.$/, '');
};

var image_url =  'https://counterpartychain.io/content/images/icons/-.png';
globals.coindaddy_default = null;
try{
	var default_image = Ti.UI.createImageView({image: image_url});
	globals.coindaddy_default = Ti.Utils.base64encode(default_image.toBlob()).toString();
}
catch(e){
	globals.coindaddy_default = '';
}

Math._getDecimalLength = function(value) {
    var list = (value.toString()).split('.'), result = 0;
    if (list[1] !== undefined && list[1].length > 0) result = list[1].length;
    return result;
};

Math.multiply = function(value1, value2) {
    var intValue1 = parseInt( (value1.toString()).replace('.', ''), 10);
    var intValue2 = parseInt( (value2.toString()).replace('.', ''), 10);
    var decimalLength = Math._getDecimalLength(value1) + Math._getDecimalLength(value2); 
    return (intValue1 * intValue2) / Math.pow(10, decimalLength);
};

Math.divide = function(value1, value2) {
    var intValue1 = parseInt( (value1.toString()).replace('.', ''), 10);
    var intValue2 = parseInt( (value2.toString()).replace('.', ''), 10);
    var len1 = Math._getDecimalLength(value1);
    var len2 = Math._getDecimalLength(value2); 
    
    if( len1 > len2 ) intValue2 *= Math.pow(10, len1 - len2);
	else if( len1 < len2 ) intValue1 *= Math.pow(10, len2 - len1);
    
    if( len1 > 0 && len2 > 0 ) decimalLength = 0;
    else decimalLength = len1 + len2;
    if( len1 == 0 || len2 == 0 ) decimalLength = 0;
    
    return (intValue1 / intValue2) * Math.pow(10, decimalLength);
};

Math.subtract = function(value1, value2) {
    var max = Math.max(Math._getDecimalLength(value1), Math._getDecimalLength(value2)), k = Math.pow(10, max);
    return (Math.multiply(value1, k) - Math.multiply(value2, k)) / k;
};

function reorg_finish(){
	if( globals.isReorg ){
		globals.isReorg = false;
		globals.reorg_views['home'].removeSelf();
	}
};

var service = null;
globals.backgroundfetch = function (e) {
	_requires['network'].connectGETv2({
		'method': 'status/reorg',
		'callback': function( result ){
			if( !result.isReorg ){
				reorg_finish();
				if( OS_IOS ){
					Ti.App.iOS.removeEventListener( 'backgroundfetch', globals.backgroundfetch );
					var notification = Ti.App.iOS.scheduleLocalNotification({
					    alertBody: L('text_finish_reorg'),
					    date: new Date(new Date().getTime())
					}); 
				}
				else if( service != null ){
					service.stop();
					service = null;
					
					var intent = Ti.Android.createIntent({
					    action: Ti.Android.ACTION_MAIN,
					    className: 'inc.lireneosoft.counterparty.IndiesquareWalletActivity',
					    packageName: 'inc.lireneosoft.counterparty'
					});
					intent.flags |= Ti.Android.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP;
					intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
					
					var notification = Ti.Android.createNotification({
					    contentTitle: 'IndieSquare Wallet',
					    contentText : L('text_finish_reorg'),
					    tickerText: L('text_finish_reorg'),
					    contentIntent: Ti.Android.createPendingIntent({ 'intent': intent }),
					    defaults:  Ti.Android.DEFAULT_ALL,
			            flags: Ti.Android.FLAG_SHOW_LIGHTS,
					    icon: Ti.App.Android.R.drawable.appicon,
					    number: 1,
					    when: new Date()
					});
					Ti.Android.NotificationManager.notify(1, notification);
				}
			}
			else if( OS_IOS && e != null ) Ti.App.iOS.endBackgroundHandler(e.handlerId);
		}
	});
};
globals.reorg_occured = function(){
	if( !globals.isReorg ){
		globals.isReorg = true;
		
		if( OS_IOS ){
			globals.reorg_views['home'] = _requires['util'].setReorg(Ti.API.home_win);
			globals.reorg_views['history'] = _requires['util'].setReorg(Ti.API.history_win);
			globals.reorg_views['dex'] = _requires['util'].setReorg(Ti.API.exchange_win);
			Ti.App.iOS.setMinimumBackgroundFetchInterval( Ti.App.iOS.BACKGROUNDFETCHINTERVAL_MIN );
			Ti.App.iOS.addEventListener( 'backgroundfetch', globals.backgroundfetch );
		}
		else{
			globals.reorg_views['home'] = _requires['util'].setReorg(globals.main_window);
			var intent = Ti.Android.createServiceIntent( { url: 'background/fetch.js' } );
			intent.putExtra('interval', 15000);
			service = Ti.Android.createService(intent);
			service.start();
		}
	}
};

globals._parseCip2 = function( url ){
	if( url == null || !url.match(/^counterparty:/) ) return null;
	var scheme = url.replace(/^counterparty:/, '').split('?');
	
	var data = null;
	try{
		var address = _requires['bitcore'].getAddressFromWIF(scheme[0]);
		data = { 'address': address, 'WIF': scheme[0] };
	}
	catch(e){
		Ti.API.info(e);
		data = { 'address': scheme[0] };
	}
	
	if( scheme.length > 1 ){
		scheme[1].split('&').forEach(function( val ){
			var v = val.split('=');
			try{
				data[v[0]] = decodeURIComponent(v[1]);
			}
			catch(e){ Ti.API.info(e.error); }
		});
	}
	return data;
};
function urlToObject(url)	{
	var	returnObj	=	{};
	url	=	url.replace('URLSCHEME://?', '');
	var	params	=	url.split('&');
	params.forEach(function(param)	{
		var	keyAndValue	=	param.split('=');
		returnObj[keyAndValue[0]]	=	decodeURI(keyAndValue[1]);
	});
	return	obj;
}

function loadingFromInit(){
	if( OS_IOS && Ti.API.home_win != null ){
		return _requires['util'].showLoading(Ti.API.home_win, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('label_please_wait')});
	}
	else if( globals.main_window != null ){
		return _requires['util'].showLoading(globals.main_window, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('label_please_wait')});
	}
	return null;
}

function signAndSendMessageTokenly(url){
	var loading = loadingFromInit();
	
	var scheme = url.split('?');
	var msg = scheme[1];
	msg = msg.replace('msg=', '');
	
	var sig = _requires['bitcore'].signMessage(msg);
	var client = Ti.Network.createHTTPClient({
		// function called when the response data is available
		onload : function(e) {
		if( loading != null ) loading.removeSelf();
			_requires['util'].createDialog({
		  		title : L('text_tokenly_sent'),
				message: L('text_tokenly_confirm'),
				buttonNames: [L('label_ok')]
			}).show();
		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
			if( loading != null ) loading.removeSelf();
			var arr_from_json = JSON.parse( this.responseText);
			if(arr_from_json["error"] != undefined){
				alert( arr_from_json["error"]);
			}
			else{
				alert( this.responseText);
			}
		},
		timeout : 15000  // in milliseconds
	});
	// Prepare the connection.
	client.open("POST", url);
	// Send the request.
	client.send({
		"msg":msg,
		"address":_requires['cache'].data.address,
		"sig":sig
	});
};

function linkageVerifyUser( params, is_fromQR ){
	if( 'x-success' in params ){
		var dialog = _requires['util'].createDialog({
			title: L('label_callback_verifyuser'),
			message: L('text_callback_verifyuser').format( { 'name': params['x-success'] }),
			buttonNames: [L('label_cancel'), L('label_ok')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index != e.source.cancel ){
				_requires['auth'].check({ title: L('text_authentication'), callback: function(e){
					if( e.success ){
						try{
							if( 'channel' in params ){
								var main_address = _requires['bitcore'].changeHD(0);
								var sig = _requires['bitcore'].signMessage(params['channel']);
								_requires['bitcore'].changeHD(globals.currentHD);
								var data = {
									'id': _requires['cache'].data.id,
									'message': params['channel'],
									'signature': sig,
								};
								_requires['pubsub'].publish({
									'channel' : params.channel,
									'message' : JSON.stringify(data),
									'callback': function(m){
										if( is_fromQR ){
											_requires['util'].createDialog({
												message: L('text_linkage_success'),
												buttonNames: [L('label_close')]
											}).show();
										}
									}
								});
							}
						}
						catch(e){
							Ti.API.info('error: '+e.error);
						}
					}
				}});
			}
		});
		dialog.show();
	}
}

function linkageGetAddress( params, is_fromQR ){
	if( 'x-success' in params ){
		var address = _requires['cache'].data.address;
		var dialog = _requires['util'].createDialog({
			title: L('label_callback_getaddress'),
			message: L('text_callback_getaddress').format( { 'address': address, 'name': params['x-success'] }),
			buttonNames: [L('label_cancel'), L('label_ok')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index != e.source.cancel ){
				_requires['auth'].check({ title: L('text_authentication'), callback: function(e){
					if( e.success ){
						if( 'msg' in params ){
							try{
								var sig = _requires['bitcore'].signMessage(params['msg']);
								if( 'channel' in params ){
									var data = {
										'address': address,
										'message': params['msg'],
										'signature': sig,
									};
									_requires['pubsub'].publish({
										'channel' : params.channel,
										'message' : JSON.stringify(data),
										'callback': function(m){
											if( is_fromQR ){
												_requires['util'].createDialog({
  													message: L('text_linkage_success'),
  													buttonNames: [L('label_close')]
  												}).show();
											}
										}
									});
								}
								else{
									Ti.Platform.openURL(params['x-success'] + '://sendaddress?address=' + _requires['cache'].data.address+'&msg='+params['msg']+'&sig='+sig);
									if(OS_ANDROID) globals.main_window.activity.finish();
								}
							}
							catch(e){
								Ti.API.info('error: '+e.error);
								if(OS_ANDROID) globals.main_window.activity.finish();
							}
						}
						else {
							Ti.Platform.openURL(params['x-success'] + '://sendaddress?address=' + address);
							if(OS_ANDROID) globals.main_window.activity.finish();	
						}
						
					}else{
						if(OS_ANDROID) globals.main_window.activity.finish();
					}
				}});
			}
		});
		dialog.show();
	}
}

function linkageQrcode( params, is_fromQR ){
	if( 'x-success' in params ){
		var dialog = _requires['util'].createDialog({
			title: L('label_callback_qrcode'),
			message: L('text_callback_qrcode').format( { 'name': params['x-success'] }),
			buttonNames: [L('label_cancel'), L('label_ok')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index != e.source.cancel ){
				_requires['util'].openScanner({
					callback: function(e){
						if( 'channel' in params ){
							var data = {
								'data': e.barcode
							};
							_requires['pubsub'].publish({
								'channel' : params.channel,
								'message' : JSON.stringify(data),
								'callback': function(m){
									if( is_fromQR ){
										_requires['util'].createDialog({
											message: L('text_linkage_success'),
											buttonNames: [L('label_close')]
										}).show();
									}
								}
							});
						}
						else{
							Ti.Platform.openURL(params['x-success'] + '://qrcode?data=' + e.barcode);
						}
					}
				});
			}
		});
		dialog.show();
	}
}

function linkageAddWebapp( params, is_fromQR ){
	if( 'x-success' in params ){
		globals.addWebapp({
			'id': params['x-success']
		}, function( result ){
			var data = {
				'data': result
			};
			if( 'channel' in params ){
				_requires['pubsub'].publish({
					'channel' : params.channel,
					'message' : JSON.stringify(data),
					'callback': function(m){
						if( is_fromQR ){
							_requires['util'].createDialog({
								message: L('text_linkage_success'),
								buttonNames: [L('label_close')]
							}).show();
						}
					}
				});
			}
		});
	}
}

function screenToSend( params ){
	var s = setInterval(function(){
		if( globals.balances != null && globals.tiker != null ){
            clearInterval(s);
            
            function gotoScreen( data ){
		    	var asset = (data.accept_token != null)? data.accept_token: ((data.asset != null)? data.asset: data.token);
		    	
		    	var send_token = null;
				for( var i = 0; i < globals.balances.length; i++ ){
					if( globals.balances[i].token === asset ){
						send_token = globals.balances[i];
						break;
					}
				}
				if( send_token != null ){
					var data = {
						'asset': send_token.token,
						'balance': send_token.balance,
						'address': (data.destination != null)? data.destination: data.address,
						'amount': params.amount,
						'channel': params.channel,
						'currency': data.currency,
						'regular_dust_size': params.regular_dust_size
					};
					globals.windows['send'].run(data);
					if( params.channel != null ){
						globals.publich = function(data){
							_requires['pubsub'].publish({
								'channel' : params.channel,
								'message' : JSON.stringify(data),
								'callback': function(m){
									Ti.API.info(JSON.stringify(m));
								}
							});
						};
					}
				}
				else {
					_requires['util'].createDialog({
						message: L('label_errortokenfound').format({token: asset}),
						buttonNames: [L('label_close')]
					}).show();
				}
		    }
		    
		    if( params.id != null ){
		    	_requires['network'].connectGETv2({
					'method': 'tips/' + params.id + '/info',
					'callback': function( info ){
						gotoScreen( info );
					},
					'onError': function(error){
						_requires['util'].createDialog({
							title: error.type,
							message: error.message,
							buttonNames: [L('label_close')]
						}).show();
					}
				});
			}
			else{
				gotoScreen( params );
			}
        }
	}, 100);
}

function screenToDex( params ){
	if( params.token == null ) return;
	
	var s = setInterval(function(){
		if( globals.balances != null && globals.tiker != null ){
            clearInterval(s);
            
            globals.showExchange('none');
        	globals.setOrderParameters(params.token.toUpperCase(), {
        		'type': params.type || 'buy',
        		'amount': params.amount,
        		'price': params.price,
        		'currency': params.currency
        	});
        }
	}, 100);
}

function sweep( params, balances ){
	if( params.sweepbtc == null || params.sweepbtc.toLowerCase() !== 'true' ){
		params.isFullDust = false;
		if( params.sweepbtc == null ) params.isFullDust = true;
		params.sweepbtc = false;
	}
	else params.sweepbtc = true;
	
	var btc = balances[0];
	btc.balance = Math.subtract(parseFloat(btc.balance), -parseFloat(btc.unconfirmed_balance));
	
	var tokens = new Array();
	if( !params.sweepbtc ){
		var isUnconfirmed = false;
		for( var i = 1; i < balances.length; i++ ){
			if( params.asset != null && balances[i].token != params.asset ) continue;
			
			var balance = parseFloat(balances[i].balance);
			var unconfirmed_balance = parseFloat(balances[i].unconfirmed_balance);
			
			if( unconfirmed_balance != 0 ) isUnconfirmed = true;
			if( unconfirmed_balance < 0 ) balance += unconfirmed_balance;
			
			if( (params.amount != null && balance >= params.amount) || balance > 0 ){
				balance = params.amount || balance;
				tokens.push({'amount': balance, 'token': balances[i].token});
			}
		}
		if( params.asset != null && tokens.length <= 0 ){
			_requires['util'].createDialog({
				message: L('label_error_sweepinsufficient').format({'token': params.asset}),
				buttonNames: [L('label_close')]
			}).show();
			return;
		}
	}
	
	var fee = parseFloat(params.fee) || 10000;
	var regular_dust_size = (params.sweepbtc || tokens.length <= 0)? 0: 5430;
	
	var tokenlength = (tokens.length > 0)? tokens.length: 1;
	var total_token_fee = Math.divide((fee + regular_dust_size) * tokenlength, 1e8);
	var remaining_btc_value = Math.subtract(btc.balance, total_token_fee);
	
	if( tokens.length <= 0 && btc.balance <= 0 ){
		_requires['util'].createDialog({
			message: L('text_error_sweep_empty').format({'address': params.address}),
			buttonNames: [L('label_close')]
		}).show();
		return;
	}
	else if( remaining_btc_value < 0 ){
		_requires['util'].createDialog({
			message: L('label_error_sweepinsufficientBTC').format({'fee': total_token_fee}),
			buttonNames: [L('label_close')]
		}).show();
		return;
	}
	
	if( tokens.length > 0 ){
		if( params.isFullDust ) regular_dust_size += Math.divide(Math.multiply(remaining_btc_value, 1e8), tokens.length);
	}
	else{
		tokens.push({'token': 'BTC', 'amount': remaining_btc_value});
	}
	
	var total_btc_as_dust = Math.divide(regular_dust_size * tokens.length, 1e8);
	var total_fee = Math.divide(fee * tokens.length, 1e8);
	
	var current = -1;
	var index = 0;
	var loading = null;
	function doSweep(){
		var postParams = {
			'source': params.address,
			'token': tokens[current].token,
			'destination': _requires['cache'].data.address,
			'quantity': tokens[current].amount,
			'regular_dust_size': regular_dust_size,
			'fee': fee,
			'use_dust_inputs': true
		};
		_requires['network'].connectPOSTv2({
			'method': 'transactions/send',
			'post': postParams,
			'callback': function( result ){
				_requires['bitcore'].sign(result.unsigned_tx, {
					'check': {
						'source': params.address,
						'destination': _requires['cache'].data.address,
						'WIF': params.WIF
					},
					'callback': function(signed_tx){
						_requires['network'].connectPOSTv2({
							'method': 'transactions/broadcast',
							'post': {
								tx: signed_tx
							},
							'callback': function( result ){
								index++;
							},
							'onError': function(error){
								index = -2;
								_requires['util'].createDialog({
									'title': error.type,
									'message': error.message,
									'buttonNames': [L('label_close')]
								}).show();
							}
						});
					},
					'fail': function(error){
						if( loading != null ) loading.removeSelf();
						_requires['util'].createDialog({
							'message': error,
							'buttonNames': [L('label_close')]
						}).show();
					}
				});
			},
			'onError': function(error){
				if( loading != null ) loading.removeSelf();
		  		var dialog = _requires['util'].createDialog({
					'title': error.type,
					'message': error.message,
					'buttonNames': [L('label_close')]
				}).show();
			}
		});
	}
	
	var label = params.label || params.address;
	var feeInCurrency = _requires['tiker'].to('BTC', total_fee, _requires['cache'].data.currncy);
	
	var message = null;
	var messageFee = '\n\n' + L('label_fee') + ' ' + total_fee + 'BTC (' + feeInCurrency + ')';
	var messageBTC = '';
	if( total_btc_as_dust > 0 ) messageBTC = L('text_sweep_getbtc').format({'value': total_btc_as_dust});
	
	if( params.asset != null || tokens.length == 1 ) message = L('text_getconfirmation').format( { 'label':label , 'amount': tokens[0].amount, 'token': tokens[0].token }) + '\n' + messageBTC + messageFee;
	else message = L('text_sweepall').format({ 'label': label, 'count': tokens.length }) + messageFee;
	
	var dialog = _requires['util'].createDialog({
		title: L('label_confirm'),
		message: message,
		buttonNames: [L('label_cancel'), L('label_ok')]
	});
	dialog.addEventListener('click', function(e){
		if( e.index != e.source.cancel ){
			_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
				if( e.success ){
					loading = loadingFromInit();
					var timer = setInterval(function(){
						if( index != current ){
							current = index;
							if( current == -2 || current > tokens.length - 1 ){
								clearInterval(timer);
								if( loading != null ) loading.removeSelf();
								if( params.channel != null ) globals.publich({'status': true});
								
								var dialog = _requires['util'].createDialog({
									message: L('text_received'),
									buttonNames: [L('label_close')]
								});
								dialog.addEventListener('click', function(e){
									globals.loadBalance(true);
								});
								dialog.show();
								return;
							}
							if( current > 0 ){
								setTimeout(function(){
									doSweep();
								}, 2000);
							}
							else doSweep();
						}
					}, 500);
				}
			}});
		}
	});
	dialog.show();
}

function sweepTokens( params ){
	if( params.address === _requires['cache'].data.address ){
		var dialog = _requires['util'].createDialog({
			'message': L('text_error_sweep_sameaddress').format({'address': params.address}),
			'buttonNames': [L('label_close')]
		}).show();
		return;
	}
	
	var loading = loadingFromInit();
	_requires['network'].connectGETv2({
		'method' : 'addresses/' + params.address + '/balances',
		'callback' : function(result) {
			if( loading != null ) loading.removeSelf();
			sweep(params, result);
		},
		'onError' : function(error) {
			if (loading != null) loading.removeSelf();
			var dialog = _requires['util'].createDialog({
				'title': error.type,
				'message': error.message,
				'buttonNames': [L('label_close')]
			}).show();
		}
	});
}

function deepLink( url ){
	globals.windows['weblink'].run({
        'path': url
    });
}

globals._parseArguments = function( url, is_fromQR ) {
	if( url == null ){
		if( OS_IOS ) url = Ti.App.getArguments()['url'];
		else{
			var launchIntent = Ti.App.Android.launchIntent;
			if( launchIntent != null && launchIntent.hasExtra('source') ){ 
				url = launchIntent.getStringExtra('source');
				if( !url.match(new RegExp('^' + Alloy.CFG.walletapp_uri)) ){
					url = 'indiewallet://' + url;
				}
			}
		}
	}
	
	if( url ){
		Ti.API.info('url = ' + url);
		if( url.match(new RegExp('^' + Alloy.CFG.walletapp_uri)) ){
			deepLink(url);
			return;
		}
	}
	
	if( url && (is_fromQR || globals.lastUrl !== url) ) {
		globals.lastUrl = url;
		
		if( url.indexOf('/instant-verify/') > -1 ){
		
			var tag =  Ti.App.Properties.getString(_requires['cache'].data.address);
			if(tag == null || tag == 'NULL' ){
				tag = "";
			}
			var dialog = _requires['util'].createDialog({
				message : L('text_tokenly_desc').format({'address':"\n\n" + tag + "\n" + _requires['cache'].data.address}),
				buttonNames : [L('label_cancel'), L('label_confirm')]
			});
			dialog.addEventListener('click', function(e) {
				if( e.index != e.source.cancel ){
					_requires['auth'].check({ title: L('text_authentication'), callback: function(e){
						if( e.success ){
							setTimeout(function() { signAndSendMessageTokenly(url); }, 1000);
						}
					}});
				}
			});
			dialog.show();
		}
		else if( url.match(/^indiewallet:\/\/x-callback-url/) ){
			var scheme = url.replace(/^indiewallet:\/\/x-callback-url\//, '').split('?');
			var func = scheme[0];
			var params = new Array();
			
			var p = scheme[1].split('&');
			for(var i = 0; i < p.length; i++){
				var a = p[i].split('=');
				params[a[0]] = decodeURIComponent(a[1]);
			}
			
			var track_params = {};
			
			if( func === 'verifyuser' ){
				linkageVerifyUser(params, is_fromQR);
			}
			else if( func === 'getaddress' ){
				linkageGetAddress(params, is_fromQR);
			}
			else if( func === 'qrcode' ){
				linkageQrcode(params, is_fromQR);
			}
			else if( func === 'add_webapp' ){
				track_params = params;
				linkageAddWebapp(params, is_fromQR);
			}
			
			track_params['func'] = func;
		}
		else if( url.match(/^indiewallet:\/\//) ){
			var scheme = url.replace(/^indiewallet:\/\//, '').split('?');
	    	
	    	var func = scheme[0];
	    	var params = JSON.parse(decodeURIComponent(scheme[1].split('=')[1]));
	    	
	    	var track_params = {};
	    	
	    	if( func === 'screen_to' ){
	    		if( params.screen === 'send' ){
					screenToSend(params);
				}
				else if( params.screen === 'dex' ){
					screenToDex(params);
				}
				track_params['screen'] = params.screen;
			}
			else {
				function publish( data ){
					if( data != null ){
						_requires['pubsub'].publish({
							'channel' : params.channel,
							'message' : JSON.stringify(data),
							'callback': function(m){
								if( params.vending_wait_id != null ){
									_requires['network'].connectPUTv2({
										'method': 'tips/' + params.vending_wait_id + '/list/update',
										'post': {
											status: 2
										},
										'callback': function( result ){
											Ti.API.info('success');
										},
										'onError': function(error){
											Ti.API.info('failed');
										}
									});
								}
								if( is_fromQR ){
									_requires['util'].createDialog({
										message: L('text_linkage_success'),
										buttonNames: [L('label_close')]
									}).show();
								}
							}
						});
					}
					if( !is_fromQR && params.scheme != null ){
						if( params.scheme === 'http' ){
							if( OS_ANDROID ){
								var activity = Ti.Android.currentActivity;
								activity.finish();
							}
						}
						else Ti.Platform.openURL(params.scheme+'://');
					}
				}
				var unsigned_hex = null;
				var unpacked = null;
				function authorization(){
					_requires['auth'].check({ title: L('text_authentication'), callback: function(e){
						if( e.success ){
							if( func === 'signin' ){
								var data = {
									'id': _requires['cache'].data.id,
									'password': _requires['cache'].data.password
								};
								publish( data );
							}
							else if( func === 'new_address' ){
								globals.addWallet(function(params){
									if( params.status ){
										var data = {
											'id': _requires['cache'].data.id,
											'address': params.address
										};
									}
									else{
										var data = {
											'id': _requires['cache'].data.id,
											'address': params.action
										};
									}
									publish( data );
								});
							}
							else if( func === 'sign' ){
								if( unsigned_hex != null ){
							    	_requires['bitcore'].sign(unsigned_hex, {
							    		'check': unpacked,
										'callback': function(signed_tx){
											var data = {
												'signed_tx': signed_tx
											};
											publish( data );
										},
										'fail': function(error){
											_requires['util'].createDialog({
												message: error,
												buttonNames: [L('label_close')]
											}).show();
										}
									});
								}
							}
						}
						else {
							publish({ 'failed': true });
						}
					}});
				}
				var s = setInterval(function(){
				    clearInterval(s);
				    var auth_message;
				    function showDialog(message){
				    	var dialog = _requires['util'].createDialog({
							title : L('label_linkage_auth'),
							message : message,
							buttonNames : [L('label_close'), L('label_ok')]
						});
						dialog.addEventListener('click', function(e) {
							if (e.index != e.source.cancel) {
								authorization();
							}
							else{
								publish({ 'failed': true });
							}
						});
						dialog.show();
				    }
				    
				    if( func === 'sign' ){
				    	loading = loadingFromInit();
				    	function unpack( unsigned_hex ){
				    		var unpacked_message = '';
				    		_requires['network'].connectPOSTv2({
								'method': 'transactions/unpack',
								'post': {
									tx: unsigned_hex
								},
								'callback': function( result ){
									unpacked = result;
									track_params = unpacked;
									var feeInBTC = (result.fee / 1e8).toFixed2(8);
									var dustInBTC = (result.dust / 1e8).toFixed2(8);
									var feeInCurrency = _requires['tiker'].to('BTC', feeInBTC, _requires['cache'].data.currncy);
									var dustInCurrency = _requires['tiker'].to('BTC', dustInBTC, _requires['cache'].data.currncy);
									unpacked_message = _requires['util'].getTransactionWillStory(result) + '\n-----\n' + L('label_fee') + ' ' + feeInBTC + 'BTC (' + feeInCurrency + ') \nDust:' + dustInBTC + 'BTC (' + dustInCurrency + ')';
								},
								'onError': function(error){
									unpacked_message = 'unknown';
								},
								'always': function(){
									if( loading != null ) loading.removeSelf();
									showDialog(L('label_linkage_auth_sign') + "\n-----\n" + unpacked_message);
								}
							});
				    	}
				    	if( params.unsigned_hex ){
				    		unsigned_hex = params.unsigned_hex;
				    		unpack( params.unsigned_hex );
				    	}
				    	else{
					    	_requires['pubsub'].subscribe({
							    channel  : params.channel + 'receive',
							    connect  : function(){},
							    callback : function( data ){
							    	unsigned_hex = data.unsigned_hex;
							    	unpack( unsigned_hex );
							    },
							    onError : function(e){
							    	if( loading != null ) loading.removeSelf();
							    	_requires['util'].createDialog({
										'message': L('text_linkage_failed'),
										'buttonNames': [L('label_close')]
									}).show();
							    }
							});
						}
				    }
				    else{
					    if( func === 'signin' ) auth_message = L('label_linkage_auth_signin');
					    else if( func === 'new_address' ) auth_message = L('label_linkage_auth_new_address');
					    showDialog(auth_message);
				    }
			    }, 100);
			}
			track_params['func'] = func;
		}
		else{
			var cips = globals._parseCip2(url);
			if( cips == null ){
				var uri = _requires['bitcore'].URI((url.indexOf('bitcoin:') >= 0)? url : 'bitcoin:' + url);
				if( uri != null ){
					uri.token = 'BTC';
					screenToSend(uri);
					return;
				}
				else{
					url = url.replace(/^bitcoin:/, 'counterparty:');
					if( url.indexOf('/counterparty:/') < 0 ) url = 'counterparty:' + url;
					url += ((url.indexOf('?') < 0)? '?': '&') + 'sweepbtc=true';
				}
				cips = globals._parseCip2(url);
			}
			if( cips != null ){
				if( cips.WIF == null ){
					if( cips.token == null ) cips['token'] = 'BTC';
					screenToSend(cips);
				}
				else{
					sweepTokens(cips);
				}
			}
		}
    }
};