module.exports.run = function() {
    function init_passphrase(passphrase) {
        each_num = -1;
        field_passphrase.value = passphrase || "";
        if (null == passphrase) for (var i = 0; 12 > i; i++) field_each[i].value = "";
        view_each_1.removeAllChildren();
        view_each_1.add(field_passphrase);
        view_each_1.opacity = 1;
        view_each_1.left = view_each_1.right = null;
        view_each_2.opacity = 0;
        view_each_2.removeAllChildren();
    }
    function move_next() {
        function move() {
            var field = field_each[++each_num];
            word_num.text = L("text_word_num").format({
                num: each_num + 1
            });
            new_view.add(field);
            is_moving = true;
            old_view.left = 0;
            old_view.animate({
                left: -200,
                opacity: 0,
                duration: 300
            }, function() {
                old_view.left = old_view.right = null;
                old_view.removeAllChildren();
            });
            new_view.opacity = 0;
            new_view.right = -200;
            new_view.animate({
                right: 0,
                opacity: 1,
                duration: 300
            }, function() {
                new_view.left = new_view.right = null;
                new_view.visible = true;
                is_moving = false;
            });
            0 >= each_num ? text_inputbyeach_prev.opacity = .5 : 1 == each_num && (text_inputbyeach_prev.opacity = 1);
        }
        if (11 > each_num) {
            if (!is_moving) {
                var new_view, old_view;
                if (each_num % 2 == 0) {
                    new_view = view_each_1;
                    old_view = view_each_2;
                } else {
                    new_view = view_each_2;
                    old_view = view_each_1;
                }
                if (each_num >= 0) {
                    _requires["inputverify"].set(new Array({
                        name: L("label_passphrase"),
                        type: "password",
                        target: old_view.children[0],
                        over: 0
                    }));
                    var result = null;
                    if (true == (result = _requires["inputverify"].check())) move(); else {
                        var dialog = _requires["util"].createDialog({
                            message: result.message,
                            buttonNames: [ L("label_close") ]
                        });
                        dialog.addEventListener("click", function() {
                            result.target.focus();
                        });
                        dialog.show();
                    }
                } else move();
            }
        } else {
            var passphrase = "";
            for (var i = 0; 12 > i; i++) {
                passphrase += field_each[i].value.toLowerCase();
                11 > i && (passphrase += " ");
            }
            signin.visible = field_group.visible = button_group.visible = true;
            word_num.visible = button_group_each.visible = false;
            init_passphrase(passphrase);
        }
    }
    function move_prev(){
		if( each_num > 0 && !is_moving ){
			var new_view, old_view;
			if( each_num % 2 == 0 ){
				new_view = view_each_1;
				old_view = view_each_2;
			}
			else{
				new_view = view_each_2;
				old_view = view_each_1;
			}
			
			var field = field_each[--each_num];
			word_num.text = L('text_word_num').format({'num': each_num + 1});
			new_view.add(field);
			
			is_moving = true;
			
			old_view.right = 0;
			old_view.animate({ right: -200, opacity: 0.0, duration: 300 }, function(){
				old_view.left = old_view.right = null;
				old_view.removeAllChildren();
			});
			
			new_view.opacity = 0.0;
			new_view.left = -200;
			new_view.animate({ left: 0, opacity: 1.0, duration: 300 }, function(){
				new_view.left = new_view.right = null;
				new_view.opacity = 1.0;
				is_moving = false;
			});
			
			if( each_num <= 0 ) text_inputbyeach_prev.opacity = 0.5;
		}
	}
    function getAccelerometer(e) {
        var a = 0;
        e.timestamp % 3 == 0 ? a = e.x * e.y : e.timestamp % 3 == 1 ? a = e.y * e.z : e.timestamp % 3 == 2 && (a = e.z * e.x);
        globals.Accelerometer = 1e8 * a;
        var accel = e.x + e.y + e.z;
        if (-1 == firstAccel) firstAccel = accel; else {
            var threshAccel = firstAccel - accel;
            30 > threshAccel && (threshAccel = -1 * threshAccel);
            firstAccel = -1;
            if (threshAccel > 0 && accelArray.length < 32) {
                accelArray.push(threshAccel);
            }
        }
        val++;
        max > val && (s += (e.timestamp + parseInt(e.x) + parseInt(e.y) + parseInt(e.z) + parseInt(a)) % 2);
    }
    var _windows = globals.windows;
    var _requires = globals.requires;
    var win = _requires["layer"].createWindow();
    var main_view = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: Ti.UI.FILL
    });
    win.origin.add(main_view);
    
    if( !_requires['cache'].checkExists() ){
	    var crypt = require("crypt/api");
	    var rsa_info = globals.requires["cache"].load_rsa();
	    var isCreatingAccount = false;
	    var password = "";
	    for (var i = 0; 12 > i; i++) {
	        var random = 16 * Math.random() | 0;
	        password += (12 == i ? 4 : 16 == i ? 3 & random | 8 : random).toString(16);
	    }
	    var gotCSRPNG = false;
	    var gotRANDORG = false;
	    var seedCSRPNG = "";
	    var seedRandOrg = "";
	    var webview = Ti.UI.createWebView({
	        url: (OS_IOS)? "/vendor/secureRand.html": "../vendor/secureRand.html"
	    });
	    Ti.App.addEventListener("app:fromWebView", function(e) {
	    	seedCSRPNG = e.message;
	        seedCSRPNG.length > 255 && (gotCSRPNG = true);
	    });
	    var client = Ti.Network.createHTTPClient({
	        onload: function() {
	            if (this.responseText.length > 100) {
	                seedRandOrg = this.responseText.replace(/ /g, "");
	                gotRANDORG = true;
	            }
	        },
	        onerror: function(e) {
	        },
	        timeout: 15e3
	    });
	    client.open("GET", "https://www.random.org/cgi-bin/randbyte?nbytes=255&format=b");
	    client.send();
	    webview.hide();
	    win.origin.add(webview);
	    
	    var view = Ti.UI.createScrollView({
	        width: Ti.UI.FILL,
	        height: Ti.UI.FILL,
	        scrollType: "vertical",
	        backgroundColor: "#e54353"
	    });
	    main_view.add(view);
	    var logo = _requires["util"].makeImage({
	        image: '/images/icon_logo_white.png',
	        width: 150,
	        top: 0
	    });
	    var newwallet = _requires["util"].group({
	        label: _requires["util"].makeLabel({
	            text: L("label_newwallet"),
	            font: {
	                fontSize: 25
	            },
	            color: "#ffffff"
	        })
	    });
	    newwallet.addEventListener("touchend", function() {
	    	var dialog = _requires['util'].createDialog({
				title : L('label_createaccount'),
				message : L('text_createaccount'),
				buttonNames : [L('label_cancel'), L('label_create')]
			});
			dialog.addEventListener('click', function(e) {
				if (e.index != e.source.cancel) {
					whole_group.visible = false;
			        if (true == gotRANDORG && true == gotCSRPNG) {
			            var a = s.split(""), n = a.length;
			            for (var i = n - 1; i > 0; i--) {
			                var j = Math.floor(Math.random() * (i + 1));
			                var tmp = a[i];
			                a[i] = a[j];
			                a[j] = tmp;
			            }
			            s = a.join("");
			            s = s.substr(0, 256);
			            {
			                parseInt(s, 2);
			            }
			            globals.randomBytes = getRandom(128, parseInt(s, 2));
			            Ti.Accelerometer.removeEventListener("update", getAccelerometer);
			            if (false == isCreatingAccount) {
			                isCreatingAccount = true;
			                createAccount({
			                    passphrase: null
			                });
			            }
			        } else {
			        	_requires["util"].createDialog({
			                message: L('text_error_notsecure'),
			                buttonNames: [ L("label_close") ]
			            }).show();
			        }
				}
			});
			dialog.show();
	    });
	    newwallet.top = 50;
	    newwallet.height = 50;
	    newwallet.width = "90%";
	    newwallet.backgroundColor = "#E45C61";
	    var signin = _requires["util"].group({
	        label: _requires["util"].makeLabel({
	            text: L("label_signin"),
	            font: {
	                fontSize: 25
	            },
	            color: "#ffffff"
	        })
	    });
	    signin.addEventListener("touchend", function() {
	        var passphrase = field_passphrase.value;
	        _requires["inputverify"].set(new Array({
	            name: L("label_passphrase"),
	            type: "password",
	            target: field_passphrase,
	            over: 0
	        }));
	        var result = null;
	        if (true == (result = _requires["inputverify"].check())) {
	            if (false == isCreatingAccount) {
	                isCreatingAccount = true;
	                createAccount({
	                    passphrase: passphrase
	                });
	            }
	        } else {
	            var dialog = _requires["util"].createDialog({
	                message: result.message,
	                buttonNames: [ L("label_close") ]
	            });
	            dialog.addEventListener("click", function() {
	                result.target.focus();
	            });
	            dialog.show();
	        }
	    });
	    signin.top = 210;
	    signin.height = 50;
	    signin.width = "90%";
	    signin.visible = false;
	    signin.backgroundColor = "#E45C61";
	    var hasuser_button = _requires["util"].group({
	        hasuser: _requires["util"].makeLabel({
	            text: L("text_loginasuser"),
	            font: {
	                fontSize: 15
	            },
	            color: "#ffffff"
	        })
	    });
	    hasuser_button.height = 35;
	    hasuser_button.width = "90%";
	    hasuser_button.top = 120;
	    hasuser_button.backgroundColor = "#E45C61";
	    hasuser_button.addEventListener("touchend", function() {
	        newwallet.animate({
	            top: 0,
	            opacity: 0,
	            duration: 300
	        }, function() { newwallet.visible = false; });
	        signin.visible = true;
	        signin.animate({
	            top: 210,
	            opacity: 1,
	            duration: 300
	        });
	        hasuser_button.visible = false;
	        button_group_each.visible = false;
	        field_group.visible = true;
	        button_group.visible = true;
	        init_passphrase();
	        if( _requires["util"].getDisplayHeight() <= 480 ) policy.visible = false;
	    });
	    var field_passphrase = _requires["util"].makeTextField({
	        color: "#333300",
	        hintText: L("label_passphrase"),
	        border: "hidden",
	        font: {
	            fontSize: 15,
	            fontWeight: "normal"
	        },
	        height: 35,
	        width: 250,
	        top: 0,
	        paddingLeft: 5,
	        backgroundColor: "#ffffff",
	        passwordMask: true
	    });
	    var view_each_1 = Ti.UI.createView({
	        width: "100%",
	        height: Ti.UI.SIZE,
	        top: 0
	    });
	    var view_each_2 = Ti.UI.createView({
	        width: "100%",
	        height: Ti.UI.SIZE,
	        top: 0
	    });
	    var word_num = _requires["util"].makeLabel({
	        text: "",
	        font: {
	            fontSize: 20
	        },
	        color: "#ffffff",
	        top: 40
	    });
	    var field_each = [];
	    var each_num = -1;
	    for (var i = 0; 12 > i; i++) field_each[i] = _requires["util"].makeTextField({
	        color: "#ffffff",
	        border: "hidden",
	        font: {
	            fontSize: 15,
	            fontWeight: "normal"
	        },
	        height: 35,
	        width: 150,
	        top: 0,
	        paddingLeft: 5,
	        backgroundColor: "#E45C61",
	        passwordMask: true
	    });
	    var text_inputbyeach = _requires["util"].makeLabel({
	        text: L("text_inputbyeach"),
	        font: {
	            fontSize: 15
	        },
	        color: "#ffffff"
	    });
	    text_inputbyeach.addEventListener("touchend", function() {
	        signin.visible = button_group.visible = false;
	        word_num.visible = true;
	        button_group_each.visible = true;
	        move_next();
	    });
	    var is_moving = false;
	    var text_inputbyeach_next = _requires["util"].makeLabel({
	        text: L("text_inputbyeach_next"),
	        font: {
	            fontSize: 15
	        },
	        color: "#ffffff",
	        left: 10
	    });
	    text_inputbyeach_next.addEventListener("touchend", function() {
	        move_next();
	    });
	    var label_each_cancel = _requires["util"].makeLabel({
	        text: L("label_login_cancel"),
	        font: {
	            fontSize: 15
	        },
	        color: "#ffffff"
	    });
	    label_each_cancel.addEventListener("touchend", function() {
	        newwallet.visible = true;
	        newwallet.animate({
	            top: 50,
	            opacity: 1,
	            duration: 300
	        });
	        signin.animate({
	            top: 210,
	            opacity: 0,
	            duration: 300
	        }, function() { signin.visible = false; });
	        word_num.visible = false;
	        hasuser_button.visible = true;
	        field_group.visible = false;
	        button_group.visible = false;
	        button_group_each.visible = false;
	        init_passphrase();
	        if( _requires["util"].getDisplayHeight() <= 480 ) policy.visible = true;
	    });
	    var text_inputbyeach_prev = _requires["util"].makeLabel({
	        text: L("text_inputbyeach_prev"),
	        font: {
	            fontSize: 15
	        },
	        color: "#ffffff",
	        right: 10
	    });
	    text_inputbyeach_prev.addEventListener("touchend", function() {
	        move_prev();
	    });
	    var button_group_each = _requires["util"].group({
	        text_inputbyeach_prev: text_inputbyeach_prev,
	        separator1: _requires["util"].makeLabel({
	            text: " | ",
	            font: {
	                fontSize: 15
	            },
	            color: "#ffffff"
	        }),
	        label_back: label_each_cancel,
	        separator2: _requires["util"].makeLabel({
	            text: " | ",
	            font: {
	                fontSize: 15
	            },
	            color: "#ffffff"
	        }),
	        text_inputbyeach_next: text_inputbyeach_next
	    }, "horizontal");
	    button_group_each.top = 50;
	    button_group_each.visible = false;
	    var label_back = _requires["util"].makeLabel({
	        text: L("label_login_back"),
	        font: {
	            fontSize: 15
	        },
	        color: "#ffffff",
	        left: 10
	    });
	    label_back.addEventListener("touchend", function() {
	        newwallet.visible = true;
	        newwallet.animate({
	            top: 50,
	            opacity: 1,
	            duration: 300
	        });
	        signin.animate({
	            top: 210,
	            opacity: 0,
	            duration: 300
	        }, function() { signin.visible = false; });
	        hasuser_button.visible = true;
	        field_group.visible = false;
	        button_group.visible = false;
	        button_group_each.visible = false;
	        init_passphrase();
	        if( _requires["util"].getDisplayHeight() <= 480 ) policy.visible = true;
	    });
	    var button_group = _requires["util"].group({
	        text_inputbyeach: text_inputbyeach,
	        separator: _requires["util"].makeLabel({
	            text: ' | ',
	            font: {
	                fontSize: 15
	            },
	            color: '#ffffff',
	            left: 10
	        }),
	        label_back: label_back
	    }, "horizontal");
	    button_group.top = 50;
	    var field_group = _requires["util"].group({
	        view_each_1: view_each_1,
	        view_each_2: view_each_2
	    });
	    field_group.addView({
	        button_group: button_group,
	        button_group_each: button_group_each
	    });
	    field_group.width = "100%";
	    field_group.visible = false;
	    field_group.top = 120;
	    var signin_group = _requires["util"].group({
	        newwallet: newwallet,
	        hasuser_button: hasuser_button
	    });
	    signin_group.addView({
	        word_num: word_num,
	        field_group: field_group,
	        signin: signin
	    });
	    signin_group.top = 50;
	    var createAccount = function(params) {
	        _requires["cache"].load_rsa();
	        var passphrase = params.passphrase;
	        if ("demo" === passphrase) {
	            passphrase = Alloy.Globals.demopassphrase;
	            globals.DEMO = true;
	            password = "demo3728";
	        }
	        var loading = _requires["util"].showLoading(win.origin, {
	            width: Ti.UI.FILL,
	            height: Ti.UI.FILL,
	            style: "dark",
	            message: L("loading_createaccount")
	        });
	        try {
	            var address, pubkey;
	            passphrase = _requires["bitcore"].getpassphrase(passphrase);
	            _requires["bitcore"].init(passphrase);
	            address = _requires["bitcore"].getAddress();
	            pubkey = _requires["bitcore"].getPublicKey();
	            var b = require("crypt/bcrypt");
	            bcrypt = new b();
	            bcrypt.hashpw(password, bcrypt.gensalt(10), function(pass_hash) {
	                _requires['network'].connectPOSTv2({
	                    'method': 'users/create',
						'post': {
							'address': address,
							'provider_code': globals.api_key,
							'password': pass_hash // TODO remove on OEM feature
						},
	                    'callback': function(result) {
	                        _requires["cache"].data.id = result.id;
	                        _requires["cache"].data.address = address;
	                        _requires["cache"].data.passphrase = passphrase;
	                        _requires["cache"].data.pass_hash = pass_hash;
	                        _requires["cache"].data.password = password;
	                        _requires['cache'].data.current_fee = "halfHourFee";
	                        _requires["cache"].data.currncy = "ja" === L("language") ? "JPY" : "USD";
	                        _requires["cache"].save();
	                        globals.keepRegister = true;
	                        if( OS_IOS ) globals.createTab();
	                        
	                        globals.introscreens = require('/window/introscreens.js');
	                        globals.introscreens.createView();
	                        
	                        _windows['home'].run();
	                        win.close();
	                    },
	                    onError: function(message) {
	                        alert(message);
	                    },
	                    always: function() {
	                        isCreatingAccount = false;
	                        loading.removeSelf();
	                    }
	                });
	            });
	        } catch (e) {
	            loading.removeSelf();
	            isCreatingAccount = false;
	            _requires["util"].createDialog({
	                message: e.message,
	                buttonNames: [ L("label_close") ]
	            }).show();
	        }
	    };
	    
	    var max = 256;
	    var crypto = require("vendor/crypto");
	    getRandom = function(bits, seed) {
	        var randomBytes = crypto.randomBytes(bits / 8, seed), random = [];
	        for (var i = 0; bits / 32 > i; i++) random.push(randomBytes.readUInt32BE(4 * i));
	        return random;
	    };
	    
	    var firstAccel = -1;
	    var accelArray = [];
	    var val = 0, s = "";
	    var uid = Ti.Platform.id;
	    var d = new Date();
	    uid += d.getTime();
	    for (i = 0; i < uid.length; i++) s += uid[i].charCodeAt(0).toString(2);
	    canContinue = false;
	    Ti.Accelerometer.addEventListener("update", getAccelerometer);
	    
	    var whole_group = _requires["util"].group({
	        logo: logo
	    }, "vertical");
	    view.add(whole_group);
	    win.open();
	    var loading = _requires["util"].showLoading(view, {
	        color: "#ffffff",
	        message: L("label_loading")
	    });
	    loading.bottom = 30;
	    if (!rsa_info.already) {
	        var PASS = password;
	        var RSAkey = globals.Crypt_key = crypt.generateRSAKey(PASS, 1024);
	        rsa_info.already = true;
	        rsa_info.a = RSAkey.toString();
	        globals.requires["cache"].save_rsa(rsa_info);
	    }
	    var policy = _requires["util"].group({
	        text1: _requires["util"].makeLabel({
	            text: L("label_privecypolicy"),
	            font: {
	                fontSize: 12
	            },
	            color: "#ffffff",
	            top: 0
	        }),
	        text2: _requires["util"].makeLabel({
	            text: L("label_privecypolicy2"),
	            font: {
	                fontSize: 8
	            },
	            color: "#ffffff",
	            top: 15
	        })
	    });
	    policy.bottom = 15;
	    policy.addEventListener("touchend", function() {
	        _windows['weblink'].run({
	            'path': Alloy.CFG.dashboard_uri + 'terms'
	        });
	    });
	    canContinue = true;
	    setTimeout(function() {
	        if (true == gotCSRPNG) {
	            s += seedCSRPNG;
	        }
	        if (true == gotRANDORG) {
	            s += seedRandOrg;
	        }
	        loading.removeSelf();
	        view.add(policy);
	        whole_group.addView({
	            signin_group: signin_group
	        });
	    }, 3e3);
	}
	else{
		alert(L('text_access_deny') + '\nError:1001');
	}
	
	win.origin.addEventListener('android:back', function(){
		return true;
	});
	
	return win.origin;
};