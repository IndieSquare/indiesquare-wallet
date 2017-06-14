module.exports = (function() {
	var self = {};
	var util = require('require/util');
	
	self.createWindow = function(){
		var win = {};
		win.origin = Ti.UI.createWindow({
			orientationModes: [Ti.UI.PORTRAIT],
			navBarHidden: true
		});
		if( OS_IOS ) win.origin.statusBarStyle = Ti.UI.iOS.StatusBar.LIGHT_CONTENT;
		if( OS_ANDROID ) win.origin.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_ADJUST_PAN;
		
		win.view = Ti.UI.createView({ backgroundColor:'#ffffff', width: Ti.UI.FILL, height: Ti.UI.FILL });
		win.origin.add(win.view);
		
		win.open = function( params ){
			if( OS_ANDROID ) params = null;
			win.origin.open( params );
		};
		
		win.close = function( params ){
			if( OS_ANDROID ) params = null;
			win.origin.close( params );
		};
		
		win.hide = function(){
			win.origin.hide();
		};
		
		win.show = function(){
			win.origin.show();
		};
		
		return win;
	};
	
	self.drawFrame = function( win, params ){
		var frame = {};
		frame.top = Ti.UI.createView({ backgroundColor:'#ffc07f', top: 0, width: Ti.UI.FILL, height: 40 });
		frame.bottom = Ti.UI.createView({ backgroundColor:'#ffc07f', bottom: 0, width: Ti.UI.FILL, height: 50 });
		
		if( Alloy.CFG.isDevelopment ){
			var text_dev = util.makeLabel({
				text: 'Development ver '+Ti.App.version,
				font:{ fontSize: 10 },
				bottom: 5
			});
			frame.top.add(text_dev);
		}
		var top = 0, bottom = 0;
		if( params ){
			top = (params.window_top)? params.window_top: 0;
			bottom = (params.window_bottom)? params.window_bottom: 0;
		}
		frame.view = Ti.UI[(OS_ANDROID || (params && params.NoScroll))?'createView':'createScrollView']({
			top: 40 + top, width: Ti.UI.FILL,
			height: util.getDisplayHeight() - (90 + bottom + top),
			scrollType: 'vertical'
		});
		
		if( params != null ){
			if( params.back ){
				var back_button = util.group({
					image: util.makeImageButton({
					    image: '/images/img_back.png',
					    width: 60,
					}),
					txt_back: util.makeLabel({
						text: L('label_back'),
						font:{ fontSize: 10 },
						left: 60
					})
				});
				back_button.left = -20;
				if( L('language') === 'en' ) back_button.txt_back.left = 80;
				back_button.addEventListener('click', function(){
					if( params.callback ) params.callback();
					win.close({transition:Ti.UI.iPhone.AnimationStyle.NONE});
				});
				frame.bottom.add(back_button);
			}
		}
		win.origin.add( frame.view );
		win.origin.add( frame.top );
		win.origin.add( frame.bottom );
		
		return frame;
	};
	
	self.newLayer = function( parent ){
		var layer = Ti.UI.createView({
			width: Ti.UI.FILL, height: util.getDisplayHeight() - 90,
			top: 40,
			scrollType: 'vertical'
		});
		parent.add( layer );
		
		return layer;
	};
	
	self.removeLayer = function( win, layer ){
		win.origin.remove( layer );
	};
	
	self.addPullEvent = function( view, params ){
		var a = null;
		if( OS_ANDROID ){
			a = view.children[0].convertPointToView({
				x: view.children[0].rect.x,
				y: view.children[0].rect.y
			}, params.parent);
		}
		
		var reload = util.makeImageButton({
		    image: '/images/icon_reload_off.png',
		    width: 30, top: (a != null)? util.convert_y(a.y): params.margin_top, opacity: 0.0
		});
		params.parent.add(reload);
		
		var s = 0, s_total = 0, top = view.children[0].top;
		var howpull = params.howpull || 60;
		function scroll( y ){
			if(y > -howpull){
				reload.opacity = (y / -howpull);
				reload.image = '/images/icon_reload_off.png';
			}
			else{
				reload.opacity = 1.0;
				reload.image = '/images/icon_reload_on.png';
			}
			var t = Ti.UI.create2DMatrix();
			reload.transform = t.rotate(90 - (90 * reload.opacity)).scale(reload.opacity, reload.opacity);
		}
		function release( y ){
			if( y < -howpull ){
				if( OS_ANDROID ){
					view.children[0].top = y;
					view.children[0].animate({ top: 90, duration: 100 });
				}
				else if( OS_IOS ){
					view.children[0].animate({ top: 60, duration: 100 });
				}
				var loading = util.showLoading(params.parent, { width: Ti.UI.FILL, height: 25, top: (a != null)? util.convert_y(a.y): params.margin_top });
				params.callback(loading);
			}
			else if( OS_ANDROID ){
				view.children[0].animate({ top: top, duration: 100 });
				s_total = 0;
			}
			reload.image = '/images/icon_reload_off.png';
			reload.opacity = 0.0;
		}
		if( OS_IOS ){
			view.addEventListener('scroll', function(e){
				if( view.contentOffset.y <= 0 ) scroll( view.contentOffset.y );
			});
			view.addEventListener('dragEnd', function(e){
				release( view.contentOffset.y );
			});
		}
		else if( OS_ANDROID ){
			var move = 0;
			view.addEventListener('touchstart', function(e){
				s = e.y;
				move = 0;
				if( s_total < 0 ) s_total = 0;
			});
			view.addEventListener('touchmove', function(e){
				if( move++ > 3 ){
					globals.is_scrolling = true;
					if( view.contentOffset.y <= 0 || view.children[0].top > top ){
						if( s != 0 ){
							var diff = (s - e.y) / 2;
							if( Math.abs(diff) < 100 ) s_total += diff;
							view.children[0].top = -s_total;
							if( view.children[0].top <= top ){
								view.children[0].top = top;
								view.scrollingEnabled = true;
							}
							scroll(-view.children[0].top);
						}
						s = e.y;
					}
				}
			});
			view.addEventListener('touchend', function(e){
				globals.is_scrolling = false;
				release( -view.children[0].top );
				s = 0;
			});
		}
	};
	
	return self;
}());