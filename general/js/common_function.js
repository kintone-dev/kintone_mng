//スペース＆アプリ情報
var sysid = {
	// Project Management
	PM: {
		space_id: 11,
		app_id: {
			item: 165,
			project: 133,
			shipment: 113,
			sNum: 115,
			unit: 81,
			device: 77,
			installation: 76,
			organization: 75
		}
	},
	// Inventory
	INV: {
		space_id: 19,
		app_id: {
			unit: 156,
			device: 155,
			report: 154,
			shipment: 153,
			sNum: 149,
			account_tc: 141
		}
	},
	// Support
	SUP: {
		space_id: 13,
		app: {
			item: 111,
			inquiry: 95,
			onsite: 108,
			shipment: 110,
			escalation: 94,
			accident: 92
		}
	},
	// ATLAS Smart Security
	ASS: {
		space: 14,
		app: {
			member: 139,
			cancellation: 135,
			item: 109,
			shipment: 104
		}
	},
	DEV: {
		space: 22,
		app: {
			defective: 161,
			account_tc: 160,
			sNum: 159
		}
	}
}
/* ボタン、タブメニュー */
// スペースフィールドにボタンを設置
function setBtn(btnID, btnValue) {
	var contsBtn = document.createElement('button'); //ボタン作成
	contsBtn.id = btnID; //ボタンにID追加
	contsBtn.classList.add('jsbtn_conts'); //ボタンにCSS追加
	contsBtn.innerText = btnValue; //ボタンの表示名
	contsBtn.addEventListener("mouseover", function (event) {
		contsBtn.classList.add('jsbtn_over');
	}, false); //マウスを乗せた時の処理
	contsBtn.addEventListener("mouseleave", function (event) {
		contsBtn.classList.remove('jsbtn_over');
	}, false); //マウスを離した時の処理
	kintone.app.record.getSpaceElement(btnID).appendChild(contsBtn); //指定スペースフィールドにボタン設置
	return contsBtn;
}
// 詳細画面のヘッダースペースにボタン設置
function setBtn_header(btnID, btnValue) {
	var headerBtn = document.createElement('button');
	headerBtn.id = btnID;
	headerBtn.classList.add('jsbtn_header');
	headerBtn.innerText = btnValue;
	headerBtn.addEventListener("mouseover", function (event) {
		headerBtn.classList.add('jsbtn_over');
	}, false);
	headerBtn.addEventListener("mouseleave", function (event) {
		headerBtn.classList.remove('jsbtn_over');
	}, false);
	kintone.app.record.getHeaderMenuSpaceElement().appendChild(headerBtn);
	return headerBtn;
}
// 一覧画面のヘッダースペースにボタン設置
function setBtn_index(btnID, btnValue) {
	var indexBtn = document.createElement('button');
	indexBtn.id = btnID;
	indexBtn.classList.add('jsbtn_header');
	indexBtn.innerText = btnValue;
	indexBtn.addEventListener("mouseover", function (event) {
		indexBtn.classList.add('jsbtn_over');
	}, false);
	indexBtn.addEventListener("mouseleave", function (event) {
		indexBtn.classList.remove('jsbtn_over');
	}, false);
	kintone.app.getHeaderMenuSpaceElement().appendChild(indexBtn);
	return indexBtn;
}

// tabメニューをULで作成
function tabMenu(tabID, tabList) {
	var tMenu = document.createElement('ul'); //ul要素作成
	tMenu.id = tabID; //リストにID追加
	tMenu.classList.add(tabID); //リストにCSS追加
	tMenu.classList.add('tabMenu'); //リストにCSS追加
	for (var tl in tabList) { //繰り返しli要素とその中身を作成
		var tList = document.createElement('li'); //li要素作成
		var aLink = document.createElement('a'); //a要素作成
		aLink.setAttribute('href', '#' + tabList[tl]); //a要素に詳細を追加
		aLink.innerText = tabList[tl]; //a要素の表示名
		tList.appendChild(aLink); //li要素にa要素追加
		tMenu.appendChild(tList); //ul要素にli要素追加
	}
	kintone.app.record.getSpaceElement(tabID).appendChild(tMenu); //指定スペースフィールドにtabメニュー追加
	$('.' + tabID + ' li:first-of-type').addClass("active"); //デフォルトで最初のli要素をアクティブ状態にする
	$('.' + tabID + ' a').on('click', function () { //他のメニュークリック時アクション
		var parentElm = $(this).parent(); //クリックされた要素を取得
		$('.' + tabID + ' li').removeClass("active"); //li要素のCSS設定を削除
		$(parentElm).addClass("active"); //クリックした要素に改めてCSS設定を付与
		return false;
	});
}
/* 使い方
*function tabSwitch(onSelect){ //タブメニュー選択肢
*	switch(onSelect){
*		case '#menu1'
*	}
*}tabSwitch('#お問い合わせ詳細'); //tab初期表示設定

*tabMenu('tabID', ['menu1','menu2']); //タブメニュー作成
*$('.tabMenu a').on('click', function(){ //タブメニュークリック時アクション
*	var idName = $(this).attr('href'); //タブ内のリンク名を取得  
*	tabSwitch(idName); //tabをクリックした時の表示設定
*	return false;
*});
*/


