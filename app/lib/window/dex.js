module.exports = (function() {

var _windows = globals.windows;
var _requires = globals.requires;
var DexWidget = require('/window/dexwidget.js');
var intro_view = null;
var trendingView = null;
var showingDashboard = true;

function dex(){
	
}

var view_dex = Ti.UI.createView({ backgroundColor:'#FFFFFF', width: Ti.UI.FILL, height: Ti.UI.FILL });

dex.prototype.getView = function(){
	return view_dex;
};

var popular_tokens = [];

var tokenHistory = Ti.App.Properties.getList('tokenHistory');		
if( tokenHistory ){
	popular_tokens = popular_tokens.concat(tokenHistory);
}
search_tokens = [];
	
function addSearchTokens(){
	search_tokens = [];
	for( var i = 0; i < globals.balances.length; i++ ){
		if(globals.balances[i].token !== 'XCP' && globals.balances[i].token !== 'BTC'){
			search_tokens.push(globals.balances[i]);
		}
	}
	
	for( var i = 0; i < popular_tokens.length; i++ ){
		var canAddToken = true;
		for( var i2 = 0; i2 < globals.balances.length; i2++ ){
			if(popular_tokens[i].token === globals.balances[i2].token){
				canAddToken = false;
			}
		}
		if(canAddToken == true){
			search_tokens.push(popular_tokens[i]);
		}
	}
}
function load(){
	addSearchTokens();
	
	var dex_currency = globals.requires['cache'].data.currncy;
	var display_height = _requires['util'].getDisplayHeight();
	var buySellType = 'buy';
	var buy_asset = '';
	var lowestSellPrice = 0;
	var highestBuyPrice = 0;
	var spend_asset = 'XCP';
	var selected_asset = '';
	var market_price = 0;
	
	var sell_lab_xcp1;
	var sell_lab_xcp2;
	var sell_lab_xcp3;
	
	var sell_lab_fiat1;
	var sell_lab_fiat2;
	var sell_lab_fiat3;
	
	var buy_lab_xcp1;
	var buy_lab_xcp2;
	var buy_lab_xcp3;
	
	var buy_lab_fiat1;
	var buy_lab_fiat2;
	var buy_lab_fiat3;
	
	var closed_lab_xcp1;
	var closed_lab_xcp2;
	var closed_lab_xcp3;
	
	var closed_lab_fiat1;
	var closed_lab_fiat2;
	var closed_lab_fiat3;
	
	var sell_order_button;
	var buy_order_button;
	
	var market_sell_price = 0;
	var open_orders_total_cost = 0;
	var open_orders_total_amount = 0;
	var open_orders_total_price = 0;
	var all_open_sell_orders = [];
	var fiat_mode = false;
    total_dex_field_focus = false;
    price_dex_field_focus = false;
    amount_dex_field_focus = false;
    
	var view = Ti.UI.createScrollView({ 
  	 contentWidth:0, 
  	 contentHeight:'auto', 
  	 top:0,
  	 height: _requires['util'].getDisplayHeight(),
  	 showVerticalScrollIndicator:true, 
  	 showHorizontalScrollIndicator:true 
	});
	
	view.height = _requires['util'].getDisplayHeight() - 50;
	view_dex.add(view);

	var top_bar = Ti.UI.createView({
		backgroundColor : '#e54353',
		width : Ti.UI.FILL,
		height : (OS_ANDROID)? 147: 165
	});
	top_bar.top = 0;
	view_dex.add(top_bar);
	
	intro_view = Ti.UI.createView({
		backgroundColor : 'white',
		width : Ti.UI.FILL,
		height :view.rect.height - 80,
	});
	if( trendingView == null ){
		trendingView = new DexWidget.createTrending();
		trendingView.top = 55;
		intro_view.add(trendingView);
		didGoToPage1 = false;
	}
	else {
		if( OS_ANDROID ){
			if(didGoToPage1 == true){
				didGoToPage1 = false;
				globals.loadCells();
			}
		}
	}
	
	if(OS_ANDROID){
		intro_view.height = view.rect.height - 57;
	}
	var trendingLabel = _requires['util'].makeLabel({
		text : L('label_trending'),
		backgroundColor : "transparent",
		color : '#e54353',
		textAlign: 'center',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 18,
			fontWeight : 'bold'
		},
		top:20
	});
	intro_view.add(trendingLabel);
	
	var historyLabel = _requires['util'].makeLabel({
		text : L('label_history'),
		backgroundColor : "transparent",
		color : '#e54353',
		textAlign: 'center',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 18,
			fontWeight : 'bold'
		},
		top: 260
	});
	intro_view.add(historyLabel);
	
	var introLabels = _requires['util'].group({
		"1": _requires['util'].makeLabel({
			text : L('label_getting_started'),
			backgroundColor : "transparent",
			color : '#e54353',
			textAlign: 'center',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 18,
				fontWeight : 'bold'
			},
			top:10
		}),
		"2": _requires['util'].makeLabel({
			text : L('label_getting_started_1'),
			backgroundColor : "transparent",
			color : '#9b9b9b',
			textAlign: 'center',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 18,
				fontWeight : 'normal'
			},
			top:20
		}),
		"3": _requires['util'].makeLabel({
			text : L('label_getting_started_2'),
			backgroundColor : "transparent",
			color : '#9b9b9b',
			textAlign: 'center',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 18,
				fontWeight : 'normal'
			},
			top:10
		}),
		"4": _requires['util'].makeLabel({
			text : L('label_getting_started_3'),
			backgroundColor : "transparent",
			color : '#9b9b9b',
			textAlign: 'center',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 18,
				fontWeight : 'normal'
			},
			top:10
		})
	}, 'vertical');
	
	introLabels.opacity = 0;
	introLabels.top = 260;
	intro_view.add(introLabels);
	intro_view.top = (OS_ANDROID)? 57:80;
	view_dex.add(intro_view);
	
	var orderHistoryListView = Ti.UI.createView({
		backgroundColor: 'white',
		width: Ti.UI.FILL, height: 100,
		top: 290,
	});
	//orderHistoryListView.opacity = 0;
	orderHistoryListView.height =  intro_view.height - orderHistoryListView.top;
	intro_view.add(orderHistoryListView);
	
	function checkTiker(){
		_requires['tiker'].getTiker();
	}
	checkTiker();
	
	var orders1 = _requires['util'].createTableList({
		backgroundColor : 'white',
		width : '100%',
		height : '40%',
		scrollable :false,
		top : 0,
		rowHeight : '33.3%'
	});
	orders1.addEventListener('click', selectRow1);
	
	var orders2 = _requires['util'].createTableList({
		backgroundColor : 'white',
		width : '100%',
		height : '40%',
		scrollable :false,
		top : 0,
		rowHeight :'33.3%'
	});
	orders2.addEventListener('click', selectRow2);

	var histories = _requires['util'].createTableList({
		backgroundColor : 'white',
		width : '100%', height : '20%',
		scrollable :false,
		top : 0,
		rowHeight : '32.3%'
	});
	histories.addEventListener('click', selectRowClosed);
	
	var buySellTokens = _requires['util'].createTableList({
		backgroundColor: 'white',
		width: '100%', height: (OS_ANDROID)? 350: 200,
		top:0,
		rowHeight: 60
	});
	
	var orderHistoryList = Ti.UI.createScrollView({
		scrollType: 'vertical',
		layout: 'vertical',
		top: 0,
		width: Ti.UI.FILL, height: Ti.UI.FILL,
		backgroundColor: 'white',
		showVerticalScrollIndicator: true
	});
	
	var picker_toolbar = Ti.UI.createView({
		width: '100%',
		height: (OS_ANDROID)? 50: 40,
		backgroundColor: '#e54353'
	});
	
	var picker_toolbar_order = Ti.UI.createView({
		width: '100%',
		height: (OS_ANDROID)? 50: 40,
		backgroundColor: '#e54353'
	});

	var picker1 = _requires['util'].group({
		"toolbar": picker_toolbar,
		"picker": buySellTokens
	}, 'vertical');
	
	orderHistoryListView.add(orderHistoryList);
	var pickerOrder = _requires['util'].group({
		"toolbar": picker_toolbar_order,
	}, 'vertical');
	
	var orderHistLoading = Ti.UI.createActivityIndicator({
		font:{
			fontFamily : 'Sling',
			fontSize : 14,
			fontWeight : 'normal'
		},
		height:100,
		width: Ti.UI.FILL,
		color:'black',
		style:Ti.UI.ActivityIndicatorStyle.PLAIN,
		message: L('label_loading_trending'),
		top:300
	});
	orderHistLoading.show();
	intro_view.add(orderHistLoading);
	if(OS_ANDROID) picker1.top = display_height;
	else picker1.bottom = -340;
	
	if(OS_ANDROID) pickerOrder.top = display_height;
	else pickerOrder.bottom = -340;
	
	var box1 = _requires['util'].group();
	box1.height = 35;
	box1.width = '43%';
	box1.backgroundColor = 'white';
	box1.borderRadius = 4;
	box1.top = (OS_ANDROID)?10: 30;
	box1.left = 45;
	top_bar.add(box1);
	
	var box1_range = _requires['util'].group();
	box1_range.top = 0;
	box1_range.left = 20;
	box1_range.height = 60;
	box1_range.width = '43%';
	top_bar.add(box1_range);

	var box1_asset_image = Ti.UI.createImageView({
		image : '/images/asset_xcp.png',
		width : 33, height : 33,
		left : 2
	});
	box1.add(box1_asset_image);
	box1_asset_image.hide();
	
	function put_box1(asset_name){
		if( asset_name === L('label_exchange_select_token') ){
			var box1_asset_name = _requires['util'].makeLabel({
				text : asset_name,
				color : 'black',
				minimumFontSize : 10,
				font : { fontFamily : 'Helvetica Neue', fontSize : (OS_ANDROID)? 12: 15, fontWeight : 'normal' },
				textAlign:'center',
				width:'100%',
				height:30
			});
		}else{
			if( asset_name.length > 12 ){
				asset_name = asset_name.substr(0, 10) + '...';
			}
			var box1_asset_name = _requires['util'].makeLabel({
				text : asset_name,
				color : 'black',
				left: 38,
				width: '70%', top: 5,
				minimumFontSize : 10,
				font : { fontFamily: 'Helvetica Neue', fontSize: (OS_ANDROID)? 12: 15, fontWeight: 'normal' },
				textAlign: 'center'
			});
		}
		box1.add(box1_asset_name);
		box1.addEventListener('touchstart', function() {
			pickerOrder.animate(slide_out);
			picker1.animate(slide_in);
			darkView.animate(showDarkView);
			darkView.show();
			search_tokens = [ { token: L('label_exchange_getting_tokens') }];
			
			setTimeout(function() { addBuySellTokens(); }, 500);
		});
		
	}
	
	var responsiveView = Ti.UI.createButton({
		backgroundColor : "transparent",
        width : '40%',
        height : '40%',
        color: 'white',
        top:10,
        left:40,
        font:{fontFamily:'Helvetica Neue', fontSize:20, fontWeight:'normal'},
	});
	responsiveView.addEventListener('click', function() {
		search_tokens = [ {token: L('label_exchange_getting_tokens') }];
			if( OS_ANDROID ){
				if(picker1.top == display_height){
					picker1.animate(slide_in);
					darkView.animate(showDarkView);
					darkView.show();
					pickerOrder.animate(slide_out);
					search_tokens = [ {token: L('label_exchange_getting_tokens') }];
					setTimeout(function() { addBuySellTokens(); }, 500);
				}
			}
			else{
				if(picker1.bottom == -340){
					picker1.animate(slide_in);
					darkView.animate(showDarkView);
					darkView.show();
					pickerOrder.animate(slide_out);
					search_tokens = [ {token: L('label_exchange_getting_tokens') }];
					setTimeout(function() { addBuySellTokens(); }, 500);
				}
			}
			addBuySellTokens(false);	
		});
	top_bar.add(responsiveView);
	
	put_box1(L('label_exchange_select_token'));
		
		
	//	addBuySellTokens();
	var orderhistory_error = null;
	function getOrderHistory(loading){
		my_order_history = [];
		
		//orderHistoryList.setData([]);
		//orderHistoryList.removeAllChildren();
		if( loading == null ) orderHistLoading.show();
		else orderHistoryList.removeAllChildren();
				
		_requires['network'].connectGETv2({
			'method' : 'addresses/' + _requires['cache'].data.address + '/orderhistory',
			'callback' : function(result) {
				if(result.length > 0) introLabels.opacity = 0;
				else{
					orderHistoryListView.visible = false;
					historyLabel.opacity = 0;
					introLabels.opacity = 1;
				}
				
				if( orderhistory_error != null ){
					orderHistoryListView.remove(orderhistory_error);
					orderhistory_error = null;
				}
				
				orderHistoryList.removeAllChildren();
				if( loading != null ) loading.removeSelf();
				else orderHistLoading.hide();
				
				for( var i = 0; i < result.length; i++ ){
					var tmphash = result[i]['tx_hash'];
					if( result[i].status == 'cancelled' ){
						Ti.App.Properties.removeProperty(tmphash);
					}
					my_order_history.push(result[i]);
				}
				function createBox( params ){
					var box = _requires['util'].group();
					box.height = params.height;
					box.width = '100%';
					box.backgroundColor = '#ffffff';
					
					return box;
				}
				
				for( var i = 0; i < my_order_history.length; i++ ){
					var val = my_order_history[i];
					var row = createBox({ height: 60 });
					row.top = 10;
					
					var token_name = (val.type == 'buy')?val['get_token']: val['give_token'];
					//token_name = val['give_asset'];
					var token_amount = val.order_amount;
					var color = '#6db558';
					if (val.type == 'buy') color = '#e54353';
					if (market_sell_price == 0) market_sell_price = val.price;
					
					var date = new Date(val.block_time * 1e3);
					var formattedTime = date.getFullYear() + ' ' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + ('0'+date.getHours()).substr(-2) + ':' + ('0'+date.getMinutes()).substr(-2) + ':' + ('0' + date.getSeconds()).substr(-2);
					var statusdate = _requires['util'].group({
						'date': _requires['util'].makeLabel({
							minimumFontSize:6,
							text : formattedTime,
							textAlign : 'right',
							bottom: 0,
							color : '#9b9b9b',
							font : { fontFamily : 'Helvetica Neue', fontSize : 9, fontWeight : 'normal' }
						})
					}, 'vertical');
					
					statusdate.right = 5;
					statusdate.bottom = 5;
					//row.backgroundColor = color;
					var color = '#6db558';
					if (val.type == 'buy') color = '#e54353';
					var imageType = '/images/sellAvatar.png';
					if (val.type == 'buy') imageType = '/images/buyAvatar.png';
					
					var order_amount = _requires['util'].group({
						'amount_order': _requires['util'].makeLabel({
							minimumFontSize:6,
							text : trim2( token_amount ),
							textAlign : 'left',
							left : 0,
							top : 0,
							color : '#9b9b9b',
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 10,
								fontWeight : 'normal'
							}
						}),
						'amount_token': _requires['util'].makeLabel({
							minimumFontSize:6,
							text : token_name,
							textAlign : 'left',
							left : 0,
							top: (OS_ANDROID)? -1: 1,
							color : '#9b9b9b',
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 10,
								fontWeight : 'normal'
							}
						}),
						'amount_type': _requires['util'].makeLabel({
							minimumFontSize:6,
							text : val.type,
							textAlign : 'left',
							left : 0,
							bottom: 5,
							color : color,
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 10,
								fontWeight : 'bold'
							}
						})
					}, 'vertical');
					order_amount.left = 5;
					
					var fiat_order = _requires['util'].makeLabel({
						minimumFontSize:6,
						text : _requires['tiker'].to('XCP', val.price, dex_currency, 8),
						textAlign : 'right',
						top: 15, left: 0,
						color : color,
						font : {
							fontFamily : 'Helvetica Neue',
							fontSize : 11,
							fontWeight : 'normal'
						}
					});
					var display_heightdex = _requires['util'].getDisplayHeight();
					if( display_heightdex < 700 ) fiat_order.top = 12;
					
					var trim_price = trim( val.price );
					//hist
					var price_order = _requires['util'].makeLabel({
						minimumFontSize:6,
						text : trim_price + ' XCP',
						textAlign : 'right',
						top : 0, left: 0,
						color : color,
						font : {
							fontFamily : 'Helvetica Neue',
							fontSize : 11,
							fontWeight : 'normal'
						}
					});
					
					var order_prices = _requires['util'].group({
						'fiat_order': fiat_order,
						'price_order': price_order
					});
					row.add( order_prices );
					
					if(fiat_mode == true){
						price_order.top = 15;
						fiat_order.top = 0;
					}
					//order_prices
					row.add( order_amount );
					row.add( statusdate );
					
					var cancelingStatus = Ti.App.Properties.getString(val.tx_hash);
					if(cancelingStatus == 'CANCELING'){
						var order_canceling_status = _requires['util'].makeLabel({
							minimumFontSize:6,
							text: L('label_exchange_canceling'),
							textAlign : 'right',
							top : 20, right: 5,
							color : color,
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 11,
								fontWeight : 'normal'
							}
						});
						row.add( order_canceling_status );
					}
					else if(val.status == 'open'){
						var cancelButton= Ti.UI.createButton({
						   backgroundColor : "#e44450",
						   borderRadius: 4,
						   title :  L('label_order_status_canceled'),
						   color:'white',
						   right:5,
						   width :70,
						   height : 25,
						   top : 10,
						   font:{fontFamily:'Gill Sans', fontSize: (OS_ANDROID)? 9: 11, fontWeight:'light'},
						   minimumFontSize : 7,
						});
					    row.add( cancelButton );
					}
					else if(val.status == 'cancelled'){
						var order_complete_cancelled = _requires['util'].makeLabel({
							minimumFontSize:6,
							text :L('label_exchange_cancelled'),
							textAlign : 'right',
							top : 20, right: 5,
							color : color,
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 11,
								fontWeight : 'normal'
							}
						});
						row.add( order_complete_cancelled );
					}
					else if(val.status == 'filled'){
						var order_complete_status = _requires['util'].makeLabel({
							minimumFontSize:6,
							text :L('label_exchange_completed'),
							textAlign : 'right',
							top : 20, right: 5,
							color : color,
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 11,
								fontWeight : 'normal'
							}
						});
						row.add( order_complete_status );
					}
					else if(val.status == 'expired'){
						var order_status_expired = _requires['util'].makeLabel({
							minimumFontSize:6,
							text :L('label_exchange_expired'),
							textAlign : 'right',
							top : 20, right: 5,
							color : color,
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 11,
								fontWeight : 'normal'
							}
						});
						row.add( order_status_expired );
					}
					else if(val.status == 'unconfirmed'){
						var order_status_unconfirmed = _requires['util'].makeLabel({
							minimumFontSize:6,
							text :L('label_exchange_unconfirmed'),
							textAlign : 'right',
							top : 20, right: 5,
							color : color,
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 11,
								fontWeight : 'normal'
							}
						});
						row.add( order_status_unconfirmed );
					}
					else {
						var order_status_lab = _requires['util'].makeLabel({
							minimumFontSize:6,
							text : val.status,
							textAlign : 'right',
							top : 20, right: 5,
							color : color,
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 11,
								fontWeight : 'normal'
							}
						});
						row.add( order_status_lab );
					}
					var border = Ti.UI.createView({
						width: '95%',
						height: 1, bottom: 0,
						backgroundColor: '#ececec',
						opacity: 1
					});
					row.add(border);
					
					var mainTouch = Ti.UI.createView({
						width: Ti.UI.FILL, height: Ti.UI.FILL,
					});
					row.add(mainTouch);
					
					if( val.status == 'open' ){
						var cancelTouch = Ti.UI.createView({
							width: 70, height: Ti.UI.FILL,
							right: 0
						});
						row.add(cancelTouch);
						
						(function(cancelTouch, i){
							cancelTouch.addEventListener('touchend', function(e) {
								selectRowOrder(i);
							});
						})(cancelTouch, i);
					}
					
					(function(mainTouch, token_name){
						mainTouch.addEventListener('touchend', function(e) {
							globals.clickedTrending(token_name);
						});
					})(mainTouch, token_name);
					
					orderHistoryList.add(row);
				}
				if( my_order_history.length > 0 ){
					_requires['layer'].addPullEvent(orderHistoryList, { parent: orderHistoryListView, howpull: 30, margin_top: 15, callback: function(l){
						getOrderHistory(l);
					}});
					if( OS_IOS ) orderHistoryList.contentHeight = my_order_history.length * 70 + 60;
					else{
						var row = createBox({ height: 60 });
						orderHistoryList.add(row);
					}
				}
			},
			'onError' : function(error) {
				orderHistLoading.hide();
				if( loading != null ) loading.removeSelf();
				if( orderhistory_error == null ){
					orderhistory_error = _requires['util'].group({
						'text': _requires['util'].makeLabel({
							text: L('text_history_error'),
							font:{ fontSize: 15 },
							color: '#ffffff'
						})
					});
					orderhistory_error.backgroundColor = 'E43E44';
					orderhistory_error.opacity = 0.8;
					orderhistory_error.width = '100%';
					orderhistory_error.height = 50;
					orderhistory_error.addEventListener('touchstart', function(){
						orderHistoryListView.remove(orderhistory_error);
						orderhistory_error = null;
						getOrderHistory(null);
					});
					orderHistoryListView.add(orderhistory_error);
				}
			}
		});
	}
		
	function getXCPBalance(){
		for( var i = 0; i < globals.balances.length; i++ ){
			if( globals.balances[i].token === 'XCP' ){
				XCP_balance.text = L('label_exchange_xcp_balance') +'\n' + globals.balances[i].balance.toFixed(3);
				break;
			}
		}
	}
	
	function trim( quantity ){
		if(quantity >= 1) quantity = quantity.toFixed(2);
		else quantity = quantity.toFixed(8);
		return quantity;
	}
	
	function trim2( quantity ){
		if(quantity >= 1) quantity = quantity.toFixed2(2);
		else quantity = quantity.toFixed2(8);
		return quantity;
	}
	
	var token_balance = _requires['util'].makeLabel({
		text : '',
		color : 'black',
		minimumFontSize : 10,
		font : { fontFamily : 'Helvetica Neue', fontSize : 10, fontWeight : 'normal' },
		left :88,
		top : (OS_ANDROID)? 30: 52,
		width:'30%'
	});
	top_bar.add(token_balance);
	
	var backToTrendingButton =  _requires['util'].makeImage({
		image : '/images/question_mark.png',
		width : 34,
		height : 30
	});
	backToTrendingButton.left = 5;
	backToTrendingButton.top = (OS_ANDROID)?10: 33;
	
	backToTrendingButton.addEventListener('click', function(e) {
		if(showingDashboard == false){
			globals.webapps.buttonShow();
			showingDashboard = true;
			backToTrendingButton.image = '/images/question_mark.png';
		
			intro_view.show();
			intro_view.animate({opacity:1, duration:500});
		}
		else{
			var dialog = _requires['util'].createDialog({
		   		title:L('exchange_how_to_title'),
				message:L('exchange_how_to'),
				buttonNames: [L('how_to_exchange_ok')]
			});
			dialog.addEventListener('click', function(e){
				if( e.index == e.source.cancel ){
					Ti.App.Properties.setString('shows_dex_how3', "FALSE");
				}
			});
			dialog.show();
		}
	});
	top_bar.add(backToTrendingButton);
	
	var ordersLoadtarted = false;
	var buySell = _requires['util'].group();
	buySell.height = 35;
	buySell.width = '40%';
	buySell.backgroundColor = 'white';
	buySell.borderRadius = 4;
	buySell.borderWidth = 1;
	buySell.borderColor = 'white';
	buySell.top = (OS_ANDROID)?10: 30;
	buySell.right = 5;
	top_bar.add(buySell);
	
	var linebreak =  Ti.UI.createView({
		backgroundColor : 'white',
		width : 1,
		height : 35
	});
	linebreak.opacity = 0.5;
	var buyButton = Ti.UI.createButton({
        backgroundColor : '#e54353',
        title : L('label_buy'),
        width : '50%', height : '100%',
        color:'white',
        left: 0,
        font:{ fontFamily:'Helvetica Neue', fontSize:15, fontWeight:'normal' },
    });
	buySell.add(buyButton);
	buySell.opacity = 0.3; 
	buySell.touchEnabled = false;
	
	var sellButton = Ti.UI.createButton({
        backgroundColor : "white",
        title : L('label_sell'),
        width : '50%',
        height : '100%',
        color:'black',
        right:0,
        font:{fontFamily:'Helvetica Neue', fontSize:15, fontWeight:'normal'},
    });
   
	buySell.add(sellButton);
	buySell.add(linebreak);
	
	function checkSellToken() {
		var foundToken = false;
		for( var i = 0; i < globals.balances.length; i++ ){
			if(globals.balances[i].token === selected_asset) foundToken = true;
		}
		if( foundToken == false ){
			selected_asset = '';
			token_balance.text = '';
			box1.removeAllChildren();
			instructions_1.text = L('label_exchange_token_not_found');
			instructions_1.opacity = 1;
			put_box1(L('label_exchange_select_token'));
			hideShowOrders(true);
			box1_asset_image.hide();
			darkView.animate(showDarkView);
			darkView.show();
			pickerOrder.animate(slide_out);
			picker1.animate(slide_in);
			ordersLoadStarted = false;
		}
		return foundToken;
	}
	
	function pushSellButton() {
		buySellType = 'sell';
		buy_asset = 'XCP';
		if(selected_asset.length > 0) spend_asset = selected_asset;
		
		sellButton.backgroundColor = '#6db558';
		buyButton.backgroundColor = "white";
		sellButton.color = "white";
		buyButton.color = "black";
		search_tokens = [];
		
		for( var i = 0; i < globals.balances.length; i++ ){
			if(globals.balances[i].token !== 'XCP' && globals.balances[i].token !== 'BTC'){
				search_tokens.push(globals.balances[i]);
			}
		}
		
		//searchField.hide();
		//search.opacity = 0.0;
		addBuySellTokens();
		if( checkSellToken() ){
			setBalance();
			if( !ordersLoadStarted ) globals.getOrders();
			
			backToTrendingButton.image = '/images/back_arrow.png';
			intro_view.animate({opacity:0, duration:500});
			setTimeout(function() { intro_view.hide();}, 500);
			
			globals.webapps.buttonHide();
			showingDashboard = false;
		}
		getXCPBalance();
		
		if (sell_order_button != undefined) {
			sell_order_button.hide();
		}
		if (buy_order_button != undefined) {
			buy_order_button.show();
		}
		labels1.text = '  ' + L('label_exchange_sell_orders').format({'asset':selected_asset});
		labels2.text = '  ' + L('label_exchange_buy_orders').format({'asset':selected_asset});
	}
	sellButton.addEventListener('click', pushSellButton);
	
	function pushBuyButton() {
		buySellType = 'buy';
		spend_asset = 'XCP';
		if(selected_asset.length > 0){
			buy_asset = selected_asset;
		}
		addSearchTokens();
		buyButton.backgroundColor = '#e54353';
		sellButton.backgroundColor = "white";
		sellButton.color = "black";
		buyButton.color = "white";
		
		token_balance.text = "";
		setBalance();
		getXCPBalance();
		//searchField.show();
		//search.opacity = 1.0;
		addBuySellTokens();
		
		if (sell_order_button != undefined) {
			sell_order_button.show();
		}
		if (buy_order_button != undefined) {
			buy_order_button.hide();
		}
		labels1.text = '  ' + L('label_exchange_sell_orders').format({'asset':selected_asset});
		labels2.text = '  ' +L('label_exchange_buy_orders').format({'asset':selected_asset});
		
		if( !ordersLoadStarted ) globals.getOrders();
		backToTrendingButton.image = '/images/back_arrow.png';
		
		intro_view.animate({opacity:0, duration:500});
		setTimeout(function() { intro_view.hide();}, 500);
		globals.webapps.buttonHide();
		showingDashboard = false;
	}
	buyButton.addEventListener('click', pushBuyButton);
	
	var instructions_1 = _requires['util'].makeLabel({
		text : L('label_exchange_instructions1'),
		color : 'white',
		top: 60,
		height: 75,
		font : { fontFamily : 'Helvetica Neue', fontSize : 15, fontWeight : 'normal' },
		textAlign:'center',
		width: '90%'
	});
		
	//top_bar.add(instructions_1);
	
	var amount_label = _requires['util'].makeLabel({
		color : 'white',
		text:L('label_exchange_amount'),
		textAlign : 'center',
		height :'100%',
		width:'23%',
		minimumFontSize : 5,
		left:0,
		font:{fontFamily:'Helvetica Neue', fontSize:13, fontWeight:'normal'},
	});
	
	var price_label = _requires['util'].makeLabel({
		color : 'white',
		text:L('label_exchange_price') + ' XCP',
		textAlign : 'center',
		height :'100%',
		width:'20%',
		minimumFontSize : 5,
		left:0,
		font:{fontFamily:'Helvetica Neue', fontSize:13, fontWeight:'normal'},
	});
		
	var total_label = _requires['util'].makeLabel({
		color : 'white',
		text:L('label_exchange_total') + ' XCP',
		textAlign : 'center',
		height :'100%',
		width:'20%',
		minimumFontSize : 5,
		left:5,
		font:{fontFamily:'Helvetica Neue', fontSize:13, fontWeight:'normal'},
	});
	
	var empty2 = _requires['util'].makeLabel({
		color : 'white',
		text: ' ',
		textAlign : 'center',
		height :'100%',
		width: 33,
		left: 5,
		font:{fontFamily:'Helvetica Neue', fontSize:13, fontWeight:'normal'},
	});
	
	var XCP_balance = _requires['util'].makeLabel({
		text : '',
		textAlign : 'left',
		color : 'white',
		left: 10, top: 0,
		font : { fontFamily : 'Helvetica Neue', fontSize : 10, fontWeight : 'normal' },
		width:'20%'
	});
	
	var label_fee = _requires['util'].makeLabel({
		text: '',
		width: '20%',
		top: 0,
		left: 8,
		color:'white',
		font:{ fontFamily : 'Helvetica Neue', fontSize : 10, fontWeight : 'normal' }
	});
	
	if( isFinite(_requires['cache'].data.current_fee) ) label_fee.text = L('label_fee') + ' ' + _requires['cache'].data.current_fee + 'BTC ▼';
	else label_fee.text = L('label_fee') + ' ' + globals.fee_text[_requires['cache'].data.current_fee] + ' ▼';
	
	label_fee.addEventListener('click', function(e) {
		globals.picker_fee.open();
	});
	globals.label_dexfee = label_fee;
	
	var labels_row = _requires['util'].group({
		'amount_label' : amount_label,
		'empty2' : empty2,
		'price_label' : price_label,
		'total_label' : total_label,
	},'horizontal');
	labels_row.width = '100%';
	labels_row.height = 20;
	labels_row.top = 0;
	labels_row.left = 0;
	
	var amount_dex_field = _requires['util'].makeTextField({
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		color : 'black',
		textAlign : 'center',
		hintText:'',
		keyboardType : Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD,
		font : { fontFamily : 'Helvetica Neue', fontSize : 13, fontWeight : 'normal' },
		minimumFontSize : 10,
		height : (OS_ANDROID)? 35: 25,
		width:'20%',
		left:5
	});
	
	var price_dex_field = _requires['util'].makeTextField({
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		color : 'black',
		textAlign : 'center',
		hintText:'',
		keyboardType : Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD,
		font : { fontFamily : 'Helvetica Neue', fontSize : 13, fontWeight : 'normal' },
		minimumFontSize : 8,
		height : (OS_ANDROID)? 35: 25,
		width:'20%',
		left: 5
	});
		
	var total_dex_field = _requires['util'].makeTextField({
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		color : 'black',
		textAlign : 'center',
		hintText:'',
		keyboardType : Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD,
		font : { fontFamily : 'Helvetica Neue', fontSize : 13, fontWeight : 'normal' },
		minimumFontSize : 8,
		height : (OS_ANDROID)? 35: 25,
		width:'20%',
		left:5
	});
	
	var price_dex_field_fiat = _requires['util'].makeLabel({
		color : 'white',
		text:'---',
		textAlign : 'center',
		top:0,
		height :20,
		width:'20%',
		left:3,
		minimumFontSize : 8,
		font : { fontFamily : 'Helvetica Neue', fontSize : 10, fontWeight : 'normal' },
	});
		
	var tmp = view.rect.width * 0.25;
	var total_dex_field_fiat = _requires['util'].makeLabel({
		color : 'white',
		text:'---',
		textAlign : 'center',
		top:0,
		height :20,
		width:'20%',
		left:3,
		minimumFontSize : 10,
		font : { fontFamily : 'Helvetica Neue', fontSize : 10, fontWeight : 'normal' },
	});
	
	amount_dex_field.addEventListener('focus', function() {
	    amount_dex_field_focus = true;
    });
    amount_dex_field.addEventListener('blur', function() {
     	amount_dex_field_focus = false;
    });
	amount_dex_field.addEventListener('change', function(e) {
		if( e.value.length > 0 ){
			if(selected_asset === ''){
				alert(L('label_exchange_token'));
			}
			else{
				if(amount_dex_field_focus == true){
					if( e.fireEvent != null ) amount_dex_field_focus = false;
					if(parseFloat(price_dex_field.value) >= 0){					
						total_dex_field.value = parseFloat(e.value) * parseFloat(price_dex_field.value);
						if(fiat_mode == false){
							var price_fiat =  _requires['tiker'].to('XCP', price_dex_field.value, dex_currency, 8);
							var total_fiat =  _requires['tiker'].to('XCP', total_dex_field.value, dex_currency, 8);
							total_dex_field_fiat.text = total_fiat;
							price_dex_field_fiat.text = price_fiat;
						}
						else{
							var fiat_val = _requires['tiker'].to('XCP', 1, dex_currency,8);
							var symbol = globals.tiker[dex_currency].symbol;
							fiat_val = fiat_val.replace(symbol,'');
							fiat_val = fiat_val.replace(',','');
							
							var price_token =  (price_dex_field.value / fiat_val);
							var total_token = price_token * parseFloat(e.value);
							
							if(price_token >= 1){
								price_token = price_token.toFixed(3);
							}
							else if(price_token > 0.1){
								price_token = price_token.toFixed(4);
							}
							else{
								price_token = price_token.toFixed(8);
							}
							
							if(total_token >= 1){
								total_token = total_token.toFixed(3);
							}
							else if(total_token > 0.1){
								total_token = total_token.toFixed(4);
							}
							else{
								total_token = total_token.toFixed(8);
							}
							
							total_dex_field_fiat.text = total_token + 'XCP';
							price_dex_field_fiat.text = price_token + 'XCP';
						}
					}
				}
			}
		}
	});
	price_dex_field.addEventListener('focus', function() {
        price_dex_field_focus = true;
    });
    price_dex_field.addEventListener('blur', function() {
        price_dex_field_focus = false;
    });
    function updatePrice(){
    	if( price_dex_field.value.length > 0 ){
		if(selected_asset === ''){
			alert(L('label_exchange_token'));
		}else{
			 
			if(parseFloat(amount_dex_field.value)  >= 0){
				total_dex_field.value = parseFloat(price_dex_field.value) * parseFloat(amount_dex_field.value);
					if(fiat_mode == false){
						var price_fiat = _requires['tiker'].to('XCP', price_dex_field.value, dex_currency,8);
						var total_fiat = _requires['tiker'].to('XCP', total_dex_field.value, dex_currency,8);
						
						total_dex_field_fiat.text = total_fiat;
						price_dex_field_fiat.text =  price_fiat;
					}
					else{
						
						var fiat_val = _requires['tiker'].to('XCP', 1, dex_currency,8);
						var symbol = globals.tiker[dex_currency].symbol;
						fiat_val = fiat_val.replace(symbol,'');
						fiat_val = fiat_val.replace(',','');
						
						
						var price_token =  ( price_dex_field.value / fiat_val);
						if(price_token >= 1){
							price_token = price_token.toFixed(3);
						}
						else if(price_token > 0.1){
							price_token = price_token.toFixed(4);
						}
						else{
							price_token = price_token.toFixed(8);
						}
						
						
						var total_token =  (total_dex_field.value / fiat_val);
						if(total_token >= 1){
							total_token = total_token.toFixed(3);
						}
						else if(total_token > 0.1){
							total_token = total_token.toFixed(4);
						}
						else{
								total_token = total_token.toFixed(8);
						}
						
						total_dex_field_fiat.text = total_token +'XCP';
						price_dex_field_fiat.text = price_token +'XCP';
					}
				}	
			}
		}
    }
	price_dex_field.addEventListener('change', function(e) {
		if(price_dex_field_focus == true){
			updatePrice();
		}
	});
	total_dex_field.addEventListener('focus', function() {
        total_dex_field_focus = true;
    });
    total_dex_field.addEventListener('blur', function() {
		total_dex_field_focus = false;
    });
	total_dex_field.addEventListener('change', function(e) {
		if( e.value.length > 0 ){
			if(selected_asset === '') alert(L('label_exchange_token'));
			else{
				 if(total_dex_field_focus == true){
					if(amount_dex_field.value > 0){
						var price_val = (parseFloat(e.value) / parseFloat(amount_dex_field.value));
						price_val = parseFloat(price_val);
					    
					    if(price_val >= 1){
							price_val = price_val.toFixed(3);
						}
						else if(price_val > 0.1){
							price_val = price_val.toFixed(4);
						}
						else{
							price_val = price_val.toFixed(8);
						}
						price_dex_field.value = price_val;
						
					}
					if(fiat_mode == false){
						var total_fiat = _requires['tiker'].to('XCP', e.value, dex_currency,8);
						total_dex_field_fiat.text = total_fiat;
						
						var price_fiat = _requires['tiker'].to('XCP', price_dex_field.value, dex_currency,8);
						price_dex_field_fiat.text = price_fiat;
						
					}
					else if( amount_dex_field.value !== '' ){
						var fiat_val = _requires['tiker'].to('XCP', 1, dex_currency,8);
						var symbol = globals.tiker[dex_currency].symbol;
						fiat_val = fiat_val.replace(symbol,'');
						fiat_val = fiat_val.replace(',','');
						var total_token =  (total_dex_field.value / fiat_val);
						if(total_token >= 1){
							total_token = total_token.toFixed(3);
						}
						else if(total_token > 0.1){
							total_token = total_token.toFixed(4);
						}
						else{
							total_token = total_token.toFixed(8);
						}
						total_dex_field_fiat.text = total_token +'XCP';
					    price_dex_field.value = (parseFloat(e.value) / parseFloat(amount_dex_field.value));
						
						var price_token =  (price_dex_field.value / fiat_val);
						if(price_token >= 1){
							price_token = price_token.toFixed(3);
						}
						else if(price_token > 0.1){
							price_token = price_token.toFixed(4);
						}
						else{
							price_token = price_token.toFixed(8);
						}
						price_dex_field_fiat.text = price_token +'XCP';
					}
				}
			}
		}
	});
	
	var slide_in; 
	var slide_out;
	
	var showDarkView = Ti.UI.createAnimation({opacity:0.4, duration:200});
	var fadeDarkView = Ti.UI.createAnimation({opacity:0.0, duration:200});
	
	if( OS_ANDROID ){
		slide_in = Ti.UI.createAnimation({top: display_height - 460, duration:200});
		slide_out = Ti.UI.createAnimation({top: display_height, duration:200});
	}
	else {
		slide_in = Ti.UI.createAnimation({bottom: 50, duration:200});
		slide_out = Ti.UI.createAnimation({bottom: -340, duration:200});
	}
	
	var slide_in2 =  Ti.UI.createAnimation({bottom: 0, duration:200});
	var slide_out2 =  Ti.UI.createAnimation({bottom: -240, duration:200});		

	var searchField = _requires['util'].makeTextField({
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		color : 'black',
		hintText : 'Enter name',
		autocorrect : false,
		left : 5,
		width : 130,
		height : (OS_ANDROID)? 40 : 30
	});
	var search = _requires['util'].makeLabel({
		text : L('label_search'),
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		},
		height : 30,
		left : 150
	});

	var close = _requires['util'].makeLabel({
		text : L('label_search_close'),
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		},
		height : 30,
		right : 10
	});
	
	var close_order = _requires['util'].makeLabel({
		text : L('label_search_close'),
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'light'
		},
		height : 30,
		right : 10
	});
	
	var order_list_title = _requires['util'].makeLabel({
		text : L('order_list_title'),
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'light'
		},
		height : 30
	});

	picker_toolbar.add(searchField);
	picker_toolbar.add(search);
	picker_toolbar.add(close);
	
	
	picker_toolbar_order.add(close_order);
	picker_toolbar_order.add(order_list_title);
	
	var searchText = ' ';
	
	searchField.addEventListener('change', function(e) {
		searchText = e.value;
		
		if(e.value.length == 0){
			search_tokens = popular_tokens;
			addBuySellTokens();
		}
		
	});
	
	close.addEventListener('click',function() {
		searchField.blur();
		darkView.animate(fadeDarkView);
		setTimeout(function() { darkView.hide(); }, 200);
		picker1.animate(slide_out);
	});
	
	close_order.addEventListener('click',function() {
		pickerOrder.animate(slide_out);
		darkView.animate(fadeDarkView);
		setTimeout(function() { darkView.hide(); }, 200);
	});


	var labels = _requires['util'].group({
		
		"amount" : _requires['util'].makeLabel({
			text : L('label_exchange_amount'),
			left:10,
			color : '#9b9b9b',
			textAlign : 'left',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 10,
				fontWeight : 'bold'
			},
		}),

		"price" : _requires['util'].makeLabel({
			text : L('label_exchange_price'),
			color : '#9b9b9b',
			textAlign : 'left',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 10,
				fontWeight : 'bold'
			},
		})
	});
	labels.width = '100%';
	labels.height = 15;

	var labels1 = _requires['util'].makeLabel({
		text: '  '+ L('label_exchange_sell_orders').format({'asset':selected_asset}),
		left: 0,
		bottom: 2,
		color: '#9b9b9b',
		textAlign: 'left',
		font: {
			fontFamily : 'Helvetica Neue',
			fontSize : 10,
			fontWeight : 'bold'
		}
	});
	labels1.backgroundColor = '#ececec';
	labels1.width = '100%';
	labels1.height = 15;
	labels1.opacity = 0.0;
	
	var labels2 = _requires['util'].makeLabel({
		text : '  '+ L('label_exchange_buy_orders').format({'asset': selected_asset}),
		color : '#9b9b9b',
		textAlign : 'left',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 10,
			fontWeight : 'bold'
		}
	});
	labels2.backgroundColor = '#ececec';
	labels2.width = '100%';
	labels2.height = 15;
	var addingTokens = false;
	var addBuySellTokens = function( isaddsearch ){
		if( isaddsearch == null || isaddsearch ) addSearchTokens();
		if( addingTokens == false ){
			addingTokens = true;
			buySellTokens.setRowDesign(search_tokens, function(row, val) {
				var nameLeft = 10;
				if( val.token != L('label_exchange_getting_tokens') && val.token != L('label_exchange_search_limit') ){
					nameLeft = 55;
					var token_image = Ti.UI.createImageView({
						defaultImage: '/images/blankPlaceholder.png',
						image: Alloy.CFG.api_uri + 'v2/tokens/' + val.token +'/image?width=100&X-Api-Key=' + Alloy.Globals.api_key,
						width: 33, height: 33,
						left: 8
					});
					row.add(token_image);
				}
				var label = Ti.UI.createLabel({
					text : val.token,
					font : { fontFamily : 'HelveticaNeue-Light', fontSize : 20, fontWeight : 'normal' },
					color : 'black',
					width : 'auto', height : 'auto',
					left : nameLeft
				});
				row.add(label);
				return row;
			});
			addingTokens = false;
		}
	};
	
	buySellTokens.addEventListener('click', selectToken);

	box1_range.addEventListener('touchstart', function() {
		pickerOrder.animate(slide_out);
		picker1.animate(slide_in);
		darkView.animate(showDarkView);
		darkView.show();
		search_tokens = [ {token: L('label_exchange_getting_tokens') }];
		setTimeout(function() { addBuySellTokens(); }, 500);
	});
	
	search.addEventListener('click', function(){
		searchField.blur();

		if (searchText.length > 0) {
			if (searchText.length < 3) {
				search_tokens = [ {token: L('label_exchange_search_limit') }];
				addBuySellTokens(false);
				return;
			}
			search_tokens = [ {token: L('label_exchange_getting_tokens') }];
			addBuySellTokens(false);
			_requires['network'].connectGETv2({
				'method' : 'tokens?name=' + searchText,
				'callback' : function(result) {
					search_tokens = result;
					addBuySellTokens(false);
				},
				'onError' : function(error) {
					var dialog = _requires['util'].createDialog({
						'title': error.type,
						'message': error.message,
						'buttonNames': [L('label_close')]
					}).show();
				}
			});
		} else {
			search_tokens = popular_tokens;
		}
	});

	function setBalance(){
		token_balance.text = '';
		for( var i = 0; i < globals.balances.length; i++ ){
			if(globals.balances[i].token === selected_asset){
				var trim_price = globals.balances[i].balance.toFixed2(8);
				token_balance.text = '(' + trim_price + ')';
			}
		}
		if( selected_asset !== '' && token_balance.text === '' ) token_balance.text = '(0)';
	}
	
	function setOrderParameters( token, option ){
		var selectedVal = token;
		selected_asset = selectedVal;
		
		if( buySellType === 'sell' && !checkSellToken() ) return false;
		
		resetForm();
		amount_dex_field.hintText = selected_asset;
		price_dex_field.hintText = selected_asset;
		
		if( option != null ){
			buySellType = option.type || 'buy';
			
			ordersLoadStarted = loadCompleted = false;
			if( buySellType === 'buy' ) pushBuyButton();
			else pushSellButton();
			
			if( option.currency != null && option.currency != 'XCP' ){
				if( globals.tiker[option.currency] != null ) dex_currency = option.currency;
			}
			if( fiat_mode != (option.currency != null && option.currency != 'XCP') ) modeSwitch();
			
			if( option.price ){
				price_dex_field.value = option.price;
			}
			if( option.amount ){
				amount_dex_field.value = option.amount;
				amount_dex_field_focus = true;
			}
		}
		if( fiat_mode ){
			price_label.text = L('label_exchange_price') + ' ' + globals.tiker[dex_currency].symbol;
			total_label.text = L('label_exchange_total') + ' ' + globals.tiker[dex_currency].symbol;
		}
		
		if( buySellType === 'buy' ) buy_asset = selected_asset;
		else spend_asset = selected_asset;
		
		box1.removeAllChildren();
		
		var token_image = Ti.UI.createImageView({
			defaultImage: '/images/blankPlaceholder.png',
			image: Alloy.CFG.api_uri + 'v2/tokens/' + selected_asset + '/image?X-Api-Key=' + Alloy.Globals.api_key,
			width: 33, height: 33,
			left: 2
		});
		box1.add(token_image);
		flushTextFields();
		
		fields_row.touchEnabled = true;
		
		put_box1(selectedVal);
		box1_asset_image.show();
	 	setBalance();
	 	getXCPBalance();
	 	
	 	buySell.opacity = 1; 
		buySell.touchEnabled = true;
		
		instructions_1.text = L('label_exchange_instructions2');
		
		fields_row.opacity = 1;
		switch_image.opacity = 1;
		
		if( !ordersLoadStarted ) globals.getOrders();
		
		if( option != null && loadCompleted ){
			loadedOrderdatas();
		}
		
		return true;
	}
	globals.setOrderParameters = setOrderParameters;
	
	function selectToken(e) {
		var canAddToken = true;
		for( var i = 0; i < popular_tokens.length; i++ ){
			if(popular_tokens[i].token === search_tokens[e.index].token){
				canAddToken = false;
			}
		}
		if(canAddToken == true){
			var tokenHistory = Ti.App.Properties.getList('tokenHistory');
			if(tokenHistory){
				
				var canAddToken2 = true;
				for( var i = 0; i < tokenHistory.length; i++ ){
					if(tokenHistory[i].token === search_tokens[e.index].token){
						canAddToken2 = false;
					}
				}
				if(canAddToken2 == true){
					tokenHistory.push(search_tokens[e.index]);
				}
				
				if(tokenHistory.length > 5){
					tokenHistory.shift();
				}
			}else{
				tokenHistory = [];
				tokenHistory.push(search_tokens[e.index]);
			}
			popular_tokens = popular_tokens.concat(search_tokens[e.index]);
		}
		
		var selectedVal = search_tokens[e.index].token;
		selected_asset = selectedVal;
		amount_dex_field.hintText = selected_asset;
		price_dex_field.hintText = selected_asset;
		
		if( buySellType === 'buy' ) buy_asset = selected_asset;
		if( buySellType === 'sell' ) spend_asset = selected_asset;
		
		box1.removeAllChildren();
		
		var token_image = Ti.UI.createImageView({
			defaultImage: '/images/blankPlaceholder.png',
			image: Alloy.CFG.api_uri + 'v2/tokens/' + selected_asset +'/image?width=100&X-Api-Key=' + Alloy.Globals.api_key,
			width: 33, height: 33,
			left: 2
		});
		box1.add(token_image);
		flushTextFields();
		
		picker1.animate(slide_out);
		darkView.animate(fadeDarkView);
		setTimeout(function() { darkView.hide(); }, 200);
		fields_row.opacity = 1;
		switch_image.opacity = 1;
		fields_row.touchEnabled = true;
		
		put_box1(selectedVal);
		box1_asset_image.show();
	 	setBalance();
	 	getXCPBalance();
	 	
	 	buySell.opacity = 1; 
		buySell.touchEnabled = true;
		
		instructions_1.text = L('label_exchange_instructions2');
		
		if( buySellType !== 'none'){
			globals.getOrders();
			backToTrendingButton.image = '/images/back_arrow.png';
		
			intro_view.animate({opacity:0, duration:500});
			setTimeout(function() { intro_view.hide();}, 500);
			globals.webapps.buttonHide();
			showingDashboard = false;
		}
	}
	var orders1Array = [];
	var orders2Array = [];
	var closedOrdersArray = [];

	function selectRow1(e) {
		 var rowId = e.rowData.rowId;
		 
		 if(fiat_mode == false){
			 price_dex_field.value = orders1Array[e.index].price.toFixed2(8);
		 }
		 else{
		 	var fiat_price_val = _requires['tiker'].to('XCP', (spend_asset === 'XCP')? orders1Array[e.index].price: orders1Array[e.index].price, dex_currency, 8);
			fiat_price_val = fiat_price_val.replace(/[^\d.-]/g, '');
			price_dex_field.value = fiat_price_val;								
   		}
   		
		var dialog = _requires['util'].createDialog({
			title:'',
			message:L('label_exchange_copied'),
			buttonNames: ['OK']
		});
			
		dialog.show();
		updatePrice();
	}
	function selectRow2(e) {
		 var rowId = e.rowData.rowId;
		 if(fiat_mode == false){
			 price_dex_field.value = orders2Array[e.index].price.toFixed2(8);
		 }
		 else{
		 	var fiat_price_val = _requires['tiker'].to('XCP', (spend_asset === 'XCP')? orders2Array[e.index].price: orders2Array[e.index].price, dex_currency, 8);
				fiat_price_val = fiat_price_val.replace(/[^\d.-]/g, '');
				price_dex_field.value = fiat_price_val;								
   		}
		var dialog = _requires['util'].createDialog({
   			title:'',
			message:L('label_exchange_copied'),
			buttonNames: ['OK']
		});
		dialog.show();
   		updatePrice();
	}

	var closedLabel = _requires['util'].makeLabel({
		text : '  ' + L('label_exchange_closed_orders'),
		left : 0,
		height:15,
		width:'100%',
		backgroundColor:'#ececec',
		color : '#9b9b9b',
		textAlign : 'left',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 10,
			fontWeight : 'bold'
		},
	});

	function selectRowClosed(e) {
		 var rowId = e.rowData.rowId;
		
		 if(fiat_mode == false){
			 price_dex_field.value = closedOrdersArray[e.index].price.toFixed2(8);
		 }
		 else{
			var fiat_price_val = _requires['tiker'].to('XCP', (spend_asset === 'XCP')? closedOrdersArray[e.index].price:closedOrdersArray[e.index].price, dex_currency, 8);
				fiat_price_val = fiat_price_val.replace(/[^\d.-]/g, '');
				price_dex_field.value = fiat_price_val;							
   		}
   		updatePrice();
	}
	function selectRowOrder(index) {
		 var anOrder = my_order_history[index];
		 var statusOrder = anOrder.status;
		 
		 if( statusOrder == 'open' ){
		 	var cancelingStatus = Ti.App.Properties.getString(anOrder.tx_hash);
			if( cancelingStatus !== 'CANCELING' ){
			 	var loading = _requires['util'].showLoading(globals.main_window, {
					width : Ti.UI.FILL,
					height : Ti.UI.FILL
				});
				_requires['network'].connectGETv2({
  					'method': 'fees/recommended',
   					'callback': function(result){
						_requires['network'].connectPOSTv2({
		  					'method': 'transactions/cancel',
		    				'post': {
		       				 	source: _requires['cache'].data.address,
		       					offer_hash:anOrder.tx_hash,
		       					fee_per_kb:result[_requires['cache'].data.current_fee],
		   					 },
		   					 'callback': function(result){
		   					 	loading.removeSelf();
		   					 	
		   					 	var feeInBTC = (result.fee / 1e8).toFixed2(8);
								var feeInCurrency = globals.requires['tiker'].to('BTC', feeInBTC, dex_currency);
							
		   					 	
		   					 	var dialog = _requires['util'].createDialog({
						   			title:L('exchange_cancel_confirm_title'),
									message:L('exchange_cancel_confirm').format({'fee' :  feeInBTC + 'BTC (' + feeInCurrency + ')' + '\n' + globals.fee_text[_requires['cache'].data.current_fee]}),
									buttonNames: [L('exchange_cancel_cancel'),L('exchange_cancel_ok')]
								});
								dialog.addEventListener('click', function(e){
									if( e.index != e.source.cancel ){
										_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
											if( e.success ){
		   					 					loading = _requires['util'].showLoading(globals.main_window, {
													width : Ti.UI.FILL,
													height : Ti.UI.FILL
												});
		   					 					Ti.App.Properties.setString(anOrder.tx_hash, "CANCELING");
						     				 	_requires['bitcore'].sign(result.unsigned_tx, {
													'callback': function(signed_tx){
														_requires['network'].connectPOSTv2({
															'method': 'transactions/broadcast',
															'post': {
																tx: signed_tx
															},
															'callback': function( result ){
																_requires['util'].createDialog({
																	message : L('exchange_confirm_canceled_message'),
																	buttonNames : [L('label_close')]
																}).show();
															},
															'onError': function(error){
																if( loading != null ) loading.removeSelf();
										      			  		var dialog = _requires['util'].createDialog({
																	'title': error.type,
																	'message': error.message,
																	'buttonNames': [L('label_close')]
																}).show();
															},
															'always': function(){
																loading.removeSelf();
																resetForm();
																getOrderHistory(null);
															}
														});
													},
													'fail': function(error){
														loading.removeSelf();
														_requires['util'].createDialog({
															'message': error,
															'buttonNames': [L('label_close')]
														}).show();
													}
												});
											}
										}});
									}	
								});
								dialog.show();
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
					},
					'onError' : function(error) {
						if( loading != null ) loading.removeSelf();
						var dialog = _requires['util'].createDialog({
							'title': error.type,
							'message': error.message,
							'buttonNames': [L('label_close')]
						}).show();
					}
				});
			}
		}
	}
	function showNoOrdersSellTutorial(){
		if( Ti.App.Properties.getString('shows_order_how') !== 'FALSE'){
			if(spend_asset === 'XCP'){
				var dialog = _requires['util'].createDialog({
		   			title:L('exchange_how_to_orders_title_sell').format({'asset':buy_asset}),
					message:L('exchange_how_to_no_orders_sell').format({'asset':buy_asset}),
					buttonNames: [L('text_dont_show'),'OK']
					});
					dialog.addEventListener('click', function(e){
					if( e.index == e.source.cancel ){
						Ti.App.Properties.setString('shows_order_how', "FALSE");
					}
				});
				dialog.show();
			}
		}
	}
	function showNoOrdersBuyTutorial(){
		if( Ti.App.Properties.getString('shows_order_how') !== 'FALSE'){
			if(spend_asset !== 'XCP'){
				var dialog = _requires['util'].createDialog({
		   			title:L('exchange_how_to_orders_title_buy').format({'asset':spend_asset}),
					message:L('exchange_how_to_no_orders_sell').format({'asset':spend_asset}),
					buttonNames: [L('text_dont_show'), 'OK']
				});
				dialog.addEventListener('click', function(e){
					if( e.index == e.source.cancel ){
						Ti.App.Properties.setString('shows_order_how', "FALSE");
					}
				});
				dialog.show();
			}	
		}
	}
	function showOrdersTutorial(){
		if( Ti.App.Properties.getString('shows_order_how') !== 'FALSE'){
				
			if(spend_asset == 'XCP'){
				var dialog = _requires['util'].createDialog({
	   			title:L('exchange_how_to_orders_title_sell').format({'asset':buy_asset}),
				message:L('exchange_how_to_orders_sell').format({'asset':buy_asset}),
				buttonNames: [L('text_dont_show'), L('how_to_exchange_ok')]
				});
				dialog.addEventListener('click', function(e){
					if( e.index == e.source.cancel ){
						Ti.App.Properties.setString('shows_order_how', "FALSE");
					}
				});
				if(orders1Array.length > 0){
					dialog.show();
				}
			}
			else{
				var dialog = _requires['util'].createDialog({
	   			title:L('exchange_how_to_orders_title_buy').format({'asset':spend_asset}),
				message:L('exchange_how_to_orders_buy').format({'asset':spend_asset}),
				buttonNames: [L('text_dont_show'), L('how_to_exchange_ok')]
				});
				dialog.addEventListener('click', function(e){
					if( e.index != e.source.cancel ){
						Ti.App.Properties.setString('shows_order_how', "FALSE");
					}
				});
				if(orders2Array.length > 0){
					dialog.show();
				}
			}
		}
	}
	
	var loadCompleted = false;
	function loadedOrderdatas(){
		loadCompleted = true;
		if( amount_dex_field.value >= 0 && price_dex_field.value > 0 ){
			order();
		}
	}
	var ordersLoadStarted = false;
	
	globals.didLoadTrending = function(tokenClicked){
		setTimeout(function() { getOrderHistory(null); }, 300);
	};
	
	globals.clickedTrending = function(tokenClicked){
		selected_asset = tokenClicked;
		amount_dex_field.hintText = selected_asset;
		price_dex_field.hintText = selected_asset;
		
		buy_asset = selected_asset;
		spend_asset = 'XCP';
		
		box1.removeAllChildren();
		
		var token_image = Ti.UI.createImageView({
			defaultImage: '/images/blankPlaceholder.png',
			image: Alloy.CFG.api_uri + 'v2/tokens/' + selected_asset +'/image?width=100&X-Api-Key=' + Alloy.Globals.api_key,
			width: 33, height: 33,
			left: 2
		});
		box1.add(token_image);
		flushTextFields();
		
		fields_row.opacity = 1;
		switch_image.opacity = 1;
		fields_row.touchEnabled = true;
		
		put_box1(tokenClicked);
		box1_asset_image.show();
	 	
	 	buySell.opacity = 1; 
		buySell.touchEnabled = true;
		
		instructions_1.text = L('label_exchange_instructions2');
		
		buySellType = 'buy';
		
		if(selected_asset.length > 0){
			buy_asset = selected_asset;
		}
		addSearchTokens();
		buyButton.backgroundColor = '#e54353';
		sellButton.backgroundColor = "white";
		sellButton.color = "black";
		buyButton.color = "white";
		
		token_balance.text = "";
		setBalance();
		getXCPBalance();
		searchField.show();
		search.opacity = 1.0;
		addBuySellTokens();
		
		if (typeof sell_order_button !== 'undefined') {
			sell_order_button.show();
		}
		if (typeof buy_order_button !== 'undefined') {
			buy_order_button.hide();
		}
		labels1.text = '  ' + L('label_exchange_sell_orders').format({'asset':selected_asset});
		labels2.text = '  ' +L('label_exchange_buy_orders').format({'asset':selected_asset});
		
		globals.getOrders();
		backToTrendingButton.image = '/images/back_arrow.png';
		
		intro_view.animate({opacity:0, duration:500});
		setTimeout(function() { intro_view.hide();}, 500);
		globals.webapps.buttonHide();
		showingDashboard = false;
		
		//backToTrendingButton.animate({opacity:1, duration:500});
	};
	globals.getOrders = function(){
		var main_token = buy_asset;
		if( buy_asset === 'XCP' ) main_token = spend_asset;
		if( main_token == null || main_token.length <= 0 ) return;
		
		orders1.removeAllChildren();
		orders1.opacity = 1;
		orders1.setData([]);
		orders2.removeAllChildren();
		orders2.opacity = 1;
		orders2.setData([]);
		histories.removeAllChildren();
		histories.opacity = 1;
		histories.setData([]);
		
		labels1.text = '  '+ L('label_exchange_sell_orders').format({'asset':selected_asset});
		labels2.text = '  '+ L('label_exchange_buy_orders').format({'asset':selected_asset});
		open_orders_total_price = 0;
		open_orders_total_amount = 0;
		open_orders_total_cost = 0;
		market_price = 0;
		market_sell_price = 0;
	
		all_open_sell_orders = [];
		are_sell_orders = false;
		
		if( buy_asset != spend_asset ){
			histories.add(_requires['util'].makeLabel({
				text : L('exchange_loading_closed'),
				backgroundColor : "transparent",
				color : '#9b9b9b',
				font : {
					fontFamily : 'Helvetica Neue',
					fontSize : 12,
					fontWeight : 'bold'
				},
			}));
					
			orders1.add(_requires['util'].makeLabel({
				text : L('exchange_loading_sell'),
				backgroundColor : "transparent",
				color : '#9b9b9b',
				font : {
					fontFamily : 'Helvetica Neue',
					fontSize : 12,
					fontWeight : 'bold'
				},
			}));
						
			orders2.add(_requires['util'].makeLabel({
				text : L('exchange_loading_buy'),
				backgroundColor : "transparent",
				color : '#9b9b9b',
				font : {
					fontFamily : 'Helvetica Neue',
					fontSize : 12,
					fontWeight : 'bold'
				},
			}));
			hideShowOrders(false);
			
			ordersLoadStarted = true;
			_requires['network'].connectGETv2({
				'method' : 'orders/' + main_token + '/history',
				'callback' : function(result) {
					var matches = result;
					
					histories.opacity = 1.0;
					histories.setData([]);
					if (histories != null) histories.removeAllChildren();
					if (matches.length == 0) {
						histories.add(_requires['util'].makeLabel({
							text : L('label_noorders_closed'),
							backgroundColor : "transparent",
							color : '#9b9b9b',
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 12,
								fontWeight : 'bold'
							},
						}));
					}
					else {
						closedOrdersArray = matches;
						if (matches.length > 3) matches = matches.slice(0, 3);
						
						var tokens = ' ' + spend_asset + '/' + buy_asset;
						var current = matches[0]['price'].toFixed2(8) + tokens;
						if( matches.length > 0 ){
							var atrib = Ti.UI.createAttributedString({
								text : current,
								attributes : [{
									type : Ti.UI.ATTRIBUTE_FONT,
									value : { fontFamily : 'HelveticaNeue', fontSize : 12, fontWeight : 'bold' },
									range : [current.indexOf(tokens), (tokens).length]
								}]
							});
						}
						market_price = parseFloat(matches[0]['price']).toFixed2(8);
						
						if ( !isNaN(matches[0]['price']) ) {
							_requires['tiker'].getTiker();
						}
						
						var counter = 0;
						histories.setRowDesign(matches, function(row, val) {
							var buy_spend_asset = buy_asset;
							var token_amount = (val.type == 'buy')?val['get_quantity']: val['give_quantity'];
							var color = '#6db558';
							if (val.type == 'buy') color = '#e54353';
							if (market_sell_price == 0) market_sell_price = val.price;
							
							var date = new Date(val.block_time * 1e3);
							var formattedTime = date.getFullYear() + ' ' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + ('0'+date.getHours()).substr(-2) + ':' + ('0'+date.getMinutes()).substr(-2) + ':' + ('0' + date.getSeconds()).substr(-2);
							var typedate = _requires['util'].group({
								'type': _requires['util'].makeLabel({
									minimumFontSize:6,
									text : L('label_' + val.type + '_closed'),
									right : 0,
									top:0,
									color : '#9b9b9b',
									font : { fontFamily : 'Helvetica Neue', fontSize : 10, fontWeight : 'bold' },
								}),
								'date': _requires['util'].makeLabel({
									minimumFontSize:6,
									text : formattedTime,
									textAlign : 'right',
									right : 0, bottom: 0,
									color : '#9b9b9b',
									font : { fontFamily : 'Helvetica Neue', fontSize : 9, fontWeight : 'normal' }
								})
							}, 'vertical');
							
							typedate.right = 10;
							//row.backgroundColor = color;
							var color = '#6db558';
							if (val.type == 'buy') color = '#e54353';
							var imageType = '/images/sellAvatar.png';
							if (val.type == 'buy') imageType = '/images/buyAvatar.png';
							var avatar_image = _requires['util'].makeImage({
	   									 image: imageType,
	    								 height: 27, width:27, left: 5,
									});		
									row.add(avatar_image);
							
							var order_amount = _requires['util'].group({
								'amount_order': _requires['util'].makeLabel({
									minimumFontSize:6,
									text : trim2( token_amount ),
									textAlign : 'left',
									left : 0,
									top : 0,
									color : '#9b9b9b',
									font : {
										fontFamily : 'Helvetica Neue',
										fontSize : 10,
										fontWeight : 'normal'
									}
								}),
								'amount_token': _requires['util'].makeLabel({
									minimumFontSize:6,
									text : main_token,
									textAlign : 'left',
									left : 0,
									top: (OS_ANDROID)? -1: 1,
									color : '#9b9b9b',
									font : {
										fontFamily : 'Helvetica Neue',
										fontSize : 10,
										fontWeight : 'normal'
									}
								})
							}, 'vertical');
							order_amount.left = 40;
							
							var fiat_order = _requires['util'].makeLabel({
								minimumFontSize:6,
								text : _requires['tiker'].to('XCP', val.price, dex_currency, 8),
								textAlign : 'right',
								top: 15, left: 0,
								color : color,
								font : {
									fontFamily : 'Helvetica Neue',
									fontSize : 11,
									fontWeight : 'normal'
								}
							});
							var display_heightdex = _requires['util'].getDisplayHeight();
							if(display_heightdex < 700){
								fiat_order.top = 12;
							}
							
							var trim_price = trim( val.price );
							//hist
							var price_order = _requires['util'].makeLabel({
								minimumFontSize:6,
								text : trim_price + ' XCP',
								textAlign : 'right',
								top : 0, left: 0,
								color : color,
								font : {
									fontFamily : 'Helvetica Neue',
									fontSize : 11,
									fontWeight : 'normal'
								}
							});
							
							var order_prices = _requires['util'].group({
								'fiat_order': fiat_order,
								'price_order': price_order
							});
							row.add( order_prices );
							
							if(fiat_mode == true){
								price_order.top = 15;
								fiat_order.top = 0;
							}
							
							if(counter == 0){
								closed_lab_fiat1 = fiat_order;
								closed_lab_xcp1 = price_order;
							}
							else if(counter == 1){
								closed_lab_fiat2 = fiat_order;
								closed_lab_xcp2 = price_order;
							}
							else if(counter == 2){
								closed_lab_fiat3 = fiat_order;
								closed_lab_xcp3 = price_order;
							}
									
							counter += 1;
							row.add( order_amount );
							row.add( typedate );
							
							return row;
						}, (OS_ANDROID)? _requires['util'].convert_y(histories.toImage().height) / 3: null);
					}
					
					_requires['network'].connectGETv2({
						'method' : 'orders/' + main_token + '/book',
						'callback' : function(result) {
							
							if(buy_asset != '' && spend_asset != ''){
								hideShowOrders(false);
							}
							orders1.removeAllChildren();
							orders1.opacity = 1;
							orders1.setData([]);
							orders2.removeAllChildren();
							orders2.opacity = 1;
							orders2.setData([]);
							if (orders1 != null) orders1.removeAllChildren();
							if (result.ask.length == 0 || result.bid.length == 0){
								showNoOrdersSellTutorial();
								showNoOrdersBuyTutorial();
							}
							
							if (result.ask.length == 0 && result.bid.length == 0) {
								orders1.opacity = 1;
								orders1.add(_requires['util'].makeLabel({
									text :  L('label_noorders'),
									backgroundColor : "transparent",
									color : '#9b9b9b',
									font : {
										fontFamily : 'Helvetica Neue',
										fontSize : 12,
										fontWeight : 'bold'
									},
								}));
								orders2.add(_requires['util'].makeLabel({
									text :  L('label_noorders'),
									backgroundColor : "transparent",
									color : '#9b9b9b',
									font : {
										fontFamily : 'Helvetica Neue',
										fontSize : 12,
										fontWeight : 'bold'
									},
								}));
							} else {	
								function marge(orders, type) {
									var marged = new Array();
									var n = 0;
									for (var i = 0; i < orders.length; i++) {
										var is = true;
										if (i > 0) {
											if (orders[i].price == marged[n].price) {
												marged[n].order_amount += orders[i].order_amount;
												is = false;
											} else {
												n++;
												is = true;
											}
										}
										if (is) {
											if (marged[n] == null) marged[n] = {};
											marged[n].price = orders[i].price;
											if (type === 'buy') {
												marged[n].quantity = orders[i]["get_quantity"];
											} else {
												marged[n].quantity = orders[i]["give_quantity"];
											}
											marged[n].order_amount = orders[i].order_amount;
											marged[n].type = type;
										}
									}
									return marged;
								}
								
								var sell_orders = marge(result.ask, 'sell');
								if (sell_orders.length > 3) sell_orders = sell_orders.slice(0, 3);
								sell_orders.reverse();
								
								var buy_orders = marge(result.bid, 'buy');
								if (buy_orders.length > 3) buy_orders = buy_orders.slice(0, 3);
								
								if( buy_orders.length > 0 ) market_sell_price = buy_orders[0].price;
								else if( sell_orders.length > 0 ) market_sell_price = sell_orders[sell_orders.length - 1].price;
								
								orders1Array = sell_orders;
								orders2Array = buy_orders;
								
								showOrdersTutorial();
								var counter = 0;
								
								orders1.setRowDesign(orders1Array, function(row, val) {
									var color = '#6db558';
									if (val.type == 'buy') color = '#e54353';
			
									row.backgroundColor = 'white';
			
									var avatar_image = _requires['util'].makeImage({
	   									 image: '/images/sellAvatar.png',
	    								 height: 30, width:29, left: 5
									});		
									row.add(avatar_image);
									
									var order_amount = _requires['util'].group({
										'amount_token': _requires['util'].makeLabel({
											minimumFontSize:6,
											text : trim2( val.order_amount ),
											textAlign : 'left',
											color : '#9b9b9b',
											top: 0, left: 0,
											font : {
												fontFamily : 'Helvetica Neue',
												fontSize : 13,
												fontWeight : 'normal'
											}
										}),
										'token_tag': _requires['util'].makeLabel({
											minimumFontSize:6,
											text : main_token,
											textAlign : 'left',
											color : '#9b9b9b',
											top: 1, left: 0,
											font : {
												fontFamily : 'Helvetica Neue',
												fontSize : 10,
												fontWeight : 'normal'
											}
										})
									}, 'vertical');
									order_amount.left = 40;
									row.add(order_amount);
									
									var fiat_price = _requires['util'].makeLabel({
										minimumFontSize:6,
										text : _requires['tiker'].to('XCP',  val.price, dex_currency, 8),
										textAlign : 'left',
										color : color,
										width:250,
										top: 18, left: '42%',
										font : {
											fontFamily : 'Helvetica Neue',
											fontSize : 11,
											fontWeight : 'normal'
										}
									});
									var trim_price = trim( val.price );
									var price = _requires['util'].makeLabel({
										minimumFontSize:6,
										text : trim_price + ' XCP',
										textAlign : 'left',
										width:250,
										color : color,
										top: 0, left: '42%',
										font : {
											fontFamily : 'Helvetica Neue',
											fontSize : 14,
											fontWeight : 'normal'
										}
									});
									
									var order_prices = _requires['util'].group({
										'fiat_price': fiat_price,
										'price': price
									});
									row.add( order_prices );
									
									if(fiat_mode == true){
										price.top = 18;
										fiat_price.top = 0;
										price.font = { fontSize : 11 };
										fiat_price.font = { fontSize : 13 };
									}
									
									if(counter == 0){
										sell_lab_fiat1 = fiat_price;
										sell_lab_xcp1 = price;
									}
									else if(counter == 1){
										sell_lab_fiat2 = fiat_price;
										sell_lab_xcp2 = price;
									}
									else if(counter == 2){
										sell_lab_fiat3 = fiat_price;
										sell_lab_xcp3 = price;
									}
									
   									if(counter == orders1Array.length - 1){
   									   sell_order_button = Ti.UI.createButton({
     								   backgroundColor : "#4b986e",
       								   borderRadius: 4,
       								   title :  L('label_exchange_best_price_buy'),
       								   color:'white',
        							   right: 10,
      								   width : 70,
        							   height : 25,
       								   font:{fontFamily:'Gill Sans', fontSize: (OS_ANDROID)? 9: 11, fontWeight:'light'},
       								   minimumFontSize : 7,
   									 });
   									
										row.add(sell_order_button);
										
										if(spend_asset === 'XCP'){
											labels1.text = '  '+ L('label_exchange_sell_orders').format({'asset':selected_asset});
											sell_order_button.show();
										}
										else{
											sell_order_button.hide();
										}
									}
									
									counter += 1;
									return row;
								}, (OS_ANDROID)? _requires['util'].convert_y(orders1.toImage().height) / 3: null);
								
								counter = 0;
								orders2.setRowDesign(orders2Array, function(row, val) {
									
									var buy_spend_asset = buy_asset;
									var color = '#6db558';
									if (val.type == 'buy') color = '#e54353';
			
									row.backgroundColor = 'white';
									
									var avatar_image = _requires['util'].makeImage({
	   									 image: '/images/buyAvatar.png',
	    								 height: 30, width:29, left: 5
									});		
									row.add(avatar_image);
									
									var order_amount = _requires['util'].group({
										'amount_token': _requires['util'].makeLabel({
											minimumFontSize:6,
											text : trim2( val.order_amount ),
											textAlign : 'left',
											color : '#9b9b9b',
											top: 0, left: 0,
											font : {
												fontFamily : 'Helvetica Neue',
												fontSize : 13,
												fontWeight : 'normal'
											}
										}),
										'token_tag': _requires['util'].makeLabel({
											minimumFontSize:6,
											text : main_token,
											textAlign : 'left',
											color : '#9b9b9b',
											top: 1, left: 0,
											font : {
												fontFamily : 'Helvetica Neue',
												fontSize : 10,
												fontWeight : 'normal'
											}
										})
									}, 'vertical');
									order_amount.left = 40;
									row.add(order_amount);
									
									var fiat_price = _requires['util'].makeLabel({
										minimumFontSize:6,
										text : _requires['tiker'].to('XCP', val.price, dex_currency, 8),
										textAlign : 'left',
										color : color,
										top: 18, left: '42%',
										width:250,
										font : {
											fontFamily : 'Helvetica Neue',
											fontSize : 11,
											fontWeight : 'normal'
										}
									});
									
									var trim_price = trim( val.price );
									var price = _requires['util'].makeLabel({
										minimumFontSize:6,
										text : trim_price + ' XCP',
										textAlign : 'left',
										color : color,
										top: 0, left: '42%',
										width:250,
										font : {
											fontFamily : 'Helvetica Neue',
											fontSize : 14,
											fontWeight : 'normal'
										}
									});
									
									var order_prices = _requires['util'].group({
										'fiat_price': fiat_price,
										'price': price
									});
									row.add( order_prices );
									
									if(fiat_mode == true){
										price.top = 18;
										fiat_price.top = 0;
										price.font = { fontSize : 11 };
										fiat_price.font = { fontSize : 13 };
									}
									
									if(counter == 0){
										buy_lab_fiat1 = fiat_price;
										buy_lab_xcp1 = price;
									}
									else if(counter == 1){
										buy_lab_fiat2 = fiat_price;
										buy_lab_xcp2 = price;
									}
									else if(counter == 2){
										buy_lab_fiat3 = fiat_price;
										buy_lab_xcp3 = price;
									}
									
									if(counter == 0){
									   buy_order_button = Ti.UI.createButton({
     								   backgroundColor : color,
       								   borderRadius: 4,
       								   title : L('label_exchange_best_price_sell'),
       								   color:'white',
        							   right:10,
      								   width :70,
        							   height : 25,
       								   font:{fontFamily:'Gill Sans', fontSize: (OS_ANDROID)? 9: 11, fontWeight:'light'},
       								   minimumFontSize : 7,
   									});
										
									
										row.add(buy_order_button);
										
										if(spend_asset !== 'XCP'){
											buy_order_button.show();
											labels2.text = '  ' + L('label_exchange_buy_orders').format({'asset':selected_asset});
										}else{
											buy_order_button.hide();
										}
										
									}	
									counter += 1;
									return row;
								}, (OS_ANDROID)? _requires['util'].convert_y(orders2.toImage().height) / 3: null);
							}
							loadedOrderdatas();
						},
						'onError' : function(error) {
							var dialog = _requires['util'].createDialog({
								'title': error.type,
								'message': error.message,
								'buttonNames': [L('label_close')]
							}).show();
						}
					});
				},
				'onError' : function(error) {
					var dialog = _requires['util'].createDialog({
						'title': error.type,
						'message': error.message,
						'buttonNames': [L('label_close')]
					}).show();
				}
			});
		}
	};
	
	function hideShowOrders(hide){
		
		if(hide == true){
			labels1.opacity = 0;	
			orders_group.opacity = 0;	
			footer_bar.opacity = 0;
			
		}else{
			instructions_1.opacity = 0;
			labels1.opacity = 1;	
			orders_group.opacity = 1;
			footer_bar.opacity = 1;
		}
	}
	var orders_group = _requires['util'].group({
		'label1' : labels1,
		'orders1' : orders1,
		'label2' : labels2,
		'orders2' : orders2,
		'closedTitle' : closedLabel,
		'histories' : histories
	}, 'vertical');
	//orders_group.backgroundColor = 'blue';
	orders_group.top = top_bar.top + top_bar.height;
	
	var darkView =  Ti.UI.createView({
		backgroundColor : 'black',
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	});
	darkView.opacity = 0.0;
	darkView.hide();
	
	var confirm_button_dex = Ti.UI.createButton({
        backgroundColor : "#4b986e",
        borderRadius: 4,
        title : L('label_confirm'),
        color:'white',
        height :25,
		width:'20%',
		left:6,
        font:{fontFamily:'Gill Sans', fontSize: (OS_ANDROID && L('language') === 'en')? 12: 15, fontWeight:'light'}
    });
	var footer_bar =  Ti.UI.createView({
		backgroundColor : '#e54353',
		width : Ti.UI.FILL,
		height : 80
	});
	var switch_image = _requires['util'].makeImage({
	    image: '/images/fiat_xcp_switch.png',
	    height: 30, width:33, left: 5
	});
	switch_image.opacity = 0.0;
	
	confirm_button_dex.addEventListener('click', function() {
		order();
	});
	var fields_row = _requires['util'].group({
		'amount_field' : amount_dex_field,
		'switch':switch_image,
		'price_field' : price_dex_field,
		'total_field' : total_dex_field,
		'confirm_button' : confirm_button_dex
	},'horizontal');
	
	fields_row.width = '100%';
	fields_row.height = 33;
	fields_row.top = 22;
	fields_row.left = 0;
	
	fields_row.opacity = 0.0;
	fields_row.touchEnabled = false;
	
	var fields_row_fiat = _requires['util'].group({
		'xcp_balance' : XCP_balance,
		'empty2' : _requires['util'].makeLabel({
			text: ' ',
			textAlign : 'center',
			width: 30, left: 5,
			font:{fontFamily:'Helvetica Neue', fontSize:13, fontWeight:'normal'},
		}),
		'price_field' : price_dex_field_fiat,
		'total_field' : total_dex_field_fiat,
		'label_fee' : label_fee
	}, 'horizontal');
	fields_row_fiat.width = '100%';
	fields_row_fiat.height = 60;
	fields_row_fiat.top = 55;
	fields_row_fiat.left = 0;
	
	function modeSwitch(){
		if(fiat_mode == false){
			fiat_mode = true;
			price_label.text = L('label_exchange_price') +' ' + globals.tiker[dex_currency].symbol;
			total_label.text = L('label_exchange_total') +' ' + globals.tiker[dex_currency].symbol;
			
			if (sell_lab_fiat1 != undefined) {
				sell_lab_fiat1.top = 0;
				sell_lab_fiat1.font = { fontSize : 13 };
			}
			
			if (sell_lab_fiat2 != undefined) {
				sell_lab_fiat2.top = 0;
				sell_lab_fiat2.font = { fontSize : 13 };
			}
			
			if (sell_lab_fiat3 != undefined) {
				sell_lab_fiat3.top = 0;
				sell_lab_fiat3.font = { fontSize : 13 };
			}
				
				
			if (sell_lab_xcp1 != undefined) {
				sell_lab_xcp1.top = 18;
				sell_lab_xcp1.font = { fontSize : 11 };
			}
			if (sell_lab_xcp2 != undefined) {
				sell_lab_xcp2.top = 18;
				sell_lab_xcp2.font = { fontSize : 11 };
			}
			if (sell_lab_xcp3 != undefined) {
				sell_lab_xcp3.top = 18;
				sell_lab_xcp3.font = { fontSize : 11 };
			}
			
			if (buy_lab_fiat1 != undefined) {
				buy_lab_fiat1.top = 0;
				buy_lab_fiat1.font = { fontSize : 13 };
			}
			if (buy_lab_fiat2 != undefined) {
				buy_lab_fiat2.top = 0;
				buy_lab_fiat2.font = { fontSize : 13 };
			}
			if (buy_lab_fiat3 != undefined) {
				buy_lab_fiat3.top = 0;
				buy_lab_fiat3.font = { fontSize : 13 };
			}
			
			if (buy_lab_xcp1 != undefined) {
				buy_lab_xcp1.top = 18;
				buy_lab_xcp1.font = { fontSize : 11 };
			}
			if (buy_lab_xcp2 != undefined) {
				buy_lab_xcp2.top = 18;
				buy_lab_xcp2.font = { fontSize : 11 };
			}
			if (buy_lab_xcp3 != undefined) {
				buy_lab_xcp3.top = 18;
				buy_lab_xcp3.font = { fontSize : 11 };
			}
			
			if (closed_lab_fiat1 != undefined) {
				closed_lab_fiat1.top = 0;
			}
			if (closed_lab_fiat2 != undefined) {
				closed_lab_fiat2.top = 0;
			}
			if (closed_lab_fiat3 != undefined) {
				closed_lab_fiat3.top = 0;
			}
			
			var display_heightdex = _requires['util'].getDisplayHeight();
			if(display_heightdex < 800){
				if (closed_lab_xcp1 != undefined) {
					closed_lab_xcp1.top = 12;
				}
				if (closed_lab_xcp2 != undefined) {
					closed_lab_xcp2.top = 12;
				}
			
				if (closed_lab_xcp3 != undefined) {
					closed_lab_xcp3.top = 12;
				}
			}
			else{
				if (closed_lab_xcp1 != undefined) {
					closed_lab_xcp1.top = 15;
				}
				if (closed_lab_xcp2 != undefined) {
					closed_lab_xcp2.top = 15;
				}
			
				if (closed_lab_xcp3 != undefined) {
					closed_lab_xcp3.top = 15;
				}
			}
		}
		else{		
			fiat_mode = false;
			if (sell_lab_fiat1 != undefined) {
				sell_lab_fiat1.top = 18;
				sell_lab_fiat1.font = { fontSize : 11 };
			}
			if (sell_lab_fiat2 != undefined) {
				sell_lab_fiat2.top = 18;
				sell_lab_fiat2.font = { fontSize : 11 };
			}
			if (sell_lab_fiat3 != undefined) {
				sell_lab_fiat3.top = 18;
				sell_lab_fiat3.font = { fontSize : 11 };
			}
			
			if (sell_lab_xcp1 != undefined) {
				sell_lab_xcp1.top = 0;
				sell_lab_xcp1.font = { fontSize : 13 };
			}
			if (sell_lab_xcp2 != undefined) {
				sell_lab_xcp2.top = 0;
				sell_lab_xcp2.font = { fontSize : 13 };
			}
			if (sell_lab_xcp3 != undefined) {
				sell_lab_xcp3.top = 0;
				sell_lab_xcp3.font = { fontSize : 13 };
			}
			
			if (buy_lab_fiat1 != undefined) {
				buy_lab_fiat1.top = 18;
				buy_lab_fiat1.font = { fontSize : 11 };
			}
			if (buy_lab_fiat2 != undefined) {
				buy_lab_fiat2.top = 18;
				buy_lab_fiat2.font = { fontSize : 11 };
			}
			if (buy_lab_fiat3 != undefined) {
				buy_lab_fiat3.top = 18;
				buy_lab_fiat3.font = { fontSize : 11 };
			}
				
			if (buy_lab_xcp1 != undefined) {
				buy_lab_xcp1.top = 0;
				buy_lab_xcp1.font = { fontSize : 13 };
			}
			if (buy_lab_xcp2 != undefined) {
				buy_lab_xcp2.top = 0;
				buy_lab_xcp2.font = { fontSize : 13 };
			}
			if (buy_lab_xcp3 != undefined) {
				buy_lab_xcp3.top = 0;
				buy_lab_xcp3.font = { fontSize : 13 };
			}
			
			var display_heightdex = _requires['util'].getDisplayHeight();
			if(display_heightdex < 700){
				if (closed_lab_fiat1 != undefined) {
					closed_lab_fiat1.top = 12;
				}
				if (closed_lab_fiat2 != undefined) {
					closed_lab_fiat2.top = 12;
				}
				if (closed_lab_fiat3 != undefined) {
					closed_lab_fiat3.top = 12;
				}	
			}
			else{
				if (closed_lab_fiat1 != undefined) {
					closed_lab_fiat1.top = 15;
				}
				if (closed_lab_fiat2 != undefined) {
					closed_lab_fiat2.top = 15;
				}
				if (closed_lab_fiat3 != undefined) {
					closed_lab_fiat3.top = 15;
				}
			}
			
			if (closed_lab_xcp1 != undefined) {
				closed_lab_xcp1.top = 0;
			}
			if (closed_lab_xcp2 != undefined) {
				closed_lab_xcp2.top = 0;
			}
			if (closed_lab_xcp3 != undefined) {
				closed_lab_xcp3.top = 0;
			}
			
			price_label.text = L('label_exchange_price') + ' XCP';
			total_label.text = L('label_exchange_total') + ' XCP';
		}
		
		price_dex_field_fiat.text = '---';
		total_dex_field_fiat.text = '---';
		price_dex_field.value = '';
		total_dex_field.value = '';
	}
	switch_image.addEventListener('click', modeSwitch);
	
	footer_bar.top = (OS_ANDROID)? 55: 75;
	footer_bar.add(labels_row);
	footer_bar.add(fields_row);
	footer_bar.add(fields_row_fiat);
	
	orders_group.height =  view.rect.height - orders_group.top;
	
	var tabels_height = orders_group.height - 45; //45 is height of labels between tables
	
	histories.height = tabels_height * 0.25;
	orders1.height = tabels_height * 0.375;
	orders2.height = tabels_height * 0.375;
	
	hideShowOrders(true);
	view.add(orders_group);
	top_bar.add(footer_bar);
	
	function resetForm(){
		price_dex_field_fiat.text = '---';
		total_dex_field_fiat.text = '---';
		price_dex_field.value = '';
		total_dex_field.value = '';
	
		amount_dex_field.value = '';
	}
	function order(){
		if(amount_dex_field.value <= 0){
			_requires['util'].createDialog({
				message : L('exchange_order_enter_amount').format({'asset':selected_asset}),
				buttonNames : [L('label_close')]
			}).show();
			return;	
		}
		
		if(price_dex_field.value <= 0){
			_requires['util'].createDialog({
				message : L('exchange_order_enter_price').format({'asset':selected_asset}),
				buttonNames : [L('label_close')]
			}).show();
			return;	
		}
		
		send_amount = amount_dex_field.value.replace(/[^\d.-]/g, '');
		if( !fiat_mode ){
			send_price = price_dex_field.value.replace(/[^\d.-]/g, '');
		}
		else{
			send_price = price_dex_field_fiat.text.replace(/[^\d.-]/g, '');
		}
		
		var total_amount = Math.multiply(send_price, send_amount).toFixed2(8);
		var fiat_val = _requires['tiker'].to('XCP', total_amount, dex_currency,8);
		
		var result = null;
		var loading = _requires['util'].showLoading(globals.main_window, {
			width : Ti.UI.FILL,
			height : Ti.UI.FILL
		});			
							
		var main_token = buy_asset;
		if( buy_asset === 'XCP' ) main_token = spend_asset;
		
		var give_token = null;
		var give_quantity = null;
		var get_token = null;
		var get_quantity = null;
		
		if( buySellType === 'buy' ){
			give_token = 'XCP';
			give_quantity = total_amount;
			get_token = main_token;
			get_quantity = send_amount;
		}
		else{
			give_token = main_token;
			give_quantity = send_amount;
			get_token = 'XCP';
			get_quantity = total_amount;
		}
		
		var expiration = 4320;
		_requires['network'].connectGETv2({
			'method': 'fees/recommended',
			'callback': function(result){
				var order_params = {
					'source': _requires['cache'].data.address,
					'give_token' : give_token,
					'give_quantity' : give_quantity,
					'get_token' : get_token,
					'get_quantity' : get_quantity,
					'expiration': expiration
				};
				if( isFinite(_requires['cache'].data.current_fee) ) order_params.fee = _requires['cache'].data.current_fee * 1e8;
				else order_params.fee_per_kb = result[_requires['cache'].data.current_fee];
				_requires['network'].connectPOSTv2({
					'method' : 'transactions/order',
					'post' : order_params,
					'callback' : function(result) {
						loading.removeSelf();
						var feeInBTC = (result.fee / 1e8).toFixed2(8);
						var feeInCurrency = globals.requires['tiker'].to('BTC', feeInBTC, dex_currency);
						var priority = globals.fee_text[_requires['cache'].data.current_fee];
						
						var dialog;
						if(buySellType === "buy"){
							dialog = _requires['util'].createDialog({
								title : L('label_confirmorder'),
								message : L('text_confirmorder_buying').format({
									'type' : 'buying',
									'price' : send_price,
									'price_asset' : spend_asset,
									'quantity' : send_amount,
									'total' : total_amount,
									'total_asset': 'XCP',
									'main_asset' : buy_asset,
									'fiat' : (fiat_val == null)? '' : '(' + fiat_val + ')',
									'fee' : feeInBTC + 'BTC' +((feeInCurrency == null)? '': '(' + feeInCurrency + ')') + ((priority == undefined)? '': '\n' + priority),
								}),
								buttonNames : [L('label_cancel'),L('label_exchange_place_order')]
							});
						}
						else{
							dialog = _requires['util'].createDialog({
								title : L('label_confirmorder'),
								message : L('text_confirmorder_selling').format({
									'price' : send_price,
									'price_asset' : buy_asset,
									'quantity' : send_amount,
									'total' : total_amount,
									'total_asset': 'XCP',
									'main_asset' : spend_asset,
									'fiat' : fiat_val,
									'fee' : feeInBTC + 'BTC (' + feeInCurrency + ')' + ((priority == undefined)? '': '\n' + priority),
								}),
								buttonNames : [L('label_cancel'),L('label_exchange_place_order')]
							});
						}
						dialog.addEventListener('click', function(e) {
							if( e.index != e.source.cancel ) {
								_requires['auth'].check({
									title : L('label_confirmorder'),
									callback : function(e) {
										if (e.success) {
											loading = _requires['util'].showLoading(globals.main_window, {
												width : Ti.UI.FILL,
												height : Ti.UI.FILL
											});
											_requires['bitcore'].sign(result.unsigned_tx, {
												'callback': function(signed_tx) {
													_requires['network'].connectPOSTv2({
														'method' : 'transactions/broadcast',
														'post' : {
															tx : signed_tx
														},
														'callback' : function(result) {
															var t = new Date();
															t.setSeconds(t.getSeconds() + (expiration * 600));
															var day = t.getDate();
															var monthIndex = t.getMonth() + 1;
															var year = t.getFullYear();
															
															var expireDate = day +'/'+ monthIndex +'/'+ year;
															if( L('language') === 'ja' ) expireDate = year + '/' + monthIndex + '/' + day;
															
															resetForm();
															_requires['util'].createDialog({
																message : L('exchange_order_placed_message').format({ 'expire_date':expireDate }),
																buttonNames : [L('label_close')]
															}).show();
															
															price_dex_field.value = '';
															total_dex_field.value = '';
															amount_dex_field.value = '';
															price_dex_field_fiat.text = '';
															total_dex_field_fiat.text = '';
														},
														'onError' : function(error) {
															var dialog = _requires['util'].createDialog({
																'title': error.type,
																'message': error.message,
																'buttonNames': [L('label_close')]
															}).show();
														},
														'always' : function() {
															if( loading != null ) loading.removeSelf();
														}
													});
												},
												'fail': function(error){
													loading.removeSelf();
													_requires['util'].createDialog({
														'message': error,
														'buttonNames': [L('label_close')]
													}).show();
												}
											});				
										}
									}
								});
							}
						});
						dialog.show();
					},
					'onError' : function(error) {
						if( loading != null ) loading.removeSelf();
      			  		var dialog = _requires['util'].createDialog({
							'title': error.type,
							'message': error.message,
							'buttonNames': [L('label_close')]
						}).show();
					}
				});
			},
			'onError' : function(error) {
				if( loading != null ) loading.removeSelf();
				var dialog = _requires['util'].createDialog({
					'title': error.type,
					'message': error.message,
					'buttonNames': [L('label_close')]
				}).show();
			}
		});
	}
	view_dex.add(darkView);
	view_dex.add(picker1);
	
	view_dex.add(pickerOrder);
	
	function init(){
		selected_asset = '';
		token_balance.text = '';
		box1.removeAllChildren();
		put_box1(L('label_exchange_select_token'));
		hideShowOrders(true);
		box1_asset_image.hide();
		searchField.blur();
		ordersLoadStarted = false;
		addBuySellTokens();
	}
	
	function flushTextFields(){
		amount_dex_field.value = '';
		price_dex_field.value = '';
		total_dex_field.value = '';
	}
	
	globals.dex_init = init;
}
	
dex.prototype.startDex = function(){
	if( !Ti.API.dexLoad ){
		if( globals.balances != null ) load();
		else{
			var loading = _requires['util'].showLoading(view_dex, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('loading_waiting_first')});
			var timer = setInterval(function(){
				if( globals.balances != null ){
					if( loading != null ) loading.removeSelf();
					clearInterval(timer);
					load();
				}
			}, 500);
		}
		if( Ti.App.Properties.getString('shows_dex_how3') !== 'FALSE'){
		    var dialog = _requires['util'].createDialog({
		   		title:L('exchange_how_to_title'),
				message:L('exchange_how_to'),
				buttonNames: [L('text_dont_show'), L('how_to_exchange_ok')]
			});
			dialog.addEventListener('click', function(e){
				if( e.index == e.source.cancel ){
					Ti.App.Properties.setString('shows_dex_how3', "FALSE");
				}
			});
			dialog.show();
		}
		Ti.API.dexLoad = true;
	}
};

dex.prototype.getViewType = function(){
	return showingDashboard;
};

dex.prototype.clear = function(){
	Ti.API.dexLoad = false;
	Ti.App.Properties.setString('shows_dex_how3', 'TRUE');
};

return new dex();

}());