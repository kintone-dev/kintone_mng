function set_sysid(env) {
	//スペース＆アプリ情報
	switch (env) {
		default:
			var sysid = {
				// Project Management
				PM: {
					space_id: 11,
					app_id: {
						item: 165,
						project: 133,
						installation: 76,
						organization: 75
					}
				},
				// Inventory Management
				INV: {
					space_id: 19,
					app_id: {
						unit: 156,
						device: 155,
						report: 179,
						shipment: 178,
						purchasing: 170
					}
				},
				// Device Management
				DEV: {
					space: 22,
					app_id: {
						swap: 161,
						account_tc: 160,
						sNum: 215,
						reuse: 174
					}
				},
				// Support
				SUP: {
					space_id: 13,
					app_id: {
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
					app_id: {
						member: 139,
						cancellation: 135,
						item: 109,
						shipment: 104
					}
				}
			}
			break;
		case 'develop_sog':
			var sysid = {
				// Project Management (DEV)
				PM: {
					space_id: 26,
					app_id: {
						item: 213,
						project: 217,
						installation: 208,
						organization: 209
					}
				},
				// Inventory Management (DEV)
				INV: {
					space_id: 26,
					app_id: {
						unit: 210,
						device: 206,
						report: 205,
						shipment: 207,
						purchasing: 212
					}
				},
				// Device Management (DEV)
				DEV: {
					space: 26,
					app_id: {
						swap: 214,
						account_tc: 216,
						sNum: 215,
						reuse: 211
					}
				},
				// Support (DEV)
				SUP: {
					space_id: 31,
					app_id: {
						item: 226,
						inquiry: 227,
						onsite: 0,
						shipment: 0,
						escalation: 0,
						accident: 0
					}
				},
				// ATLAS Smart Security (DEV)
				ASS: {
					space: 30,
					app_id: {
						member: 222,
						cancellation: 225,
						item: 223,
						shipment: 224
					}
				}
			}
			break;
	}
	return sysid;
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
/**使い方
 * var newORG=setBtn('btn_newORG','新規組織');
 * newORG.onclick=function(){
 * 	createNewREC(sysID.DIPM.app.org, 'prj_aNum', prj_aNumValue); // 実行内容例
 * }
 */
// プルダウンメニュー
function setSelect_header(selectID, selectValue) {
	var headerSelect = document.createElement('select');
	headerSelect.id = selectID;
	headerSelect.classList.add('jsselect_header');
	for (var sl in selectValue) {
		var sOption = document.createElement('option');
		sOption.innerText = selectValue[sl];
		headerSelect.appendChild(sOption);
	}
	kintone.app.record.getHeaderMenuSpaceElement().appendChild(headerSelect);
	return headerSelect;
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
	// window.open('https://accel-lab.cybozu.com/k/' + tarAPP_id + '/edit', '_blank'); //該当アプリの新規レコード作成画面を開く
	window.open('https://accel-lab.cybozu.com/k/' + tarAPP_id + '/edit', Math.random() + '-newWindow', 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=1000,height=600,left=300,top=200'); //該当アプリの新規レコード作成画面を開く

	if (Array.isArray(copy_fCode)) { //配列の場合のアクション
		for (var fr in copy_fCode) {
			sessionStorage.removeItem(copy_fCode[fr]);
		} //同じ名称のSessionStorageを削除
	} else {
		sessionStorage.removeItem(copy_fCode); //同じ名称のSessionStorageを削除
	}
}

// シリアル番号取得
var sNumRecords = function (Value, fType) {
	var sNs = [];
	switch (fType) {
		case 'table':
			for (var ti in Value) {
				var sn = Value[ti].value.sNum.value; //シリアル番号データを取り出す
				var snArray = sn.split(/\r\n|\n/); //シリアル番号を改行を持って、区切り、配列にする
				var sns = snArray.filter(Boolean); //配列順番を反転
				for (var sni in sns) {
					sNs.push(sns[sni]);
				}
			}
			break;
		case 'text':
			//var sn=Value[ti].value.sNum.value; //シリアル番号データを取り出す
			var snArray = Value.split(/\r\n|\n/); //シリアル番号を改行を持って、区切り、配列にする
			sNs = snArray.filter(Boolean);
			break;
	}
	return sNs;
};

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
function autoNum(header, fieldCode) {
	$.ajax({
		type: 'GET'
	}).done(function (data, status, xhr) {
		var serverDate = new Date(xhr.getResponseHeader('Date')).getTime(); //サーバー時刻を代入
		var utcNum = Math.floor(serverDate / 5000); //5秒の幅を持って、切り上げる
		var eRecord = kintone.app.record.get(); //レコード値を取得
		eRecord.record[fieldCode].value = header + utcNum; //フィールドに値をセット
		kintone.app.record.set(eRecord); //変更内容を反映
	});
}

// カーテンレール部品割り出し
var railConf = function (spec) {
	var truckLength = spec.rLength - 140;
	var mcode = 'KRT-DY' + spec.rLength + spec.rType.toUpperCase();
	var railDetail = [];
	var truck = ['カーテンレール（DY）2000', Math.ceil(truckLength / 2000) * spec.shipNum];
	var ConnectingKit = ['Connecting Kit', Math.ceil(truckLength / 2000 - 1) * spec.shipNum];
	var RubberBelt = ['ラバーベルト', Math.ceil((truckLength * 2 + 240) / 1000) * spec.shipNum];
	var Carriers = ['ランナー', Math.round(truckLength / 125)];
	if (spec.rType.match(/[wW]/)) Carriers[1] = Math.ceil(Carriers[1] / 2) * 2 * spec.shipNum;
	else Carriers[1] = Carriers[1] * spec.shipNum;
	var CeilingBracket = ['', Math.round(spec.rLength / 500 + 1) * spec.shipNum];
	if (spec.rMethod == '天井') CeilingBracket[0] = '取付金具(D)';
	else if (spec.rMethod.match(/壁付/)) CeilingBracket[0] = '取付金具';
	var MasterCarrier = ['マスターキャリアー', 1 * spec.shipNum];
	if (ConnectingKit[1] > 0) MasterCarrier[0] = 'マスターキャリアー連結レール用(G)';
	var BeltClip = ['ベルトアタッチメント', 2 * spec.shipNum];
	var EndHook = ['エンドフック', 1 * spec.shipNum];
	if (spec.rType.match(/[wW]/)) {
		MasterCarrier[1] = MasterCarrier[1] * 2;
		BeltClip[1] = BeltClip[1] * 2;
		EndHook[1] = EndHook[1] * 2;
	}

	railDetail.push({
		mname: truck[0],
		shipnum: truck[1]
	});
	if (ConnectingKit[1] > 0) railDetail.push({
		mname: ConnectingKit[0],
		shipnum: ConnectingKit[1]
	});
	railDetail.push({
		mname: RubberBelt[0],
		shipnum: RubberBelt[1]
	});
	railDetail.push({
		mname: Carriers[0],
		shipnum: Carriers[1]
	});
	railDetail.push({
		mname: CeilingBracket[0],
		shipnum: CeilingBracket[1]
	});
	if (spec.rMethod.match(/壁付/)) {
		if (spec.rMethod.match(/壁付[sS]/)) railDetail.push({
			mname: 'L字金具',
			shipnum: CeilingBracket[1]
		});
		else if (spec.rMethod.match(/壁付[wW]/)) railDetail.push({
			mname: 'L字金具W',
			shipnum: CeilingBracket[1]
		});
	}
	railDetail.push({
		mname: MasterCarrier[0],
		shipnum: MasterCarrier[1]
	});
	railDetail.push({
		mname: BeltClip[0],
		shipnum: BeltClip[1]
	});
	railDetail.push({
		mname: EndHook[0],
		shipnum: EndHook[1]
	});
	railDetail.push({
		mname: 'エンドボックス',
		shipnum: 2 * spec.shipNum
	});
	railDetail.push({
		mname: 'バンパー＋クッション',
		shipnum: 2 * spec.shipNum
	})
	var railComp = [];
	for (var i in railDetail) {
		railComp.push({
			value: {
				mVendor: {
					value: '',
					type: 'SINGLE_LINE_TEXT'
				},
				mType: {
					value: '',
					type: 'SINGLE_LINE_TEXT'
				},
				mCode: {
					value: '',
					type: 'SINGLE_LINE_TEXT'
				},
				mName: {
					value: '',
					type: 'SINGLE_LINE_TEXT'
				},
				mNickname: {
					value: railDetail[i].mname,
					type: 'SINGLE_LINE_TEXT'
				},
				shipNum: {
					value: railDetail[i].shipnum,
					type: 'NUMBER'
				},
				sNum: {
					value: '',
					type: 'MULTI_LINE_TEXT'
				},
				shipRemarks: {
					value: '',
					type: 'SINGLE_LINE_TEXT'
				}
			}
		});
	}
	railComp[0].value.shipRemarks.value = 'truckLength: ' + truckLength;
	return railComp;
};

// 検索エンジン

/* その他 */
function orgRound(value, base) {
	return Math.round(value * base) / base;
}

function orgCeil(value, base) {
	return Math.ceil(value * base) / base;
}

function orgFloor(value, base) {
	return Math.floor(value * base) / base;
}
// 全レコード呼び出し
function api_getRecords(appID) {
	return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
		'app': appID,
		'query': null
	});
}

// 100件以上のレコード登録
const postRecords = async (sendApp, records) => {
	const POST_RECORDS = records;
	while (POST_RECORDS.length) {
		var postBody = {
			'app': sendApp,
			'records': POST_RECORDS.slice(0, 100),
		}
		await kintone.api(kintone.api.url('/k/v1/records', true), "POST", postBody)
			.then(function (resp) {
				console.log(postBody);
			}).catch(function (error) {
				console.log(error);
			});
		POST_RECORDS.splice(0, 100);
	}
}

// 100件以上のレコード更新
const putRecords = async (sendApp, records) => {
	const PUT_RECORDS = records;
	while (PUT_RECORDS.length) {
		var putBody = {
			'app': sendApp,
			'records': PUT_RECORDS.slice(0, 100),
		}
		await kintone.api(kintone.api.url('/k/v1/records', true), "PUT", putBody)
			.then(function (resp) {
				console.log(putBody);
			}).catch(function (error) {
				console.log(error);
			});
		PUT_RECORDS.splice(0, 100);
	}
}

// 100件以上のレコード削除
const deleteRecords = async (sendApp, records) => {
	const DELETE_RECORDS = records;
	while (DELETE_RECORDS.length) {
		var deleteBody = {
			'app': sendApp,
			'ids': DELETE_RECORDS.slice(0, 100),
		}
		await kintone.api(kintone.api.url('/k/v1/records', true), "DELETE", deleteBody)
			.then(function (resp) {
				console.log(deleteBody);
			}).catch(function (error) {
				console.log(error);
			});
		DELETE_RECORDS.splice(0, 100);
	}
}

/**
 * 指定月のレポートが締切の場合エラー表示
 * @param {*} reportDate 判別したいレポートの月 例)202109
 * @returns
 */
async function checkEoMReport(reportDate) {
	var getReportBody = {
		'app': sysid.INV.app_id.report,
		'query': 'sys_invoiceDate = "' + reportDate + '"'
	};
	var reportData = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
		.then(function (resp) {
			return resp;
		}).catch(function (error) {
			console.log(error);
			return error;
		});
	if (reportData.length != 0) {
		for (var i in reportData.records[0].EoMcheck.value) {
			if (reportData.records[0].EoMcheck.value[i] == '締切') {
				return false;
			}
		}
	}
	return reportData;
};

/* 商品管理、拠点管理の在庫処理 */

/**
 * ストック情報をまとめたjson作成
 * @param {*} event kintone event
 * @param {*} appId 関数を使ったアプリのID
 * @returns json
 */
function createStockJson(event, appId) {
	var stockData = {
		'arr': [],
		'ship': []
	};

	if (appId == sysid.INV.app_id.shipment) { //入出荷管理の場合
		stockData.appId = appId;
		var sendDate = pageRecod.sendDate.value;
		sendDate = sendDate.replace(/-/g, '');
		sendDate = sendDate.slice(0, -2);
		stockData.date = sendDate;
		var arrivalShipType = ['移動-販売', '移動-サブスク', '販売', 'サブスク', '移動-拠点間', '移動-ベンダー'];
		for (var i in event.record.deviceList.value) {
			// 出荷情報を作成
			var stockShipBody = {
				'arrOrShip': 'ship',
				'devCode': event.record.deviceList.value[i].value.mCode.value,
				'uniCode': event.record.sys_shipmentCode.value,
				'stockNum': event.record.deviceList.value[i].value.shipNum.value
			};
			stockData.ship.push(stockShipBody);
			// 出荷区分がarrivalShipTypeに含まれる場合のみ入荷情報を作成
			if (arrivalShipType.includes(event.record.shipType.value)) {
				var stockArrBody = {
					'arrOrShip': 'arr',
					'devCode': event.record.deviceList.value[i].value.mCode.value,
					'uniCode': event.record.sys_arrivalCode.value,
					'stockNum': event.record.deviceList.value[i].value.shipNum.value
				};
				stockData.arr.push(stockArrBody)
			}
		}
		return stockData;
	} else if (appId == sysid.PM.app_id.project) { //案件管理の場合
		stockData.appId = appId;
		stockData.date = event.record.sys_invoiceDate.value;
		var distributeSalesType = ['販売', 'サブスク'];
		// 提供形態がdistributeSalesTypeに含まれる場合のみ出荷情報作成
		if (distributeSalesType.includes(event.record.salesType.value)) {
			for (var i in event.record.deviceList.value) {
				if (event.record.deviceList.value[i].value.subBtn.value == '通常') {
					//出荷情報は積送からのみ
					var stockShipBody = {
						'arrOrShip': 'ship',
						'devCode': event.record.deviceList.value[i].value.mCode.value,
						'uniCode': 'distribute',
						'stockNum': event.record.deviceList.value[i].value.shipNum.value
					};
					stockData.ship.push(stockShipBody);
				}
			}
			return stockData;
		}
		return false;
	} else if (appId == sysid.INV.app_id.purchasing) { // 仕入管理の場合
		stockData.appId = appId;
		var sendDate = event.record.arrivalDate.value;
		sendDate = sendDate.replace(/-/g, '');
		sendDate = sendDate.slice(0, -2);
		stockData.date = sendDate;
		// 通貨種類によって先頭の記号変更
		if (event.record.currencyType.value == '米ドル＄') {
			var foreignCurrency = '$';
		} else if (event.record.currencyType.value == 'ユーロ€') {
			var foreignCurrency = '€';
		} else {
			var foreignCurrency = '';
		}
		// 入荷情報作成
		for (var i in event.record.arrivalList.value) {
			var stockArrBody = {
				'arrOrShip': 'arr',
				'devCode': event.record.arrivalList.value[i].value.mCode.value,
				'uniCode': event.record.arrivalList.value[i].value.uCode.value,
				'stockNum': event.record.arrivalList.value[i].value.arrivalNum.value,
				'costInfo': {
					'mCost': event.record.arrivalList.value[i].value.totalUnitCost.value,
					'mCostUpdate': event.record.arrivalDate.value,
					'deviceCost': event.record.arrivalList.value[i].value.unitPrice.value,
					'deviceCost_foreign': foreignCurrency + event.record.arrivalList.value[i].value.unitPrice_foreign.value,
					'importExpenses': event.record.arrivalList.value[i].value.addiUnitExpenses.value,
					'developCost': event.record.arrivalList.value[i].value.addiCost.value
				}
			};
			stockData.arr.push(stockArrBody);
		}
		return stockData;
	}

	return false;
};

/**
 * 受け取ったjsonから商品管理、拠点管理に在庫情報を挿入
 * @param {*} event kintone event
 * @param {*} appId 関数を使ったアプリのID
 * @returns
 */
async function stockCtrl(event, appId) {
	var stockData = createStockJson(event, appId);
	console.log(stockData);
	/* 商品管理情報取得 */
	//商品管理クエリ作成
	var devQuery = [];
	for (var i in stockData.arr) {
		devQuery.push('"' + stockData.arr[i].devCode + '"');
	}
	for (var i in stockData.ship) {
		devQuery.push('"' + stockData.ship[i].devCode + '"');
	}
	// 配列内の重複した要素の削除
	devQuery = Array.from(new Set(devQuery));
	var getDeviceBody = {
		'app': sysid.INV.app_id.device,
		'query': 'mCode in (' + devQuery.join() + ')'
	};
	var deviceRecords = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getDeviceBody)
		.then(function (resp) {
			return resp;
		}).catch(function (error) {
			console.log(error);
			return error;
		});
	/* 商品管理情報取得 end */

	/* 拠点管理情報取得 */
	//拠点管理クエリ作成
	var uniQuery = [];
	for (var i in stockData.arr) {
		uniQuery.push('"' + stockData.arr[i].uniCode + '"');
	}
	for (var i in stockData.ship) {
		uniQuery.push('"' + stockData.ship[i].uniCode + '"');
	}
	// 配列内の重複した要素の削除
	uniQuery = Array.from(new Set(uniQuery));
	var getUnitBody = {
		'app': sysid.INV.app_id.unit,
		'query': 'uCode in (' + uniQuery.join() + ')'
	};
	var unitRecords = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getUnitBody)
		.then(function (resp) {
			return resp;
		}).catch(function (error) {
			console.log(error);
			return error;
		});
	/* 拠点管理情報取得 end */

	// 情報更新用配列
	var deviceStockData = [];
	var unitStockData = [];

	// 商品管理情報作成
	for (var i in deviceRecords.records) {
		var putDevBody = {
			'updateKey': {
				'field': 'mCode',
				'value': deviceRecords.records[i].mCode.value
			},
			'record': {
				'uStockList': {
					'value': deviceRecords.records[i].uStockList.value
				}
			}
		}
		deviceStockData.push(putDevBody);
	}

	// 商品管理、入荷情報挿入 (指定数分＋する)
	for (var i in deviceStockData) {
		for (var j in deviceStockData[i].record.uStockList.value) {
			for (var k in stockData.arr) {
				if (stockData.arr[k].devCode == deviceStockData[i].updateKey.value && stockData.arr[k].uniCode == deviceStockData[i].record.uStockList.value[j].value.uCode.value) {
					deviceStockData[i].record.uStockList.value[j].value.uStock.value = parseInt(deviceStockData[i].record.uStockList.value[j].value.uStock.value || 0) + parseInt(stockData.arr[k].stockNum || 0);
				}
			}
		}
	}

	// 商品管理、出荷情報挿入 (指定数分-する)
	for (var i in deviceStockData) {
		for (var j in deviceStockData[i].record.uStockList.value) {
			for (var k in stockData.ship) {
				if (stockData.ship[k].devCode == deviceStockData[i].updateKey.value && stockData.ship[k].uniCode == deviceStockData[i].record.uStockList.value[j].value.uCode.value) {
					deviceStockData[i].record.uStockList.value[j].value.uStock.value = parseInt(deviceStockData[i].record.uStockList.value[j].value.uStock.value || 0) - parseInt(stockData.ship[k].stockNum || 0);
				}
			}
		}
	}

	// 仕入管理の場合のみ商品管理jsonに在庫情報を入れる
	if (stockData.appId == sysid.INV.app_id.purchasing) {
		for (var i in deviceStockData) {
			for (var j in stockData.arr) {
				if (stockData.arr[j].devCode == deviceStockData[i].updateKey.value) {
					deviceStockData[i].record.mCost = {
						'value': stockData.arr[j].costInfo.mCost
					};
					deviceStockData[i].record.mCostUpdate = {
						'value': stockData.arr[j].costInfo.mCostUpdate
					};
					deviceStockData[i].record.deviceCost = {
						'value': stockData.arr[j].costInfo.deviceCost
					};
					deviceStockData[i].record.deviceCost_foreign = {
						'value': stockData.arr[j].costInfo.deviceCost_foreign
					};
					deviceStockData[i].record.importExpenses = {
						'value': stockData.arr[j].costInfo.importExpenses
					};
					deviceStockData[i].record.developCost = {
						'value': stockData.arr[j].costInfo.developCost
					};
				}
			}
		}
	}


	// 拠点管理情報作成
	for (var i in unitRecords.records) {
		var putUniBody = {
			'updateKey': {
				'field': 'uCode',
				'value': unitRecords.records[i].uCode.value
			},
			'record': {
				'mStockList': {
					'value': unitRecords.records[i].mStockList.value
				}
			}
		}
		unitStockData.push(putUniBody);
	}

	// 減らしたり増やしたりする
	// 拠点管理、入荷情報挿入 (指定数分＋する)
	for (var i in unitStockData) {
		for (var j in unitStockData[i].record.mStockList.value) {
			for (var k in stockData.arr) {
				if (stockData.arr[k].uniCode == unitStockData[i].updateKey.value && stockData.arr[k].devCode == unitStockData[i].record.mStockList.value[j].value.mCode.value) {
					unitStockData[i].record.mStockList.value[j].value.mStock.value = parseInt(unitStockData[i].record.mStockList.value[j].value.mStock.value || 0) + parseInt(stockData.arr[k].stockNum || 0);
				}
			}
		}
	}

	// 拠点管理、出荷情報挿入 (指定数分-する)
	for (var i in unitStockData) {
		for (var j in unitStockData[i].record.mStockList.value) {
			for (var k in stockData.ship) {
				if (stockData.ship[k].uniCode == unitStockData[i].updateKey.value && stockData.ship[k].devCode == unitStockData[i].record.mStockList.value[j].value.mCode.value) {
					unitStockData[i].record.mStockList.value[j].value.mStock.value = parseInt(unitStockData[i].record.mStockList.value[j].value.mStock.value || 0) - parseInt(stockData.ship[k].stockNum || 0);
				}
			}
		}
	}

	//商品管理、拠点管理を更新
	var putDeviceBody = {
		'app': sysid.INV.app_id.device,
		'records': deviceStockData,
	}
	await kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', putDeviceBody)
		.then(function (resp) {
			return resp;
		}).catch(function (error) {
			console.log(error);
			return error;
		});

	var putUnitBody = {
		'app': sysid.INV.app_id.unit,
		'records': unitStockData,
	}
	await kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', putUnitBody)
		.then(function (resp) {
			return resp;
		}).catch(function (error) {
			console.log(error);
			return error;
		});


	// 作成したjsonを配列に格納
	var totalStockdata = {
		'device': deviceStockData,
		'unit': unitStockData
	};

	return totalStockdata;
};