/* 表示関連 */
//フィールド表示設定
function setFieldShown(fieldCode, isShown) {
	kintone.app.record.setFieldShown(fieldCode, isShown);
	kintone.mobile.app.record.setFieldShown(Element, isShown);
}

function setSpaceShown(Element, option, parm) {
	var elTag = kintone.app.record.getSpaceElement(Element); //スペースフィールドの要素を取得
	if (option == 'line') elTag.parentNode.parentNode.style.display = parm; //上記で取得した要素の二つ前の要素のdisplayオプション設定
	else if (option == 'individual') elTag.parentNode.style.display = parm;
}

/* ツール */
//sessionStorageにデータ格納
function createNewREC(tarAPP_id, copy_fCode, copy_value) {
	if (Array.isArray(copy_fCode)) { //配列の場合のアクション
		for (var fi in copy_fCode) { //ループさせデータ格納
			sessionStorage.removeItem(copy_fCode[fi]); //同じ名称のSessionStorageを削除
			sessionStorage.setItem(copy_fCode[fi], copy_value[fi]); //値をSessionStorageに格納する
		}
	} else { //配列以外の場合のアクション
		sessionStorage.removeItem(copy_fCode); //同じ名称のSessionStorageを削除
		sessionStorage.setItem(copy_fCode, copy_value); //値をSessionStorageに格納する
	}
	window.open('https://accel-lab.cybozu.com/k/' + tarAPP_id + '/edit', '_blank'); //該当アプリの新規レコード作成画面を開く

	if (Array.isArray(copy_fCode)) { //配列の場合のアクション
		for (var fr in copy_fCode) {
			sessionStorage.removeItem(copy_fCode[fr]);
		} //同じ名称のSessionStorageを削除
	} else {
		sessionStorage.removeItem(copy_fCode); //同じ名称のSessionStorageを削除
	}
}

