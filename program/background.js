//
//  https://developer.chrome.com/extensions/omnibox のサンプルをもとにしている
//

//
// https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/omnibox
// manifest.jsonに "omnibox": { "keyword" : "/" } というエントリを書いておくと、
// '/' と' 'を押したとき onInputChanged でキー入力を取得できるようになる
//

'use strict';

const Asearch = require("asearch") // browserifyで展開

var suggestnames = []
for(var i=0;i<100;i++){
    suggestnames[i] = `suggests${i}`
}

//
// browserActionボタンを押したときcontent_script.jsにメッセージを送る
//
//chrome.browserAction.onClicked.addListener(function(tab) { // これはV2のやりかた
chrome.action.onClicked.addListener(function(tab) { // これがV3
    chrome.tabs.sendMessage(tab.id, { type: 'CLICK_POPUP', message: "message" })
})

//
// ユーザがomniboxで何か入力したとき呼ばれるもの
//
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    var data = []
    chrome.storage.local.get(suggestnames, function (value) {
	var as = new Asearch(` ${text.toLowerCase()} `)
	for(var i=0;i<100;i++){
	    var suggests = value[`suggests${i}`]
	    if(suggests){
		for(var desc in suggests){
		    if(as.match(desc.toLowerCase(),0)){
			data.push({'description': desc, 'content': suggests[desc]})
		    }
		}
	    }
	}

	suggest(data.slice(0,10)) // 候補を表示 数を制限しないと候補が出ないようだ
    })
    
    // よく使うものはトップに出るようにするとか
    // data.unshift({content: "aaaaa", description: "bbbbb"})
    // 学習させておくのは良いかも
})

//
// ユーザがメニューを選択したとき呼ばれるもの
//
chrome.omnibox.onInputEntered.addListener(function(text) {
    if(text.match(/^http/)){
	//openWindow(text) // location.href = は動かない
	//location.href = text;
	//chrome.tabs.sendMessage(0, { type: 'OPEN', message: "message" })
	//clients.openWindow(text);
	//chrome.runtime.sendMessage({ type: 'open' })
	//postMessage(text);
	chrome.windows.create({ "url": text })
    }
    else {
	fetch('https://goquick.org') // GoQuick.orgユーザはGoQuick.orgを利用
	    .then(response => response.text())
	    .then(data => {
		if(data.match("GoQuick Login")){
		    chrome.windows.create({"url": `https://google.com/search?q=${text}`})
		}
		else {
		    chrome.windows.create({"url": 'http://goquick.org/' + text})
		}
	    })
    }
})
