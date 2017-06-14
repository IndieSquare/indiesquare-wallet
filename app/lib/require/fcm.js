module.exports = (function() {
	var self = {};
	
	self.start = function(){
		var deviceToken = null;
		function receivePush(e) {
			try{
				var message;
				if( OS_IOS ) message = e.data.aps.alert;
				else{
					message = e.message;
				}
				globals.requires['util'].createDialog({
					'message': message,
					'buttonNames': [L('label_close')]
				}).show();
				
				globals.loadBalance(true);
			}
			catch(e){
				Ti.API.info('Push receive error.');
			}
		}
		function deviceTokenSuccess(e) {
			deviceToken = e.deviceToken;
			globals.requires['network'].connectPUTv2({
				'method': 'users/' + globals.requires['cache'].data.id + '/info/update',
				'post': {
					updates: JSON.stringify( [
						{ column: 'device_token', value: deviceToken },
						{ column: 'appver', value: Ti.App.version },
						{ column: 'language', value: L('language') }
					])
				},
				'callback': function( result ){
					globals.deviceToken = deviceToken;
				},
				'onError': function(error){
					globals.requires['util'].createDialog({
						'title': error.type,
						'message': error.message,
						'buttonNames': [L('label_close')]
					}).show();
				}
			});
		}
		function deviceTokenError(e) {
			Ti.API.info('Failed to register for push notifications! ' + e.error);
		}

		if( OS_IOS ){
			if (Ti.Platform.name == 'iPhone OS' && parseInt(Ti.Platform.version.split('.')[0]) >= 8) {
				Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {
					Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
					Ti.Network.registerForPushNotifications({
			            success: deviceTokenSuccess,
			            error: deviceTokenError,
			            callback: receivePush
			        });
			    });
			    Ti.App.iOS.registerUserNotificationSettings({
				    types: [
				        Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
				        Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
				        Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
				    ]
				});
			}
			else {
				Ti.Network.registerForPushNotifications({
					types: [
						Ti.Network.NOTIFICATION_TYPE_BADGE,
						Ti.Network.NOTIFICATION_TYPE_ALERT,
						Ti.Network.NOTIFICATION_TYPE_SOUND
					],
					success: deviceTokenSuccess,
					error: deviceTokenError,
					callback: receivePush
				});
			}
		}
		else{
			var firebase = require('ti.firebase');
			firebase.registerForFCM({
				success: deviceTokenSuccess,
				error: deviceTokenError,
				callback: receivePush
			});
		}
	};
	
    return self;
}());