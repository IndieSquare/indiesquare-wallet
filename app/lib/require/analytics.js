module.exports = (function() {
	var self = {};
	
	var Firebase = require('ti.firebase');
	if( !Alloy.CFG.isDevelopment ) Firebase.configure();
	
	self.setUser = function(params){
		if( Alloy.CFG.isDevelopment ) return;
		try{
			Ti.API.info('Analytics setUser:' + JSON.stringify(params));
			if( OS_IOS ){
				Firebase.FIRAnalytics.setUserPropertyString(params);
			}
			else{
				Firebase.setUserPropertyString(params.name, params.value);
			}
		}
		catch(e){
			Ti.API.error(e);
		}
	};
	
	self.trackEvent = function(params){
		if( Alloy.CFG.isDevelopment ) return;
		try{
			Ti.API.info('Analytics trackEvent:' + JSON.stringify(params));
			if( OS_IOS ){
				Firebase.FIRAnalytics.logEventWithName({
					name: params.name,
					parameters: params.parameters
				});
			}
			else{
				Firebase.logEventWithName(params.name, params.parameters);
			}
		}
		catch(e){
			Ti.API.error(e);
		}
	};
	
	return self;
}());