/* レポート処理 */
/**
 * 受け取ったjsonから月次レポートに情報を挿入
 * @param {*} event kintone event
 * @param {*} appId 関数を使ったアプリのID
 * @returns
 */
async function reportCtrl(event, appId) {
	var stockData = createStockJson(event, appId);
	console.log(stockData);

	/* 月次レポート情報取得 */
	// 月次レポートクエリ作成
	var getReportBody = {
		'app': sysid.INV.app_id.report,
		'query': 'sys_invoiceDate = "' + stockData.date + '" order by 更新日時 asc'
	};
	var reportRecords = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getReportBody)
		.then(function (resp) {
			return resp;
		}).catch(function (error) {
			console.log(error);
			return error;
		});
	/* 月次レポート情報取得 end */

	/* レポート更新用情報作成 */
	var reportUpdateData = [];
	var getUniNameArray = [];
	for (var i in stockData.arr) {
		var reportUpdateBody = {
			'arrOrShip': stockData.arr[i].arrOrShip,
			'sys_code': stockData.arr[i].devCode + '-' + stockData.arr[i].uniCode,
			'devCode': stockData.arr[i].devCode,
			'uniCode': stockData.arr[i].uniCode,
			'stockNum': stockData.arr[i].stockNum
		}
		getUniNameArray.push('"' + stockData.arr[i].uniCode + '"');
		reportUpdateData.push(reportUpdateBody);
	}
	for (var i in stockData.ship) {
		var reportUpdateBody = {
			'arrOrShip': stockData.ship[i].arrOrShip,
			'sys_code': stockData.ship[i].devCode + '-' + stockData.arr[i].uniCode,
			'devCode': stockData.ship[i].devCode,
			'uniCode': stockData.ship[i].uniCode,
			'stockNum': stockData.ship[i].stockNum
		}
		getUniNameArray.push('"' + stockData.ship[i].uniCode + '"');
		reportUpdateData.push(reportUpdateBody);
	}

	//拠点名取得
	getUniNameArray = Array.from(new Set(getUniNameArray));
	var getUnitBody = {
		'app': sysid.INV.app_id.unit,
		'query': 'uCode in (' + getUniNameArray.join() + ')'
	};
	var unitRecords = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', getUnitBody)
		.then(function (resp) {
			return resp;
		}).catch(function (error) {
			console.log(error);
			return error;
		});

		for(var i in reportUpdateData){
			for(var j in unitRecords.records){
				if(reportUpdateData[i].uniCode == unitRecords.records[j].uCode.Value){
					reportUpdateData[i].uName = unitRecords.records[j].uName.Value;
				}
			}
		}
	/* レポート更新用情報作成 end */

	if (reportRecords.records.length != 0) { //対応したレポートがある場合
		//更新レポート情報
		var putReportData = {
			'id': reportRecords.records[0].$id.value,
			'record': {
				'inventoryList': {
					'value': reportRecords.records[0].inventoryList.value
				}
			}
		}
	}

	console.log(reportUpdateData);
	return reportUpdateData;
};