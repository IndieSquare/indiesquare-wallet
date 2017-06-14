Alloy.Globals = {
	copyright: '',
	
	datas: null,
	windows: null,
	requires: null,
	lastUrl: null,
	
	webview_id: '',
	webview_pass: '',
	
	api_key: '', // You can get this key on IndieBoard: see https://developer.indiesquare.me
	demopassphrase: '',
	
	SAVE_FILE_PATH: Ti.Filesystem.applicationDataDirectory + 'a.json',
	CRYPT_FILE_PATH: Ti.Filesystem.applicationDataDirectory + 'b.json',
	
	network: 'livenet'
};