// パスワードジェネレーター
var pw_generator = function (len) {
	var letters = 'abcdefghjklmnpqrstuvwxyz'; //パスワードに使用する文字列群
	var numbers = '0123456789'; //パスワードに使用する数字群
	var symbols = '~!@#$%^&*()_+={}[:;<>,.?'; //パスワードに使用する記号群
	var string = letters + letters.toUpperCase() + numbers + symbols; //小文字を大文字に変換

	var pw_req = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[~!@#$%^&*()_+={}[:;<>,.?])[a-zA-Z0-9~!@#$%^&*()_+={}[:;<>,.?]+$/); //パスワード条件

	var pw;
	while (true) { //条件を果たすまでパスワードを繰り返し作成
		pw = ''; //パスワードをクリア
		for (var i = 0; i < len; i++) {
			pw += string.charAt(Math.floor(Math.random() * string.length));
		} //パスワード生成
		var ck_pw_req = pw_req.exec(pw); //生成したパスワードが条件を満たすか確認
		if (ck_pw_req) break; //生成したパスワードが条件を満たす場合のみ繰り返し中止
	}
	return pw;
};

// Auto Numbering 自動採番
function autoNum(header, fieldCode){
	$.ajax({type: 'GET'}).done(function(data, status, xhr) {
		var serverDate = new Date(xhr.getResponseHeader('Date')).getTime(); //サーバー時刻を代入
		var utcNum=Math.floor(serverDate/5000); //5秒の幅を持って、切り上げる
		var eRecord = kintone.app.record.get(); //レコード値を取得
		eRecord.record[fieldCode].value=header+utcNum; //フィールドに値をセット
		kintone.app.record.set(eRecord); //変更内容を反映
	});
}

// 故障品管理とシリアル管理連携
function defective(defectiveNum, repairedNum){

	//シリアル管理に挿入する情報の作成
	var defInfo = {
		'app': sysid.DEV.app.sNum,
		'records': []
	};

	var defRecord = {
		'updateKey': {
			'field': 'sNum',
			'value': defectiveNum
		},
		'record': {
			'sState': {
				'value': '故障品'
			},
			'sDstate': {
				'value': '検証待ち'
			}
		}
	};

	defInfo.records.push(defRecord);

	console.log(defInfo);

	//シリアル管理に状態と状況を挿入
	var putResult = kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', defInfo);

	putResult.then(function (resp) {
		console.log("put success");
	}).catch(function (error) {
		console.log("put error");
		console.error(error);
	});

	//故障品のデータ取得
	var queryBody = {
		'app': sysid.DEV.app.sNum,
		'query': 'sNum="' + defectiveNum + '"',
	};
	var getResult = kintone.api(kintone.api.url('/k/v1/records', true), 'GET', queryBody);

	getResult.then(function (resp) {
		var respRecords = resp.records;

		delete respRecords[0].$id;
		delete respRecords[0].$revision;
		delete respRecords[0].sNum;
		delete respRecords[0].sDstate;
		delete respRecords[0].sState;
		delete respRecords[0].レコード番号;
		delete respRecords[0].作成日時;
		delete respRecords[0].作成者;
		delete respRecords[0].ステータス;
		delete respRecords[0].更新者;
		delete respRecords[0].更新日時;

		var repInfo = {
			'app': sysid.DEV.app.sNum,
			'records': []
		};
	
		var repRecord = {
			'updateKey': {
				'field': 'sNum',
				'value': repairedNum
			},
			'record': {}
		};

		repRecord.record = respRecords[0];
		repInfo.records.push(repRecord);

		console.log(repInfo);

		var putRepResult = kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', repInfo);

		putRepResult.then(function (resp) {
			console.log("defective date put success");
		}).catch(function (error) {
			console.log("put error");
			console.error(error);
		});	
		
	}).catch(function (error) {
		console.log(error);
		console.log(error.message);
	});
}

// カーテンレール部品割り出し
var railConf=function (spec){
  var truckLength=spec.rLength-140;
  var mcode='KRT-DY'+spec.rLength+spec.rType.toUpperCase();
  var railDetail=[];
  var truck=['カーテンレール（DY）2000', Math.ceil(truckLength/2000)*spec.shipNum];
  var ConnectingKit=['Connecting Kit', Math.ceil(truckLength/2000-1)*spec.shipNum];
  var RubberBelt=['Rubber Belt', Math.ceil((truckLength*2+240)/1000)*spec.shipNum];
  var Carriers=['Carriers', Math.round(truckLength/125)];
  if (spec.rType.match(/[wW]/)) Carriers[1]=Math.ceil(Carriers[1]/2)*2*spec.shipNum;
  else Carriers[1]=Carriers[1]*spec.shipNum;
  var CeilingBracket=['',Math.round(spec.rLength/500+1)*spec.shipNum];
  if (spec.rMethod=='天井') CeilingBracket[0]='Ceiling Bracket(D)';
  else if (spec.rMethod.match(/壁付/)) CeilingBracket[0]='Ceiling Bracket';
  var MasterCarrier=['Master Carrier', 1*spec.shipNum];
  if (ConnectingKit[1]>0) MasterCarrier[0]='Master Carrier(G)';
  var BeltClip=['Belt Clip', 2*spec.shipNum];
  var EndHook=['End Hook', 1*spec.shipNum];
  if (spec.rType.match(/[wW]/)){
    MasterCarrier[1]=MasterCarrier[1]*2;
    BeltClip[1]=BeltClip[1]*2;
    EndHook[1]=EndHook[1]*2;
  }
  
  railDetail.push({mname:truck[0], shipnum:truck[1]});
  if(ConnectingKit[1]>0) railDetail.push({mname:ConnectingKit[0], shipnum:ConnectingKit[1]});
  railDetail.push({mname:RubberBelt[0], shipnum:RubberBelt[1]});
  railDetail.push({mname:Carriers[0], shipnum:Carriers[1]});
  railDetail.push({mname:CeilingBracket[0], shipnum:CeilingBracket[1]});
  if(spec.rMethod.match(/壁付/)){
    if(spec.rMethod.match(/壁付[sS]/)) railDetail.push({mname:'L字金具', shipnum:CeilingBracket[1]});
    else if(spec.rMethod.match(/壁付[wW]/)) railDetail.push({mname:'L字金具W', shipnum:CeilingBracket[1]});
  }
  railDetail.push({mname:MasterCarrier[0], shipnum:MasterCarrier[1]});
  railDetail.push({mname:BeltClip[0], shipnum:BeltClip[1]});
  railDetail.push({mname:EndHook[0], shipnum:EndHook[1]});
  railDetail.push({mname:'End Box', shipnum:2*spec.shipNum});
  railDetail.push({mname:'Bumper', shipnum:2*spec.shipNum})
  var railComp=[];
  for (var i in railDetail){
    railComp.push({
      value:{
        mCode:{value:'', type:'SINGLE_LINE_TEXT'},
        mType:{value:'', type:'SINGLE_LINE_TEXT'},
        mVendor:{value:'', type:'SINGLE_LINE_TEXT'},
        mName:{value:railDetail[i].mname, type:'SINGLE_LINE_TEXT'},
        shipNum:{value:railDetail[i].shipnum, type: 'NUMBER'},
        sNum:{value:'', type:'MULTI_LINE_TEXT'},
        shipMemo:{value:'', type:'SINGLE_LINE_TEXT'}
      }
    });
  }
  railComp[0].value.shipMemo.value='truckLength: '+truckLength;
  return railComp;
};

/* その他 */
// 全レコード呼び出し
function api_getRecords(appID) {
	return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
		'app': appID,
		'query': null
	});
}