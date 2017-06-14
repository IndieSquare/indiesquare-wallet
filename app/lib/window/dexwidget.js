module.exports = (function() {
	var _requires = globals.requires;
	var trendingResults = [];
	var nextPost = 0;
	var tokenResults = [];
	function DexWidget(){
	
	}
	
	DexWidget.prototype.createTrending = function (timestamp,speed) {
		this.bar = Ti.UI.createView({ backgroundColor:'transparent', width: _requires['util'].getDisplayWidth(), height: 210 });
    	var scrollView = Ti.UI.createScrollView({
			scrollType : 'horizontal',
			width :  _requires['util'].getDisplayWidth(),
			height : '100%',
			backgroundColor : 'blue',
		});
		
		var offsetInc  = _requires['util'].getDisplayWidth() / 3;
		var animationOffset = offsetInc;
		var scrollTimer = 0;
		var innerTimer = 0;
 
   		function startTimer(){
			if(OS_IOS){
				clearInterval(scrollTimer);
				scrollTimer = setInterval(function(){ 
					scrollView.scrollTo(animationOffset,0);
					animationOffset += offsetInc;
				}, 6000);
			}
			else{
				clearInterval(scrollTimer);
				scrollTimer = setInterval(function(){ 
					if(middle_view_scroll.currentPage == 2){
						nextPost += (offsetInc / ( _requires['util'].getDisplayWidth() / Ti.Platform.displayCaps.platformWidth));
					}
				}, 6000);
			}
		}
		function startInnerTimer(){
			innerTimer = setInterval(function(){
				if(scrollView.contentOffset.x < nextPost){
					if(middle_view_scroll.currentPage == 2){
						scrollView.scrollTo(scrollView.contentOffset.x + 20, 0);
					}
				}
			},100);
		}
		
		var cellsArray = [];
		var innerCellsArray = [];
		var cellsMinCheck = [];
		var cellsMaxCheck = [];
    	var arrayPoints = [];
    	
    	
    	for(var i = 0;i<1000;i++){
    		var anOffset = offsetInc*i+"";
    		arrayPoints.push(anOffset);
    	}
    
    
	    function closest(array,num){
		    var i=0;
		    var minDiff=1000;
		    var ans;
		    for(i in array){
		    	var m=Math.abs(num-array[i]);
		    	if(m<minDiff){ 
		            minDiff=m;
		            ans=array[i]; 
		    	}
		    }
		    return ans;
		}
	    
	    function updateCells(){
	    	for(var i = 0; i<cellsArray.length; i++){
	    		var aCell = cellsArray[i];
				var innerCell = innerCellsArray[i];
				var aCheck = cellsMinCheck[i];
				var dif  =   _requires['util'].getDisplayWidth() / Ti.Platform.displayCaps.platformWidth;
	    		var scrollOffset = scrollView.contentOffset.x * dif;
				if(scrollOffset >= aCheck){
					
					cellsMaxCheck[i] = aCell.left + offsetInc;
					aCell.left += (offsetInc * cellsArray.length);
				 	cellsMinCheck[i] = aCell.left + offsetInc;
				 	
				}
				
				var aCheckMax = cellsMaxCheck[i];
				if(typeof aCheckMax != "undefined"){
					if(scrollOffset <= aCheckMax ){
	    				aCell.left = aCheckMax - offsetInc;
						cellsMaxCheck[i] -= (offsetInc * cellsArray.length);
					 	cellsMinCheck[i] = aCell.left + offsetInc;
					}
				}
			
				var tokenOffset = (cellsMinCheck[i] - scrollOffset) - (offsetInc*0.5);
				
				tokenOffset = (tokenOffset / _requires['util'].getDisplayWidth());
				tokenOffset = (tokenOffset % 1) * 2;
				if(tokenOffset > 1){
					tokenOffset = 1 + (1 - tokenOffset);
				}
				if(tokenOffset < 0){
					tokenOffset = 0;	
				}
				aCell.opacity = tokenOffset;
				if(aCell.opacity > 1){
					aCell.opacity = 1;
				}
				if(aCell.opacity < 0){
					aCell.opacity = 0;
				}
				
				if(OS_IOS){
					var scaleNum = tokenOffset;
					if(scaleNum < 0.7){
						scaleNum = 0.7;
					}
				 	var scale = Ti.UI.create2DMatrix().scale(scaleNum,scaleNum);
					innerCell.transform = scale;
				}
			}
	    }
	    globals.loadCells = function(){
	    	if(tokenResults.length == 0){
	    		return;
	    	}
	    	Ti.API.log("loading rending cells");
	    	clearInterval(scrollTimer);
			clearInterval(innerTimer);
	    	scrollView.removeAllChildren();
			loadingAct.hide();
			
			nextPost  = 0;
			for( var i = 0; i < tokenResults.length; i++ ){
				var aToken =tokenResults[i];
				var aView = Ti.UI.createView({ backgroundColor:'transparent', width:offsetInc, height:'100%', left:(offsetInc*i), index:i});
				var innerView = Ti.UI.createView({ backgroundColor:'transparent', width:(OS_ANDROID)? '90%': '100%', height: '100%'});
				var aButton = Ti.UI.createButton({
					backgroundImage:'/images/blankPlaceholder.png',
					title :  "",
					index:i,
					width : '100%',
					height : '100%',
					color : '#fadf99',
					textAlign : 'center',
					font : {
						fontFamily : 'Sling',
						fontSize : 9,
						fontWeight : 'normal'
					}
				});
				
				cellsArray.push(aView);
				innerCellsArray.push(innerView);
				cellsMinCheck[i] = offsetInc * (i+1);
				    
				aButton.addEventListener('click', function(e){
				var aToken = tokenResults[e.source.index];
				globals.clickedTrending(aToken.token);
			});
					
			var buySell = _requires['util'].group({
				'buy' :_requires['util'].makeLabel({
					width : 'auto',
					height:'auto',
					top:0,
					text : '',
					font : {
						fontFamily : 'Sling',
						fontSize : (OS_ANDROID)? 10: 12,
						fontWeight : 'normal'
					},
					color : 'black'
				}),
				'sell' :_requires['util'].makeLabel({
					width : 'auto',
					height:'auto',
					left:10,
					top:0,
						text : '',
						font : {
							fontFamily : 'Sling',
							fontSize :(OS_ANDROID)? 10: 12,
							fontWeight : 'normal'
						},
						color : '#595959'
				}),
			},'horizontal');
					
			buySell.top = 10;
			buySell.height = 60;
			var aTrendGroup = _requires['util'].group({
				'title' :_requires['util'].makeLabel({
					width : 'auto',
					text : aToken.token,
					font : {
						fontFamily : 'Sling',
						fontSize : 12,
						fontWeight : 'normal'
					},
					color : '#595959'
				}),
				'image' : Ti.UI.createImageView({
					image :  Alloy.CFG.api_uri + 'v2/tokens/'+aToken.token+'/image?width=200&X-Api-Key=' + Alloy.Globals.api_key,
					defaultImage:'/images/blankPlaceholder.png',
					top:10,
					width :(OS_ANDROID)? 90: 100,
					height :(OS_ANDROID)? 90: 100,
				}),
				'buysell':buySell,
				},'vertical');
				innerView.add(aTrendGroup);
				aView.add(innerView);
				
				aView.add(aButton);
				aView.top = 0;
				scrollView.add(aView);
				getBestPricesOrders(aToken.token,buySell);
			}
			animationOffset =  parseFloat(offsetInc) * 5;
	    	scrollView.scrollTo(animationOffset,0);
	    	
	    	setTimeout(function() { 
	    		scrollView.animate(Ti.UI.createAnimation({
					opacity:1,
					duration : 200
				}));
			}, 1000);
			
			startTimer();
			if(OS_ANDROID){
				scrollView.setContentOffset({x:0,y:0});
				startInnerTimer();
			}							
	    };
	    _requires['network'].connectGETv2({
			'method' : 'tokentrend?length=10',
			'callback' : function(result) {
				tokenResults = result;
				globals.loadCells();
				globals.didLoadTrending();
			},
			'onError' : function(error) {
				var dialog = _requires['util'].createDialog({
					'title': error.type,
					'message': error.message,
					'buttonNames': [L('label_close')]
				}).show();
			}
		});
	    
	    scrollView.addEventListener('touchstart', function(e){
			clearInterval(scrollTimer);
			clearInterval(innerTimer);
		});
			
		scrollView.addEventListener('scroll', function(e) {
			updateCells();
	    });
				
		if(OS_IOS){
			scrollView.addEventListener('dragend', function() {
				var offset = scrollView.contentOffset.x;
				var closetPoint = closest(arrayPoints,offset);
				scrollView.scrollTo(closetPoint,0);
				animationOffset = (parseFloat(closetPoint) + parseFloat(offsetInc));
				startTimer();
			});
		}
		if(OS_ANDROID){
			scrollView.addEventListener('touchend', function() {
				/*
					var offset = scrollView.contentOffset.x;
				
					nextPost = closest(arrayPoints,offset);
					Ti.API.log(nextPost);
	
						startTimer();
						startInnerTimer();
				*/
			});
		}
		scrollView.backgroundColor = 'transparent';
		scrollView.opacity = 0;
	    this.bar.add(scrollView);	
		
		function marge(orders, type) {
			var marged = new Array();
			var n = 0;
			for (var i = 0; i < orders.length; i++) {
				var is = true;
				if (i > 0) {
					if (orders[i].price == marged[n].price) {
						marged[n].order += orders[i].order;
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
					marged[n].order = orders[i].order;
					marged[n].type = type;
				}
			}
			return marged;
		}
										
		function trimPrice( quantity ){
			var quan = quantity+"";
			
			if(quan.indexOf("e-") != -1 ){
				return quantity;
			}
			if(quan.indexOf(".") == -1 ){
				return quantity.toFixed(0);
			}
			else if(quantity > 1){
				return quantity.toFixed(2);
			}
			else if(quantity > 0.1){
				return quantity.toFixed(3);
			}
			else if(quantity > 0.0001){
				return quantity.toFixed(4);
			}
			else if(quantity > 0.00001){
				return quantity.toFixed(5);
			}
			else if(quantity > 0.000001){
				return quantity.toFixed(6);
			}
			else{
				return quantity.toFixed(7);
			}
		}
			
		function getBestPricesOrders(asset,buySellGroup){
			_requires['network'].connectGETv2({
				'method' : 'orders/' + asset+ '/book?base_token='+'XCP',
				'callback' : function(result) {
					if (result.ask.length > 0 || result.bid.length > 0) {
						var sell_orders = marge(result.ask, 'sell');
						var buy_orders = marge(result.bid, 'buy');
						if( buy_orders.length > 0 ){
							buySellGroup.buy.color = '#ca2929';
							var formattedPrice = trimPrice(parseFloat(buy_orders[0].price));
							var fiat_val = _requires['tiker'].to('XCP', formattedPrice, _requires['cache'].data.currncy, 3);
							var priceText = L('label_buy').toUpperCase() + '\n' + formattedPrice +' XCP' + ((fiat_val == null)? '' : '\n' + fiat_val);
							
							var attributes = [];
							if( fiat_val != null ){
								attributes.push({
									type : Ti.UI.ATTRIBUTE_FONT,
									value : { fontFamily : 'HelveticaNeue', fontSize : (OS_ANDROID)? 9: 10, fontWeight : 'normal' },
									range : [priceText.indexOf(fiat_val), fiat_val.length]
								});
							}
							attributes.push({
								type : Ti.UI.ATTRIBUTE_FONT,
								value : { fontFamily : 'Helvetica Neue', fontSize : (OS_ANDROID)? 9: 10, fontWeight : 'bold' },
								range : [priceText.indexOf(L('label_buy').toUpperCase()), L('label_buy').toUpperCase().length]
							});
							attributes.push({
								type : Ti.UI.ATTRIBUTE_FONT,
								value : { fontFamily : 'HelveticaNeue', fontSize : 8, fontWeight : 'normal' },
								range : [priceText.indexOf('XCP'), ('XCP').length]
							});
							if( fiat_val != null ){
								attributes.push({
						            type: Ti.UI.ATTRIBUTE_FOREGROUND_COLOR,
						            value: '#595959',
						            range: [priceText.indexOf(fiat_val), fiat_val.length]
								});
							}
							var atrib = Ti.UI.createAttributedString({
								text : priceText,
								attributes : attributes
							});
							buySellGroup.buy.attributedString = atrib;
						}
						else{
							buySellGroup.buy.text = "-";
						}
						if( sell_orders.length > 0 ){
							buySellGroup.sell.color =  '#6db558';
							var formattedPrice = trimPrice(parseFloat(sell_orders[0].price));
							var fiat_val = _requires['tiker'].to('XCP', formattedPrice, _requires['cache'].data.currncy,3);
							var priceText = L('label_sell').toUpperCase()+"\n"+formattedPrice +' XCP' + ((fiat_val == null)? '' : '\n' + fiat_val);
							
							var attributes = [];
							if( fiat_val != null ){
								attributes.push({
									type : Ti.UI.ATTRIBUTE_FONT,
									value : { fontFamily : 'HelveticaNeue', fontSize : (OS_ANDROID)? 9: 10, fontWeight : 'normal' },
									range : [priceText.indexOf(fiat_val), (fiat_val).length]
								});
							}
							attributes.push({
								type : Ti.UI.ATTRIBUTE_FONT,
								value : { fontFamily : 'Helvetica Neue', fontSize : (OS_ANDROID)? 9: 10, fontWeight : 'bold' },
								range : [priceText.indexOf(L('label_sell').toUpperCase()), L('label_sell').toUpperCase().length]
							});
							attributes.push({
								type : Ti.UI.ATTRIBUTE_FONT,
								value : { fontFamily : 'HelveticaNeue', fontSize : 8, fontWeight : 'normal' },
								range : [priceText.indexOf('XCP'), ('XCP').length]
							});
							if( fiat_val != null ){
								attributes.push({
						            type: Ti.UI.ATTRIBUTE_FOREGROUND_COLOR,
						            value: '#595959',
						            range: [priceText.indexOf(fiat_val), (fiat_val).length]
								});
							}
							var atrib = Ti.UI.createAttributedString({
								text : priceText,
								attributes : attributes
							});
							buySellGroup.sell.attributedString = atrib;
						}
						else{
							buySellGroup.sell.text = "-";
						}
					}else{
						buySellGroup.sell.text = "-";
						buySellGroup.buy.text = "-";
					}	
				},
				'onError' : function(error) {
				}
			});
		}
				
		var loadingAct = Ti.UI.createActivityIndicator({
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
		});
		this.bar.add(loadingAct);
		loadingAct.show();
		
    	return this.bar;
	};
	return new DexWidget();
}());