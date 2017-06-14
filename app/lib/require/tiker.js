module.exports = (function() {
	var self = {};
	token_fiat_values = [];
	self.getTiker = function( params ){
		var _requires = globals.requires;
		_requires['network'].connectGETv2({
			'method': 'market/ticker',
			'callback': function( result ){
				globals.tiker = result;
				if( params && params.callback ) params.callback(result);
			},
			'onError': function(error){}
		});
	};
	
	function addCommas(nStr) {
   		 nStr += '';
   		 x = nStr.split('.');
   		 x1 = x[0];
   		 x2 = x.length > 1 ? '.' + x[1] : '';
    	 var rgx = /(\d+)(\d{3})/;
    	 while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
   		 }
   		 return x1 + x2;
	}
	
	self.to = function( type, quantity, currency, digit ){
		if( !self.isAvailable( currency ) ) return null;
		if( !isFinite(quantity) ) return '???';
		
		var price = globals.tiker[currency].last;
		var symbol = globals.tiker[currency].symbol;
		
		if( digit == null ) digit = 4;
		if( type === 'XCP' ){
			var xcp_btc = globals.tiker['XCP'].last;
			return '{0}{1}'.format(symbol, addCommas((quantity * price * xcp_btc).toFixed2(digit)));
		}
		else if( type === 'BTC' ){
			return '{0}{1}'.format(symbol, addCommas((quantity * price).toFixed2(digit)));
		}
		else{
			if(token_fiat_values.hasOwnProperty(type)){
				var val = token_fiat_values[type];
				return '{0}{1}'.format(symbol, addCommas((quantity * val).toFixed2(digit)));
			}
			else{
				return '{0}{1}'.format(symbol, 0);
			}
		}
	};
	
	self.swapCurrency = function( params ){
		if( !self.isAvailable( params.from ) ) return null;
		if( !self.isAvailable( params.to ) ) return null;
		
		var BTC = params.amount / globals.tiker[params.from].last;
		var rate_to = globals.tiker[params.to].last;
		
		return (rate_to * BTC).toFixed2(4);
	};
	
	self.getRate = function( currency ){
		if( !self.isAvailable( currency ) ) return null;
		var xcp_btc = globals.tiker['XCP'].last;
		return globals.tiker[currency].last * xcp_btc;
	};
	
	self.isAvailable = function( currency ){
		if( globals.tiker == null ) return false;
		return currency in globals.tiker;
	};
	
	return self;
}());