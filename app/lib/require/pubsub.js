module.exports = (function() {
	var self = {};
	
	self.init = function( params ){
		
	};
	
	self.publish = function( params ){
		var xhr = Ti.Network.createHTTPClient({'validatesSecureCertificate': !Alloy.CFG.isLocal});
		xhr.open('POST', Alloy.CFG.pubsub_uri + 'publish');
		xhr.onload = function(){
			if( params.callback != null ) params.callback();
		},
		xhr.onerror = function(e){
			Ti.API.info(e);
			if( params.onError != null ) params.onError(e);
		};
		xhr.send({ 'channel': params.channel, 'data': params.message });
	};
	
	self.subscribe = function( params ){
		var xhr = Ti.Network.createHTTPClient({'validatesSecureCertificate': !Alloy.CFG.isLocal});
		xhr.open('POST', Alloy.CFG.pubsub_uri + 'topic');
		xhr.onload = function(){
			var xhr = Ti.Network.createHTTPClient();
			xhr.timeout = 180000;
			xhr.open('POST', Alloy.CFG.pubsub_uri + 'subscribe');
			xhr.onload = function(){
				var res = JSON.parse(this.responseText);
				
				if( params.callback != null ) params.callback(res.data);
			},
			xhr.onerror = function(e){
				Ti.API.info(e);
			};
			xhr.send({ channel: params.channel, type: 1 });
			
			params.connect();
		},
		xhr.onerror = function(e){
			Ti.API.info(e);
			if( params.onError != null ) params.onError(e);
		};
		xhr.send({ channel: params.channel });
	};
	
	return self;
}());