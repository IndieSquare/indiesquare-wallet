module.exports = (function() {
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var main_view;
	var menuview;
	var view;
	var backScreen;
	var button;
	var shortcutsView;
	var appListView;
	var listicon;
	var trashicon;
	
	var displayWidth = _requires['util'].getDisplayWidth();
	var displayHeight = _requires['util'].getDisplayHeight();
	
	var myapps = null;
	
	function webApps(){
		globals.shortCutSort = 0;
		//_requires['cache'].data.webapps = null;
		myapps = _requires['cache'].data.webapps;
		if( myapps == null ) myapps = [];
	}
	
	function deleteWebApp( params, box ){
		for( var i = 0; i < myapps.length; i++ ){
			if( myapps[i].id == params.id ){
				myapps.splice(i, 1);
				break;
			}
		}
		
		_requires['cache'].data.webapps = myapps;
		_requires["cache"].save();
		
		if( box != null ){
			box.animate(Ti.UI.createAnimation({
				opacity : 0.0,
				duration : 500
			}),function(){
				updateAppList();
			});
		}
		else updateAppList();
		
		if( params.shortcut ) updateShortCutView(false);
	}
	
	function addWebapp( params, callback ){
		_requires['network'].connectGETtoConnects({
			'method' : 'apps/' + params.id,
			'callback' : function(result) {
				var isNew = true;
				for( var i = 0; i < myapps.length; i++ ){
					if( myapps[i].id == result.id ){
						isNew = false;
						break;
					}
				}
				if( isNew ){
					var dialog = _requires['util'].createDialog({
						title: L('label_callback_addwebapp'),
						message: L('text_callback_addwebapp').format( { 'name': result.title, 'author': result.author }),
						buttonNames: [L('label_cancel'), L('label_ok')]
					});
					dialog.addEventListener('click', function(e){
						if( e.index != e.source.cancel ){
							myapps.push({
								'id': result.id,
								'title': result.title,
								'image': result.image,
								'url': result.base_uri,
								'version': result.version,
								'author': result.author,
								'category': result.category,
								'shortcut': false,
								'shortcut_index': globals.shortCutSort++,
								'index': myapps.length,
								'pre': false });
							
							_requires['cache'].data.webapps = myapps;
							_requires["cache"].save();
							
							updateAppList();
							callback(true);
							return;
						}
						callback(false);
					});
					dialog.show();
				}
				else{
					_requires['util'].createDialog({
						'message': L('text_webapp_already').format({'name': result.title}),
						'buttonNames': [L('label_close')]
					}).show();
					callback(true);
				}
			},
			'onError' : function(error) {
				callback(false);
			}
		});
	}
	globals.addWebapp = addWebapp;
	
	var isTrashMode = false;
	function trashmode(){
		if( isTrashMode ){
			/*
			trashicon.icon.image = '/images/icon_trash.png';
			trashicon.title.text = L('label_trash');
			for(var i = 0; i < appListView.children.length; i++){
				var box = appListView.children[i];
				box.children[4].visible = true;
				box.children[5].visible = false;
			}
			*/
		}
		else{
			//trashicon.icon.image = '/images/icon_done.png';
			//trashicon.title.text = L('label_done');
			
			for(var i = 0; i < appListView.children.length; i++){
				var box = appListView.children[i];
				box.children[4].visible = false;
				box.children[5].visible = true;
			}
		}
		isTrashMode = !isTrashMode;
	}
	
	function updateShortCutView( isChange ){
		var shortcut_n = 0;
		var shortcuts = [];
		shortcutsView.removeAllChildren();
		for( var i = 0; i < myapps.length; i++ ){
			if( myapps[i].shortcut ) shortcuts.push(myapps[i]);
		}
		if( isChange ){
			_requires['cache'].data.webapps = myapps;
			_requires["cache"].save();
		}
		shortcuts.sort(function(a, b) {
		  return a.shortcut_index < b.shortcut_index ? 1 : -1;
		});
		for( var i = 0; i < shortcuts.length; i++ ){
			var app = shortcuts[i];
			var appicon = _requires['util'].group({
				'icon' : _requires['util'].makeImage({
					image : app.image,
					width : 50,
					height : 50
				}),
				'title' : _requires['util'].makeLabel({
					text : app.title.substr(0, 7),
					color : 'black',
					textAlign : 'left',
					font : {
						fontFamily : 'HelveticaNeue-Light',
						fontSize : 15,
						fontWeight : 'normal'
					}
				})
			}, 'vertical');
			appicon.top = 7.5;
			appicon.left = 10 + (shortcut_n++ * 70);
			
			(function(appicon, app) {
				appicon.addEventListener('touchend', function(){
					close();
					listicon.icon.image = '/images/icon_list.png';
					listicon.title.text = L('label_list');
					isList = false;
					_windows['weblink'].run({ 'path': app.url, barColor: app.barcolor || '#009688' });
				});
			})(appicon, app);
			
			shortcutsView.add(appicon);
		}
		if( shortcut_n <= 0 ){
			var label_shortcut = _requires['util'].group({
				'icon' : _requires['util'].makeImage({
					image : '/images/icon_pin_off.png',
					width : 15, height : 15
				}),
				'sub' : _requires['util'].makeLabel({
					text: L('label_emptyshortcut'),
					textAlign: 'left',
					font: { fontFamily : 'HelveticaNeue-Light', fontSize : 14, fontWeight : 'light' },
					left: 5
				})
			}, 'horizontal');
			label_shortcut.opacity = 0.5;
			shortcutsView.add(label_shortcut);
		}
	}
	
	function updateAppList(){
		function createBox( params ){
			var box = _requires['util'].group();
			box.height = params.height;
			box.width = Ti.UI.FILL;
			box.backgroundColor = '#ffffff';
			
			return box;
		}
		
		if( isList ){
			/*
			if( myapps.length <= 0 ){
				trashicon.visible = false;
				trashicon.opacity = 0.0;
				if( isTrashMode ) trashmode();
			}
			else {
				trashicon.visible = true;
				trashicon.opacity = 1.0;
			}
			*/
		}
		appListView.removeAllChildren();
		for( var i = 0; i < myapps.length; i++ ){
			var app = myapps[i];
			var box = createBox({ height: 60 });
			box.top = 10;
			
			var appicon = _requires['util'].makeImage({
				image : app.image,
				width : 40, height : 40,
				left: 10
			});
			box.add(appicon);
			
			var apptitle = _requires['util'].makeLabel({
				text : app.title,
				textAlign : 'left',
				font : { fontFamily : 'HelveticaNeue-Light', fontSize : 14, fontWeight : 'light' },
				top : 10, left : 65
			});
			box.add(apptitle);
			
			var appcategory = _requires['util'].makeLabel({
				text : app.category,
				textAlign : 'left',
				font : { fontFamily : 'HelveticaNeue-Light', fontSize : 12, fontWeight : 'light' },
				bottom : 10, left : 65
			});
			box.add(appcategory);
			
			var border = Ti.UI.createView({
				width: '95%',
				height: 1, bottom: 0,
				backgroundColor: '#ececec',
				opacity: 1
			});
			box.add(border);
			
			var pinParam;
			if( app.shortcut ){
				pinParam = {
					image : '/images/icon_pin_on.png',
					width : 25, height : 25,
					right: 17.5
				};
			}
			else{
				pinParam = {
					image : '/images/icon_pin_off.png',
					width : 20, height : 20,
					right: 20, opacity: 0.5
				};
			}
			var appicon_pin = _requires['util'].makeImage(pinParam);
			box.add(appicon_pin);
			
			var appicon_trash = _requires['util'].makeImage({
				image : '/images/icon_trash.png',
				width : 20, height : 20,
				right: 20, opacity: 1.0,
				visible: false
			});
			if( app.pre > 0 ) appicon_trash.opacity = 0.0;
			box.add(appicon_trash);
			
			if( isTrashMode ){
				appicon_trash.visible = true;
				appicon_pin.visible = false;
			}
			
			var touch_list = Ti.UI.createView({
				width: displayWidth - 60, height: Ti.UI.FILL,
				left: 0, opacity: 0.5
			});
			box.add(touch_list);
			
			var touch_pin = Ti.UI.createView({
				width: 60, height: Ti.UI.FILL,
				right: 0, opacity: 0.5
			});
			box.add(touch_pin);
			
			(function(box, touch_list, touch_pin, appicon_pin, app) {
				touch_pin.addEventListener('touchend', function(){
					if( isTrashMode ){
						if( app.pre <= 0 ) deleteWebApp(app, box);
					}
					else{
						app.shortcut = !app.shortcut;
						appicon_pin.image = (app.shortcut)? '/images/icon_pin_on.png': '/images/icon_pin_off.png';
						
						if( app.shortcut ){
							appicon_pin.animate(Ti.UI.createAnimation({
								width : 25, height: 25,
								right: 17.5, opacity: 1.0,
								duration : 200
							}));
							app.shortcut_index = globals.shortCutSort++;
						}
						else{
							appicon_pin.animate(Ti.UI.createAnimation({
								width : 20, height: 20,
								right: 20, opacity: 0.5,
								duration : 200
							}));
						}
						updateShortCutView(true);
					}
				});
				touch_list.addEventListener('touchend', function(){
					_windows['weblink'].run({ 'path': app.url, barColor: app.barcolor || '#009688' });
				});
			})(box, touch_list, touch_pin, appicon_pin, app);
			
			appListView.add(box);
		}
	}
	
	function buttonHide(){
		if( button != null ){
			button.animate(Ti.UI.createAnimation({
				bottom : 0,
				duration : 200
			}));
		}
	}
	webApps.prototype.buttonHide = buttonHide;
	
	function buttonShow(){
		if( button != null ){
			button.animate(Ti.UI.createAnimation({
				bottom : 70,
				duration : 200
			}), function(){
				main_view.visible = false;
			});
		}
	}
	webApps.prototype.buttonShow = buttonShow;
	
	function open(){
		main_view.visible = true;
		backScreen.animate(Ti.UI.createAnimation({
			opacity : 0.7,
			duration : 200
		}));
		menuview.animate(Ti.UI.createAnimation({
			top : displayHeight - 140,
			duration : 400
		}));
		view.animate(Ti.UI.createAnimation({
			top : displayHeight - 80,
			duration : 200
		}));
		buttonHide();
	}
	
	function close(){
		backScreen.animate(Ti.UI.createAnimation({
			opacity : 0.0,
			duration : 200
		}));
		menuview.animate(Ti.UI.createAnimation({
			top : displayHeight,
			duration : 200
		}));
		view.animate(Ti.UI.createAnimation({
			top : displayHeight,
			duration : 200
		}));
		buttonShow();
	}
	
	var isList = false;
	function listSlide(){
		if( isTrashMode ) trashmode();
		
		if( isList ){
			listicon.icon.image = '/images/icon_list.png';
			listicon.title.text = L('label_list');
			view.animate(Ti.UI.createAnimation({
				top : displayHeight - 80,
				duration : 200
			}));
			
			shortcutsView.animate(Ti.UI.createAnimation({
				opacity : 1.0,
				duration : 200
			}), function(){
				shortcutsView.visible = true;
			});
			/*
			trashicon.animate(Ti.UI.createAnimation({
				opacity : 0.0,
				duration : 200
			}), function(){
				trashicon.visible = false;
			});
			*/
		}
		else{
			listicon.icon.image = '/images/icon_close.png';
			listicon.title.text = L('label_close');
			view.animate(Ti.UI.createAnimation({
				top : 0,
				duration : 200
			}));
			
			shortcutsView.animate(Ti.UI.createAnimation({
				opacity : 0.0,
				duration : 200
			}), function(){
				shortcutsView.visible = false;
			});
			if( myapps.length > 0 ){
				/*
				trashicon.visible = true;
				trashicon.animate(Ti.UI.createAnimation({
					opacity : 1.0,
					duration : 200
				}));
				*/
			}
		}
		isList = !isList;
	}
	
	webApps.prototype.createButton = function(){
		button = Ti.UI.createImageView({
			image: '/images/icon_connect.png',
			width: 40, height: 40
		});
		button.right = 15;
    	button.bottom = 70;
    	
    	button.addEventListener('touchend', open);
    	return button;
	};
	
	webApps.prototype.createView = function(){
		main_view = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: Ti.UI.FILL });
		main_view.visible = false;
		
		backScreen = Ti.UI.createView({ backgroundColor:'black', width: Ti.UI.FILL, height: Ti.UI.FILL });
		backScreen.opacity = 0.0;
		
		backScreen.addEventListener('touchend', close);
		
		menuview = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: displayHeight });
    	menuview.top = displayHeight;
    	
    	menuview.addEventListener('touchend', close);
    	
		var linkage_button = _requires['util'].group({
			'icon': _requires['util'].makeImage({
				image: '/images/icon_connect_linkage.png',
				width: 30, height: 30
			}),
			'title': _requires['util'].makeLabel({
				text: L('label_linkage'),
				color: 'white',
				textAlign: 'left',
				left: 5,
				font: { fontFamily: 'HelveticaNeue-Light', fontSize: 15, fontWeight: 'normal' }
			})
		}, 'horizontal');
		linkage_button.top = 20;
		linkage_button.right = 20;
		menuview.add(linkage_button);
		
		var touch_linkage = Ti.UI.createView({
			width: 115, height: 60,
			top: 0, right: 0, backgroundColor:'transparent'
		});
		touch_linkage.addEventListener('touchend', function(e) {
			_requires['util'].openScanner({
				'callback' : function(e) {
					globals._parseArguments(e.barcode, true);
				}
			});
		});
		menuview.add(touch_linkage);
		
		view = Ti.UI.createView({ backgroundColor:'#ffffff', width: Ti.UI.FILL, height: displayHeight });
    	view.top = displayHeight;
    	
    	appListView = Ti.UI.createScrollView({
			width: Ti.UI.FILL, height: displayHeight - 130,
			top: 80,
			backgroundColor: 'white',
			scrollType: 'vertical',
			layout: 'vertical',
			showVerticalScrollIndicator: true
		});
		view.add(appListView);
		/*
		var border = Ti.UI.createView({
			width : Ti.UI.FILL, height : 1,
			backgroundColor : 'black',
			bottom : 45,
			opacity : 0.2
		});
		view.add(border);
		
		var buttonframe = Ti.UI.createView({
			backgroundColor : '#009688',
			width : Ti.UI.FILL, height : 45,
			bottom: 0,
			opacity : 1
		});
		view.add(buttonframe);
		
		var connectButton = _requires['util'].group({
			'main' : Ti.UI.createLabel({
				text : L('label_tab_indieconnects'),
				color : 'white',
				font : {　fontSize : 18,　fontFamily : 'HelveticaNeue-Bold'　}
			}),
			'sub' : Ti.UI.createLabel({
				text : L('label_tab_getitmore'),
				color : 'white',
				font : { fontSize : 12, fontFamily : 'HelveticaNeue-Light', fontWeight : 'light' },
			})
		}, 'vertical');
		buttonframe.add(connectButton);
		connectButton.addEventListener('touchend', function(e){
			if( isTrashMode ) trashmode();
			_windows['weblink'].run({ 'path': Alloy.CFG.connects_uri, barColor: '#009688' });
		});
    	*/
    	
		shortcutsView = Ti.UI.createScrollView({
			width: displayWidth - 80, height: 80,
			top: 0, left: 0,
			scrollType : 'horizontal',
			showHorizontalScrollIndicator: true
		});
		view.add(shortcutsView);
		
		listicon = _requires['util'].group({
			'icon': _requires['util'].makeImage({
				image: '/images/icon_list.png',
				width: 20,
				height: 20
			}),
			'title': _requires['util'].makeLabel({
				text: L('label_list'),
				color: 'black',
				textAlign: 'center',
				top: 5,
				font: {
					fontFamily: 'HelveticaNeue-Light',
					fontSize: 10,
					fontWeight: 'normal'
				}
			})
		}, 'vertical');
		listicon.top = 20;
		listicon.right = 25;
		listicon.addEventListener('touchend', function(){
			listSlide();
		});
		view.add(listicon);
		/*
		trashicon = _requires['util'].group({
			'icon' : _requires['util'].makeImage({
				image: '/images/icon_trash.png',
				width: 20, height: 20
			}),
			'title': _requires['util'].makeLabel({
				text: L('label_trash'),
				color: 'black',
				textAlign: 'center',
				top: 5,
				font: {
					fontFamily: 'HelveticaNeue-Light',
					fontSize: 10,
					fontWeight: 'normal'
				}
			})
		}, 'vertical');
		trashicon.top = 17.5;
		trashicon.left = 25;
		trashicon.opcity = 0.0;
		trashicon.visible = false;
		trashicon.addEventListener('touchend', function(){
			trashmode();
		});
		view.add(trashicon);
		*/
		main_view.add(backScreen);
		main_view.add(menuview);
		main_view.add(view);
	  	
	  	_requires['network'].connectGETtoConnects({
			'method' : 'preinstalls',
			'callback' : function(result) {
				var preinstalls = [];
				for( var i = 0; i < myapps.length; i++ ){
					if( myapps[i].pre > 0 ){
						var isDelete = true;
						for(var j = 0; j < result.length; j++){
							if( myapps[i].id == result[j].id ){
								isDelete = false;
								break;
							}
						}
						var target = myapps.splice(i--, 1)[0];
						if( !isDelete ) preinstalls.push(target);
					}
				}
				
				for(var i = 0; i < result.length; i++){
					var app = result[i];
					var isNew = true;
					for( var j = 0; j < preinstalls.length; j++ ){
						if( preinstalls[j].id == app.id ){
							isNew = false;
							// Update
							preinstalls[j].title = app.title;
							preinstalls[j].image = app.image;
							preinstalls[j].url = app.base_uri;
							preinstalls[j].version = app.version;
							preinstalls[j].author = app.author;
							preinstalls[j].category = app.category;
							preinstalls[j].pre = app.pre;
							break;
						}
					}
					if( isNew ){
						preinstalls.push({
							'id': app.id,
							'title': app.title,
							'image': app.image,
							'url': app.base_uri,
							'version': app.version,
							'author': app.author,
							'category': app.category,
							'pre': app.pre,
							'shortcut': false,
							'index': i });
					}
				}
				preinstalls.sort(function(a, b) {
					return a.pre > b.pre ? 1 : -1;
				});
				myapps = preinstalls.concat(myapps);
				for( var i = 0; i < myapps.length; i++ ) myapps[i].index = i;
				
				_requires['cache'].data.webapps = myapps;
				_requires["cache"].save();
			},
			'onError': function(error) {
				
			},
			'always': function(){
				myapps.sort(function(a, b) {
					return a.shortcut_index > b.shortcut_index ? 1 : -1;
				});
				for( var i = 0; i < myapps.length; i++ ) myapps[i].shortcut_index = i;
				globals.shortCutSort = i + 1;
				myapps.sort(function(a, b) {
					return a.index > b.index ? 1 : -1;
				});
				
				updateShortCutView(false);
				updateAppList();
			}
		});
	  	
    	return main_view;
	};
	return new webApps();
}());