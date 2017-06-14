module.exports = (function() {
	var self = {};
	
	function onerror(params, e, error){
		var message = { code: 'unknown', type: 'Error', message: e.error };
		if( error != undefined && error != null ){
			try{
				Ti.API.error(error);
				message = JSON.parse(error);
			}
			catch(e){}
		}
		Ti.API.error('Error: ' + e.error + ':' + e.code + ': ' + JSON.stringify(message));
		
		globals.requires['analytics'].trackEvent({
			name: 'api_exception',
			parameters: {
				'method': params.type,
				'endpoint': params.endpoint,
				'type': message.type,
				'code': message.code,
				'message': message.message,
				'errors': message.errors
			}
		});
		
		if( params.onError ) params.onError( message );
	};
	
	function onworm(params, json){
		Ti.API.warn( json.errorMessage );
		if( params.onError ) params.onError( json.errorMessage );
	};
	
	function reorg(params){
		Ti.API.warn('Reorg occured...');
		if( params.onReorg ) params.onReorg();
	};
	
	self.connectDELETEv2 = function( params ){
		var xhr = Ti.Network.createHTTPClient({'validatesSecureCertificate': !Alloy.CFG.isLocal});
		xhr.open('DELETE', Alloy.CFG.api_uri + 'v2/' + params.method);
		xhr.setRequestHeader('X-Api-Key', Alloy.Globals.api_key);
		xhr.onload = function(){
			var results = '';
			try{
				results = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( results );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			params.type = 'DELETE';
			params.endpoint = Alloy.CFG.api_uri + 'v2/' + params.method;
  			onerror(params, e, this.responseText);
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	
	self.connectPUTv2 = function( params ){
		var xhr = Ti.Network.createHTTPClient({'validatesSecureCertificate': !Alloy.CFG.isLocal});
		xhr.open('PUT', Alloy.CFG.api_uri + 'v2/' + params.method);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader('charset','utf-8');
		xhr.setRequestHeader('X-Api-Key', Alloy.Globals.api_key);
		xhr.onload = function(){
			var results = '';
			try{
				results = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( results );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			params.type = 'PUT';
			params.endpoint = Alloy.CFG.api_uri + 'v2/' + params.method;
			onerror(params, e, this.responseText);
			if( params.always != null ) params.always();
		};
		xhr.send( JSON.stringify(params.post));
	};
	
	self.connectPOSTv2 = function( params ){
  		var xhr = Ti.Network.createHTTPClient({'validatesSecureCertificate': !Alloy.CFG.isLocal});
  		xhr.open('POST', Alloy.CFG.api_uri + 'v2/' + params.method);
  		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader('charset','utf-8');
  		xhr.setRequestHeader('X-Api-Key', Alloy.Globals.api_key);
		
  		xhr.onload = function(){
  			var results = '';
    		try{
    			results = JSON.parse( this.responseText );
    		}
    		catch(e){}
    		params.callback( results );
    		if( params.always != null ) params.always();
  		},
  		xhr.onerror = function(e){
  			params.type = 'POST';
			params.endpoint = Alloy.CFG.api_uri + 'v2/' + params.method;
  			onerror(params, e, this.responseText);
    		if( params.always != null ) params.always();
  		};
  		xhr.send( JSON.stringify(params.post) );
	};
	
	self.connectGETv2 = function( params ){
		var xhr = Ti.Network.createHTTPClient({'validatesSecureCertificate': !Alloy.CFG.isLocal});
		xhr.open('GET', Alloy.CFG.api_uri + 'v2/' + params.method);
  		xhr.setRequestHeader('X-Api-Key', Alloy.Globals.api_key);
		xhr.onload = function(){
			var results = '';
			try{
				results = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( results );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			params.type = 'GET';
			params.endpoint = Alloy.CFG.api_uri + 'v2/' + params.method;
			onerror(params, e, this.responseText);
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	
	self.getjson = function( params ){
		var xhr = Ti.Network.createHTTPClient({'validatesSecureCertificate': !Alloy.CFG.isLocal});
		
		if( !params.uri.match(/^https?:\/\//) ) params.uri = 'https://' + params.uri;
		
		xhr.open('GET', params.uri);
		xhr.setRequestHeader('X-Api-Key', Alloy.Globals.api_key);
		xhr.onload = function(){
			var json_data = '';
			try{
				json_data = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( json_data );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			//onerror(params, e, this.responseText);
			if( params.onError ) params.onError();
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	
	self.connectPOSTtoIndieboard = function( params ){
  		var xhr = Ti.Network.createHTTPClient({'validatesSecureCertificate': !Alloy.CFG.isLocal});
  		xhr.open('POST', Alloy.CFG.dashboard_uri + params.method);
  		//xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader('charset','utf-8');
  		xhr.setRequestHeader('X-Api-Key', Alloy.Globals.api_key);
  		xhr.setRequestHeader('Authorization', 'Basic ' + Ti.Utils.base64encode(globals.webview_id + ':' + globals.webview_pass));
  		xhr.onload = function(){
  			var results = '';
    		try{
    			results = JSON.parse( this.responseText );
    		}
    		catch(e){}
    		params.callback( results );
    		if( params.always != null ) params.always();
  		},
  		xhr.onerror = function(e){
  			params.type = 'POST';
			params.endpoint = Alloy.CFG.dashboard_uri + params.method;
  			onerror(params, e, this.responseText);
    		if( params.always != null ) params.always();
  		};
  		xhr.send( params.post );
	};
	
	self.connectGETtoConnects = function( params ){
  		var xhr = Ti.Network.createHTTPClient({'validatesSecureCertificate': !Alloy.CFG.isLocal});
		xhr.open('GET', Alloy.CFG.api_uri + 'connects/v1/' + params.method);
  		xhr.setRequestHeader('X-Api-Key', Alloy.Globals.api_key);
		xhr.onload = function(){
			var results = '';
			try{
				results = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( results );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			params.type = 'GET';
			params.endpoint = Alloy.CFG.dashboard_uri + params.method;
			onerror(params, e, this.responseText);
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	
	return self;
}());