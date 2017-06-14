module.exports = (function() {

var _requires = globals.requires;

function receive(){
	
}

var view_receive = Ti.UI.createView({ backgroundColor:'#FFFFFF', width: Ti.UI.FILL, height: Ti.UI.FILL });
var view_box = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: Ti.UI.FILL });         
var top_bar_receive = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 60 });
top_bar_receive.top = 0;

function removeAllChildren(viewObject){
	//copy array of child object references because view's "children" property is live collection of child object references
    var children = viewObject.children.slice(0);
	for (var i = 0; i < children.length; ++i) {
        viewObject.remove(children[i]);
    }
}

receive.prototype.getView = function(){
	return view_receive;
};

receive.prototype.setImageQR = function(){
	removeAllChildren(view_box);
	
	home_title_center = _requires['util'].makeLabel({
		text:L('label_tab_receive'),
		color:"white",
		font:{ fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 28, center: 0
	});
	top_bar_receive.add( home_title_center );
	
	if(OS_ANDROID){
		home_title_center.top = 20;
	}
	
	var addressQR = _requires['cache'].data.address;
	
	var qrcode = require('require/qrcode').QRCode({
	    typeNumber: 4,
	    errorCorrectLevel: 'M'
	});
	var qrcodeView = qrcode.createQRCodeView({
	    width: 250,
	    height: 250,
	    margin: 15,
	    text: addressQR
	});
	var text_title_rec = _requires['util'].group({
		title: _requires['util'].makeLabel({
			text: L('label_bitcoinaddress'),
			top: 0,
			font:{ fontSize: 12 }
		}),
		address: _requires['util'].makeLabel({
			text: addressQR,
			top: 10,
			font:{ fontSize: 13 }
		}),
		view_qr: qrcodeView,
		taptocopy: _requires['util'].makeLabel({
			text:L('label_qrcopy'),
			textAlign: 'left',
			font:{fontFamily: 'HelveticaNeue-Light', fontSize:15, fontWeight:'light'},
			top: 0
		})
	}, 'vertical');
	
	text_title_rec.view_qr.addEventListener('touchend', function(){
		Ti.UI.Clipboard.setText( addressQR );
		_requires['util'].createDialog({
			message:L('text_copied_message'),
			buttonNames: [L('label_close')]
		}).show();
	});
	
	view_box.add(text_title_rec);
};

view_receive.add(view_box);
view_receive.add(top_bar_receive);

return new receive();

}());