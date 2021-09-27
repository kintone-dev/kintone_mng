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
    return event;
  });
  kintone.events.on('app.record.detail.process.proceed', function(event){
    var nStatus=event.nextStatus.value;
    if(nStatus=='入力内容確認中'){
      return kintone.api(kintone.api.url('/v1/user/groups', true), 'GET', {code:kintone.getLoginUser().code}).then(function(resp) {
        if(event.record.purchaseOrder.value.length<1){
          var inGroup=false;
          for(var i in resp.groups){
            console.log(resp.groups[i].name);
            if(resp.groups[i].name=='営業責任者'){
              inGroup=true;
              break;
            }
            console.log('inGroup: '+inGroup);
          }
          if(inGroup){
            console.log('inGroup: '+inGroup)
            var isConfirm=window.confirm('注文書なしで納品を先行してもよろしいですか?');
            console.log('isConfirm: '+isConfirm)
            if(!isConfirm){
              console.log('isConfirm: '+isConfirm)
              event.error='請求書を添付するか営業責任者に承認を求めてください！';
            }
          }else{
            event.error='請求書を添付するか営業責任者に承認を求めてください！';
          }
        }
        return event;
        // var inGroup;
        // var isConfirm;
        // for(var i in resp.groups){
        //   if(event.record.purchaseOrder.value.length<1 && resp.groups[i].name=='営業責任者'){
        //     isConfirm=window.confirm('注文書なしで納品を先行してもよろしいですか?');
        //     break;
        //   }else{
        //     isConfirm=false;
        //   }
        // }
        // if(!isConfirm){
        //   event.error='請求書を添付するか営業責任者に承認を求めてください！';
        // }else if(event.record.purchaseOrder.value.length<1){
        //   event.error='請求書を添付するか営業責任者に承認を求めてください！';
        // }
        // kintone.app.record.set(event);
      });
    }
    return event;
  });
  kintone.events.on(['app.record.edit.show', 'app.record.detail.show'], function (event) {

    if (event.record.ステータス.value == '納品準備中') {
      var types = ['SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT', 'SUBTABLE', 'RICH_TEXT', 'NUMBER', 'DATE', 'DATETIME', 'TIME', 'DROP_DOWN', 'RADIO_BUTTON', 'CHECK_BOX', 'MULTI_SELECT', 'USER_SELECT', 'ORGANIZATION_SELECT', 'GROUP_SELECT', 'LINK', 'FILE'];
      var arr = Object.keys(event.record);
      arr.forEach(function (fcode) {
        if (types.indexOf(event.record[fcode].type) >= 0) {
          event.record[fcode].disabled = true;
        }
      });
      for (var i in event.record.deviceList.value) {
        event.record.deviceList.value[i].value.mNickname.disabled = true;
        event.record.deviceList.value[i].value.shipNum.disabled = true;
        event.record.deviceList.value[i].value.subBtn.disabled = true;
        event.record.deviceList.value[i].value.shipRemarks.disabled = true;
      }
      event.record.sys_invoiceDate.disabled = false;
      event.record.invoiceNum.disabled = false;
      event.record.invoiceStatus.disabled = false;
    }
    return event;
  });


  kintone.events.on(['app.record.create.show', 'app.record.detail.show', 'app.record.edit.show'], function (event) {

    setFieldShown('mVendor', false);
    setFieldShown('mName', false);
    event.record.cSales.disabled = false;

    setFieldShown('sys_suptitle', true);
    if (event.record.invoiceNum.value === '' || event.record.invoiceNum.value === undefined) setFieldShown('invoiceStatus', false);
    else setFieldShown('invoiceStatus', true);


    // タブ表示切り替え
    function tabSwitch(onSelect) {
      switch (onSelect) {
        case '#案件情報':
          setFieldShown('prjNum', true);
          setFieldShown('Exist_Project', true);
          setFieldShown('salesType', true);
          setFieldShown('predictDate', true);
          setFieldShown('purchaseOrder', true);
          setFieldShown('purchaseOrder_status', true);
          setFieldShown('prjMemo', true);
          if (event.record.Exist_Project.value.length>0) { setFieldShown('samePRJ', true); }
          else { setFieldShown('samePRJ', false); }


          setFieldShown('cName', true);
          setFieldShown('orgName', true);
          setFieldShown('instName', true);
          setFieldShown('Contractor', true);
          if(event.record.instName.value=='' || event.record.instName.value==undefined){
            setSpaceShown('btn_newINST','individual','inline-block');
            setSpaceShown('btn_unknowINST','individual','inline-block');
          }
          else{
            setSpaceShown('btn_newINST','individual','none');
            setSpaceShown('btn_unknowINST','individual','none');
          }

          setFieldShown('cSales', true);
          setFieldShown('instStatus', true);
          setFieldShown('instDate', true);
          setFieldShown('instDDday', true);

          setSpaceShown('calBtn', 'line', 'none');
          setFieldShown('tarDate', false);
          setFieldShown('aboutDelivery', false);
          setFieldShown('deviceList', false);

          setFieldShown('dstSelection', false);
          setFieldShown('receiver', false);
          setFieldShown('phoneNum', false);
          setFieldShown('zipcode', false);
          setFieldShown('prefectures', false);
          setFieldShown('city', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);

          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);
          break;
        case '#宛先情報':
          setFieldShown('prjNum', false);
          setFieldShown('Exist_Project', false);
          setFieldShown('salesType', false);
          setFieldShown('predictDate', false);
          setFieldShown('purchaseOrder', false);
          setFieldShown('purchaseOrder_status', false);
          setFieldShown('prjMemo', false);
          setFieldShown('samePRJ', false);

          setFieldShown('cName', false);
          setFieldShown('orgName', false);
          setFieldShown('instName', false);
          setSpaceShown('btn_newINST','individual','none');
          setSpaceShown('btn_unknowINST','individual','none');
          setFieldShown('cSales', false);
          setFieldShown('instStatus', false);
          setFieldShown('instDate', false);
          setFieldShown('instDDday', false);
          setFieldShown('Contractor', false);

          setSpaceShown('calBtn', 'line', 'none');
          setFieldShown('tarDate', false);
          setFieldShown('aboutDelivery', false);
          setFieldShown('deviceList', false);

          setFieldShown('dstSelection', true);
          setFieldShown('receiver', true);
          setFieldShown('phoneNum', true);
          setFieldShown('zipcode', true);
          setFieldShown('prefectures', true);
          setFieldShown('city', true);
          setFieldShown('address', true);
          setFieldShown('buildingName', true);
          setFieldShown('corpName', true);

          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);
          break;
        case '#納品明細':
          setFieldShown('prjNum', false);
          setFieldShown('Exist_Project', false);
          setFieldShown('salesType', false);
          setFieldShown('predictDate', false);
          setFieldShown('purchaseOrder', false);
          setFieldShown('purchaseOrder_status', false);
          setFieldShown('prjMemo', false);
          setFieldShown('samePRJ', false);

          setFieldShown('cName', false);
          setFieldShown('orgName', false);
          setFieldShown('instName', false);
          setSpaceShown('btn_newINST','individual','none');
          setSpaceShown('btn_unknowINST','individual','none');
          setFieldShown('cSales', false);
          setFieldShown('instStatus', false);
          setFieldShown('instDate', false);
          setFieldShown('instDDday', false);
          setFieldShown('Contractor', false);

          setSpaceShown('calBtn', 'line', 'block');
          setFieldShown('tarDate', true);
          setFieldShown('aboutDelivery', true);
          setFieldShown('deviceList', true);

          setFieldShown('dstSelection', false);
          setFieldShown('receiver', false);
          setFieldShown('phoneNum', false);
          setFieldShown('zipcode', false);
          setFieldShown('prefectures', false);
          setFieldShown('city', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);

          setFieldShown('deliveryCorp', false);
          setFieldShown('trckNum', false);
          setFieldShown('sendDate', false);
          setFieldShown('expArrivalDate', false);
          break;
        case '#輸送情報':
          setFieldShown('prjNum', false);
          setFieldShown('Exist_Project', false);
          setFieldShown('salesType', false);
          setFieldShown('predictDate', false);
          setFieldShown('purchaseOrder', false);
          setFieldShown('purchaseOrder_status', false);
          setFieldShown('prjMemo', false);
          setFieldShown('samePRJ', false);

          setFieldShown('cName', false);
          setFieldShown('orgName', false);
          setFieldShown('instName', false);
          setSpaceShown('btn_newINST','individual','none');
          setSpaceShown('btn_unknowINST','individual','none');
          setFieldShown('cSales', false);
          setFieldShown('instStatus', false);
          setFieldShown('instDate', false);
          setFieldShown('instDDday', false);
          setFieldShown('Contractor', false);

          setSpaceShown('calBtn', 'line', 'none');
          setFieldShown('tarDate', true);
          setFieldShown('aboutDelivery', false);
          setFieldShown('deviceList', false);

          setFieldShown('dstSelection', false);
          setFieldShown('receiver', false);
          setFieldShown('phoneNum', false);
          setFieldShown('zipcode', false);
          setFieldShown('prefectures', false);
          setFieldShown('city', false);
          setFieldShown('address', false);
          setFieldShown('buildingName', false);
          setFieldShown('corpName', false);

          setFieldShown('deliveryCorp', true);
          setFieldShown('trckNum', true);
          setFieldShown('sendDate', true);
          setFieldShown('expArrivalDate', true);
          break;
      }
    }
    tabSwitch('#案件情報');
    //タブメニュー作成
    tabMenu('tab_project', ['案件情報', '宛先情報', '納品明細', '輸送情報']);
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
  });

  kintone.events.on(['app.record.edit.change.sys_instAddress', 'app.record.create.change.sys_instAddress'], function (event) {
    if(event.record.instName.value=='' || event.record.instName.value==undefined){
      setSpaceShown('btn_newINST','individual','inline-block');
      setSpaceShown('btn_unknowINST','individual','inline-block');
      console.log('no');
    }
    else{
      setSpaceShown('btn_newINST','individual','none');
      setSpaceShown('btn_unknowINST','individual','none');
      console.log('ok');
    }

    return event;
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
    return event;
  });

  kintone.events.on(['app.record.create.change.dstSelection', 'app.record.edit.change.dstSelection', 'app.record.create.change.sys_instAddress', 'app.record.edit.change.sys_instAddress', 'app.record.create.change.sys_unitAddress', 'app.record.edit.change.sys_unitAddress'], function (event) {
    do_dstSelection(event.record);

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

  function do_dstSelection(eRecords) {
    var selection = eRecords.dstSelection.value;
    if (selection == '施工業者/拠点へ納品') {
      eRecords.receiver.disabled = true;
      eRecords.phoneNum.disabled = true;
      eRecords.zipcode.disabled = true;
      eRecords.prefectures.disabled = true;
      eRecords.city.disabled = true;
      eRecords.address.disabled = true;
      eRecords.buildingName.disabled = true;
      eRecords.corpName.disabled = true;
      if (eRecords.sys_unitAddress.value !== undefined) {
        var unitAddress = eRecords.sys_unitAddress.value.split(',');
        eRecords.receiver.value = unitAddress[0];
        eRecords.phoneNum.value = unitAddress[1];
        eRecords.zipcode.value = unitAddress[2];
        eRecords.prefectures.value = unitAddress[3];
        eRecords.city.value = unitAddress[4];
        eRecords.address.value = unitAddress[5];
        eRecords.buildingName.value = unitAddress[6];
        eRecords.corpName.value = unitAddress[7];
      }
    } else if (selection == '設置先と同じ') {
      eRecords.receiver.disabled = false;
      eRecords.phoneNum.disabled = false;
      eRecords.zipcode.disabled = false;
      eRecords.prefectures.disabled = false;
      eRecords.city.disabled = false;
      eRecords.address.disabled = false;
      eRecords.buildingName.disabled = false;
      eRecords.corpName.disabled = false;
      if (eRecords.sys_instAddress.value !== undefined) {
        var instAddress = eRecords.sys_instAddress.value.split(',');
        eRecords.receiver.value = instAddress[0];
        eRecords.phoneNum.value = instAddress[1];
        eRecords.zipcode.value = instAddress[2];
        eRecords.prefectures.value = instAddress[3];
        eRecords.city.value = instAddress[4];
        eRecords.address.value = instAddress[5];
        eRecords.buildingName.value = instAddress[6];
        eRecords.corpName.value = instAddress[7];
      }
    } else if (selection == '担当手渡し') {
      eRecords.receiver.disabled = false;
      eRecords.phoneNum.disabled = false;
      eRecords.zipcode.disabled = true;
      eRecords.prefectures.disabled = true;
      eRecords.city.disabled = true;
      eRecords.address.disabled = true;
      eRecords.buildingName.disabled = true;
      eRecords.corpName.disabled = true;
      eRecords.zipcode.value = '';
      eRecords.prefectures.value = '';
      eRecords.city.value = '';
      eRecords.address.value = '';
      eRecords.buildingName.value = '';
      eRecords.corpName.value = '';
    } else {
      eRecords.receiver.disabled = false;
      eRecords.phoneNum.disabled = false;
      eRecords.zipcode.disabled = false;
      eRecords.prefectures.disabled = false;
      eRecords.city.disabled = false;
      eRecords.address.disabled = false;
      eRecords.buildingName.disabled = false;
      eRecords.corpName.disabled = false;
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
    eSearch.onkeydown = function () {
      if (window.event.keyCode == 13) {
        console.log(window.event.keyCode)
        document.getElementById("btn_eSearch").click();
      }
    }
    eSearchArea.appendChild(eSearch);

    var searchBtn = document.createElement('input');
    searchBtn.type = 'submit';
    searchBtn.id = 'btn_' + eSearchParms.sID;
    searchBtn.value = '検索';
    eSearchArea.appendChild(searchBtn);

    var searchTargetArea = document.createElement('form');
    searchTargetArea.id = 'searchTargets';
    searchTargetArea.name = 'searchTargets';

    for (var i in eSearchParms.sConditions) {
      var searchTarget = document.createElement('input');
      searchTarget.id = eSearchParms.sConditions[i].fCode;
      searchTarget.name = 'searchTarget'; //eSearchParms.sConditions[i].fCode;
      searchTarget.type = 'checkbox';
      if (i == 0) {
        searchTarget.checked = true;
      }
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
      sConditions: [
        {
          fCode: 'prjTitle',
          fName: 'タイトル'
        },
        {
          fCode: 'invoiceNum',
          fName: '請求書番号'
        },
        {
          fCode: 'prjNum',
          fName: '案件管理番号'
        }
      ]
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
      var isSearchConditions = []
      for (var st in document.searchTargets.searchTarget) {
        // console.log(document.forms.searchTarget[st].checked)
        isSearchConditions.push(document.searchTargets.searchTarget[st].checked);
        if (document.searchTargets.searchTarget[st].checked) {
          str_query = str_query + document.searchTargets.searchTarget[st].id + ' like "' + keyword + '"';
          var st_a = Number(st) + 1;
          if (st_a < document.searchTargets.searchTarget.length && document.searchTargets.searchTarget[st_a].checked) {
            str_query = str_query + ' or ';
          }
        }
      }
      if (keyword == "" || keyword == undefined) {
        str_query = "";
      }
      // else if(keyword != ""){
      //   // str_query = '?query='+ FIELD_CODE +' like "' + keyword + '"'; //コメントアウト
      // }
      // 検索結果のURLへ
      document.location = location.origin + location.pathname + str_query;

      // document.getElementById('s_eSearch').value=keyword;
      // document.searchTargets.searchTarget[1].checked=true;

    });

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
              } else if(String(shipTable[st].value.mCode.value).match(/ZSL10/)){
                shipTable[st].value.shipRemarks.value = shipTable[st].value.shipRemarks.value.replace(/WFP/g, 'PAC')
                newShipTable.push(shipTable[st]);
                var escBody = {
                  value: {
                    mVendor: {
                      type: "SINGLE_LINE_TEXT",
                      value: ''
                    },
                    mType: {
                      type: "SINGLE_LINE_TEXT",
                      value: ''
                    },
                    mCode: {
                      type: "SINGLE_LINE_TEXT",
                      value: ''
                    },
                    mName: {
                      type: "SINGLE_LINE_TEXT",
                      value: ''
                    },
                    mNickname: {
                      type: "SINGLE_LINE_TEXT",
                      value: 'LOCK Pro用エスカッション'
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
                      value: parseInt(shipTable[st].value.shipNum.value)
                    }
                  }
                }
                newShipTable.push(escBody);
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
        else if (mCodeValue.match(/ZSL10/)) event.record.deviceList.value[i].value.shipRemarks.value = 'WFP';
      }
    }
    return event;
  });

  //wfpチェック
  kintone.events.on('app.record.detail.show', function (event) {

    var putData = [];

    if (sessionStorage.getItem('record_updated') === '1') {
      sessionStorage.setItem('record_updated', '0');
      return event;
    }

    if (event.record.deviceList.value.some(item => item.value.shipRemarks.value.match(/WFP/))) {
      var putBody = {
        'id': event.record.$id.value,
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
    } else {
      var putBody = {
        'id': event.record.$id.value,
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

    //サーバー時間取得
    $.ajax({
      type: 'GET',
      cache: false,
      async: false
    }).done(function (data, status, xhr) {
      //請求月が今より過去の場合
      var serverDate = new Date(xhr.getResponseHeader('Date')); //サーバー時刻を代入
      var nowDateFormat = String(serverDate.getFullYear()) + String(("0" + (serverDate.getMonth() + 1)).slice(-2));
      if (parseInt(nowDateFormat) > parseInt(event.record.sys_invoiceDate.value)) {
        alert('昔の請求書です。');
        return event;
      }
    });

    return event;
  });

})();