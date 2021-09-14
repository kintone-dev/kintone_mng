(function () {
  'use strict';
  // 新規導入案件 案件番号自動採番
  kintone.events.on('app.record.create.show', function (event) {
    autoNum('PRJ_', 'prjNum');
    event.record.prjNum.disabled = true;
    setFieldShown('invoiceNum', false);
    setFieldShown('invoiceStatus', false);
    return event;
  });

  var prjNumValue = '';
  kintone.events.on('app.record.create.change.prjNum', function (event) {
    prjNumValue = event.record.prjNum.value;
    return event;
  });

  kintone.events.on('app.record.edit.change.invoiceNum', function (event) {
    if (event.record.invoiceNum.value === '' || event.record.invoiceNum.value === undefined) setFieldShown('invoiceStatus', false);
    else setFieldShown('invoiceStatus', true);
  });

  kintone.events.on(['app.record.create.show', 'app.record.detail.show', 'app.record.edit.show'], function (event) {
    const PAGE_RECORD = event.record;
    PAGE_RECORD.cSales.disabled = false;
    doSelection(PAGE_RECORD);
    setFieldShown('sys_suptitle', true);
    if (event.record.invoiceNum.value === '' || event.record.invoiceNum.value === undefined) setFieldShown('invoiceStatus', false);
    else setFieldShown('invoiceStatus', true);

    // システム用フィールド非表示
    setFieldShown('sys_unitAddress', false);
    setFieldShown('sys_instAddress', false);

    // 新・既存案件表示切り替え
    function tabSwitch(onSelect) {
      switch (onSelect) {
        case '#案件情報':
          setPrjInfoShown(PAGE_RECORD, true, 'prj');
          setInstInfoShown(false);
          setTarInfoShown(false);
          setArrivalInfoShown(PAGE_RECORD, false, '')
          setShipInfoShown(false);
          break;
        case '#設置先情報':
          setPrjInfoShown(PAGE_RECORD, false, '');
          setInstInfoShown(true);
          setTarInfoShown(false);
          setArrivalInfoShown(PAGE_RECORD, false, '')
          setShipInfoShown(false);
          break;
        case '#納品依頼リスト':
          setPrjInfoShown(PAGE_RECORD, false, '');
          setInstInfoShown(false);
          setTarInfoShown(true);
          setArrivalInfoShown(PAGE_RECORD, false, '')
          setShipInfoShown(false);
          break;
        case '#宛先情報':
          var eRecord = kintone.app.record.get();
          setPrjInfoShown(PAGE_RECORD, false, '');
          setInstInfoShown(false);
          setTarInfoShown(false);
          setArrivalInfoShown(eRecord.record, true, 'arrival')
          setShipInfoShown(false);
          break;
        case '#輸送情報':
          setPrjInfoShown(PAGE_RECORD, false, '');
          setInstInfoShown(false);
          setTarInfoShown(false);
          setArrivalInfoShown(PAGE_RECORD, false, '')
          setShipInfoShown(true);
          break;
      }
    }
    tabSwitch('#案件情報');
    //タブメニュー作成
    tabMenu('tab_project', ['案件情報', '設置先情報', '納品依頼リスト', '宛先情報', '輸送情報']);
    //タブ切り替え表示設定
    $('.tab_project a').on('click', function () {
      var idName = $(this).attr('href'); //タブ内のリンク名を取得
      tabSwitch(idName); //tabをクリックした時の表示設定
      return false; //aタグを無効にする
    });
    var newINST = setBtn('btn_newINST', '新規設置先');
    $('#' + newINST.id).on('click', function () {
      // createNewREC(sysid.PM.app_id.installation, ['prjNum', 'btn_newORG_shown'], [prjNumValue, 'none']);
      createNewREC(sysid.PM.app_id.installation, ['prjNum', 'unknowINST', 'setShown'], [prjNumValue, '', '']);
    });

    var unknowINST = setBtn('btn_unknowINST', '新規不特定設置先');
    $('#' + unknowINST.id).on('click', function () {
      createNewREC(sysid.PM.app_id.installation, ['prjNum', 'unknowINST', 'setShown'], [prjNumValue, '不特定設置先', 'disable']);
    });

    if (PAGE_RECORD.ステータス.value == '納品準備中') {
      var types = ['SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT', 'SUBTABLE', 'RICH_TEXT', 'NUMBER', 'DATE', 'DATETIME', 'TIME', 'DROP_DOWN', 'RADIO_BUTTON', 'CHECK_BOX', 'MULTI_SELECT', 'USER_SELECT', 'ORGANIZATION_SELECT', 'GROUP_SELECT', 'LINK', 'FILE'];
      var arr = Object.keys(PAGE_RECORD);
      arr.forEach(function (fcode) {
        if (types.indexOf(PAGE_RECORD[fcode].type) >= 0) {
          PAGE_RECORD[fcode].disabled = true;
        }
      });
      for (var i in PAGE_RECORD.deviceList.value) {
        PAGE_RECORD.deviceList.value[i].value.mNickname.disabled = true;
        PAGE_RECORD.deviceList.value[i].value.shipNum.disabled = true;
        PAGE_RECORD.deviceList.value[i].value.subBtn.disabled = true;
        PAGE_RECORD.deviceList.value[i].value.shipRemarks.disabled = true;
      }
      PAGE_RECORD.invoiceDate.disabled = false;
      PAGE_RECORD.invoiceNum.disabled = false;
      PAGE_RECORD.invoiceStatus.disabled = false;
    }
  });

  kintone.events.on(['app.record.index.edit.show', 'app.record.edit.show'], function (event) {
    // 新規作成以外、案件管理番号編集と既存案件切り替え不可
    event.record.prjNum.disabled = true;
    event.record.Exist_Project.disabled = true;

    return event;
  });

  // 新・既存案件表示切り替え
  kintone.events.on(['app.record.create.change.Exist_Project', 'app.record.edit.change.Exist_Project'], function (event) {
    if (event.record.Exist_Project.value == '既存案件') {
      setFieldShown('samePRJ', true);
      event.record.prjNum.value = "";
      event.record.prjNum.disabled = false;
    } else {
      setFieldShown('samePRJ', false);
      autoNum('PRJ_', 'prjNum');
      event.record.prjNum.disabled = true;
    }
  });

  kintone.events.on(['app.record.create.change.dstSelection', 'app.record.edit.change.dstSelection', 'app.record.create.change.sys_instAddress', 'app.record.edit.change.sys_instAddress', 'app.record.create.change.sys_unitAddress', 'app.record.edit.change.sys_unitAddress'], function (event) {
    const PAGE_RECORD = event.record;
    doSelection(PAGE_RECORD);

    return event;
  });

  /*
    kintone.events.on('app.record.detail.process.proceed', function (event) {
      var nStatus = event.nextStatus.value;
      if (nStatus == '納品手配済') {
        var queryBody = {
          'app': sysID.DIPM.app.ship,
          'query': 'prjNum="' + event.record.prjNum.value + '" and ステータス in ("納品情報未確定")',
          'fields': ['prjNum', '$id', 'ステータス', 'shipType']
        };

        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', queryBody).then(function (getResp) {
          //「確認中」の「用途」がある場合、「用途」を更新するBody作成
          var update_shipType = {
            'app': sysID.DIPM.app.ship,
            'records': []
          };
          //Statusの更新用Body作成
          var update_Status = {
            'app': sysID.DIPM.app.ship,
            'records': []
          };

          for (var i in getResp.records) {
            //「確認中」の「用途」がある場合、update_shipTypeのrecordsに追加
            if (getResp.records[i].shipType.value == '確認中') {
              update_shipType.records.push({
                'id': getResp.records[i].$id.value,
                'record': {
                  'shipType': {
                    'value': event.record.shipType.value
                  }
                }
              });
            }
            update_Status.records.push({
              'id': getResp.records[i].$id.value,
              'action': '処理開始',
              //'assignee': 'kintone_mng@accel-lab.com'
            });
          }
          if (update_shipType.records.length > 0) kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', update_shipType); //.then(function(resp){console.log(resp)}).catch(function(error){console.log(error)});
          kintone.api(kintone.api.url('/k/v1/records/status', true), 'PUT', update_Status); //.then(function(resp){console.log(resp)}).catch(function(error){console.log(error)});

        }).catch(function (error) {
          console.log(error);
          console.log(error.message);
        });

        var putBody = {

        };
      }
      return event;
    });
  */

  //案件情報タブ表示処理
  const setPrjInfoShown = function (pageRecod, param, tabCase) {
    setFieldShown('prjNum', param);
    setFieldShown('Exist_Project', param);
    setFieldShown('salesType', param);
    setFieldShown('predictDate', param);
    setFieldShown('purchaseOrder', param);
    setFieldShown('prjMemo', param);
    if (tabCase == 'prj') {
      if (pageRecod.Exist_Project.value == '既存案件') {
        setFieldShown('samePRJ', true);
      } else {
        setFieldShown('samePRJ', false);
      }
    } else {
      setFieldShown('samePRJ', param);
    }
  }

  //設置先情報タブ表示処理
  const setInstInfoShown = function (param) {
    setFieldShown('cName', param);
    setFieldShown('orgName', param);
    setFieldShown('cSales', param);
    setFieldShown('instStatus', param);
    setFieldShown('instDate', param);
    setFieldShown('instDDday', param);
  }

  //納品依頼リストタブ表示処理
  const setTarInfoShown = function (param) {
    setFieldShown('tarDate', param);
    setFieldShown('aboutDelivery', param);
    setFieldShown('deviceList', param);
  }

  //宛先情報タブ表示処理
  const setArrivalInfoShown = function (pageRecod, param, tabCase) {
    setFieldShown('dstSelection', param);
    setFieldShown('zipcode', param);
    setFieldShown('phoneNum', param);
    setFieldShown('address', param);
    setFieldShown('buildingName', param);
    setFieldShown('corpName', param);
    setFieldShown('receiver', param);
    setFieldShown('prefectures', param);
    setFieldShown('city', param);
    if (tabCase == 'arrival') {
      doSelection(pageRecod);
    } else {
      setFieldShown('Contractor', false);
      setFieldShown('instName', false);
      setSpaceShown('btn_newINST', 'individual', 'none');
      setSpaceShown('btn_unknowINST', 'individual', 'none');
    }
  }

  //輸送情報タブ表示処理
  const setShipInfoShown = function (param) {
    setFieldShown('deliveryCorp', param);
    setFieldShown('trckNum', param);
    setFieldShown('sendDate', param);
    setFieldShown('expArrivalDate', param);
  }

  function doSelection(pageRecod) {
    var selection = pageRecod.dstSelection.value;
    if (selection == '施工業者/拠点へ納品') {
      setFieldShown('Contractor', true);
      setFieldShown('instName', false);
      setSpaceShown('btn_newINST', 'individual', 'none');
      setSpaceShown('btn_unknowINST', 'individual', 'none');
      pageRecod.receiver.disabled = true;
      pageRecod.phoneNum.disabled = true;
      pageRecod.zipcode.disabled = true;
      pageRecod.prefectures.disabled = true;
      pageRecod.city.disabled = true;
      pageRecod.address.disabled = true;
      pageRecod.buildingName.disabled = true;
      pageRecod.corpName.disabled = true;
      if (pageRecod.sys_unitAddress.value !== undefined) {
        var unitAddress = pageRecod.sys_unitAddress.value.split(',');
        pageRecod.receiver.value = unitAddress[0];
        pageRecod.phoneNum.value = unitAddress[1];
        pageRecod.zipcode.value = unitAddress[2];
        pageRecod.prefectures.value = unitAddress[3];
        pageRecod.city.value = unitAddress[4];
        pageRecod.address.value = unitAddress[5];
        pageRecod.buildingName.value = unitAddress[6];
        pageRecod.corpName.value = unitAddress[7];
      }
    } else if (selection == '設置先と同じ') {
      setFieldShown('Contractor', false);
      setFieldShown('instName', true);
      if (pageRecod.instName.value == undefined) {
        setSpaceShown('btn_newINST', 'individual', 'block');
        setSpaceShown('btn_unknowINST', 'individual', 'block');
      } else {
        setSpaceShown('btn_newINST', 'individual', 'none');
        setSpaceShown('btn_unknowINST', 'individual', 'none');
      }
      pageRecod.receiver.disabled = false;
      pageRecod.phoneNum.disabled = false;
      pageRecod.zipcode.disabled = false;
      pageRecod.prefectures.disabled = false;
      pageRecod.city.disabled = false;
      pageRecod.address.disabled = false;
      pageRecod.buildingName.disabled = false;
      pageRecod.corpName.disabled = false;
      if (pageRecod.sys_instAddress.value !== undefined) {
        var instAddress = pageRecod.sys_instAddress.value.split(',');
        pageRecod.receiver.value = instAddress[0];
        pageRecod.phoneNum.value = instAddress[1];
        pageRecod.zipcode.value = instAddress[2];
        pageRecod.prefectures.value = instAddress[3];
        pageRecod.city.value = instAddress[4];
        pageRecod.address.value = instAddress[5];
        pageRecod.buildingName.value = instAddress[6];
        pageRecod.corpName.value = instAddress[7];
      }
    } else if (selection == '担当手渡し') {
      setFieldShown('Contractor', false);
      setFieldShown('instName', false);
      setSpaceShown('btn_newINST', 'individual', 'none');
      setSpaceShown('btn_unknowINST', 'individual', 'none');
      pageRecod.receiver.disabled = false;
      pageRecod.phoneNum.disabled = false;
      pageRecod.zipcode.disabled = true;
      pageRecod.prefectures.disabled = true;
      pageRecod.city.disabled = true;
      pageRecod.address.disabled = true;
      pageRecod.buildingName.disabled = true;
      pageRecod.corpName.disabled = true;

      pageRecod.zipcode.value = '';
      pageRecod.prefectures.value = '';
      pageRecod.city.value = '';
      pageRecod.address.value = '';
      pageRecod.buildingName.value = '';
      pageRecod.corpName.value = '';
    } else {
      setFieldShown('Contractor', false);
      setFieldShown('instName', false);
      setSpaceShown('btn_newINST', 'individual', 'none');
      setSpaceShown('btn_unknowINST', 'individual', 'none');
      pageRecod.receiver.disabled = false;
      pageRecod.phoneNum.disabled = false;
      pageRecod.zipcode.disabled = false;
      pageRecod.prefectures.disabled = false;
      pageRecod.city.disabled = false;
      pageRecod.address.disabled = false;
      pageRecod.buildingName.disabled = false;
      pageRecod.corpName.disabled = false;
    }
  }
  /**
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   */
// function setSearchArea(areaID, searchConditions) {
var setSearchArea=function(searchParams) {
	// var indexBtn = document.createElement('button');
	// indexBtn.id = btnID;
	// indexBtn.classList.add('jsbtn_header');
	// indexBtn.innerText = btnValue;
	// indexBtn.addEventListener("mouseover", function (event) {
	// 	indexBtn.classList.add('jsbtn_over');
	// }, false);
	// indexBtn.addEventListener("mouseleave", function (event) {
	// 	indexBtn.classList.remove('jsbtn_over');
	// }, false);
  var searchArea=document.createElement('div');
  searchArea.id='customSearchArea';


  var searchForm=document.createElement('form');

  var eSearch=document.createElement('input');
  eSearch.id=searchParams.easySearch.sID;
  eSearch.type='search';
  eSearch.placeholder='簡易検索';
  eSearch.classList.add('testclass');
  searchForm.appendChild(eSearch);

  var dSearch=document.createElement('span');
  dSearch.classList.add('testSpanBtn');
  dSearch.innerText='testSpanBtn';
  searchForm.appendChild(dSearch);

  var searchBtn=document.createElement('button');
  searchBtn.innerText='検索';
  searchBtn.onClick=testalert();
  searchArea.appendChild(searchBtn);

  searchForm.onsubmit='testalert()';
  searchArea.appendChild(searchForm);

  
	kintone.app.getHeaderMenuSpaceElement().appendChild(searchArea);
	return searchArea;
}
function testalert(){
  console.log($('#invoiceNum').val());
}
/* 使い方
 *var newORG=setBtn('btn_newORG','新規組織');
 *$('#'+newORG.id).on('click', function(){
 *	createNewREC(sysID.DIPM.app.org, 'prj_aNum', prj_aNumValue); // 実行内容例
 *});
 */
  kintone.events.on('app.record.index.show', function(event){
    var prjSearch=setSearchArea({
      areaID:'prjSearch',
      easySearch:{sID:'invoiceNum',sName:'請求書番号'},
      searchConditions:[
        {sID:'invoiceNum',sName:'請求書番号'},
        {sID:'prjNum',sName:'案件管理番号'}
      ]
    });
    // ={
    //   areaID:'prjSearch',
    //   searchType:'or',
    //   searchConditions:[
    //     {tar_fCode:'invoiceNum',tar_fValue:''},
    //     {tar_fCode:'prjNum',tar_fValue:''}
    //   ]
    // };
  });
/*
  const tar_fCode=['invoiceNum','prjNum'];
  const searchType='or';

//検索したいフィールドの設定値
//ふぃーるどフィールドコードは一対一
const FIELD_CODE = 'invoiceNum';
const FIELD_CODE2 = 'prjNum';
//andかorを小文字で入れる、今回はor
const AND_OR = "or";
  kintone.events.on("app.record.index.show", function (event) {
    //GET引数に格納された直前の検索キーワードを取得して再表示
    var result = {};
    //クエリから、URL固定部分(?query=)を無視して取り出す
    var query = window.location.search.substring(7); 
    //フィールドコード名と検索キーワードに分割する
    for(var i = 0;i < query.length;i++){
      var element = query[i].split('like');
      var param_field_code = encodeURIComponent(element[0]);
      var param_search_word = encodeURIComponent(element[1]);
      //空白スペースを取り除いて、配列に格納
      result[param_field_code.replace(/^\s+|\s+$/g, "")] = param_search_word.replace(/^[\s|\"]+|[\s|\"]+$/g, "");
    }
    //検索キーワード
    var search_word = document.createElement('input');
    search_word.type = 'text';
    //検索ボタン
    var search_button = document.createElement('input');
    search_button.type = 'submit';
    search_button.value = 'search';
    search_button.onclick = function () {
      keyword_search();
    };
    //キーワード検索の関数
    function keyword_search(){
      var keyword = search_word.value;
      // var str_query = '?query='+ FIELD_CODE +' like "' + keyword;
      // ここがクエリ
      // var str_query = '?query='+ FIELD_CODE +' like "' + keyword + '" ' + AND_OR +' '+ FIELD_CODE2 +' like "' + keyword + '"' + AND_OR +' '+ FIELD_CODE3 +' like "' + keyword + '"';
      var str_query = '?query='+ FIELD_CODE +' like "' + keyword + '" ' + AND_OR +' '+ FIELD_CODE2 +' like "' + keyword + '"';
      
      if(keyword == ""){
        str_query = "";
      }else if(keyword != ""){
        // str_query = '?query='+ FIELD_CODE +' like "' + keyword + '"'; //コメントアウト
      }
      // 検索結果のURLへ
      document.location = location.origin + location.pathname + str_query
    }
    // 重複を避けるため要素をあらかじめクリアしておく
    var node_space = kintone.app.getHeaderMenuSpaceElement()
    for (var i =node_space.childNodes.length-1; i>=0; i--) {
      node_space.removeChild(node_space.childNodes[i]);
    }
    var label = document.createElement('label');
    label.appendChild(document.createTextNode('レコード内検索'));
    label.appendChild(document.createTextNode(' ')); 
    label.appendChild(search_word);
    label.appendChild(document.createTextNode(' ')); 
    label.appendChild(search_button); 
    kintone.app.getHeaderMenuSpaceElement().appendChild(label);
  　
    return event;
  });
  */
})();