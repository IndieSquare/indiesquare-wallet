module.exports = (function() {

	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var display_height = _requires['util'].getDisplayHeight();
	var view_history = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	
	function history(){}
	
	history.prototype.getView = function(){
		return view_history;
	};
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 60 });
	top_bar.top = 0;
	view_history.add(top_bar);
	
	var history_title_center = _requires['util'].makeLabel({
		text: L('label_tab_history'),
		color:"white",
		font:{ fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 25, center: 0
	});
	top_bar.add( history_title_center );
	
	if(OS_ANDROID){
		history_title_center.top = 20;
	}
	
	var t_hist = Ti.UI.create2DMatrix();
	t_hist = t_hist.rotate(180);
	var t_hist2 = Ti.UI.create2DMatrix();
	t_hist2 = t_hist2.rotate(0);
	var refreshAnimate_hist2 = Ti.UI.createAnimation({
		transform : t_hist2,
		duration : 0,
		repeat : 1
	});
	var refreshAnimate_hist = Ti.UI.createAnimation({
		transform : t_hist,
		duration : 200,
		repeat : 10
	});
	
	
	var refresh_button_hist = _requires['util'].makeImageButton({
		image : '/images/icon_refresh.png',
		width : 25,
		height : 25,
		right : 10,
		top : 28,
		listener : function() {
			refresh_button_hist.animate(refreshAnimate_hist);
			
			setTimeout(function() { refresh_button_hist.animate(refreshAnimate_hist2); }, 2100);
			loadHistory(true,false);
		}
	});
	top_bar.add(refresh_button_hist);
	
	if (OS_ANDROID) {
		refresh_button_hist.top = 20;
	}

	var scroll_view = Ti.UI.createScrollView({ scrollType: 'vertical', layout: 'vertical', height:display_height - 110, backgroundColor: 'transparent', showVerticalScrollIndicator: true });
	if(OS_ANDROID){
		scroll_view.height = display_height - 120;
	}
	
	var overlay_view_hist = Ti.UI.createView({
    	height:'100%',
    	width:'100%',
   		top:0,
   	 	left:0
	});
	var historySkipIndex = 0;
	var currentOffset = - (scroll_view.height - 50);
	var takeAmount = 20;
	
	var loadingMore =  _requires['util'].makeLabel({
		text: L('loading_more_1'),
		top: 10, 
		height:50,
		width:90,
		font:{ fontSize:12, fontWeight:'bold'},
		textAlign: 'left'
	});
				
	setInterval(function(){ 
		if(loadingMore.text ===  L('loading_more_1')){
			loadingMore.text = L('loading_more_2');
		}
		else if(loadingMore.text ===  L('loading_more_2')){
			loadingMore.text = L('loading_more_3');
		}
		else if(loadingMore.text ===  L('loading_more_3')){
			loadingMore.text = L('loading_more_4');	
		}
		else{
			loadingMore.text = L('loading_more_1');
		}
	}, 400);
				
	scroll_view.addEventListener('scroll', function(e) {
		if(scroll_view.contentOffset.y > currentOffset){
			scroll_view.add(loadingMore);
			loadHistory(false,true);
		}
	});
	
	scroll_view.top = 60;
	view_history.add(scroll_view);

	var loading = null, history_error = null;
	function createList( result, bool,additive ){
		try{
			scroll_view.remove(loadingMore);
			if(additive == false){
				scroll_view.removeAllChildren();
			}else{
				historySkipIndex += takeAmount;
			}
			if( result.length > 0 ){
				Ti.API.isHistoryloaded = true;
				function createBox( params ){
					var box = _requires['util'].group();
					box.height = params.height;
					box.width = '100%';
					box.backgroundColor = '#ffffff';
					
					return box;
				}
				
				for( var i = 0; i < result.length; i++ ){
					var val = result[i];
					var box = createBox({ height: 90 });
					box.top = 10;
					
					var history = ''; var address = null;
					
					history = _requires['util'].getTransactionStory(val);
					if( val.type === 'send' ){
						if(val.category === 'Send'){
							val.type = 'send';
							address = val.destination;
						}
						else{
							val.type = 'receive';
							address = val.source;
						}
					}
					
					var color = '#6db558';
					if(val.type == 'send') color = '#e54353';
					if(val.type == 'order') color = '#4265d7';
					
					var label_history = _requires['util'].group({
						'history': _requires['util'].makeLabel({
							text: history,
							top: 0, left: 0,
							font:{ fontSize:12, fontWeight:'normal'},
							textAlign: 'left'
						}),
						'address': _requires['util'].makeLabel({
							text: address,
							top: 1, left: 0,
							color:'blue',
							font:{ fontSize:12, fontWeight:'normal'},
							textAlign: 'left'
						})
					}, 'vertical');
					
					label_history.top = 15;
					label_history.left = 60;
					if( address != null ){
						label_history.address.text = address;
					}
					
					var formattedTime = val.time;
					if( val.unconfirm == undefined || !val.unconfirm ){
						var date = new Date(val.block_time * 1e3);
						formattedTime = date.getFullYear() + ' ' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + ('0'+date.getHours()).substr(-2) + ':' + ('0'+date.getMinutes()).substr(-2) + ':' + ('0' + date.getSeconds()).substr(-2);
					}
					else{
						formattedTime = L('label_unconfirmed');
					}
					var message = _requires['util'].group({
						'category': _requires['util'].makeLabel({
							text: L('label_historytype_' + val.type),
							top: 0, left: 0,
							font:{fontFamily:'Helvetica Neue', fontSize:13, fontWeight:'bold'},
							color:color
						}),
						'history': label_history,
						'time': _requires['util'].makeLabel({
							text: formattedTime,
							textAlign: 'right',
							top: 0, right: 10,
							font:{fontFamily:'Helvetica Neue', fontSize:8, fontWeight:'bold'}
						})
					});
					
					if( val.token === 'BTC' ) image = '/images/asset_bitcoin.png';
					else if( val.token === 'XCP' ) image = '/images/asset_xcp.png';
					else{
						if( val.type === 'issuance' && val.unconfirm != undefined && val.unconfirm ) image = Alloy.CFG.res_uri + 'tokens/images/' + val.token.charAt(0).toLowerCase() + '.png';
						else image = Alloy.CFG.api_uri + 'v2/tokens/' + val.token + '/image?X-Api-Key=' + Alloy.Globals.api_key;
					}
					var token_image = Ti.UI.createImageView({
						defaultImage: '/images/blankPlaceholder.png',
						image: image,
						width: 40, height: 40,
						top: 20, left: 4
					});
					message.add(token_image);
					
					message.left = 10;
					message.width = '90%';
					
					box.add( message );
					scroll_view.add(box);
					
					if( address != null ){
						box.addEventListener('click', (function(address) {
							return function(){
								Ti.UI.Clipboard.setText( address );
								_requires['util'].createDialog({
									title: L('text_copied'),
									message: L('text_copied_message') + '\n' + address,
									buttonNames: [L('label_close')]
								}).show();
							};
						})(address), false);
					}
				
				}
				
				if( bool ){
					_requires['layer'].addPullEvent(scroll_view, { parent: view_history, margin_top: 75, callback: function(l){
						view_history.add(overlay_view_hist);
						loadHistory(false, false, l);
					}});
				}	
			}
			else{
				Ti.API.isHistoryloaded = false;
				scroll_view.removeAllChildren();
				if( history_error == null ){
					history_error = _requires['util'].makeLabel({
						text: L('text_nohistory'),
						font:{ fontSize: 15 }
					});
					history_error.width = Ti.UI.FILL;
					history_error.height = Ti.UI.FILL;
					history_error.addEventListener('touchstart', function(){
						loadHistory(true,false);
					});
					view_history.add(history_error);
				}
			}
		}
		catch(e){
			if( loading != null ) loading.removeSelf();
		}
	}
	
	var canHistoryLoad = true;
	var loadHistory = history.prototype.loadHistory = function (bool, additive, l){
		if( canHistoryLoad ){
			canHistoryLoad = false;
			loading = l;
			if( bool ){
				loading = _requires['util'].showLoading(view_history, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('loading_history')});
			}
			
			if( history_error != null ){
				view_history.remove(history_error);
				history_error = null;
			}
			if( additive == false ){
				currentOffset = -scroll_view.height + 50;
				historySkipIndex = 0;
			}
			currentOffset += ((100 * takeAmount));
			
			_requires['network'].connectGETv2({
				'method': 'addresses/' + _requires['cache'].data.address + '/history?length='+takeAmount+'&skip='+historySkipIndex,
				'callback': function( result ){
					createList( result, bool, additive );
				},
				'onError': function(error){
					if(additive == true){
						currentOffset -= (100 * takeAmount) - scroll_view.height;
					}		
					if( history_error == null ){
						history_error = _requires['util'].group({
							'text': _requires['util'].makeLabel({
								text: L('text_history_error'),
								font:{ fontSize: 15 },
								color: '#ffffff'
							})
						});
						history_error.backgroundColor = 'E43E44';
						history_error.opacity = 0.8;
						history_error.width = '100%';
						history_error.height = 50;
						history_error.addEventListener('touchstart', function(){
							view_history.remove(history_error);
							history_error = null;
							loadHistory(true,false);
						});
						view_history.add(history_error);
					}
				},
				'always': function(){
					view_history.remove(overlay_view_hist);
					if( loading != null ) loading.removeSelf();
					canHistoryLoad = true;
				}
			});
		}
	};
	
	history.prototype.clear = function(){
		scroll_view.removeAllChildren();
		Ti.API.isHistoryloaded = false;
	};
	
	return new history();

}());