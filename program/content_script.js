//
// ユーザーが指定したページにアクセスした際に動作するスクリプト
//
require("re_expand") // browserifyで展開
const crypto = require('crypto')

// alert('content_script')

var suggests = []
for(var i=0;i<100;i++){
    suggests[i] = {}
}
var suggestnames = [] // localStorageからデータ取得するときの名前の列
for(var i=0;i<100;i++){
    suggestnames[i] = `suggests${i}`
}

var descs = []

// 処理状況を表示するための細長ウィンドウ
var statusWindow = $('<div>')
    .css('position','absolute')
    .css('width','100%')
    .css('height','18pt')
    .css('top',`${$(window).height()-18}px`)
    .css('left','0pt')
    .css('background-color','#ffd')
    .appendTo($('body'))
    .hide()

function hash(str){ // 文字列を0〜100の値に
    const md5 = crypto.createHash('md5')
    return parseInt(md5.update(str).digest('hex').substring(0,4),16) % 100
}

function terminate_def(cmd){
    var h = hash(cmd)
    if(descs.length > 0){
	for(l of descs){
	    var m = l.match(/^\?\s+(.*)/)
	    expanded = m[1].replace(/[\[\]]/g,'').expand() // Helpfeel記法の正規表現を展開
	    for(s of expanded){
		suggests[h][s] = cmd
	    }
	}
	var v = {}
	v[`suggests${h}`] = suggests[h]
	chrome.storage.local.set(v, function(){ });
    }
    descs = []
}

// 単独ページの登録: ダイアログを開いてHelpfeel記法をユーザに入力させる
function registerOnePage(){
    var cmd = location.href
    var h = hash(cmd)
    
    var desc=window.prompt(`Help説明文を入力`,document.title);
    if(desc){
	var expanded = desc.expand() // Helpfeel記法の正規表現を展開
	for(var s of expanded){
	    statusWindow.text(s)
	    suggests[h][s] = cmd
	}
	var v = {}
	v[`suggests${h}`] = suggests[h]
	chrome.storage.local.set(v, function(){ });
    }
    else if(desc == ''){ // 空文字列入力
	alert(`ヘルプを消去します (${cmd})`)
	statusWindow.hide()
	// suggests[h][s] == cmd のものを削除
	var name = `suggests${h}`
	chrome.storage.local.get(name, function (value) {
	    suggests = value[name]
	    for (var x in suggests){
		if(suggests[x].match(cmd)){
		    delete suggests[x]
		}
	    }
	    var v = {}
	    v[name] = suggests
	    chrome.storage.local.set(v, function(){ });
	})
    }
    else { // desc == null (キャンセル)
	// 何もしない
    }
}


function process(lines,project,ask){
    //
    // Scrapboxページの内容を1行ずつ調べてHelpfeel記法を処理する
    //
    descs = [] // Helpfeel記法
    let title = lines[0].text // Scrapboxページのタイトル
    let found = false
    for(var entry of lines){
	var line = entry.text
	if(line.match(/^\?\s/)){ // ? ではじまるHelpfeel記法
	    desc = line.replace(/^\?\s+/,'')
	    statusWindow.text(decodeURIComponent(`${title} - ${desc}`))
	    descs.push(line)
	    found = true
	}
	else if(line.match(/^\%\s/)){ // % ではじまるコマンド指定
	    if(descs.length == 0){
		alert(`Helpfeel記法が定義されていません - ${title} / ${line}`)
	    }
	    else {
		m = line.match(/^\%\s+(echo|open)\s+(.*)/)
		if(m){
		    terminate_def(m[2])
		}
		descs = []
	    }
	}
	else {
	    terminate_def(`https://scrapbox.io/${project}/${title}`)
	}
    }
    terminate_def(`https://scrapbox.io/${project}/${title}`)

    if(!found && ask){
	registerOnePage()
    }
}

//
// コールバックでbackground.jsからの値を受け取る
//
chrome.runtime.onMessage.addListener(message => {
    alert('getmessage')
    /*
    if (message.type == 'open') {
	window.open("http://pitecan.com")
	return;
    }
    */
    
    if (message.type !== 'CLICK_POPUP') {
	return;
    }

    statusWindow.text('')
    statusWindow.show()

    chrome.storage.local.get(suggestnames, function (value) {
	for(var i=0;i<100;i++){
	    if(value[`suggests${i}`]){
		suggests[i] = value[`suggests${i}`]
	    }
	}
	
	ms = location.href.match(/scrapbox\.io\/([a-zA-Z0-9\-]+)(\/(.*))?$/)
	mg = location.href.match(/gyazo\.com\/([0-9a-f]{32})/i)
	if(ms && ms[1]){
	    var project = ms[1]
	    var title = ms[3]
	    if(!title){ // ページリスト
		fetch(`https://scrapbox.io/api/pages/${project}?limit=1000`)
		    .then(function(response) {
			return response.json();
		    })
		    .then(function(json) {
			for(var page of json.pages){
			    var title = page.title
			    console.log(title)
			    fetch(`https://scrapbox.io/api/pages/${project}/${title}`)
				.then(function(response) {
				    return response.json()
				})
				.then(function(json){
				    process(json.lines,project,false)
				})
  			}
		    });
	    }
	    else { // 単独ページ
		fetch(`https://scrapbox.io/api/pages/${project}/${title}`)
		    .then(function(response) {
			return response.json()
		    })
		    .then(function(json){
			process(json.lines,project,true)
		    })
	    }
	}
	else if(mg && mg[1]){ // GyazoページにHelpfeel記述があれば登録
	    gyazoid = mg[1]
	    // lines = $('.image-desc-display').text().split(/\n/)
	    if($('.image-desc-display')[0]){
		lines = $('.image-desc-display')[0].innerHTML.split('<br>') // これは苦しい!
		descs = []
		for(var line of lines){
		    if(line.match(/^\?\s/)){ // ? ではじまるHelpfeel記法
			desc = line.replace(/^\?\s+/,'')
			descs.push(line)
			statusWindow.text(decodeURIComponent(`${desc}`))
		    }
		}
		if(descs.length > 0){
		    terminate_def(`https://gyazo.com/${gyazoid}`)
		}
		else {
		    registerOnePage()
		}
	    }
	    else {
		registerOnePage()
	    }
		
	}
	else {
	    registerOnePage()
	}

	setTimeout(function(){ statusWindow.hide() }, 10000)
    })
})
