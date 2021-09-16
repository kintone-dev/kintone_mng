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
    tabMenu('tab_project', ['案件情報', '設置先情報', '宛先情報', '納品依頼リスト', '輸送情報']);
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
      PAGE_RECORD.sys_invoiceDate.disabled = false;
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
  var setEasySearch = function (eSearchParms) {
    var eSearchArea = document.createElement('div');
    eSearchArea.ID = eSearchParms.sID;

    var eSearch = document.createElement('input');
    eSearch.id = 's_' + eSearchParms.sID;
    eSearch.type = 'text';
    eSearch.placeholder = eSearchParms.sPlaceholder;
    eSearch.classList.add('testclass');
    eSearchArea.appendChild(eSearch);

    var searchBtn = document.createElement('input');
    searchBtn.type = 'submit';
    searchBtn.id = 'btn_' + eSearchParms.sID;
    searchBtn.value = '検索';
    eSearchArea.appendChild(searchBtn);

    // var searchType=document.createElement('div');
    // searchType.id='SearchType';
    // var sTypeSelection_or=document.createElement('input');
    // sTypeSelection_or.id='sts_or';
    // sTypeSelection_or.name='searchType';
    // sTypeSelection_or.type='radio';
    // sTypeSelection_or.value='or';
    // searchType.appendChild(sTypeSelection_or);
    // var sTypeLabel_or=document.createElement('label');
    // sTypeLabel_or.htmlFor='sts_or';
    // sTypeLabel_or.innerText='いずれかの条件を満たす';
    // searchType.appendChild(sTypeLabel_or);
    // var sTypeSelection_and=document.createElement('input');
    // sTypeSelection_and.id='sts_and';
    // sTypeSelection_and.name='searchType';
    // sTypeSelection_and.type='radio';
    // sTypeSelection_and.value='and';
    // searchType.appendChild(sTypeSelection_and);
    // var sTypeLabel_and=document.createElement('label');
    // sTypeLabel_and.htmlFor='sts_and';
    // sTypeLabel_and.innerText='すべての条件を満たす';
    // searchType.appendChild(sTypeLabel_and);
    // eSearchArea.appendChild(searchType);
    var searchTargetArea = document.createElement('form');
    searchTargetArea.id = 'searchTargets';
    searchTargetArea.name = 'searchTargets';

    for (var i in eSearchParms.sConditions) {
      var searchTarget = document.createElement('input');
      searchTarget.id = eSearchParms.sConditions[i].fCode;
      searchTarget.name = 'searchTarget';//eSearchParms.sConditions[i].fCode;
      searchTarget.type = 'checkbox';
      searchTarget.checked;
      searchTargetArea.appendChild(searchTarget);
      var searchTargetValue = document.createElement('label');
      searchTargetValue.htmlFor = eSearchParms.sConditions[i].fCode;
      searchTargetValue.innerText = eSearchParms.sConditions[i].fName;
      searchTargetArea.appendChild(searchTargetValue);
    }
    eSearchArea.appendChild(searchTargetArea);


    kintone.app.getHeaderMenuSpaceElement().appendChild(eSearchArea);
  }
  //検索したいフィールドの設定値
  //ふぃーるどフィールドコードは一対一
  const FIELD_CODE = 'invoiceNum';
  const FIELD_CODE2 = 'prjNum';
  //andかorを小文字で入れる、今回はor
  const AND_OR = "or";
  kintone.events.on('app.record.index.show', function (event) {

    setEasySearch({
      sID: 'eSearch',
      sPlaceholder: '総合検索',
      sConditions: [{
          fCode: 'invoiceNum',
          fName: '請求書番号'
        },
        {
          fCode: 'prjNum',
          fName: '案件管理番号'
        }
      ]
    });
    $('#e_eSearch').keypress(function(e){
      if(e.which==13){
        $('#btn_eSearch').click();
      }
    });
    $('#btn_eSearch').on('click', function () {
      // var testC=document.s_eSearch.value;
      // var keyword=document.eSearch.s_eSearch.value;
      var keyword = document.getElementById('s_eSearch').value;

      var result = {};
      //クエリから、URL固定部分(?query=)を無視して取り出す
      var query = window.location.search.substring(7);
      //フィールドコード名と検索キーワードに分割する
      for (var i in query) {
        var element = query[i].split('like');
        var param_field_code = encodeURIComponent(element[0]);
        var param_search_word = encodeURIComponent(element[1]);
        //空白スペースを取り除いて、配列に格納
        result[param_field_code.replace(/^\s+|\s+$/g, "")] = param_search_word.replace(/^[\s|\"]+|[\s|\"]+$/g, "");
      }
      var str_query1 = '?query=' + FIELD_CODE + ' like "' + keyword + '" ' + AND_OR + ' ' + FIELD_CODE2 + ' like "' + keyword + '"';
      var str_query = '?query=';
      // var searchtarget = document.forms.searchTarget;
      for (var st in document.searchTargets.searchTarget) {
        // console.log(document.forms.searchTarget[st].checked)
        if (document.searchTargets.searchTarget[st].checked) {
          str_query = str_query + document.searchTargets.searchTarget[st].id + ' like "' + keyword + '" ';
          if (st<document.searchTargets.searchTarget.length && document.searchTargets.searchTarget[st+1].checked) {str_query = str_query + ' or ';}
        }
      }
      if (keyword == "" || keyword == undefined) {
        str_query = "";
      }
      // else if(keyword != ""){
      //   // str_query = '?query='+ FIELD_CODE +' like "' + keyword + '"'; //コメントアウト
      // }
      // 検索結果のURLへ
      alert(str_query1 + '\n' + str_query);
      document.location = location.origin + location.pathname + str_query;
    });
    // setEasySearch({
    //   id:'eSearch',
    //   placeholder:'総合検索',
    //   target:['invoiceNum','prjNum']
    //   // easySearch:{sID:'invoiceNum',sName:'請求書番号'},
    //   // searchConditions:[
    //   //   {sID:'invoiceNum',sName:'請求書番号'},
    //   //   {sID:'prjNum',sName:'案件管理番号'}
    //   // ]
    // });
    // ={
    //   areaID:'prjSearch',
    //   searchType:'or',
    //   searchConditions:[
    //     {tar_fCode:'invoiceNum',tar_fValue:''},
    //     {tar_fCode:'prjNum',tar_fValue:''}
    //   ]
    // };
    //GET引数に格納された直前の検索キーワードを取得して再表示


    return event;
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

  // 計算ボタン
  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], function (event) {
    setBtn('calBtn', '計算');
    $('#calBtn').on('click', function () {
      const ERECORD = kintone.app.record.get();
      var shipTable = ERECORD.record.deviceList.value;
      var lengthStr = '';
      var openType = '';
      var methodType = '';
      var shipNum = '';
      var numRegExp = new RegExp(/^([1-9]\d*|0)$/);
      var openRegExp = new RegExp(/^[sw]/i);
      var methodRegExp = new RegExp(/壁付[sw]|天井/i);
      var newShipTable = [];

      // 依頼数空欄時エラー
      for (var st in shipTable) {
        if (numRegExp.test(shipTable[st].value.shipNum.value)) {
          shipNum = shipTable[st].value.shipNum.value;
          shipTable[st].value.shipNum.error = null;
        } else {
          shipTable[st].value.shipNum.error = '入力形式が間違えています';
        }
      }

      // パッケージ品取得
      var pkgQuery = [];
      for (var st in shipTable) {
        if (String(shipTable[st].value.shipRemarks.value).match(/WFP/)) {
          if (String(shipTable[st].value.mCode.value).match(/pkg_/)) {
            pkgQuery.push('"' + shipTable[st].value.mCode.value + '"');
          }
        }
      }
      if (pkgQuery.length != 0) {
        var getPkg = {
          'app': sysid.INV.app_id.device,
          'query': 'mCode in (' + pkgQuery.join() + ') order by 更新日時 asc',
        };
      } else {
        var getPkg = {
          'app': sysid.INV.app_id.device,
          'query': 'order by 更新日時 asc',
        };
      }
      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', getPkg)
        .then(function (resp) {
          const RESP_RECORDS = resp.records;

          for (var st in shipTable) {
            if (String(shipTable[st].value.shipRemarks.value).match(/WFP/)) {
              if (shipTable[st].value.mCode.value == 'TRT-DY') {
                shipTable[st].value.shipRemarks.value = shipTable[st].value.shipRemarks.value.replace(/WFP/g, 'PAC')
                newShipTable.push(shipTable[st]);
                var railSpecs = (String(shipTable[st].value.shipRemarks.value)).split(/,\n|\n/);
                var numCutter = railSpecs[1].indexOf('：');
                railSpecs[0] = railSpecs[1].slice(numCutter + 1);
                var openCutter = railSpecs[2].indexOf('：');
                railSpecs[1] = railSpecs[2].slice(openCutter + 1);
                var methodCutter = railSpecs[3].indexOf('：');
                railSpecs[2] = railSpecs[3].slice(methodCutter + 1);

                if (railSpecs[1] == '(S)片開き') {
                  railSpecs[1] = 's';
                } else if (railSpecs[1] == '(W)両開き') {
                  railSpecs[1] = 'w';
                } else {
                  railSpecs[1] = '';
                }

                railSpecs.pop();

                for (var i in railSpecs) {
                  if (numRegExp.test(railSpecs[i])) {
                    if (parseInt(railSpecs[i]) >= 580) {
                      lengthStr = railSpecs[i];

                      shipTable[st].value.shipRemarks.error = null;
                    } else {
                      shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                      break;
                    }
                  } else {
                    shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                  }

                  if (openRegExp.test(railSpecs[i])) {
                    if (railSpecs[i].length === 1) {
                      openType = railSpecs[i];
                      openType = openType.toLowerCase();

                      shipTable[st].value.shipRemarks.error = null;
                    } else {
                      shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                      break;
                    }
                  } else {
                    shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                  }

                  if (methodRegExp.test(railSpecs[i])) {
                    if (railSpecs[i].match(/壁付s/i)) {
                      methodType = '壁付s';
                    } else if (railSpecs[i].match(/壁付w/i)) {
                      methodType = '壁付w';
                    } else {
                      methodType = '天井';
                    }
                    shipTable[st].value.shipRemarks.error = null;
                  } else {
                    shipTable[st].value.shipRemarks.error = '入力形式が間違えています';
                  }
                }
                var spec = {
                  rLength: lengthStr,
                  rType: openType,
                  rMethod: methodType,
                  shipNum: shipTable[st].value.shipNum.value
                }
                var railItems = railConf(spec);
                for (var ril in railItems) {
                  var railItemBody = {
                    value: {
                      mVendor: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mVendor.value).replace(/\"/g, '')
                      },
                      mType: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mType.value).replace(/\"/g, '')
                      },
                      mCode: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mCode.value).replace(/\"/g, '')
                      },
                      mName: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mName.value).replace(/\"/g, '')
                      },
                      mNickname: {
                        type: "SINGLE_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.mNickname.value).replace(/\"/g, '')
                      },
                      subBtn: {
                        type: "RADIO_BUTTON",
                        value: '通常'
                      },
                      shipRemarks: {
                        type: "MULTI_LINE_TEXT",
                        value: JSON.stringify(railItems[ril].value.shipRemarks.value).replace(/\"/g, '')
                      },
                      shipNum: {
                        type: "NUMBER",
                        value: JSON.stringify(railItems[ril].value.shipNum.value).replace(/\"/g, '')
                      }
                    }
                  }
                  newShipTable.push(railItemBody);
                }
              } else if (String(shipTable[st].value.mCode.value).match(/pkg_/)) {
                shipTable[st].value.shipRemarks.value = shipTable[st].value.shipRemarks.value.replace(/WFP/g, 'PAC')
                newShipTable.push(shipTable[st]);
                for (var rr in RESP_RECORDS) {
                  if (shipTable[st].value.mCode.value == RESP_RECORDS[rr].mCode.value) {
                    for (var pkgr in RESP_RECORDS[rr].packageComp.value) {
                      var pkgBody = {
                        value: {
                          mVendor: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mVendor.value
                          },
                          mType: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mType.value
                          },
                          mCode: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mCode.value
                          },
                          mName: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mName.value
                          },
                          mNickname: {
                            type: "SINGLE_LINE_TEXT",
                            value: RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_mNickname.value
                          },
                          subBtn: {
                            type: "RADIO_BUTTON",
                            value: '通常'
                          },
                          shipRemarks: {
                            type: "MULTI_LINE_TEXT",
                            value: ''
                          },
                          shipNum: {
                            type: "NUMBER",
                            value: parseInt(RESP_RECORDS[rr].packageComp.value[pkgr].value.pc_Num.value) * parseInt(shipTable[st].value.shipNum.value)
                          }
                        }
                      }
                      newShipTable.push(pkgBody);
                    }
                  }
                }
              }
            } else {
              newShipTable.push(shipTable[st]);
            }
          }

          ERECORD.record.deviceList.value = newShipTable;
          console.log(ERECORD.record.deviceList.value);
          for (var i in ERECORD.record.deviceList.value) {
            ERECORD.record.deviceList.value[i].value.mNickname.lookup = true;
          }
          kintone.app.record.set(ERECORD);

        });
    });

    return event;
  });

  // カーテンレールが選択された場合、シリアル番号欄にデータを記入
  kintone.events.on(['app.record.edit.change.mCode', 'app.record.create.change.mCode'], function (event) {
    for (var i in event.record.deviceList.value) {
      if (!String(event.record.deviceList.value[i].value.shipRemarks.value).match(/PAC/)) {
        var mCodeValue = event.record.deviceList.value[i].value.mCode.value;
        if (mCodeValue === undefined) event.record.deviceList.value[i].value.shipRemarks.value = '';
        else if (mCodeValue == 'TRT-DY') event.record.deviceList.value[i].value.shipRemarks.value = 'WFP\nカーテンレール全長(mm)：\n開き勝手：(S)片開き/(W)両開き\n取り付け方法：天井/壁付S/壁付W';
        else if (mCodeValue.match(/pkg_/)) event.record.deviceList.value[i].value.shipRemarks.value = 'WFP';
      }
    }
    return event;
  });

  //wfpチェック
  kintone.events.on('app.record.detail.show', function (event) {
    const PAGE_RECORD = event.record;
    var putData = [];

    if (sessionStorage.getItem('record_updated') === '1') {
      sessionStorage.setItem('record_updated', '0');
      return event;
    }

    if(PAGE_RECORD.deviceList.value.some(item => item.value.shipRemarks.value.match(/WFP/))){
      var putBody = {
        'id': PAGE_RECORD.$id.value,
        'record': {
          'sys_isReady': {
            'value': 'false'
          }
        }
      }
      putData.push(putBody);
      putRecords(kintone.app.getId(), putData);
      sessionStorage.setItem('record_updated', '1');
      location.reload();
    } else{
      var putBody = {
        'id': PAGE_RECORD.$id.value,
        'record': {
          'sys_isReady': {
            'value': 'true'
          }
        }
      }
      putData.push(putBody);
      putRecords(kintone.app.getId(), putData);
      sessionStorage.setItem('record_updated', '1');
      location.reload();
    }

    return event;
  });

})();